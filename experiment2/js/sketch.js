// sketch.js - Enhanced Generative Design with Mouse Interaction
// Author: Phoebe Royer
// Date: 1/21/25

// Constants
const NODE_COUNT = 200; // Number of nodes
const TRAIL_ALPHA = 50; // Transparency for trail effect
const CONNECTION_DISTANCE = 100; // Max distance to draw connections
const MOUSE_REPULSION_RADIUS = 100; // Distance within which nodes are repelled
const MOUSE_REPULSION_FORCE = 0.5; // Strength of the mouse repulsion

// Globals
let canvasContainer;
let nodes = [];
let centerHorz, centerVert;

// Node class to define the behavior of individual nodes
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.radius = random(4, 10);
    this.damping = 0.98; // Friction
    this.speedLimit = 3;
    this.color = color(random(100, 255), random(100, 255), random(100, 255), 150);
  }

  attractNodes(otherNodes) {
    for (let other of otherNodes) {
      if (other === this) continue;

      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let dist = sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 100) {
        let force = -0.05 / dist;
        this.vx += force * dx;
        this.vy += force * dy;
      }
    }
  }

  repelFromMouse() {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_REPULSION_RADIUS) {
      let force = MOUSE_REPULSION_FORCE / dist;
      this.vx -= force * dx;
      this.vy -= force * dy;
    }
  }

  update() {
    this.vx *= this.damping;
    this.vy *= this.damping;

    this.x += constrain(this.vx, -this.speedLimit, this.speedLimit);
    this.y += constrain(this.vy, -this.speedLimit, this.speedLimit);

    // Wrap around canvas
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius);
  }
}

// Function to connect nearby nodes
function drawConnections() {
  stroke(150, 100); // Semi-transparent lines
  strokeWeight(1);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let nodeA = nodes[i];
      let nodeB = nodes[j];
      let d = dist(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
      if (d < CONNECTION_DISTANCE) {
        let alpha = map(d, 0, CONNECTION_DISTANCE, 255, 0);
        stroke(200, alpha); // Fade based on distance
        line(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
      }
    }
  }
}

// Function to resize canvas and update layout
function resizeScreen() {
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  resetNodes();
}

// Function to create/reset nodes
function resetNodes() {
  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node(random(width), random(height)));
  }
}

// setup() function is called once when the program starts
function setup() {
  // Place the canvas in the specified container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  // Initialize the nodes
  resetNodes();

  // Handle window resize
  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly; it's the main animation loop
function draw() {
  // Semi-transparent background for trail effect
  fill(0, 0, 0, TRAIL_ALPHA); // Darker background
  rect(0, 0, width, height);

  // Draw connections between nodes
  drawConnections();

  // Update and draw each node
  for (let node of nodes) {
    node.repelFromMouse(); // Add mouse repulsion effect
    node.attractNodes(nodes);
    node.update();
    node.display();
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
  // Reset nodes when the mouse is pressed
  resetNodes();
}
