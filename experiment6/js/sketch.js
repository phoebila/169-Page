let moods = [];
let colors = {
  "happy": ["#FFD700", "#FFA500", "#FF69B4"],
  "sad": ["#4682B4", "#5F9EA0", "#6A5ACD"],
  "angry": ["#B22222", "#8B0000", "#000000"],
  "calm": ["#8FBC8F", "#556B2F", "#DEB887"]
};

let customMoods = {}; // Store custom moods
let animationProgress = 1.0; // Controls the stripe expansion animation
let isAnimating = false; // Tracks if an animation is in progress

function setup() {
  let canvas = createCanvas(400, 800);
  canvas.parent('canvas-container');

  // Make the canvas background transparent
  clear();

  let savedMoods = localStorage.getItem("moodHistory");
  if (savedMoods) {
    moods = JSON.parse(savedMoods);
  }

  createMoodButtons();
  createCustomMoodInputs();

  let clearButton = createButton("Clear scarf");
  clearButton.position(550, 820 + 5 * 30);
  clearButton.mousePressed(clearScarf);

  drawScarf();
}

function draw() {
  if (isAnimating) {
    animationProgress += 0.05; // Controls the speed of animation
    if (animationProgress >= 1.0) {
      animationProgress = 1.0;
      isAnimating = false;
      noLoop(); // Stop animation when done
    }
    drawScarf();
  }
}

function drawScarf() {
  clear(); // Use clear() for transparent background
  let stripeHeight = (height / max(moods.length, 1)) * animationProgress;

  for (let i = 0; i < moods.length; i++) {
    let mood = moods[i];
    let moodColors = colors[mood] || customMoods[mood]; // Use custom mood if it exists
    
    // Check if moodColors exists and is an array
    if (!Array.isArray(moodColors) || moodColors.length !== 3) {
      console.error(`Invalid mood colors for ${mood}`, moodColors);
      continue; // Skip this mood if colors are invalid
    }

    for (let j = 0; j < width; j += 20) {
      let waveOffset = sin(TWO_PI * (j / width) + frameCount * 0.05) * 10; // Wave distortion effect

      // Gradient transition between colors
      let col1 = moodColors[0];
      let col2 = moodColors[1];
      let col3 = moodColors[2];

      let lerpedCol = lerpColor(color(col1), color(col2), map(j, 0, width, 0, 1));  // Gradient between first two colors
      let lerpedCol2 = lerpColor(color(col2), color(col3), map(j, 0, width, 0, 1)); // Gradient between the second two colors

      // Apply wave distortion and gradient fade
      fill(lerpedCol);
      rect(j, i * stripeHeight + waveOffset, 20, stripeHeight);
      
      fill(lerpedCol2);
      rect(j, i * stripeHeight + waveOffset + 5, 20, stripeHeight);
    }
  }
}


function createMoodButtons() {
  let moodNames = Object.keys(colors);
  for (let i = 0; i < moodNames.length; i++) {
    let btn = createButton(moodNames[i]);
    btn.position(550, 820 + i * 30);
    btn.mousePressed(() => addMood(moodNames[i]));
  }
}

function createCustomMoodInputs() {
  let moodInput = createInput();
  moodInput.position(550, 720);

  let colorPickersDiv = createDiv();
  colorPickersDiv.position(550, 750);

  let colorPicker1 = createColorPicker('#000000');
  colorPicker1.parent(colorPickersDiv);
  
  let colorPicker2 = createColorPicker('#FFFFFF');
  colorPicker2.parent(colorPickersDiv);

  let colorPicker3 = createColorPicker('#FF0000');
  colorPicker3.parent(colorPickersDiv);

  let addCustomMoodButton = createButton("Add Custom Mood");
  addCustomMoodButton.position(550, 790);
  addCustomMoodButton.mousePressed(() => addCustomMood(moodInput.value(), colorPicker1.value(), colorPicker2.value(), colorPicker3.value()));
}

function addMood(newMood) {
  if (colors[newMood]) {
    moods.push(newMood);
    localStorage.setItem("moodHistory", JSON.stringify(moods));

    animationProgress = 0.0; // Reset animation progress
    isAnimating = true;
    loop(); // Start animation
  }
}

function addCustomMood(moodName, color1, color2, color3) {
  if (moodName && color1 && color2 && color3) {
    customMoods[moodName] = [color1, color2, color3];
    moods.push(moodName); // Add custom mood to the list
    localStorage.setItem("moodHistory", JSON.stringify(moods));

    animationProgress = 0.0; // Reset animation progress
    isAnimating = true;
    loop(); // Start animation
  }
}

function clearScarf() {
  moods = [];
  localStorage.removeItem("moodHistory");
  drawScarf();
}
