// Phoebe Royer
// Experiment 4 - 3D Graphics
// 2/5/25

p5.disableFriendlyErrors = true;

let kittyModel;
let kittyTexture;
let cols, rows;
let scl = 40; // Scale of each grid cell
let w = 1200, h = 800;
let terrain = [];
let sandFlow = [];
let particles = [];  // List to store interactive particles

function preload() {
  kittyTexture = loadImage('./js/model/sand_tex.jpg');  // Replace with your texture URL
  kittyModel = loadModel(
    './js/model/kitty!.obj',  // Replace with your model URL
    true
  );
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('canvas-container');
  kittyModel.computeNormals();

  // desert plane grid
  cols = w / scl;
  rows = h / scl;

  // Initialize terrain and sandFlow buffers
  for (let y = 0; y < rows; y++) {
    terrain[y] = [];
    sandFlow[y] = [];
    for (let x = 0; x < cols; x++) {
      let h = noise(x * 0.1, y * 0.1) * 50;
      terrain[y][x] = h;
      sandFlow[y][x] = h;
    }
  }
}

function draw() {
  background('#d4bd8f');  // Background color to match sand
  noStroke();
  orbitControl(); // move kitty around

  // Put kitty on a plane
	push()
	rotateX(PI/2)
	ambientLight(color(230 - h * 0.5, 200 - h * 0.3, 150 - h * 0.2))
	spotLight(color(230 - h * 0.5, 200 - h * 0.3, 150 - h * 0.2)) //, [angle], [concentration])
	pop()

	// Draw sand with with POINTS mode
	push()
	strokeWeight(5)
	stroke(255)
	translate(-width/2, -height/2)
	beginShape(POINTS)
	const t = millis()
	for (let i = 0; i < 200; i++) {
		vertex(
			(noise(i * PI) * 2 * width + t * 0.01) % width + sin(t * 0.0012 + i * Math.E)*80,
			(noise(i * PI, 100) * 2 * height + t * 0.03) % height + sin(t * 0.0009 + i * Math.E)*40,
			(noise(i * PI, 200) * 2 * width) % width - width/2,
		)
	}
	endShape()
	pop()

  // Draw Kitty
  push();
  lights();
  texture(kittyTexture);
  ambientLight(100);
  spotLight(color(230 - h * 0.5, 200 - h * 0.3, 150 - h * 0.2));
  shininess(300);
  scale(1, -1, 1);  // Flip kitty to be upright
  translate(0, 100, 0);  // Move kitty up a bit
  scale(1);  // Scale up the model

  model(kittyModel);
  pop();

  // draw desert plane
  rotateX(PI / 4);
  translate(-w / 2, -h / 2);

  // Smooth sand movement
  updateSandFlow();

  // Update and display particles (user interaction)
  updateParticles();

  // Draw terrain
  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      let h = terrain[y][x];
      stroke(100, 80, 50);
      fill(230 - h * 0.5, 200 - h * 0.3, 150 - h * 0.2); // Height-based shading
      vertex(x * scl, y * scl, h);
      vertex(x * scl, (y + 1) * scl, terrain[y + 1][x]);
    }
    endShape();
  }
}

// Sand diffusion for a natural dune effect
function updateSandFlow() {
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      let avg = (terrain[y][x] + terrain[y + 1][x] + terrain[y - 1][x] +
                 terrain[y][x + 1] + terrain[y][x - 1]) / 5;
      sandFlow[y][x] = lerp(terrain[y][x], avg, 0.1); // Smooth shifting
    }
  }

  // Apply the new terrain heights
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      terrain[y][x] = sandFlow[y][x];
    }
  }
}

// Update and simulate user interaction with particles
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.applyForce(createVector(0, 0.1)); // Gravity force

    p.update();

    // Ensure the particle is within the bounds of the terrain
    let xIndex = floor(p.pos.x / scl);
    let yIndex = floor(p.pos.y / scl);
    if (xIndex >= 0 && xIndex < cols && yIndex >= 0 && yIndex < rows) {
      let terrainHeight = terrain[yIndex][xIndex];
      
      // Check if particle is below the terrain and handle bounce
      if (p.pos.z >= terrainHeight) {
        p.pos.z = terrainHeight;
        p.vel.z *= -0.5; // Bounce effect with a reduced speed
        p.acc.z = 0; // Stop downward acceleration after bounce
      }
    }

    if (p.pos.z > 1000) { // Remove particles that go too far
      particles.splice(i, 1);
    }

    p.display();
  }
}

// Create a particle with gravity and collision behavior
function mousePressed() {
  let px = map(mouseX, 0, width, 0, cols) * scl;
  let py = map(mouseY, 0, height, 0, rows) * scl;

  let newParticle = new Particle(px, py);
  particles.push(newParticle);
}

// Particle class representing user-interactive objects
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y, terrain[floor(y / scl)][floor(x / scl)]); // Initial position based on terrain height
    this.vel = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration each frame
  }

  display() {
    push();
    noStroke();
    
    // Dynamically set the particle color based on the terrain height
    let xIndex = floor(this.pos.x / scl);
    let yIndex = floor(this.pos.y / scl);
    if (xIndex >= 0 && xIndex < cols && yIndex >= 0 && yIndex < rows) {
      let h = terrain[yIndex][xIndex]; // Get terrain height at particle position
      let sandColor = color(230 - h * 0.5, 200 - h * 0.3, 150 - h * 0.2); // Use same color logic as terrain
      fill(sandColor);
    }

    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(5);
    pop();
  }
}

// Smooth mouse interaction with a radial effect
function mouseDragged() {
  let xIndex = floor(map(mouseX, 0, width, 0, cols));
  let yIndex = floor(map(mouseY, 0, height, 0, rows));

  if (xIndex >= 0 && xIndex < cols && yIndex >= 0 && yIndex < rows) {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        let nx = xIndex + x;
        let ny = yIndex + y;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          let distance = dist(x, y, 0, 0);
          let effect = max(0, 10 - distance * 3);
          terrain[ny][nx] += effect;
        }
      }
    }
  }
}
