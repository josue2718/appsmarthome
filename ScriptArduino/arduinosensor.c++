#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

#define LED_PIN1 5  // Define el pin GPIO del LED
#define TRIG_PIN 12 // Pin TRIG del sensor HC-SR04
#define ECHO_PIN 14 // Pin ECHO del sensor HC-SR04

long duration;
float cm;
int button = 16;
bool buttonPressed = false;
int lastButtonState = LOW;
const char* ssid = "JOSUECIAU 6921";
const char* password = "3D1190u}";
const char* apiUrl = "https://aplicacionmovilot.azurewebsites.net/entrada";
WiFiClientSecure wifiClient;
bool postSent = false;  // Variable para evitar múltiples envíos

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a Wi-Fi...");
  }
  Serial.println("Conectado a Wi-Fi");
  pinMode(button, INPUT);
  pinMode(LED_PIN1, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  cm = medirDistancia();

  Serial.print("Distancia: ");
  Serial.print(cm);
  Serial.println(" cm");

  distancia(cm);

  int buttonState = digitalRead(button);
  if (buttonState == HIGH && lastButtonState == LOW) {
    buttonPressed = true;
    delay(50);
  }
  lastButtonState = buttonState;
  if (buttonPressed) {
    buttonPressed = false;
    delay(1000);
  }
  delay(500);
}

float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

void post() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    wifiClient.setInsecure();
    http.begin(wifiClient, apiUrl);
    http.addHeader("Content-Type", "application/json");
    String payload = "{}";
    int httpCode = http.POST(payload);

    Serial.print("HTTP Code: ");
    Serial.println(httpCode);
    if (httpCode > 0) {
      Serial.println("Datos enviados correctamente");
    } else {
      Serial.print("Error al enviar datos. Código: ");
      Serial.println(httpCode);
    }
    http.end();
  } else {
    Serial.println("No conectado a Wi-Fi");
  }
}

void distancia(float distancia) {
  if (distancia <= 25 && !postSent) {
    digitalWrite(LED_PIN1, HIGH);
    post();
    postSent = true;
  } else if (distancia > 25) {
    digitalWrite(LED_PIN1, LOW);
    postSent = false;
  }
}
