const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorBox = document.getElementById("color-box");
const colorValue = document.getElementById("color-value");
const colorName = document.getElementById("color-name");
const colorAction = document.getElementById("color-action");

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  video.addEventListener("loadeddata", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    sampleLoop();
  });
}


function rgbToName(r, g, b) {
  // Simple color name mapping (extend as needed)
  const colors = [
    { name: "Red", rgb: [255, 0, 0] },
    { name: "Yellow", rgb: [255, 255, 0] },
    { name: "Green", rgb: [0, 128, 0] },

  ];
  let minDist = Infinity;
  let closest = "Unknown";
  for (const c of colors) {
    const dist = Math.sqrt(
      Math.pow(r - c.rgb[0], 2) +
      Math.pow(g - c.rgb[1], 2) +
      Math.pow(b - c.rgb[2], 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = c.name;
    }
  }
  return closest;
}

function sampleLoop() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const x = Math.floor(canvas.width / 2);
  const y = Math.floor(canvas.height / 2);

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = pixel;

  const rgb = `rgb(${r}, ${g}, ${b})`;
  colorBox.style.background = rgb;
  colorValue.textContent = rgb;
  const name = rgbToName(r, g, b);
  colorName.textContent = name;

  // Show action for red, yellow, green
  let action = "";
  if (name === "Red") {
    action = "STOP";
  } else if (name === "Yellow") {
    action = "STOP or YIELD";
  } else if (name === "Lime" || name === "Green") {
    action = "GO";
  }
  colorAction.textContent = action;

  requestAnimationFrame(sampleLoop);
}

startCamera();