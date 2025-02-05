p5.disableFriendlyErrors = true;

let kittyModel;
let kittyTexture;

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
}

function draw() {
  background('#da8c34');  // Background color to match sand
  noStroke();
  orbitControl();

  // Put Raph on a plane
	push()
	translate(0, 103, 0)
	rotateX(PI/2)
	ambientLight(color('#da8c34'))
	spotLight(color(200), 0, -2000, 0, 0, 1, 0) //, [angle], [concentration])
	plane(2000, 2000)
	pop()

	// Draw snow with with POINTS mode
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
  spotLight(color(255), 0, -2000, 0, 0, 1, 0);
  shininess(300);
  scale(1, -1, 1);  // Flip kitty to be upright
  scale(1);  // Scale up the model

  model(kittyModel);
  pop();
}
