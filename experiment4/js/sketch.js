let cols, rows;
let scl = 20; // Scale of each grid cell
let w = 800, h = 600;
let terrain = [];
let sandFlow = [];
let particles = [];  // List to store interactive particles

let wind = createVector(0.02, 0); // Wind force to push particles horizontally

function setup() {
  let canvas = createCanvas(800, 600, WEBGL);
  canvas.parent('canvas-container');
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
  background(200, 180, 140);
  rotateX(PI / 3);
  translate(-w / 2, -h / 2);

  // Smooth sand movement
  updateSandFlow();

  // Update and display particles (user interaction)
  updateParticles();

  // Draw terrain with some undulation for extra effect
  drawTerrain();

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
    p.applyForce(wind); // Apply wind force

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
    this.size = random(3, 6); // Random size for variety
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
      let sandColor = color(230 - h * 0.5 + random(-10, 10), 200 - h * 0.3 + random(-10, 10), 150 - h * 0.2 + random(-10, 10)); // Add random color variation for variety
      fill(sandColor);
    }

    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(this.size);  // Use random size for each particle for variation
    pop();
  }
}

// Draw terrain with some undulation for extra effect
function drawTerrain() {
  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      let h = terrain[y][x] + sin(frameCount * 0.05 + x * 0.1) * 3; // Undulate the terrain
      stroke(100, 80, 50);
      fill(230 - h * 0.5, 200 - h * 0.3, 150 - h * 0.2); // Height-based shading
      vertex(x * scl, y * scl, h);
      vertex(x * scl, (y + 1) * scl, terrain[y + 1][x] + sin(frameCount * 0.05 + (x + y) * 0.1) * 3); // Add slight undulation
    }
    endShape();
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
