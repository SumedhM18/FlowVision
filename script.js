/* ============================================
   Document Object Model (DOM) Element References
   ============================================ */
// Video stream element from user's camera
const video = document.getElementById("video");
// Canvas used for pixel color sampling
const canvas = document.getElementById("canvas");
// 2D drawing context for canvas operations
const ctx = canvas.getContext("2d");
// Display elements for color information
const colorBox = document.getElementById("color-box");
const colorValue = document.getElementById("color-value");
const colorName = document.getElementById("color-name");
const colorAction = document.getElementById("color-action");

/* ============================================
   Initialize Camera Stream
   ============================================ */
/**
 * Requests user permission to access the camera and starts video stream.
 * Once video loads, initializes the canvas dimensions and starts color sampling.
 */
async function startCamera() {
  // Request camera access from user
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Set the video element to display the camera stream
  video.srcObject = stream;

  // Once video data is available, set up canvas and start sampling loop
  video.addEventListener("loadeddata", () => {
    // Match canvas dimensions to video resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Begin continuous color sampling
    sampleLoop();
  });
}

/* ============================================
   Color Name Recognition
   ============================================ */
/**
 * Maps RGB values to the closest named color using Euclidean distance.
 * Currently supports Red, Yellow, and Green (traffic light colors).
 * Can be extended with additional color definitions.
 * 
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} The name of the closest matching color
 */
function rgbToName(r, g, b) {
  // Define known traffic light colors with their RGB values
  const colors = [
    { name: "Red", rgb: [255, 0, 0] },
    { name: "Yellow", rgb: [255, 255, 0] },
    { name: "Green", rgb: [0, 128, 0] }
  ];
  
  // Find the color with minimum distance to the sampled RGB values
  let minDist = Infinity;
  let closest = "Unknown";
  
  for (const c of colors) {
    // Calculate Euclidean distance between sampled color and known color
    // Euclidean distance is the straight-line distance between two points in space
    //Euclidean distance formula: d = sqrt((r2 - r1)^2 + (g2 - g1)^2 + (b2 - b1)^2)

    const dist = Math.sqrt(
      Math.pow(r - c.rgb[0], 2) +
      Math.pow(g - c.rgb[1], 2) +
      Math.pow(b - c.rgb[2], 2)
    );
    // Update closest match if this color is closer
    if (dist < minDist) {
      minDist = dist;
      closest = c.name;
    }
  }
  
  return closest;
}

/* ============================================
   Main Sampling Loop
   ============================================ */
/*
 * Continuously samples the center pixel from the video stream,
 * identifies its color, and displays relevant traffic light information.
 * Runs at monitor refresh rate using requestAnimationFrame.
 */
function sampleLoop() {
  // Draw current video frame onto the hidden canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Calculate center coordinates of the canvas
  const x = Math.floor(canvas.width / 2);
  const y = Math.floor(canvas.height / 2);

  // Sample a single pixel at the center point
  // Returns Uint8ClampedArray with [R, G, B, A] values
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = pixel;

  // Display the sampled RGB color
  const rgb = `rgb(${r}, ${g}, ${b})`;
  colorBox.style.background = rgb;  // Show color preview
  colorValue.textContent = rgb;      // Show RGB values
  
  // Identify the color name
  const name = rgbToName(r, g, b);
  colorName.textContent = name;

  // Determine and display the corresponding traffic light action
  let action = "";
  if (name === "Red") {
    action = "STOP";
  } else if (name === "Yellow") {
    action = "STOP or YIELD";
  } else if (name === "Lime" || name === "Green") {
    action = "GO";
  }
  colorAction.textContent = action;

  // Schedule next frame at monitor refresh rate (typically 60fps)
  requestAnimationFrame(sampleLoop);
}

/* ============================================
   Application Initialization
   ============================================ */
// Start the camera stream when the script loads
startCamera();