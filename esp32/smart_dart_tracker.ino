// ================================================================
//  SMART DART – ESP32 GPS TRACKER
//  Hardware : ESP32 DevKit + NEO-6M GPS Module
//  Sends real-time GPS data to the Smart DART backend every 5s
// ================================================================
//
//  WIRING:
//  ┌──────────────┬────────────────────────────────────────────┐
//  │ NEO-6M       │ ESP32                                      │
//  ├──────────────┼────────────────────────────────────────────┤
//  │ VCC          │ 3.3V  ← MUST be 3.3V, NOT 5V              │
//  │ GND          │ GND                                        │
//  │ TX           │ GPIO 16  (RX2)                             │
//  │ RX           │ GPIO 17  (TX2)                             │
//  ├──────────────┼────────────────────────────────────────────┤
//  │ Red  LED (+) │ GPIO 14  → 220Ω resistor → GND            │
//  │ Green LED(+) │ GPIO 27  → 220Ω resistor → GND            │
//  │ Blue  LED(+) │ GPIO 26  → 220Ω resistor → GND            │
//  └──────────────┴────────────────────────────────────────────┘
//
//  LED MEANING:
//  Red  solid     = booting / no GPS fix
//  Red  blinking  = GPS fix active
//  Green solid    = Wi-Fi connected
//  Blue flash     = data sent to server
//
//  FIRST RUN:
//  1. Flash this code to ESP32
//  2. Connect phone/laptop to Wi-Fi: "SmartDART_Setup" / "dart2024"
//  3. Browser opens at 192.168.4.1 → enter your Wi-Fi + bus settings
//  4. Device saves settings and reboots automatically
//
//  REQUIRED LIBRARIES (Arduino IDE → Tools → Manage Libraries):
//  - TinyGPS++   by Mikal Hart
//  - WiFiManager by tzapu
//  (HTTPClient, WiFiClientSecure, SPIFFS are built-in with ESP32 board)
// ================================================================

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFiManager.h>
#include <time.h>

// ── Pin numbers ─────────────────────────────────────────────────
#define RED_LED    14
#define GREEN_LED  27
#define BLUE_LED   26
#define GPS_RX     16   // connects to NEO-6M TX pin
#define GPS_TX     17   // connects to NEO-6M RX pin

// ── Settings stored in flash (SPIFFS) ───────────────────────────
// Change these defaults before first flash, OR set them in the portal
char busId[16]     = "DART001";
char serverUrl[96] = "https://your-backend.up.railway.app";

// ── GPS object ──────────────────────────────────────────────────
TinyGPSPlus gps;

// ── GPS current values (updated every loop) ─────────────────────
double  gpsLat        = -6.8162;   // Dar es Salaam default until fix
double  gpsLng        = 39.2783;
float   gpsSpeedKmh   = 0.0;
int     gpsSatellites = 0;
bool    gpsHasFix     = false;
unsigned long lastFixMillis = 0;

// ── Internal flags ───────────────────────────────────────────────
bool portalSaved = false;

// ================================================================
//  SPIFFS  –  load / save config
// ================================================================

void loadConfig() {
  if (!SPIFFS.begin(true)) {
    Serial.println("[SPIFFS] Could not mount – using defaults");
    return;
  }
  if (!SPIFFS.exists("/config.txt")) {
    Serial.println("[SPIFFS] No saved config – using defaults");
    return;
  }
  File f = SPIFFS.open("/config.txt", "r");
  if (!f) return;

  String line1 = f.readStringUntil('\n');
  String line2 = f.readStringUntil('\n');
  f.close();

  line1.trim();
  line2.trim();

  if (line1.length() > 0) line1.toCharArray(busId,     sizeof(busId));
  if (line2.length() > 0) line2.toCharArray(serverUrl, sizeof(serverUrl));

  Serial.printf("[Config] Loaded → busId=%s  server=%s\n", busId, serverUrl);
}

void saveConfig() {
  File f = SPIFFS.open("/config.txt", "w");
  if (!f) { Serial.println("[SPIFFS] Write failed"); return; }
  f.println(busId);
  f.println(serverUrl);
  f.close();
  Serial.println("[Config] Saved to flash");
}

// Called by WiFiManager when user saves the portal form
void onSaveCallback() {
  portalSaved = true;
}

// ================================================================
//  LEDs
// ================================================================

void ledOn(int pin)  { digitalWrite(pin, HIGH); }
void ledOff(int pin) { digitalWrite(pin, LOW);  }

void blinkLed(int pin, int times, int ms = 120) {
  for (int i = 0; i < times; i++) {
    ledOn(pin);  delay(ms);
    ledOff(pin); delay(ms);
  }
}

// Short flash on the blue LED to confirm a successful HTTP send
void flashBlue() {
  ledOn(BLUE_LED);
  delay(100);
  ledOff(BLUE_LED);
}

// ================================================================
//  TIME  –  NTP UTC timestamp
// ================================================================

void syncTime() {
  Serial.print("[NTP] Syncing...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = 0;
  int tries = 0;
  while (now < 1609459200L && tries < 20) {  // 2021-01-01 as sanity check
    delay(500);
    Serial.print(".");
    time(&now);
    tries++;
  }
  Serial.println(now > 1609459200L ? " done" : " failed (will use GPS time)");
}

// Returns ISO-8601 UTC string: "2026-06-04T10:30:00Z"
String getTimestamp() {
  // Try system clock first (set by NTP)
  time_t now;
  time(&now);
  if (now > 1609459200L) {
    struct tm t;
    gmtime_r(&now, &t);
    char buf[30];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &t);
    return String(buf);
  }
  // Fall back to GPS date/time
  if (gps.date.isValid() && gps.time.isValid() && gps.date.year() > 2020) {
    char buf[30];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
      gps.date.year(),   gps.date.month(),  gps.date.day(),
      gps.time.hour(),   gps.time.minute(), gps.time.second());
    return String(buf);
  }
  // Last resort: milliseconds since boot as a string
  return String(millis());
}

// ================================================================
//  GPS  –  parse NMEA sentences from Serial2
// ================================================================

void readGPS() {
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  if (gps.location.isValid() && gps.location.isUpdated()) {
    gpsLat      = gps.location.lat();
    gpsLng      = gps.location.lng();
    gpsHasFix   = true;
    lastFixMillis = millis();

    if (gps.speed.isValid())      gpsSpeedKmh   = gps.speed.kmph();
    if (gps.satellites.isValid()) gpsSatellites = gps.satellites.value();

    // Blink red to show active GPS parsing
    digitalWrite(RED_LED, !digitalRead(RED_LED));
  }

  // If no fix for more than 5 seconds → red solid
  if (millis() - lastFixMillis > 5000) {
    gpsHasFix = false;
    ledOn(RED_LED);
  }
}

// ================================================================
//  HTTP  –  POST to Smart DART backend
// ================================================================

void sendToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] No Wi-Fi – skipping send");
    ledOff(GREEN_LED);
    return;
  }

  // Build JSON body matching /api/gps endpoint
  String body = "{";
  body += "\"busId\":\""     + String(busId)                     + "\",";
  body += "\"latitude\":"    + String(gpsLat,      6)             + ",";
  body += "\"longitude\":"   + String(gpsLng,      6)             + ",";
  body += "\"speed\":"       + String(gpsSpeedKmh, 1)             + ",";
  body += "\"satellites\":"  + String(gpsSatellites)              + ",";
  body += "\"hasFix\":"      + (gpsHasFix ? "true" : "false")    + ",";
  body += "\"timestamp\":\"" + getTimestamp()                     + "\"";
  body += "}";

  String url = String(serverUrl) + "/api/gps";

  Serial.printf("[HTTP] POST %s\n", url.c_str());
  Serial.printf("[GPS]  lat=%.6f lng=%.6f speed=%.1f sats=%d fix=%s\n",
    gpsLat, gpsLng, gpsSpeedKmh, gpsSatellites,
    gpsHasFix ? "YES" : "NO (using last known)");

  // Use WiFiClientSecure for HTTPS (Railway uses HTTPS)
  WiFiClientSecure client;
  client.setInsecure();  // skip SSL certificate verification

  HTTPClient http;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(8000);  // 8 second timeout

  int httpCode = http.POST(body);

  if (httpCode == 200) {
    Serial.println("[HTTP] Success – GPS delivered");
    flashBlue();
  } else if (httpCode == 404) {
    // Server could not find this busId
    Serial.printf("[HTTP] ERROR 404 – busId '%s' not found on server\n", busId);
    Serial.println("[HTTP] Check busId matches one of: DART001 to DART012");
    blinkLed(BLUE_LED, 3, 150);  // 3 quick blue blinks = config error
  } else {
    Serial.printf("[HTTP] ERROR code=%d\n", httpCode);
  }

  http.end();
}

// ================================================================
//  SETUP
// ================================================================

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // Set up LED pins
  pinMode(RED_LED,   OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BLUE_LED,  OUTPUT);

  // All LEDs on at boot so user can see they work
  ledOn(RED_LED); ledOn(GREEN_LED); ledOn(BLUE_LED);
  delay(500);
  ledOff(GREEN_LED); ledOff(BLUE_LED);
  // Red stays on = system booting

  Serial.println();
  Serial.println("==============================");
  Serial.println("  Smart DART GPS Tracker");
  Serial.println("==============================");

  // Load saved busId and serverUrl from flash
  loadConfig();

  // Set up two extra fields in the WiFiManager portal
  WiFiManagerParameter fieldBusId(
    "busid",                          // HTML field name
    "DART Bus ID  (e.g. DART001)",    // label shown in portal
    busId,                            // current value
    16                                // max length
  );
  WiFiManagerParameter fieldServer(
    "server",
    "Backend URL  (no trailing /)",
    serverUrl,
    96
  );

  WiFiManager wm;
  wm.setSaveConfigCallback(onSaveCallback);
  wm.addParameter(&fieldBusId);
  wm.addParameter(&fieldServer);
  wm.setConfigPortalTimeout(180);   // portal closes after 3 minutes
  wm.setConnectTimeout(30);         // give up connecting after 30 s

  Serial.println("[WiFi] Connecting...");
  Serial.println("[WiFi] If no saved network: connect to AP 'SmartDART_Setup' password 'dart2024'");

  // autoConnect: if saved Wi-Fi exists, connect to it.
  // If not (or it fails), open the config AP.
  bool connected = wm.autoConnect("SmartDART_Setup", "dart2024");

  if (!connected) {
    Serial.println("[WiFi] Could not connect – restarting in 3s");
    delay(3000);
    ESP.restart();
  }

  // Read the values the user typed in the portal
  strncpy(busId,     fieldBusId.getValue(),  sizeof(busId)     - 1);
  strncpy(serverUrl, fieldServer.getValue(), sizeof(serverUrl) - 1);

  // Save to flash if the user changed anything in the portal
  if (portalSaved) {
    saveConfig();
  }

  Serial.println("[WiFi] Connected!  IP: " + WiFi.localIP().toString());
  Serial.printf("[Config] busId=%s\n", busId);
  Serial.printf("[Config] server=%s\n", serverUrl);

  ledOff(RED_LED);
  ledOn(GREEN_LED);  // Green on = Wi-Fi connected

  // Sync clock via internet
  syncTime();

  Serial.println("[Boot] Ready – will send GPS every 5 seconds");
  blinkLed(GREEN_LED, 3, 200);  // 3 green blinks = ready
}

// ================================================================
//  LOOP
// ================================================================

unsigned long lastSendTime     = 0;
unsigned long lastWifiCheckTime = 0;

void loop() {
  // Always parse incoming GPS data
  readGPS();

  // Send to server every 5 seconds
  if (millis() - lastSendTime >= 5000) {
    lastSendTime = millis();
    sendToServer();
  }

  // Check Wi-Fi is still connected every 15 seconds
  if (millis() - lastWifiCheckTime >= 15000) {
    lastWifiCheckTime = millis();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[WiFi] Connection lost – reconnecting...");
      ledOff(GREEN_LED);
      WiFi.reconnect();
      int tries = 0;
      while (WiFi.status() != WL_CONNECTED && tries < 20) {
        delay(500);
        tries++;
      }
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("[WiFi] Reconnected");
        ledOn(GREEN_LED);
      }
    }
  }
}
