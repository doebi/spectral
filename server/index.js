const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const mqtt = require('mqtt');

// mqtt client
const client = mqtt.connect('mqtt://mqtt.devlol.org');
// serial port
const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 115200,
})
// stream parser
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

let frame, lastFrame;
let colorIndex = 0;
const colors = ["RED", "BLUE", "PINK", "ORANGE"];

const dimension = {
  x: 10,
  y: 10,
  z: 7
};

const maxAge = 100;

const teensies = {
  'alpha': {
    center: [0, 0, 0]
  },
  'beta': {
    center: [0, 0, 0]
  },
  'gamma': {
    center: [0, 0, 0]
  },
  'delta': {
    center: [0, 0, 0]
  }
}

let world = null;
let spheres = [];

function initWorld() {
  world = Array(dimension.x);
  for (var x = 0; x < dimension.x; x++) {
    world[x] = Array(dimension.y)
    for (var y = 0; y < dimension.y; y++) {
      world[x][y] = Array(dimension.z)
    }
  }
}

function setVoxel(xf, yf, zf, c) {
  let x = xf.toFixed();
  let y = yf.toFixed();
  let z = zf.toFixed();
  if ((x >= 0) && (x < dimension.x)) {
    if ((y >= 0) && (y < dimension.y)) {
      if ((z >= 0) && (z < dimension.z)) {
        world[Math.abs(x)][Math.abs(y)][Math.abs(z)] = c;
      }
    }
  }
}

function randomColor() {
  return [
    Number(Number(Math.random()*255).toFixed()),
    Number(Number(Math.random()*255).toFixed()),
    Number(Number(Math.random()*255).toFixed())
  ];
}

function drawSphere(center, radius, color) {
  //console.log('drawSphere', center, radius, color);
  let res = 30;
  for (let m = 0; m < res; m++) {
    for (let n = 0; n < res; n++) {
      setVoxel(
        center[0] + radius * Math.sin(Math.PI * m / res) * Math.cos(2 * Math.PI * n / res),
        center[1] + radius * Math.sin(Math.PI * m / res) * Math.sin(2 * Math.PI * n / res),
        center[2] + radius * Math.cos(Math.PI * m / res),
        color);
    }
  }
}

function drawBackground(color) {
  for (var x = 0; x < dimension.x; x++) {
    for (var y = 0; y < dimension.y; y++) {
      for (var z = 0; z < dimension.z; z++) {
        world[x][y][z] = color;
      }
    }
  }
}

function spawnSignal(id, strength) {
  let t = teensies[id];
  let sphere = {
    center: t.center,
    strength,
    age: 0,
    color: randomColor()
  };
  spheres.push(sphere);
}

function step() {
  let nSpheres = [];
  for (var i = 0, len = spheres.length; i < len; i++) {
    let s = spheres[i];
    s.age += 1;

    if (spheres[i].age < maxAge) {
      nSpheres.push(s);
    }
  }

  spheres = nSpheres;
  //console.log(spheres);
}

function draw() {
  drawBackground([0, 0, 0]);

  for (var i = 0, len = spheres.length; i < len; i++) {
    let s = spheres[i];
    drawSphere(s.center, s.age, s.color);
  }
}

function flush() {
  let color = colors[colorIndex];
  frame = Buffer.from(color) + "\n";

  if (frame != lastFrame) {
    port.write(frame);
    lastFrame = frame;
  }

  /*
  if (client.connected) {
    //console.log(JSON.stringify(world));
    //client.publish('artdanion/spectral/world', JSON.stringify(world));
  }
  */
}

function setup() {
  // initalize the world
  initWorld();

  // Listen for data on serial port
  // TODO: do this for every serial port / teensy

  parser.on('data', function (data) {
    let id = 'alpha';
    spawnSignal(id, Number(data.toString()));

    // for testing only
    colorIndex = Math.floor(Math.random() * colors.length);
  })

  // start the loop
  loop();
}

function loop() {
  step();
  draw();
  flush();
  setTimeout(loop, 40);
}

setup();
