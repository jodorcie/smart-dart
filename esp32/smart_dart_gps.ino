/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         SMART DART – ESP32 GPS TRACKER FIRMWARE             ║
 * ║         Compatible with Smart DART REST + WebSocket API     ║
 * ║                                                              ║
 * ║  Hardware:                                                   ║
 * ║    • ESP32 DevKit v1                                         ║
 * ║    • NEO-6M GPS Module                                       ║
 * ║    • 3× LEDs (Red=14, Green=27, Blue=26)                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  LED Status Guide:
 *    Red  (PIN 14) – SOLID     : Powered, waiting for GPS fix
 *    Red  (PIN 14) – BLINKING  : GPS fix active, parsing satellites
 *    Green(PIN 27) – SOLID     : Wi-Fi connected to network
 *    Green(PIN 27) – BLINKING  : Wi-Fi reconnecting
 *    Blue (PIN 26) – FLASH     : HTTP POST sent to Smart DART server
 *    All  LEDs     – BLINK 3×  : Config portal just opened (AP mode)
 */

// ── Libraries ─────────────────────────────────────────────────
#include <WiFi.h>
#include <WiFiClientSecure.h>   // for HTTPS to Railway
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFiManager.h>
#include <time.h>               // NTP real UTC time

// ── Pin Definitions ───────────────────────────────────────────
#define PIN_RED_LED    14   // GPS fix / system status
#define PIN_GREEN_LED  27   // Wi-Fi status
#define PIN_BLUE_LED   26   // HTTP transmission activity
#define GPS_RX_PIN     16   // ESP32 RX2 ← GPS TX
#define GPS_TX_PIN     17   // ESP32 TX2 → GPS RX
#define GPS_BAUD       9600

// ── Timing Constants ──────────────────────────────────────────
#define GPS_UPDATE_MS       5000    // send to server every 5 s (matches backend sim)
#define WIFI_CHECK_MS       10000   // check Wi-Fi health every 10 s
#define NTP_SYNC_MS         3600000 // re-sync NTP once per hour
#define GPS_FIX_TIMEOUT_MS  5000    // red LED solid if no fix for this long
#define HTTP_TIMEOUT_MS     8000    // give up HTTP call after 8 s
#define PORTAL_TIMEOUT_S    180     // config portal auto-closes after 3 min

// ── Configuration (loaded from SPIFFS, edited via portal) ─────
char cfgBusId[16]    = "DART001";
char cfgServerUrl[96] = "https://your-backend.up.railway.app";

// ── GPS ───────────────────────────────────────────────────────
TinyGPSPlus gps;
float    gpsLat        = -6.8162;   // Dar es Salaam fallback
float    gpsLng        = 39.2783;
float    gpsSpeed      = 0.0;
uint8_t  gpsSatellites = 0;
float    gpsHdop       = 99.9;      // horizontal dilution of precision
bool     gpsHasFix     = false;
unsigned long lastFixTime = 0;

// ── Timing ────────────────────────────────────────────────────
unsigned long lastGpsSend      = 0;
unsigned long lastWifiCheck    = 0;
unsigned long lastNtpSync      = 0;

// ── Flags ─────────────────────────────────────────────────────
bool shouldSaveConfig = false;
bool ntpSynced        = false;

// ═══════════════════════════════════════════════════════════════
// LED HELPERS
// ═══════════════════════════════════════════════════════════════
void blinkAll(int times, int ms = 120) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_RED_LED,   HIGH);
    digitalWrite(PIN_GREEN_LED, HIGH);
    digitalWrite(PIN_BLUE_LED,  HIGH);
    delay(ms);
    digitalWrite(PIN_RED_LED,   LOW);
    digitalWrite(PIN_GREEN_LED, LOW);
    digitalWrite(PIN_BLUE_LED,  LOW);
    delay(ms);
  }
}

void flashBlue() {
  digitalWrite(PIN_BLUE_LED, HIGH);
  delay(80);
  digitalWrite(PIN_BLUE_LED, LOW);
}

// ═══════════════════════════════════════════════════════════════
// SPIFFS CONFIG LOAD / SAVE
// ═══════════════════════════════════════════════════════════════
void loadConfig() {
  if (!SPIFFS.begin(true)) {
    Serial.println("[SPIFFS] Mount failed – using defaults");
    return;
  }
  if (!SPIFFS.exists("/dart.cfg")) {
    Serial.println("[SPIFFS] No saved config – using defaults");
    return;
  }
  File f = SPIFFS.open("/dart.cfg", "r");
  if (!f) return;

  String l1 = f.readStringUntil('\n');
  String l2 = f.readStringUntil('\n');
  f.close();

  l1.trim(); l2.trim();
  if (l1.length() > 0) l1.toCharArray(cfgBusId,     sizeof(cfgBusId));
  if (l2.length() > 0) l2.toCharArray(cfgServerUrl, sizeof(cfgServerUrl));

  Serial.printf("[Config] Bus: %s  Server: %s\n", cfgBusId, cfgServerUrl);
}

void saveConfig() {
  File f = SPIFFS.open("/dart.cfg", "w");
  if (!f) { Serial.println("[SPIFFS] Write failed"); return; }
  f.println(cfgBusId);
  f.println(cfgServerUrl);
  f.close();
  Serial.println("[Config] Saved to SPIFFS");
}

void saveConfigCallback() { shouldSaveConfig = true; }

// ═══════════════════════════════════════════════════════════════
// NTP TIME SYNC
// ═══════════════════════════════════════════════════════════════
void syncNtp() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("[NTP] Syncing");
  int tries = 0;
  time_t now = 0;
  while (now < 1000000000L && tries < 20) {
    delay(500);
    Serial.print(".");
    time(&now);
    tries++;
  }
  ntpSynced = (now > 1000000000L);
  Serial.println(ntpSynced ? " OK" : " FAILED (will use GPS time)");
}

// Build ISO-8601 timestamp: prefer NTP, fall back to GPS, then millis
String getTimestamp() {
  // Try NTP first
  if (ntpSynced) {
    time_t now;
    struct tm ti;
    time(&now);
    gmtime_r(&now, &ti);
    char buf[30];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &ti);
    return String(buf);
  }
  // Try GPS UTC time
  if (gps.date.isValid() && gps.time.isValid() && gps.date.year() > 2020) {
    char buf[30];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
      gps.date.year(), gps.date.month(),  gps.date.day(),
      gps.time.hour(), gps.time.minute(), gps.time.second());
    return String(buf);
  }
  // Last resort: uptime millis
  return String(millis());
}

// ═══════════════════════════════════════════════════════════════
// GPS PROCESSING
// ═══════════════════════════════════════════════════════════════
void processGps() {
  while (Serial2.available() > 0) {
    char c = Serial2.read();
    gps.encode(c);
  }

  if (gps.location.isValid() && gps.location.isUpdated()) {
    gpsLat     = gps.location.lat();
    gpsLng     = gps.location.lng();
    gpsHasFix  = true;
    lastFixTime = millis();

    if (gps.speed.isValid())     gpsSpeed      = gps.speed.kmph();
    if (gps.satellites.isValid()) gpsSatellites = gps.satellites.value();
    if (gps.hdop.isValid())       gpsHdop       = gps.hdop.hdop();

    // Blink red = active satellite fix
    digitalWrite(PIN_RED_LED, !digitalRead(PIN_RED_LED));
  }

  // Solid red = fix lost
  if (millis() - lastFixTime > GPS_FIX_TIMEOUT_MS) {
    gpsHasFix = false;
    digitalWrite(PIN_RED_LED, HIGH);
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP POST TO SMART DART BACKEND
// ═══════════════════════════════════════════════════════════════
void sendGpsUpdate() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Skipped – no Wi-Fi");
    digitalWrite(PIN_GREEN_LED, LOW);
    return;
  }

  // Build JSON payload
  String payload = "{";
  payload += "\"busId\":\""    + String(cfgBusId)              + "\",";
  payload += "\"latitude\":"   + String(gpsLat, 6)              + ",";
  payload += "\"longitude\":"  + String(gpsLng, 6)              + ",";
  payload += "\"speed\":"      + String(gpsSpeed, 1)            + ",";
  payload += "\"satellites\":" + String(gpsSatellites)          + ",";
  payload += "\"hdop\":"       + String(gpsHdop, 2)             + ",";
  payload += "\"hasFix\":"     + (gpsHasFix ? "true" : "false") + ",";
  payload += "\"timestamp\":\"" + getTimestamp()                + "\"";
  payload += "}";

  String url = String(cfgServerUrl) + "/api/gps";

  Serial.printf("[HTTP] POST %s\n", url.c_str());
  Serial.printf("[GPS]  %.6f, %.6f  %.1f km/h  sats:%d  hdop:%.1f  fix:%s\n",
    gpsLat, gpsLng, gpsSpeed, gpsSatellites, gpsHdop,
    gpsHasFix ? "YES" : "NO");

  WiFiClientSecure client;
  client.setInsecure(); // accepts Railway's HTTPS cert without storing root CA

  HTTPClient http;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT_MS);

  int code = http.POST(payload);

  if (code == 200) {
    Serial.println("[HTTP] OK – delivered to Smart DART server");
    flashBlue();
  } else if (code == 404) {
    String resp = http.getString();
    Serial.printf("[HTTP] 404 – Bus ID not found. Response: %s\n", resp.c_str());
    // Blink blue 3 times to indicate config error
    for (int i = 0; i < 3; i++) { flashBlue(); delay(150); }
  } else {
    Serial.printf("[HTTP] Error code: %d\n", code);
  }

  http.end();
}

// ═══════════════════════════════════════════════════════════════
// WI-FI HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
void checkWifi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost – attempting reconnect...");
    digitalWrite(PIN_GREEN_LED, LOW);
    WiFi.disconnect();
    WiFi.reconnect();
    int tries = 0;
    while (WiFi.status() != WL_CONNECTED && tries < 20) {
      digitalWrite(PIN_GREEN_LED, !digitalRead(PIN_GREEN_LED)); // blink
      delay(500);
      tries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[WiFi] Reconnected: " + WiFi.localIP().toString());
      digitalWrite(PIN_GREEN_LED, HIGH);
    } else {
      Serial.println("[WiFi] Reconnect failed – will retry next cycle");
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial2.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  pinMode(PIN_RED_LED,   OUTPUT);
  pinMode(PIN_GREEN_LED, OUTPUT);
  pinMode(PIN_BLUE_LED,  OUTPUT);

  // Startup: all LEDs on briefly
  blinkAll(2, 200);
  digitalWrite(PIN_RED_LED, HIGH); // Red solid = booting

  Serial.println("\n╔══════════════════════════════╗");
  Serial.println("║   Smart DART GPS Tracker     ║");
  Serial.println("╚══════════════════════════════╝");

  loadConfig();

  // ── WiFiManager portal ───────────────────────────────────────
  WiFiManagerParameter p_bus_id("bus", "DART Bus ID  (e.g. DART001)", cfgBusId,     16);
  WiFiManagerParameter p_server("srv", "Backend URL  (no trailing /)", cfgServerUrl, 96);

  WiFiManager wm;
  wm.setSaveConfigCallback(saveConfigCallback);
  wm.addParameter(&p_bus_id);
  wm.addParameter(&p_server);
  wm.setConfigPortalTimeout(PORTAL_TIMEOUT_S);
  wm.setConnectTimeout(30);

  // Signal that portal is opening
  blinkAll(3);
  Serial.println("[WiFi] Starting… connect to AP 'SmartDART_Setup' with password 'dart2024'");

  if (!wm.autoConnect("SmartDART_Setup", "dart2024")) {
    Serial.println("[WiFi] Timeout – restarting in 3 s");
    delay(3000);
    ESP.restart();
  }

  // Capture portal values
  strncpy(cfgBusId,     p_bus_id.getValue(), sizeof(cfgBusId)     - 1);
  strncpy(cfgServerUrl, p_server.getValue(), sizeof(cfgServerUrl) - 1);

  if (shouldSaveConfig) saveConfig();

  Serial.println("[WiFi] Connected: " + WiFi.localIP().toString());
  Serial.printf("[Config] Bus=%s  Server=%s\n", cfgBusId, cfgServerUrl);
  digitalWrite(PIN_GREEN_LED, HIGH);
  digitalWrite(PIN_RED_LED,   LOW);

  // NTP time sync
  syncNtp();

  Serial.println("[Boot] Ready – sending GPS every 5 s");
  blinkAll(1, 300);
}

// ═══════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  // 1 – Always process GPS
  processGps();

  // 2 – Send update every 5 s
  if (now - lastGpsSend >= GPS_UPDATE_MS) {
    lastGpsSend = now;
    sendGpsUpdate();
  }

  // 3 – Wi-Fi health check every 10 s
  if (now - lastWifiCheck >= WIFI_CHECK_MS) {
    lastWifiCheck = now;
    checkWifi();
  }

  // 4 – Re-sync NTP once per hour
  if (ntpSynced && now - lastNtpSync >= NTP_SYNC_MS) {
    lastNtpSync = now;
    syncNtp();
  }
}
