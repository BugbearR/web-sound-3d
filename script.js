const audioFileInput = document.getElementById('audioFile');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const canvas = document.getElementById('xyCanvas');
const ctx = canvas.getContext('2d');
const zSlider = document.getElementById('zSlider');
const zValue = document.getElementById('zValue');
const loopCheckbox = document.getElementById('loopCheckbox');

let audioContext;
let source;
let panner;
let audioBuffer;
let currentX = 0;
let currentY = 0;

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.strokeStyle = '#000';
  ctx.stroke();

  const x = ((currentX + 1) / 2) * canvas.width;
  const y = ((-currentY + 1) / 2) * canvas.height;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
}

drawCanvas();

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentX = (x / canvas.width) * 2 - 1;
  currentY = -((y / canvas.height) * 2 - 1);
  updatePosition();
  drawCanvas();
});

zSlider.addEventListener('input', () => {
  zValue.textContent = zSlider.value;
  updatePosition();
});

loopCheckbox.addEventListener('change', () => {
  if (source) {
    source.loop = loopCheckbox.checked;
  }
});

audioFileInput.addEventListener('change', async () => {
  if (!audioFileInput.files.length) return;
  const file = audioFileInput.files[0];
  const arrayBuffer = await file.arrayBuffer();
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  playButton.disabled = false;
});

function updatePosition() {
  if (panner) {
    panner.positionX.value = currentX;
    panner.positionY.value = currentY;
    panner.positionZ.value = parseFloat(zSlider.value);
  }
}

playButton.addEventListener('click', () => {
  if (!audioBuffer) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = loopCheckbox.checked;
  panner = audioContext.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  updatePosition();
  source.connect(panner).connect(audioContext.destination);
  source.start();
  stopButton.disabled = false;
  playButton.disabled = true;
  source.onended = () => {
    playButton.disabled = false;
    stopButton.disabled = true;
  };
});

stopButton.addEventListener('click', () => {
  if (source) {
    source.stop();
    playButton.disabled = false;
    stopButton.disabled = true;
  }
});
