/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      SMART DART – ESP32 FIREBASE GPS TRACKER                ║
 * ║      Writes GPS directly to Firebase Realtime Database      ║
 * ║      No backend server needed – data goes straight to map   ║
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
 *  │ Firebase ESP Client          │ Mobizt                    │
 *  │ TinyGPS++                    │ Mikal Hart                │
 *  │ WiFiManager                  │ tzapu                     │
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
 *    Red  blinking = GPS fix active, reading satellites
 *    Green solid   = Wi-Fi connected
 *    Green blink   = Wi-Fi reconnecting
 *    Blue flash    = data written to Firebase successfully
 *    Blue 3× blink = Firebase write failed
 *
 *  FIRST RUN SETUP:
 *    1. Fill in YOUR_FIREBASE_* values below
 *    2. Flash this code to ESP32
 *    3. Connect phone/laptop to WiFi "SmartDART_Setup" / "dart2024"
 *    4. Browser opens at 192.168.4.1
 *    5. Enter your home/office WiFi credentials + Bus ID
 *    6. Device saves and reboots — map shows LIVE badge immediately
 *
 *  DATA FLOW:
 *    ESP32 → Firebase Realtime DB → Vercel web app (live map)
 *    No backend server involved — works even when Render is sleeping
 */

// ── Libraries ──────────────────────────────────────────────────
#include <WiFi.h>
#include <TinyGPS++.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFiManager.h>
#include <time.h>
#include <Firebase_ESP_Client.h>

// Firebase helper add-ons (included with the library)
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ── !! FILL IN YOUR FIREBASE VALUES HERE !! ───────────────────
// Found at: Firebase Console → Project Settings → Your Apps → Config
#define YOUR_FIREBASE_API_KEY      "AIzaSyD2aFuLJmQ3aIfYJcUWSXyK5TWw-hygoJc"
#define YOUR_FIREBASE_DATABASE_URL "https://mwendokasi-8d66c-default-rtdb.europe-west1.firebasedatabase.app"
// ─────────────────────────────────────────────────────────────

// ── Pin Definitions ───────────────────────────────────────────
#define RED_LED    14
#define GREEN_LED  27
#define BLUE_LED   26
#define GPS_RX     16   // ESP32 RX2 ← NEO-6M TX
#define GPS_TX     17   // ESP32 TX2 → NEO-6M RX
#define GPS_BAUD   9600

// ── Timing ────────────────────────────────────────────────────
#define SEND_INTERVAL_MS   5000   // write to Firebase every 5 s
#define WIFI_CHECK_MS      15000  // check Wi-Fi health every 15 s
#define NTP_RESYNC_MS      3600000 // re-sync NTP once per hour
#define GPS_FIX_TIMEOUT_MS 5000   // declare fix lost after 5 s silence

// ── Bus ID (configurable via WiFiManager portal) ──────────────
char busId[16] = "DART001";     // change default here or set in portal

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

// ── Firebase ──────────────────────────────────────────────────
FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig fbConfig;
bool           fbReady       = false;
bool           fbSignedUp    = false;

// ── Timing ────────────────────────────────────────────────────
unsigned long lastSendMs      = 0;
unsigned long lastWifiCheckMs = 0;
unsigned long lastNtpSyncMs   = 0;

// ── WiFiManager flag ──────────────────────────────────────────
bool portalSaved = false;

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

void blinkAll(int times, int ms = 120) {
  for (int i = 0; i < times; i++) {
    ledOn(RED_LED); ledOn(GREEN_LED); ledOn(BLUE_LED);
    delay(ms);
    ledOff(RED_LED); ledOff(GREEN_LED); ledOff(BLUE_LED);
    delay(ms);
  }
}

void flashBlue() {
  ledOn(BLUE_LED);
  delay(80);
  ledOff(BLUE_LED);
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
    Serial.println("[SPIFFS] No config file – using defaults");
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
  Serial.println("[Config] Saved to flash");
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
    delay(500);
    Serial.print(".");
    time(&now);
    tries++;
  }
  Serial.println(now > 1609459200L ? " OK" : " FAILED");
}

// Returns ISO-8601 UTC string e.g. "2026-06-06T10:30:00Z"
String getTimestamp() {
  time_t now;
  time(&now);
  if (now > 1609459200L) {
    struct tm t;
    gmtime_r(&now, &t);
    char buf[30];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &t);
    return String(buf);
  }
  // Fallback to GPS time
  if (gps.date.isValid() && gps.time.isValid() && gps.date.year() > 2020) {
    char buf[30];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
      gps.date.year(), gps.date.month(),  gps.date.day(),
      gps.time.hour(), gps.time.minute(), gps.time.second());
    return String(buf);
  }
  return String(millis()); // last resort
}

// ═══════════════════════════════════════════════════════════════
// GPS — parse NMEA from Serial2
// ═══════════════════════════════════════════════════════════════
void readGPS() {
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  if (gps.location.isValid() && gps.location.isUpdated()) {
    gpsLat     = gps.location.lat();
    gpsLng     = gps.location.lng();
    gpsHasFix  = true;
    lastFixMs  = millis();

    if (gps.speed.isValid())      gpsSpeedKmh   = gps.speed.kmph();
    if (gps.course.isValid())     gpsHeading    = gps.course.deg();
    if (gps.satellites.isValid()) gpsSatellites = gps.satellites.value();
    if (gps.hdop.isValid())       gpsHdop       = gps.hdop.hdop();

    // Blink red to show active satellite parsing
    digitalWrite(RED_LED, !digitalRead(RED_LED));
  }

  // Fix lost
  if (millis() - lastFixMs > GPS_FIX_TIMEOUT_MS) {
    gpsHasFix = false;
    ledOn(RED_LED);
  }
}

// ═══════════════════════════════════════════════════════════════
// FIREBASE — initialise with Anonymous sign-in
// ═══════════════════════════════════════════════════════════════
void initFirebase() {
  fbConfig.api_key      = YOUR_FIREBASE_API_KEY;
  fbConfig.database_url = YOUR_FIREBASE_DATABASE_URL;

  // Token status callback — prints token generation to Serial
  fbConfig.token_status_callback = tokenStatusCallback;

  // Anonymous sign-up (one-time, result cached in auth object)
  if (!fbSignedUp) {
    Serial.print("[Firebase] Signing in anonymously...");
    if (Firebase.signUp(&fbConfig, &auth, "", "")) {
      fbSignedUp = true;
      Serial.println(" OK");
    } else {
      Serial.printf(" FAILED: %s\n", fbConfig.signer.signupError.message.c_str());
    }
  }

  Firebase.reconnectWiFi(true);
  Firebase.begin(&fbConfig, &auth);
  fbReady = true;
  Serial.println("[Firebase] Initialised");
}

// ═══════════════════════════════════════════════════════════════
// FIREBASE — write GPS data to dart-buses/{busId}
// ═══════════════════════════════════════════════════════════════
void sendToFirebase() {
  if (!fbReady) { Serial.println("[Firebase] Not ready"); return; }
  if (!Firebase.ready()) { Serial.println("[Firebase] Waiting..."); return; }

  // Path in the database: dart-buses/DART001
  String path = "/dart-buses/" + String(busId);

  FirebaseJson json;
  json.set("busId",      String(busId));
  json.set("latitude",   gpsLat);
  json.set("longitude",  gpsLng);
  json.set("speed",      gpsSpeedKmh);
  json.set("heading",    gpsHeading);
  json.set("satellites", gpsSatellites);
  json.set("hdop",       gpsHdop);
  json.set("hasFix",     gpsHasFix);
  json.set("timestamp",  getTimestamp());

  Serial.printf("[GPS] %.6f, %.6f | %.1f km/h | hdg:%.0f° | sats:%d | fix:%s\n",
    gpsLat, gpsLng, gpsSpeedKmh, gpsHeading, gpsSatellites,
    gpsHasFix ? "YES" : "NO");

  if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
    Serial.println("[Firebase] ✓ Written to " + path);
    flashBlue();
  } else {
    Serial.printf("[Firebase] ✗ Error: %s\n", fbdo.errorReason().c_str());
    blinkLed(BLUE_LED, 3, 150); // 3 blinks = write failed
  }
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
      delay(500);
      tries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[WiFi] Reconnected: " + WiFi.localIP().toString());
      ledOn(GREEN_LED);
    } else {
      Serial.println("[WiFi] Reconnect failed");
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

  // Boot sequence
  blinkAll(2, 200);
  ledOn(RED_LED); // Red solid = booting

  Serial.println();
  Serial.println("╔══════════════════════════════════╗");
  Serial.println("║  Smart DART – Firebase Tracker   ║");
  Serial.println("╚══════════════════════════════════╝");

  // Load saved Bus ID from flash
  loadConfig();

  // ── WiFiManager portal ──────────────────────────────────────
  WiFiManagerParameter fieldBusId(
    "busid",
    "DART Bus ID  (e.g. DART001 to DART012)",
    busId,
    16
  );

  WiFiManager wm;
  wm.setSaveConfigCallback(onPortalSave);
  wm.addParameter(&fieldBusId);
  wm.setConfigPortalTimeout(180); // portal closes after 3 min
  wm.setConnectTimeout(30);

  Serial.println("[WiFi] Connecting...");
  Serial.println("[WiFi] If new device: connect to 'SmartDART_Setup' / 'dart2024'");

  blinkAll(3, 100); // Signal portal is starting

  if (!wm.autoConnect("SmartDART_Setup", "dart2024")) {
    Serial.println("[WiFi] Failed – restarting in 3s");
    delay(3000);
    ESP.restart();
  }

  // Read Bus ID from portal
  strncpy(busId, fieldBusId.getValue(), sizeof(busId) - 1);
  if (portalSaved) saveConfig();

  Serial.println("[WiFi] Connected! IP: " + WiFi.localIP().toString());
  Serial.printf("[Config] Bus ID = %s\n", busId);

  ledOff(RED_LED);
  ledOn(GREEN_LED); // Green on = Wi-Fi OK

  // Sync clock via internet
  syncNtp();

  // Connect to Firebase
  initFirebase();

  Serial.println("[Boot] Ready – writing GPS to Firebase every 5s");
  blinkAll(1, 400); // Single long blink = ready
}

// ═══════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  // 1 – Always parse GPS
  readGPS();

  // 2 – Write to Firebase every 5 s
  if (now - lastSendMs >= SEND_INTERVAL_MS) {
    lastSendMs = now;
    sendToFirebase();
  }

  // 3 – Check Wi-Fi health every 15 s
  if (now - lastWifiCheckMs >= WIFI_CHECK_MS) {
    lastWifiCheckMs = now;
    checkWifi();
  }

  // 4 – Re-sync NTP once per hour
  if (now - lastNtpSyncMs >= NTP_RESYNC_MS) {
    lastNtpSyncMs = now;
    syncNtp();
  }
}
