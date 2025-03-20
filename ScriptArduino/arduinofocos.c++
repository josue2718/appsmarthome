#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Configuración WiFi
const char* ssid = "JOSUECIAU 6921";
const char* password = "3D1190u}";
const char* serverUrl = "https://aplicacionmovilot.azurewebsites.net/arduino";

// Configuración NTP para obtener la hora de México (UTC-6)
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", -21600, 60000);  // UTC-6 (México sin horario de verano)
bool foco1Activo = false;
bool foco2Activo = false;
bool foco3Activo = false;
bool foco4Activo = false;

// Definir los pines de los LEDs
#define ledPin 13
#define ledPin2 14
#define ledPin3 27
const int LDRPin = 26; // Pin para el fotoreceptor

void setup() {
  Serial.begin(9600);
  pinMode(ledPin2, OUTPUT);
  digitalWrite(ledPin2, LOW);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(ledPin3, OUTPUT);
  digitalWrite(ledPin3, LOW);
 pinMode(LDRPin, INPUT);

  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado a WiFi!");

  // Iniciar NTP Client
  timeClient.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    timeClient.update();
    HTTPClient http;
    http.begin(serverUrl);
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      
                int ldrValue = analogRead(LDRPin); // Leer el valor analógico del LDR
  Serial.print("Valor del LDR: ");
  Serial.println(ldrValue);
      String payload = http.getString();
      Serial.println("Respuesta del servidor: " + payload);

      // Procesar JSON
      StaticJsonDocument<1024> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        // Procesar el array "electrodomesticos"
        JsonArray electrodomesticos = doc["electrodomesticos"];
        for (JsonObject electrodomestico : electrodomesticos) {
          const char* pin = electrodomestico["pin"];
          bool activo = electrodomestico["activo"];

          if (strcmp(pin, "1") == 0) foco1Activo = activo;
          if (strcmp(pin, "2") == 0) foco2Activo = activo;
          if (strcmp(pin, "3") == 0) foco3Activo = activo;
          if (strcmp(pin, "4") == 0) foco4Activo = activo;
        }

        JsonArray modos = doc["Modo"];
        if (!modos.isNull() && modos.size() > 0) {
          JsonObject modoObj = modos[0];
          const char* modo = modoObj["modo"];

          int horaActual = timeClient.getHours();
          int minutosActuales = timeClient.getMinutes();
          Serial.printf("Hora actual en México: %02d:%02d\n", horaActual, minutosActuales);

          if (strcmp(modo, "hora") == 0) {
            Serial.println("Modo: hora activado");
            JsonObject horario = modoObj["horario"];
            const char* encender = horario["encender"];
            const char* apagar = horario["apagar"];
            Serial.printf("Encender: %s | Apagar: %s\n", encender, apagar);
            hora(encender, apagar, horaActual, minutosActuales);
          } 
          else if (strcmp(modo, "automatico") == 0) {
            JsonArray focos = doc["foco"];
            
            if (!focos.isNull() && focos.size() > 0) {
              JsonObject foco = focos[0];
              bool activofoco = foco["prendido"];
              
              int umbralOscuridad = 500;

              if (activofoco && ldrValue < umbralOscuridad) {
                manual();
              } else {
                foco1Activo = false;
                foco2Activo = false;
                foco3Activo = false;
                manual();
              }
            }
            else {
                foco1Activo = false;
                foco2Activo = false;
                foco3Activo = false;
                manual();
              }
          } 
          else {
            Serial.println("Modo desconocido");
          }
        } else {
          Serial.println("Error: No se encontró 'Modo' en el JSON.");
        }
      } else {
        Serial.println("Error al analizar JSON");
      }
    } else {
      Serial.print("Error en la petición HTTP, código: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Desconectado de WiFi, intentando reconectar...");
    WiFi.begin(ssid, password);
  }

  delay(500);
}

void hora(const char* encender, const char* apagar, int horaActual, int minutosActuales) {
  // Convertir encender y apagar en enteros
  int horaEncender, minEncender, horaApagar, minApagar;

  if (sscanf(encender, "%d:%d", &horaEncender, &minEncender) != 2) {
    Serial.println("Error en formato de encender");
    return;
  }

  if (sscanf(apagar, "%d:%d", &horaApagar, &minApagar) != 2) {
    Serial.println("Error en formato de apagar");
    return;
  }

  Serial.printf("Horario procesado -> Encender: %02d:%02d | Apagar: %02d:%02d\n", horaEncender, minEncender, horaApagar, minApagar);

  // Comparar con la hora actual
  if ((horaActual > horaEncender || (horaActual == horaEncender && minutosActuales >= minEncender)) && (horaActual < horaApagar || (horaActual == horaApagar && minutosActuales < minApagar))) {
    prender();

  } else {
    Serial.println("Apagando LED...");
   foco1Activo = false;
foco2Activo = false;
foco3Activo = false;
foco4Activo = false;
manual();
  }
}

void manual() {
 Serial.println("Encendiendo LED...");
  if (foco1Activo) {
    analogWrite(ledPin, 512);
    Serial.println("LED ENCENDIDO (Foco 1 activo)");
  } else {
    analogWrite(ledPin, 0);
    Serial.println("LED APAGADO (Foco 1 inactivo)");
  }
   if (foco2Activo) {
    analogWrite(ledPin2, 512);
    Serial.println("LED ENCENDIDO (Foco 2 activo)");
  } else {
    analogWrite(ledPin2, 0);
    Serial.println("LED APAGADO (Foco 2 inactivo)");
  }
   if (foco3Activo) {
    analogWrite(ledPin3, 512);
    Serial.println("LED ENCENDIDO (Foco 3 activo)");
  } else {
    analogWrite(ledPin3, 0);
    Serial.println("LED APAGADO (Foco 3 inactivo)");
  }
}

void prender() {
  Serial.println("Encendiendo LED...");
  if (foco1Activo) {
    analogWrite(ledPin, 512);
    Serial.println("LED ENCENDIDO (Foco 1 activo)");
  } else {
    analogWrite(ledPin, 0);
    Serial.println("LED APAGADO (Foco 1 inactivo)");
  }
   if (foco2Activo) {
    analogWrite(ledPin2, 512);
    Serial.println("LED ENCENDIDO (Foco 2 activo)");
  } else {
    analogWrite(ledPin2, 0);
    Serial.println("LED APAGADO (Foco 2 inactivo)");
  }
   if (foco3Activo) {
    analogWrite(ledPin3, 512);
    Serial.println("LED ENCENDIDO (Foco 3 activo)");
  } else {
    analogWrite(ledPin3, 0);
    Serial.println("LED APAGADO (Foco 3 inactivo)");
  }
}
