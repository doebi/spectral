#include <Arduino.h>
#include <OctoWS2811.h>
#include <ArduinoJson.h>
#include "Wire.h"

#define pot_address 0x2E // I2C address
#define POTI A0
#define POT_MAX 1023

#define RED 0xFF0000
#define GREEN 0x00FF00
#define BLUE 0x0000FF
#define YELLOW 0xFFFF00
#define PINK 0xFF1088
#define ORANGE 0xE05800
#define WHITE 0xFFFFFF

// Less intense...
/*
#define RED    0x160000
#define GREEN  0x001600
#define BLUE   0x000016
#define YELLOW 0x101400
#define PINK   0x120009
#define ORANGE 0x100400
#define WHITE  0x101010
*/

// declarations
const int numPins = 25;
byte pinList[numPins] = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33};
const int ledsPerStrip = 7;
const int bytesPerLED = 3; // change to 4 if using RGBW
DMAMEM int displayMemory[ledsPerStrip * numPins * bytesPerLED / 4];
int drawingMemory[ledsPerStrip * numPins * bytesPerLED / 4];

DynamicJsonDocument doc(1024);
JsonArray arr;

const int config = WS2811_GRB | WS2811_800kHz;
OctoWS2811 leds(ledsPerStrip, displayMemory, drawingMemory, config, numPins, pinList);

const int potTreshold = 400; // value between 0 and 1

// runtime variables
int potVal;
uint now = 0;
const int potInterval = 400;

void colorWipe(int color, int wait) {
  for (int i = 0; i < leds.numPixels(); i++) {
    leds.setPixel(i, color);
    leds.show();
    delayMicroseconds(wait);
  }
}

void colorWipe3(byte r, byte g, byte b, int wait) {
  for (int i = 0; i < leds.numPixels(); i++) {
    leds.setPixel(i, r, g, b);
    leds.show();
    delayMicroseconds(wait);
  }
}

void setup() {
  //comm setup
  Serial.begin(115200);

  // debug setup
  Serial1.begin(115200);

  // leds setup
  leds.begin();
  leds.show();

  // pot setup
  pinMode(POTI, INPUT);

  // wire setup
  Wire.begin();
  Wire.beginTransmission(pot_address);
  Wire.write(0b00000000);
  Wire.write(80);
  Wire.endTransmission();
  //Serial1.print(" sent - ");
  //Serial1.println(rval, HEX);
}

  /*
  int microsec = 200000 / leds.numPixels(); // change them all in 2 seconds
  colorWipe(RED, microsec);
  colorWipe(GREEN, microsec);
  colorWipe(BLUE, microsec);
  colorWipe(YELLOW, microsec);
  colorWipe(PINK, microsec);
  colorWipe(ORANGE, microsec);
  colorWipe(WHITE, microsec);

  Serial1.println(analogRead(A0));
  */

void checkPot() {
  potVal = analogRead(POTI);

  // for testing only
  //potVal = random(0, POT_MAX);

  if (potVal > potTreshold) {
    Serial1.print("above threshold: ");
    Serial1.println(potVal);

    // publish value to comms
    Serial.println(potVal);
  }
}

void checkComm() {
  String incoming;

  if (Serial.available() > 0) {
    // read the incoming byte:
    incoming = Serial.readStringUntil('\n');

    deserializeJson(doc, incoming);

    colorWipe3(doc[0], doc[1], doc[2], 0);
  }
}

void loop() {
  if(millis() >= now + potInterval){
    now += potInterval;
    // read analog value from detector
    checkPot();
  }

  // read frame from comm serial
  checkComm();
}
