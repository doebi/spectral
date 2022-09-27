let scalefx = 30;
let xAngle = -0.2;
let yAngle = 0.4;

let dimensions = [10, 7, 10];
let centerStripes = [0, 0, 0];
let countX = 0;
let countY = 0;
let countLed = 0;
let countTeensy = 0;

let stripes = new Array(10);
let drawLeds = true;
let debugLeds = false;
let animations = false;
let styleLeds = "spheres";

var mqtt;
var reconnectTimeout = 2000;
var host = "mqtt.devlol.org";
var port = 443;

let topic0 = "ledStripe/teensy_0";
let topic1 = "ledStripe/teensy_1";
let topic2 = "ledStripe/teensy_2";
let topic3 = "ledStripe/teensy_3";

function setup() {
    frameRate(15);
    createCanvas(600, 600, WEBGL);
    initStripesVariables();
    rectMode(CENTER);
    setBlack();

    MQTTconnect();
}

function draw() {
    background(0);

    poseLeds();

    //setBlack();

    if (animations) {
        drawAnimations();
        countUp();
    }

    if (debugLeds) {
        drawDebugLeds();
    }

    if (drawLeds) {
        drawStripes();
    }
}

function initStripesVariables() {
    centerStripes[0] = (dimensions[0] - 1) / 2;
    centerStripes[1] = (dimensions[1] - 1) / 2;
    centerStripes[2] = (dimensions[2] - 1) / 2;

    for (var i = 0; i < 10; i++) {
        stripes[i] = new Array(7);
        for (var j = 0; j < stripes[i].length; j++) {
            stripes[i][j] = new Array(10);
        }
    }
}

function setBlack() {
    for (var j = 0; j < 10; j++) {
        for (var l = 0; l < 10; l++) {
            for (var k = 6; k >= 0; k--) {
                stripes[j][k][l] = color(20, 20);
            }
        }
    }
}

function countUp() {

    countLed++;

    switch (countTeensy) {

        case (0):
            if (countLed > dimensions[1]) {
                countLed = 0;
                countY++;
            }
            if (countY > dimensions[2] / 2 - 1) {
                countY = 0;
                countX++;
            }
            if (countX > dimensions[0] / 2 - 1) {
                countLed = 0;
                countY = 0;
                countX = 5;
                countTeensy++;
            }
            break;

        case (1):
            if (countLed > dimensions[1]) {
                countLed = 0;
                countY++;
            }
            if (countY > dimensions[2] / 2 - 1) {
                countY = 0;
                countX++;
            }
            if (countX > dimensions[0] - 1) {
                countLed = 0;
                countX = 5;
                countY = 5;
                countTeensy++;
            }
            break;

        case (2):
            if (countLed > dimensions[1]) {
                countLed = 0;
                countY++;
            }
            if (countY > dimensions[2] - 1) {
                countY = 5;
                countX++;
            }
            if (countX > dimensions[0] - 1) {
                countLed = 0;
                countX = 0;
                countY = 5;
                countTeensy++;
            }
            break;

        case (3):
            if (countLed > dimensions[1]) {
                countLed = 0;
                countY++;
            }
            if (countY > dimensions[2] - 1) {
                countY = 5;
                countX++;
            }
            if (countX > dimensions[0] / 2 - 1) {
                countLed = 0;
                countX = 0;
                countY = 0;
                countTeensy = 0;
                setBlack();
            }
            break;

    }
}

function drawStripes() {
    stroke(255, 255 / (10 * 3));
    for (x = 0; x < dimensions[0]; x++)
        for (y = 0; y < dimensions[1]; y++)
            for (z = 0; z < dimensions[2]; z++) {
                push();
                translate(
                    scalefx * (x - centerStripes[0]),
                    scalefx * (dimensions[1] - 1 - y - centerStripes[1]),
                    scalefx * (z - centerStripes[2])
                );
                fill(stripes[x][y][z]);
                if (styleLeds == "box") box(scalefx, scalefx, scalefx);
                else sphere(scalefx / 4, 25, 25);
                pop();
            }
    noFill();
    stroke(255, 40);
    strokeWeight(5);
    translate(centerStripes[0], centerStripes[1], centerStripes[2]);
    box(
        scalefx * dimensions[0],
        scalefx * dimensions[1],
        scalefx * dimensions[2]
    );
}

function drawDebugLeds() {
    for (led = 0; led < 7; led++) {
        setVoxelrgb(0, led, 0, 222, 10, 121);
    }
    for (led = 0; led < 10; led++) {
        setVoxelrgb(0, 0, led, 222, 10, 121);
    }
    for (led = 0; led < 10; led++) {
        setVoxelrgb(led, 0, 0, 222, 10, 121);
    }
}

function drawAnimations() {
    setVoxelrgb(countX, (dimensions[1] - countLed - 1), countY, 100, 150, 250);
}

function setVoxelrgb(x, y, z, r, g, b) {
    if (x >= 0 && x < dimensions[0])
        if (y >= 0 && y < dimensions[1])
            if (z >= 0 && z < dimensions[2]) stripes[x][y][z] = color(r, g, b);
}

function poseLeds() {
    rotateY(xAngle);
    rotateX(-yAngle);
}

function mouseDragged() {
    xAngle += (mouseX - pmouseX) / 100;
    yAngle += (mouseY - pmouseY) / 100;
}

function MQTTconnect() {

    let clientID = "clientID-" + parseInt(Math.random() * 100);
    console.log("connecting to " + host + " " + port);
    mqtt = new Paho.MQTT.Client(host, port, clientID);
    var options = {
        useSSL: true,
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure
    };
    mqtt.onMessageArrived = onMessageArrived

    mqtt.connect(options);
}

function onConnect() {
    // Subscribe to the requested topic
    console.log("connected");
    mqtt.subscribe(topic0);
    mqtt.subscribe(topic1);
    mqtt.subscribe(topic2);
    mqtt.subscribe(topic3);
}

function onFailure() {
    console.log("Connection Attenpt to Host " + host + " Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
}

// Called when a message arrives
function onMessageArrived(message) {
    var payload = null;
    //console.log("Message recived: " + message.payloadString);
    //console.log("Topic: "+ message.destinationName);

    payload = JSON.parse(message.payloadString);

    if (payload.leds.length < 175) {
        for (i = payload.leds.length; i <= 175; i++) {
            payload.leds.push([0, 0, 0]);
        }
    }

    //console.log(payload.leds[1][1]);

    switch (message.destinationName) {
        case topic0:
            for (stripX = 0; stripX < 5; stripX++) {
                for (stripY = 0; stripY < 5; stripY++) {
                    for (led = 0; led < 7; led++) {
                        setVoxelrgb(stripX, (dimensions[1] - led - 1), stripY, payload.leds[led + (stripX * 7) + (stripY * 7)][0], payload.leds[led + (stripX * 7) + (stripY * 7)][1], payload.leds[led + (stripX * 7) + (stripY * 7)][2]);
                    }
                }
            }
            break;
        case topic1:
            for (stripX = 5; stripX < 10; stripX++) {
                for (stripY = 0; stripY < 5; stripY++) {
                    for (led = 0; led < 7; led++) {
                        setVoxelrgb(stripX, (dimensions[1] - led - 1), stripY, payload.leds[led + ((stripX - 5) * 7) + (stripY * 7)][0], payload.leds[led + ((stripX - 5) * 7) + (stripY * 7)][1], payload.leds[led + ((stripX - 5) * 7) + (stripY * 7)][2]);
                    }
                }
            }
            break;
        case topic2:
            for (stripX = 5; stripX < 10; stripX++) {
                for (stripY = 5; stripY < 10; stripY++) {
                    for (led = 0; led < 7; led++) {
                        setVoxelrgb(stripX, (dimensions[1] - led - 1), stripY, payload.leds[led + ((stripX - 5) * 7) + ((stripY - 5) * 7)][0], payload.leds[led + ((stripX - 5) * 7) + ((stripY - 5) * 7)][1], payload.leds[led + ((stripX - 5) * 7) + ((stripY - 5) * 7)][2]);
                    }
                }
            }
            break;
        case topic3:
            for (stripX = 0; stripX < 5; stripX++) {
                for (stripY = 5; stripY < 10; stripY++) {
                    for (led = 0; led < 7; led++) {
                        setVoxelrgb(stripX, (dimensions[1] - led - 1), stripY, payload.leds[led + (stripX * 7) + ((stripY - 5) * 7)][0], payload.leds[led + (stripX * 7) + ((stripY - 5) * 7)][1], payload.leds[led + (stripX * 7) + ((stripY - 5) * 7)][2]);
                    }
                }
            }
            break;
        default:
            break;
    }

}

function keyPressed() {
    setBlack();
    let countX = 0;
    let countY = 0;
    let countLed = 0;
    let countTeensy = 0;
    let keyIndex = -1;
    if (key == 'a' || key == 'A') {
        animations = !animations;
    }
}

function AdvancedCopy() {
    //the text that is to be copied to the clipboard
    var theText = '{"leds":[[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0],[200,200,0]]}';

    //create our hidden div element
    var hiddenCopy = document.createElement('div');
    //set the innerHTML of the div
    hiddenCopy.innerHTML = theText;
    //set the position to be absolute and off the screen
    hiddenCopy.style.position = 'absolute';
    hiddenCopy.style.left = '-9999px';

    //check and see if the user had a text selection range
    var currentRange;
    if (document.getSelection().rangeCount > 0) {
        //the user has a text selection range, store it
        currentRange = document.getSelection().getRangeAt(0);
        //remove the current selection
        window.getSelection().removeRange(currentRange);
    }
    else {
        //they didn't have anything selected
        currentRange = false;
    }

    //append the div to the body
    document.body.appendChild(hiddenCopy);
    //create a selection range
    var CopyRange = document.createRange();
    //set the copy range to be the hidden div
    CopyRange.selectNode(hiddenCopy);
    //add the copy range
    window.getSelection().addRange(CopyRange);

    //since not all browsers support this, use a try block
    try {
        //copy the text
        document.execCommand('copy');
    }
    catch (err) {
        window.alert("Your Browser Doesn't support this! Error : " + err);
    }
    //remove the selection range (Chrome throws a warning if we don't.)
    window.getSelection().removeRange(CopyRange);
    //remove the hidden div
    document.body.removeChild(hiddenCopy);

    //return the old selection range
    if (currentRange) {
        window.getSelection().addRange(currentRange);
    }
}

