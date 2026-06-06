/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      SMART DART – ESP32 REST API GPS TRACKER  (Option A)    ║
 * ║      Sends GPS via HTTP POST to Render backend /api/gps     ║
 * ║                                                              ║
 * ║  Hardware:                                                   ║
 * ║    • ESP32 DevKit v1                                         ║
 * ║    • NEO-6M GPS Module                                       ║
 * ║    • 3× LEDs  (Red=14, Green=27, Blue=26)                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  REQUIRED LIBRARIES  (Arduino IDE → Tools → Manage Libraries):
 *  ┌──────────────────────────────┬───────────────────────────┐
 *  │ Library                      │ Author                    │
 *  ├──────────────────────────────┼───────────────────────────┤
 *  │ TinyGPS++                    │ Mikal Hart                │
 *  │ WiFiManager                  │ tzapu                     │
 *  │ (HTTPClient, WiFiClientSecure│ built-in with ESP32 board)│
 *  └──────────────────────────────┴───────────────────────────┘
 *
 *  WIRING:
 *  ┌─────────────┬──────────────────────────────────────────┐
 *  │ NEO-6M      │ ESP32                                    │
 *  ├─────────────┼──────────────────────────────────────────┤
 *  │ VCC         │ 3.3V  (NOT 5V)                           │
 *  │ GND         │ GND                                      │
 *  │ TX          │ GPIO 16  (RX2)                           │
 *  │ RX          │ GPIO 17  (TX2)                           │
 *  ├─────────────┼──────────────────────────────────────────┤
 *  │ Red  LED(+) │ GPIO 14 → 220Ω → GND                    │
 *  │ Green LED(+)│ GPIO 27 → 220Ω → GND                    │
 *  │ Blue  LED(+)│ GPIO 26 → 220Ω → GND                    │
 *  └─────────────┴──────────────────────────────────────────┘
 *
 *  LED STATUS:
 *    Red  solid    = booting / no GPS fix
 *    Red  blinking = GPS fix active
 *    Green solid   = Wi-Fi connected
 *    Green blink   = Wi-Fi reconnecting
 *    Blue flash    = HTTP POST sent successfully (200 OK)
 *    Blue 3× blink = Server error (check Serial Monitor)
 *    Blue 5× blink = Render server waking up (first request delay)
 *
 *  DATA FLOW:
 *    ESP32 → POST /api/gps → Render backend → Socket.IO → Vercel map
 *    Bus shows green ESP32 badge on the live map
 *
 *  NOTE ON RENDER FREE TIER:
 *    Render spins down after 15 min idle. First POST after idle
 *    takes ~30s to respond. The ESP32 handles this gracefully —
 *    it waits, shows 5× blue blinks, then resumes normally.
 */

// ── Libraries ──────────────────────────────────────────────────
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFiManager.h>
#include <time.h>

// ── Your Render Backend URL ────────────────────────────────────
// This is your live backend — do NOT change unless you redeploy
#define BACKEND_URL "https://smart-dart.onrender.com"

// ── Pin Definitions ───────────────────────────────────────────
#define RED_LED    14
#define GREEN_LED  27
#define BLUE_LED   26
#define GPS_RX     16   // ESP32 RX2 ← NEO-6M TX
#define GPS_TX     17   // ESP32 TX2 → NEO-6M RX
#define GPS_BAUD   9600

// ── Timing ────────────────────────────────────────────────────
#define SEND_INTERVAL_MS    5000    // POST every 5 s
#define WIFI_CHECK_MS       15000   // Wi-Fi health check every 15 s
#define NTP_RESYNC_MS       3600000 // Re-sync NTP every hour
#define GPS_FIX_TIMEOUT_MS  5000    // Declare fix lost after 5 s
#define HTTP_TIMEOUT_MS     35000   // 35 s — covers Render cold-start wake-up

// ── Bus ID — set in WiFiManager portal or change default here ─
char busId[16] = "DART001";

// ── GPS ───────────────────────────────────────────────────────
TinyGPSPlus gps;
double   gpsLat        = -6.8162;   // Dar es Salaam fallback
double   gpsLng        = 39.2783;
float    gpsSpeedKmh   = 0.0;
float    gpsHeading    = 0.0;
int      gpsSatellites = 0;
float    gpsHdop       = 99.9;
bool     gpsHasFix     = false;
unsigned long lastFixMs = 0;

// ── State ─────────────────────────────────────────────────────
bool     portalSaved     = false;
bool     serverAwake     = false;   // tracks if Render has responded once
unsigned long lastSendMs      = 0;
unsigned long lastWifiCheckMs = 0;
unsigned long lastNtpSyncMs   = 0;

// ═══════════════════════════════════════════════════════════════
// LED HELPERS
// ═══════════════════════════════════════════════════════════════
void ledOn(int pin)  { digitalWrite(pin, HIGH); }
void ledOff(int pin) { digitalWrite(pin, LOW);  }

void blinkLed(int pin, int times, int ms = 120) {
  for (int i = 0; i < times; i++) {
    ledOn(pin);  delay(ms);
    ledOff(pin); delay(ms);
  }
}

void blinkAll(int times, int ms = 150) {
  for (int i = 0; i < times; i++) {
    ledOn(RED_LED); ledOn(GREEN_LED); ledOn(BLUE_LED);
    delay(ms);
    ledOff(RED_LED); ledOff(GREEN_LED); ledOff(BLUE_LED);
    delay(ms);
  }
}

void flashBlue() {
  ledOn(BLUE_LED); delay(80); ledOff(BLUE_LED);
}

// ═══════════════════════════════════════════════════════════════
// SPIFFS — save / load Bus ID
// ═══════════════════════════════════════════════════════════════
void loadConfig() {
  if (!SPIFFS.begin(true)) {
    Serial.println("[SPIFFS] Mount failed – using defaults");
    return;
  }
  if (!SPIFFS.exists("/dart.cfg")) {
    Serial.println("[SPIFFS] No config – using defaults");
    return;
  }
  File f = SPIFFS.open("/dart.cfg", "r");
  if (!f) return;
  String line = f.readStringUntil('\n');
  f.close();
  line.trim();
  if (line.length() > 0) line.toCharArray(busId, sizeof(busId));
  Serial.printf("[Config] Loaded busId=%s\n", busId);
}

void saveConfig() {
  File f = SPIFFS.open("/dart.cfg", "w");
  if (!f) { Serial.println("[SPIFFS] Write failed"); return; }
  f.println(busId);
  f.close();
  Serial.println("[Config] Saved");
}

void onPortalSave() { portalSaved = true; }

// ═══════════════════════════════════════════════════════════════
// NTP TIME
// ═══════════════════════════════════════════════════════════════
void syncNtp() {
  Serial.print("[NTP] Syncing...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = 0;
  int tries = 0;
  while (now < 1609459200L && tries < 20) {
    delay(500); Serial.print("."); time(&now); tries++;
  }
  Serial.println(now > 1609459200L ? " OK" : " FAILED");
}

String getTimestamp() {
  time_t now; time(&now);
  if (now > 1609459200L) {
    struct tm t; gmtime_r(&now, &t);
    char buf[30];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &t);
    return String(buf);
  }
  if (gps.date.isValid() && gps.time.isValid() && gps.date.year() > 2020) {
    char buf[30];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
      gps.date.year(), gps.date.month(),  gps.date.day(),
      gps.time.hour(), gps.time.minute(), gps.time.second());
    return String(buf);
  }
  return String(millis());
}

// ═══════════════════════════════════════════════════════════════
// GPS — parse NMEA from Serial2
// ═══════════════════════════════════════════════════════════════
void readGPS() {
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }
  if (gps.location.isValid() && gps.location.isUpdated()) {
    gpsLat        = gps.location.lat();
    gpsLng        = gps.location.lng();
    gpsHasFix     = true;
    lastFixMs     = millis();
    if (gps.speed.isValid())      gpsSpeedKmh   = gps.speed.kmph();
    if (gps.course.isValid())     gpsHeading    = gps.course.deg();
    if (gps.satellites.isValid()) gpsSatellites = gps.satellites.value();
    if (gps.hdop.isValid())       gpsHdop       = gps.hdop.hdop();
    // Blink red = satellites being read
    digitalWrite(RED_LED, !digitalRead(RED_LED));
  }
  if (millis() - lastFixMs > GPS_FIX_TIMEOUT_MS) {
    gpsHasFix = false;
    ledOn(RED_LED); // solid red = no fix
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP POST → Render backend /api/gps
// ═══════════════════════════════════════════════════════════════
void sendToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] No Wi-Fi – skipping");
    return;
  }

  // JSON payload matching the backend /api/gps endpoint exactly
  String body = "{";
  body += "\"busId\":\""     + String(busId)                     + "\",";
  body += "\"latitude\":"    + String(gpsLat,      6)             + ",";
  body += "\"longitude\":"   + String(gpsLng,      6)             + ",";
  body += "\"speed\":"       + String(gpsSpeedKmh, 1)             + ",";
  body += "\"heading\":"     + String(gpsHeading,  1)             + ",";
  body += "\"satellites\":"  + String(gpsSatellites)              + ",";
  body += "\"hdop\":"        + String(gpsHdop, 2)                 + ",";
  body += "\"hasFix\":";
  body += (gpsHasFix ? "true" : "false");
  body += ",";
  body += "\"timestamp\":\"" + getTimestamp()                     + "\"";
  body += "}";

  String url = String(BACKEND_URL) + "/api/gps";

  Serial.printf("[GPS] %.6f, %.6f | %.1f km/h | hdg:%.0f° | sats:%d | fix:%s\n",
    gpsLat, gpsLng, gpsSpeedKmh, gpsHeading, gpsSatellites,
    gpsHasFix ? "YES" : "NO");

  if (!serverAwake) {
    Serial.println("[HTTP] First request – Render may take up to 30s to wake up...");
    blinkLed(BLUE_LED, 5, 200); // 5 blinks = waking Render
  }

  // HTTPS with setInsecure() — skips SSL cert check (fine for this use case)
  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT_MS); // 35s — handles Render cold-start

  Serial.printf("[HTTP] POST %s\n", url.c_str());
  int code = http.POST(body);

  if (code == 200) {
    String response = http.getString();
    Serial.println("[HTTP] 200 OK – delivered to Smart DART server");
    Serial.println("[HTTP] Response: " + response);
    serverAwake = true;
    flashBlue(); // single blue flash = success

  } else if (code == 404) {
    String resp = http.getString();
    Serial.printf("[HTTP] 404 – busId '%s' not found\n", busId);
    Serial.println("[HTTP] Valid IDs: DART001 to DART012");
    Serial.println("[HTTP] Server says: " + resp);
    blinkLed(BLUE_LED, 3, 200); // 3 blinks = wrong bus ID

  } else if (code == -1 || code == 0) {
    Serial.println("[HTTP] Timeout – Render may still be waking up");
    Serial.println("[HTTP] Will retry in 5s");
    serverAwake = false;
    blinkLed(BLUE_LED, 2, 400); // 2 slow blinks = timeout

  } else {
    Serial.printf("[HTTP] Error code: %d\n", code);
    blinkLed(BLUE_LED, 3, 150);
  }

  http.end();
}

// ═══════════════════════════════════════════════════════════════
// WI-FI HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
void checkWifi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost – reconnecting...");
    ledOff(GREEN_LED);
    WiFi.reconnect();
    int tries = 0;
    while (WiFi.status() != WL_CONNECTED && tries < 20) {
      digitalWrite(GREEN_LED, !digitalRead(GREEN_LED));
      delay(500); tries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[WiFi] Reconnected: " + WiFi.localIP().toString());
      ledOn(GREEN_LED);
    } else {
      Serial.println("[WiFi] Reconnect failed – will retry");
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial2.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);

  pinMode(RED_LED,   OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BLUE_LED,  OUTPUT);

  blinkAll(2, 200);
  ledOn(RED_LED); // Red solid = booting

  Serial.println();
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║   Smart DART – REST API Tracker      ║");
  Serial.println("║   Backend: smart-dart.onrender.com   ║");
  Serial.println("╚══════════════════════════════════════╝");

  loadConfig();

  // ── WiFiManager portal ──────────────────────────────────────
  WiFiManagerParameter fieldBusId(
    "busid",
    "DART Bus ID  (DART001 – DART012)",
    busId,
    16
  );

  WiFiManager wm;
  wm.setSaveConfigCallback(onPortalSave);
  wm.addParameter(&fieldBusId);
  wm.setConfigPortalTimeout(180);
  wm.setConnectTimeout(30);

  Serial.println("[WiFi] Connecting...");
  Serial.println("[WiFi] If new: connect to 'SmartDART_Setup' / 'dart2024'");
  blinkAll(3, 100);

  if (!wm.autoConnect("SmartDART_Setup", "dart2024")) {
    Serial.println("[WiFi] Failed – restarting");
    delay(3000);
    ESP.restart();
  }

  strncpy(busId, fieldBusId.getValue(), sizeof(busId) - 1);
  if (portalSaved) saveConfig();

  Serial.println("[WiFi] Connected! IP: " + WiFi.localIP().toString());
  Serial.printf("[Config] Bus ID  = %s\n", busId);
  Serial.printf("[Config] Backend = %s\n", BACKEND_URL);

  ledOff(RED_LED);
  ledOn(GREEN_LED);

  syncNtp();

  Serial.println("[Boot] Ready – sending GPS to Render every 5s");
  Serial.println("[Boot] Note: first POST may take 30s if Render is sleeping");
  blinkAll(1, 400);
}

// ═══════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  // 1 – Always parse GPS
  readGPS();

  // 2 – POST to Render every 5 s
  if (now - lastSendMs >= SEND_INTERVAL_MS) {
    lastSendMs = now;
    sendToServer();
  }

  // 3 – Wi-Fi health check every 15 s
  if (now - lastWifiCheckMs >= WIFI_CHECK_MS) {
    lastWifiCheckMs = now;
    checkWifi();
  }

  // 4 – Re-sync NTP every hour
  if (now - lastNtpSyncMs >= NTP_RESYNC_MS) {
    lastNtpSyncMs = now;
    syncNtp();
  }
}
