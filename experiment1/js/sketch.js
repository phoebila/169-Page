// Experiment 2 (Vector Art, Animation, and Interactivity)
// Author: Phoebe Royer
// Date: 1/14/25

// Constants - User-configurable settings
const RECT_SIZE = 250;
const TEXT_SIZE = 140;

// Globals
let canvasContainer;
let centerHorz, centerVert;
let rotatingShapes = [];  // Store rotating elements for interactivity

class RotatingShape {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.angle = 0;
  }

  update() {
    this.angle += 0.01;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(this.color);
    noStroke();
    rect(-this.size / 2, -this.size / 2, this.size, this.size);
    pop();
  }
}

function setup() {
  // Place the canvas and make it fit the container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  // Initial positions for rotation center
  updateCenter();

  // Handle resizing dynamically
  $(window).resize(resizeScreen);
}

function draw() {
  background(20);  // Dark background for a clean aesthetic

  // Draw dynamic rotating rectangles
  for (let shape of rotatingShapes) {
    shape.update();
    shape.display();
  }

  // Draw the primary rotating rectangle in the center
  drawCentralRotatingRectangle();

  // Draw dynamic text centered on the canvas
  fill(0, 255, 0);
  textSize(TEXT_SIZE);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("p5*", centerHorz, centerVert);
}

function drawCentralRotatingRectangle() {
  push();
  translate(centerHorz, centerVert);
  rotate(frameCount / 100.0); // Continuous rotation
  fill(234, 31, 81);
  noStroke();
  rect(-RECT_SIZE / 2, -RECT_SIZE / 2, RECT_SIZE, RECT_SIZE);
  pop();
}

function mousePressed() {
  // Add a new randomly placed rotating shape on mouse press
  rotatingShapes.push(new RotatingShape(random(width), random(height), random(50, 150), color(random(255), random(255), random(255))));
}

function resizeScreen() {
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  updateCenter();
}

function updateCenter() {
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;
}
