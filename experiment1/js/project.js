// project.js - Experiment 2 (Vector Art, Animation, and Interactivity)
// Author: Phoebe Royer
// Date: 1/14/25

// Define a class for animated vector shapes
class AnimatedShape {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.xSpeed = random(-2, 2);
    this.ySpeed = random(-2, 2);
  }

  // Update the position of the shape
  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Bounce off edges of the canvas
    if (this.x > width || this.x < 0) this.xSpeed *= -1;
    if (this.y > height || this.y < 0) this.ySpeed *= -1;
  }

  // Draw the shape on the canvas
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }

  // Change color on mouse click
  changeColor(newColor) {
    this.color = newColor;
  }
}

let shapes = [];  // Array to hold multiple shapes

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();

  // Create initial shapes
  for (let i = 0; i < 10; i++) {
    shapes.push(new AnimatedShape(random(width), random(height), random(20, 50), color(random(255), random(255), random(255))));
  }
}

function draw() {
  background(0, 20);  // Transparent background effect for fading trails

  // Update and display all shapes
  for (let shape of shapes) {
    shape.update();
    shape.display();
  }

  // Draw a vector line following the mouse position
  stroke(0, 255, 0);
  line(width / 2, height / 2, mouseX, mouseY);
}

function mousePressed() {
  // Change color of all shapes on mouse press
  for (let shape of shapes) {
    shape.changeColor(color(random(255), random(255), random(255)));
  }

  // Add a new shape at the mouse position
  shapes.push(new AnimatedShape(mouseX, mouseY, random(20, 50), color(random(255), random(255), random(255))));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
