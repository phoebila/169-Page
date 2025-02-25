let armSegments = [100, 80, 60]; // Lengths of arm segments
let angles;
let sliders = [];
let mode = 'manual'; // 'manual' or 'auto'
let particles = []; // Blood-like fluid particles
let presetIndex = 0;
let presets = ['wave', 'grab', 'drop'];

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');
  angles = [PI / 4, PI / 4, PI / 4]; // Initialize angles inside setup
  
  for (let i = 0; i < angles.length; i++) {
    sliders.push(createSlider(0, PI, angles[i], 0.01));
    sliders[i].position(550, 600 + i * 30);
  }
  let modeButton = createButton('Toggle Mode');
  modeButton.position(550, 700);
  modeButton.mousePressed(() => mode = mode === 'manual' ? 'auto' : 'manual');
  
  let presetButton = createButton('Next Preset');
  presetButton.position(650, 700);
  presetButton.mousePressed(() => presetIndex = (presetIndex + 1) % presets.length);
}

function draw() {
  background(240);
  translate(width / 2, height / 2);
  
  if (mode === 'auto') executePreset(presets[presetIndex]);
  else for (let i = 0; i < sliders.length; i++) angles[i] = sliders[i].value();
  
  drawArm();
  updateParticles();
  drawParticles();
}

function drawArm() {
  let x = 0, y = 0;
  stroke(0);
  strokeWeight(10);
  noFill();
  
  for (let i = 0; i < armSegments.length; i++) {
    let newX = x + cos(angles[i]) * armSegments[i];
    let newY = y + sin(angles[i]) * armSegments[i];
    line(x, y, newX, newY);
    x = newX;
    y = newY;
  }
  particles.push({ x, y, lifetime: 255 });
}

function executePreset(type) {
  let t = millis() / 1000;
  if (type === 'wave') angles[1] = PI / 4 + sin(t * 2) * PI / 8;
  if (type === 'grab') { angles[1] = PI / 6; angles[2] = PI / 3; }
  if (type === 'drop') { angles[1] = PI / 2; angles[2] = PI / 6; }
}

function updateParticles() {
  for (let p of particles) p.lifetime -= 5;
  particles = particles.filter(p => p.lifetime > 0);
}

function drawParticles() {
  noStroke();
  for (let p of particles) {
    fill(200, 0, 0, p.lifetime);
    ellipse(p.x, p.y, 10);
  }
}
