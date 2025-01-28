// Enhanced desert scene with dynamic elements
// Author: Phoebe Royer
// Date: 1/28/25

// Generative Desert Landscape with Dynamic Dunes
let NUM_LAYERS = 7;           // Number of dune layers
let LAYER_HEIGHT_FACTOR = 0.22; // Vertical space each layer occupies
let NOISE_SCALE = 0.0015;     // Controls horizontal noise detail
let NOISE_DETAIL = 0.001;     // Controls vertical noise detail
let colorPalettes = [];       // Array holding possible color palettes
let currentPalette = [];      // Currently chosen color palette
let seed;                     // Random seed to regenerate

let timeOffset = 0;           // Global time offset for animation
let speed = 0.08;             // Base speed for the animation
let colorShiftSpeed = 0.005;   // Slower speed for color shifts (slower day-night cycle)

let baseHue = 0;              // Base hue for color transformations
let hueVariation = 60;        // Range of hue offset for each layer

// Layered dune setup
let dunes = [];
let cacti = [];               // Array to hold cactus objects
let timeOfDay = 0; // Variable for day-night cycle (0 for day, 1 for night)
let moonPosition = 0; // Position of the moon across the sky

function setup() {
  let canvas = createCanvas(700, 700);
  canvas.parent('#canvas-container'); // Attach canvas to the container div

  initializeColorPalettes();
  regenerateLandscape();
  generateDunes(); // Initialize dunes and cacti
}

function draw() {
  background(0, 0, 0);

  // Slowly increment timeOfDay for day-night cycle
  timeOfDay += colorShiftSpeed * deltaTime * .01; // Slow down the transition speed
  if (timeOfDay > 1) timeOfDay = 0; // Reset to 0 after full cycle
  
  // Update base hue for color shifts
  baseHue += colorShiftSpeed * deltaTime;

  // Sky gradient (from desert colors during day to deep blue at night)
  drawSkyGradient();

  // Draw the moon (its position depends on the timeOfDay)
  drawMoon();

  // Draw dunes from back (lightest) to front (darkest)
  for (let i = 0; i < NUM_LAYERS; i++) {
    let layerIndex = NUM_LAYERS - 1 - i; // Draw from back to front
    drawDuneLayer(layerIndex);
  }

  // Display cacti
  for (let i = 0; i < cacti.length; i++) {
    cacti[i].display();
  }

  timeOffset += speed * deltaTime;
}

// Draw a smooth sky gradient using desert colors and deep blue at night
function drawSkyGradient() {
  let dayColors = currentPalette.slice(0, 4); // Daytime desert colors
  let nightColors = [color(200, 80, 20), color(220, 70, 20), color(240, 50, 40), color(250, 50, 70)]; // Deep blues for night
  
  let c1, c2;
  if (timeOfDay < 0.5) {
    let transitionIndex = floor(timeOfDay * dayColors.length);
    c1 = dayColors[transitionIndex];
    c2 = dayColors[(transitionIndex + 1) % dayColors.length];
  } else {
    let transitionIndex = floor((timeOfDay - 0.5) * nightColors.length);
    c1 = nightColors[transitionIndex];
    c2 = nightColors[(transitionIndex + 1) % nightColors.length];
  }

  let colorFactor = (sin(timeOffset * 0.02) + 1) / 2;
  
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter * colorFactor);
    stroke(c);
    line(0, y, width, y);
  }
}

// Draw the moon at its current position in the sky
function drawMoon() {
  let moonY = map(timeOfDay, 0, 1, height * 0.25, height * 1.25); // Moon rises and sets based on timeOfDay
  let moonX = width * 0.5; // Moon is always in the center horizontally
  let moonSize = 50; // Moon size

  let moonColor = color(255, 255, 255); // White color for the moon
  if (timeOfDay < 0.5) {
    let dimFactor = map(timeOfDay, 0, 0.5, 0, 1);
    moonColor = color(255 * dimFactor, 255 * dimFactor, 255 * dimFactor); // Faint white color
  }

  fill(moonColor);
  noStroke();
  ellipse(moonX, moonY, moonSize, moonSize);
}

// Draw a single dune layer using Perlin noise
function drawDuneLayer(layerIndex) {
  noStroke();
  
  let paletteColor = currentPalette[layerIndex % currentPalette.length];
  let h = hue(paletteColor);
  let s = saturation(paletteColor);
  let b = brightness(paletteColor);
  
  if (timeOfDay > 0.5) {
    s = map(timeOfDay, 0.5, 1, s * 0.5, s);
    b = map(timeOfDay, 0.5, 1, b * 0.5, b);
  }

  fill(h, s, b);
  
  beginShape();
  vertex(0, height);
  
  let layerOffset = map(layerIndex, 0, NUM_LAYERS - 1, 0, 1);
  let verticalPos = height * (1 - LAYER_HEIGHT_FACTOR * layerOffset);
  
  let mouseFactorY = map(mouseY, 0, height, -80, 80);
  
  for (let x = 0; x <= width; x += 2) {
    let noiseVal = noise(
      (x * NOISE_SCALE) + (layerIndex * 100),
      (timeOffset + layerIndex * 100) * NOISE_DETAIL
    );
    
    let yOff = map(noiseVal, 0, 1, -180, 180);
    let finalY = verticalPos + yOff + mouseFactorY * (layerIndex / NUM_LAYERS);
    vertex(x, finalY);
  }
  
  vertex(width, height);
  endShape(CLOSE);
}

// Initialize some color palettes (HSB) for variety
function initializeColorPalettes() {
  colorPalettes = [
    [
      color(30, 80, 60),  
      color(40, 80, 50),  
      color(45, 90, 70),  
      color(15, 100, 50), 
      color(25, 70, 40),  
      color(10, 60, 30)   
    ],
  ];
}

// Resets the random seed, picks a color palette randomly, etc.
function regenerateLandscape() {
  seed = floor(random(100000));
  randomSeed(seed);
  noiseSeed(seed);
  
  currentPalette = random(colorPalettes);

  if (random() < 0.5) {
    currentPalette.reverse();
  }
}

// Generate dunes with noise and layer movement, and add cacti
function generateDunes() {
  dunes = [];
  cacti = []; // Clear the existing cacti

  for (let i = 0; i < NUM_LAYERS; i++) {
    let speedFactor = random(0.5, 1.5); // Random speed for each layer
    dunes.push(new DuneLayer(i, speedFactor));

    // Add cacti to each layer at random positions
    let numCacti = int(random(3, 6)); // Random number of cacti for each layer
    for (let j = 0; j < numCacti; j++) {
      let cactusX = random(width); // Random position on the x-axis
      let cactusHeight = random(30, 80); // Random height for the cactus
      cacti.push(new Cactus(cactusX, height - cactusHeight, cactusHeight)); // Create new cactus and add to array
    }
  }
}

// Dune Layer class to handle individual dune behavior
class DuneLayer {
  constructor(layerIndex, speedFactor) {
    this.layerIndex = layerIndex;
    this.speedFactor = speedFactor;
  }

  display() {
    noStroke();

    let paletteColor = currentPalette[this.layerIndex % currentPalette.length];
    let h = hue(paletteColor);
    let s = saturation(paletteColor);
    let b = brightness(paletteColor);

    fill(h, s, b);

    beginShape();
    vertex(0, height);
    
    let verticalPos = height * (1 - LAYER_HEIGHT_FACTOR * this.layerIndex);
    let mouseFactorY = map(mouseY, 0, height, -80, 80);
    
    for (let x = 0; x <= width; x += 2) {
      let noiseVal = noise(
        (x * NOISE_SCALE) + (this.layerIndex * 100),
        (timeOffset + this.layerIndex * 100) * NOISE_DETAIL
      );
      let yOff = map(noiseVal, 0, 1, -180, 180);
      let finalY = verticalPos + yOff + mouseFactorY * (this.layerIndex / NUM_LAYERS);
      vertex(x, finalY);
    }
    
    vertex(width, height);
    endShape(CLOSE);
  }
}

// Cactus class to represent individual cacti
class Cactus {
  constructor(x, baseY, height) {
    this.x = x; // Position on the x-axis
    this.baseY = baseY; // Position on the y-axis (relative to the dune layer)
    this.height = height; // Height of the cactus
  }

  display() {
    noStroke();
    
    // Change cactus color based on the time of day (light green for day, darker green for night)
    let cactusColor = color(60, 120, 50); // Default daytime color
    
    if (timeOfDay > 0.5) {
      cactusColor = color(40, 150, 40); // Darker green for night
    }
    
    fill(cactusColor);

    // Main cactus body (larger, central cylinder)
    ellipse(this.x, this.baseY - this.height / 2, 30, this.height); 

    // Add cactus arms (more irregular and different lengths)
    this.drawArm(this.x - 15, this.baseY - this.height / 2, -25, -40, 0.4); // Left arm
    this.drawArm(this.x + 15, this.baseY - this.height / 2, 25, -40, -0.4); // Right arm
    this.drawArm(this.x - 10, this.baseY - this.height * 0.6, -20, -35, 0.5); // Left lower arm
    this.drawArm(this.x + 10, this.baseY - this.height * 0.6, 20, -35, -0.5); // Right lower arm
  }

  // Draw cactus arms with varying angles and lengths
  drawArm(x, y, length, angle, factor) {
    push();
    translate(x, y);
    rotate(radians(angle)); // Rotate arm to give it a natural look
    line(0, 0, 0, length); // Draw the arm
    pop();
  }

  updatePosition() {
    // Optionally, update cactus position based on the dune movement (it could be influenced by the noise or time offset)
    this.baseY = height * (1 - LAYER_HEIGHT_FACTOR); 
  }
}

// Mouse pressed function to regenerate dunes and cacti
function mousePressed() {
  regenerateLandscape();
  generateDunes();
}
