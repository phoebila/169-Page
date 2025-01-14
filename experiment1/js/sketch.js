
// Globals for canvas 1
let canvasContainer1, centerHorz1, centerVert1;
let rotatingShapes1 = [];

class RotatingShape {
  constructor(x, y, size, color, shapeType) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.angle = 0;
    this.shapeType = shapeType; // Store the shape type
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
}

function setup() {
  // canvas 1
  canvasContainer1 = $("#canvas-container-1");
  let canvas1 = createCanvas(canvasContainer1.width(), canvasContainer1.height());
  canvas1.parent("canvas-container-1");

  updateCenter1();

  $(window).resize(resizeScreen1);
}

// part 1 --------------------------------------------

function drawGreenLine() {
  stroke(0, 255, 0);
  strokeWeight(4);
  line(greenLine.x1, greenLine.y1, greenLine.x2, greenLine.y2);
}

function moveGreenLine() {
  greenLine.x1 += greenLine.dx;
  greenLine.y1 += greenLine.dy;
  greenLine.x2 += greenLine.dx;
  greenLine.y2 += greenLine.dy;

  // Bounce off canvas edges
  if (greenLine.x1 < 0 || greenLine.x2 > width) greenLine.dx *= -1;
  if (greenLine.y1 < 0 || greenLine.y2 > height) greenLine.dy *= -1;
}

// part 1 --------------------------------------------
function mousePressedExperiment1() {
  // Randomly choose a shape type
  const shapeTypes = ["circle", "triangle", "square"];
  const randomShape = random(shapeTypes);

  // Add a new rotating shape with a random position, size, color, and shape type
  console.log(`Random shape selected: ${randomShape}`);  // Debugging the random selection

  rotatingShapes1.push(new RotatingShape(
    random(width), 
    random(height), 
    random(50, 150), 
    color(random(255), random(255), random(255)),
    randomShape
  ));
}

function resizeScreen1() {
  resizeCanvas(canvasContainer1.width(), canvasContainer1.height());
  updateCenter1();
}

function updateCenter1() {
  centerHorz1 = canvasContainer1.width() / 2;
  centerVert1 = canvasContainer1.height() / 2;
}
