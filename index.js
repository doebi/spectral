const { SerialPort } = require('serialport')

let world = null;

let dimension = {
  x: 10,
  y: 10,
  z: 7
};
let spheres = [];

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

function initWorld() {
  world = Array(dimension.x);
  for (var x = 0, len = dimension.x; x < len; x++) {
    world[x] = Array(dimension.y)
    for (var y = 0, len = dimension.y; y < len; y++) {
      world[x][y] = Array(dimension.z)
    }
  }
}

function randomColor() {
  return [Math.random(), Math.random(), Math.random()];
}

/*
function drawSphere(center, radius, color) {
	float res = 30;
	for (float m = 0; m < res; m++)
		for (float n = 0; n < res; n++)
			setVoxel(
					center.x + radius * Math.sin((float) Math.PI * m / res)
							* Math.cos((float) 2 * Math.PI * n / res),
					center.y + radius * Math.sin((float) Math.PI * m / res)
							* Math.sin((float) 2 * Math.PI * n / res),
					center.z + radius * Math.cos((float) Math.PI * m / res),
					col);
}
*/

function drawBackground(color) {
  console.log("==============================");
  for (var x = 0, len = dimension.x; x < len; x++) {
    for (var y = 0, len = dimension.y; y < len; y++) {
      for (var z = 0, len = dimension.z; z < len; z++) {
				world[x][y][z] = color;
      }
    }
  }
  console.log(world);
}

function spawnSignal(id, strength) {
  let t = teensies[id];
  let sphere = {
    strength,
    age: 0,
    color: randomColor()
  };
  spheres.push(sphere);
}

function step() {
  let nSpheres = [];
  //TODO: next step in simulation
  for (var i = 0, len = spheres.length; i < len; i++) {
    let s = spheres[i];
    s.age += 1;

    if (spheres[i].age < maxAge) {
      nSpheres.push(s);
    }
  }

  spheres = nSpheres;
}

function draw() {
  drawBackground("foo");

  /*
  for (var i = 0, len = spheres.length; i < len; i++) {
    drawSphere();
  }
  */
}

function setup() {
  // initalize the world
  initWorld();

  // open serial port
  const port = new SerialPort({
    path: '/dev/ttyACM0',
    baudRate: 115200,
  })

  // Listen for data on serial port
  // TODO: do this for every serial port / teensy
  port.on('data', function (data) {
    let id = 'first';
    spawnSignal(id, Number(data.toString()));
  })

  // start the loop
  loop();
}

function loop() {
  step();

  draw();

  console.log(world);
  setTimeout(loop, 20);
}

setup();
