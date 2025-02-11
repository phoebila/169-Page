p5.disableFriendlyErrors = true;

let kittyModel;
let asciiArtCanvas;
let asciiChars = ["@", "#", "$", "%", "&", "*", "+", "-", ":", ".", " "];  
let tileSize = 10;  // Adjust for more/less density

function preload() {
  kittyModel = loadModel('./js/model/kitty!.obj', true);  
}

function setup() {
  let canvas = createCanvas(600, 600, WEBGL);
  canvas.parent('canvas-container');
  kittyModel.computeNormals();

  // Create ASCII texture
  asciiArtCanvas = createGraphics(512, 512);
  asciiArtCanvas.textSize(tileSize);
  asciiArtCanvas.textAlign(CENTER, CENTER);
  asciiArtCanvas.fill(0);  // Black ASCII text
  // asciiArtCanvas.background(255);  // White background

  generateASCIIPattern();
}

function generateASCIIPattern() {
  let cols = asciiArtCanvas.width / tileSize;
  let rows = asciiArtCanvas.height / tileSize;
  // asciiArtCanvas.background(255);  // Keep background white

  // Draw ASCII characters in a uniform grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let charIndex = floor(random(asciiChars.length));
      let char = asciiChars[charIndex];
      let x = j * tileSize + tileSize / 2;
      let y = i * tileSize + tileSize / 2;
      asciiArtCanvas.text(char, x, y);
    }
  }
}

function draw() {
  background('#1ee33b');  

  orbitControl(); 

  // Lighting setup
  ambientLight(255);
  directionalLight(255, 255, 255, 0, 0, -1);

  push();
  scale(1, -1, 1);  
  translate(0, 0, 250);  
  stroke(255);  // white model outline
  strokeWeight(.01);

  fill(255, 255, 255, 30);  // More transparent model
  texture(asciiArtCanvas);  // Apply ASCII texture
  model(kittyModel);
  pop();
}
