// project.js - Experiment 2 (Vector Art, Animation, and Interactivity)
// Author: Phoebe Royer
// Date: 1/14/25

// Define a class for animated vector shapes
class AnimatedShape {
  constructor(x, y, size, color, shapeType) {  // Add shapeType as a constructor parameter
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.xSpeed = random(-2, 2);
    this.ySpeed = random(-2, 2);
    this.shapeType = shapeType; // Store the shape type
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
    push();
    translate(this.x, this.y);
    fill(this.color);
    noStroke();

    // Debugging to see what shape is being drawn
    console.log(`Shape Type: ${this.shapeType}`);

    // Draw shape based on the shape type
    if (this.shapeType === "circle") {
      ellipse(0, 0, this.size, this.size);
    } else if (this.shapeType === "triangle") {
      triangle(
        -this.size / 2, this.size / 2,  // Bottom left
        this.size / 2, this.size / 2,   // Bottom right
        0, -this.size / 2              // Top
      );
    } else if (this.shapeType === "square") {
      rect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    pop();
  }

  // Collision detection for green line with the shape
  checkCollision(line) {
    if (this.shapeType === "circle") {
      return this.circleCollision(line);
    } else if (this.shapeType === "square") {
      return this.squareCollision(line);
    } else if (this.shapeType === "triangle") {
      return this.triangleCollision(line);
    }
    return false;
  }

  // Collision detection for circle
  circleCollision(line) {
    // Calculate distance from line to the circle's center
    let dist = distToLine(this.x, this.y, line.x1, line.y1, line.x2, line.y2);
    return dist < this.size / 2;
  }

  // Collision detection for square
  squareCollision(line) {
    // Create a bounding box for the square
    let halfSize = this.size / 2;
    return lineIntersectsRect(line.x1, line.y1, line.x2, line.y2, this.x - halfSize, this.y - halfSize, this.size, this.size);
  }

  // Collision detection for triangle
  triangleCollision(line) {
    // Create the triangle's vertices
    let halfSize = this.size / 2;
    let x1 = this.x - halfSize, y1 = this.y + halfSize; // Bottom left
    let x2 = this.x + halfSize, y2 = this.y + halfSize; // Bottom right
    let x3 = this.x, y3 = this.y - halfSize; // Top

    // Check if the line intersects any side of the triangle
    return lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, x1, y1, x2, y2) ||
           lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, x2, y2, x3, y3) ||
           lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, x3, y3, x1, y1);
  }
}

// Function to calculate the distance from a point to a line
function distToLine(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = dot / len_sq;
  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return dist(px, py, xx, yy);
}

// Function to check if a line intersects a rectangle
function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  return lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
         lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
         lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) ||
         lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry);
}

// Function to check if two lines intersect
function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return false;
  let intersectX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  let intersectY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  return ((intersectX > Math.min(x1, x2) && intersectX < Math.max(x1, x2)) &&
          (intersectX > Math.min(x3, x4) && intersectX < Math.max(x3, x4)) &&
          (intersectY > Math.min(y1, y2) && intersectY < Math.max(y1, y2)) &&
          (intersectY > Math.min(y3, y4) && intersectY < Math.max(y3, y4)));
}

let shapes = [];  // Array to hold multiple shapes
let greenLine = { x1: 0, y1: 0, x2: 300, y2: 300 };

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();

  // Create initial shapes
  for (let i = 0; i < 10; i++) {
    shapes.push(new AnimatedShape(random(width), random(height), random(20, 50), color(random(255), random(255), random(255)), random(["circle", "triangle", "square"])));
  }
}

function draw() {
  background(0, 20);  // Transparent background effect for fading trails

  // Update and display all shapes
  for (let shape of shapes) {
    shape.update();
    shape.display();

    // Check for collision with green line
    if (shape.checkCollision(greenLine)) {
      // Handle collision response here
      shape.color = color(random(255), random(255), random(255));  // Change color on collision
    }
  }

  // Draw the green line (moving with the mouse)
  stroke(0, 255, 0);
  strokeWeight(4);
  line(greenLine.x1, greenLine.y1, greenLine.x2, greenLine.y2);
}

// Update the green line's position to follow the mouse
function mouseMoved() {
  greenLine.x1 = mouseX;  // Set the start point to the mouse position
  greenLine.y1 = mouseY;
  greenLine.x2 = mouseX + 100;  // Optional: Adjust the second point for the green line
  greenLine.y2 = mouseY + 100;  // Optional: Adjust the second point for the green line
}

function mousePressed() {
  // Randomly choose a shape type
  const shapeTypes = ["circle", "triangle", "square"];
  const randomShape = random(shapeTypes);

  // Add a new shape with a random position, size, color, and shape type
  shapes.push(new AnimatedShape(
    random(width), 
    random(height), 
    random(50, 150), 
    color(random(255), random(255), random(255)),
    randomShape
  ));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
