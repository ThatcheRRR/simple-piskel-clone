const canvas = document.querySelector('#canvas');
const pencil = document.querySelector('.pencil');
const bucket = document.querySelector('.bucket');
const stroke = document.querySelector('.stroke');
const eraser = document.querySelector('.eraser');
const choose = document.querySelector('.choose-color');
const flood = document.querySelector('.floodfill');
const tool = document.querySelectorAll('.tool');
const sizeSwitcher = document.querySelectorAll('.switcher__size');
const checkbox = document.querySelectorAll('.switcher__size_checkbox');
const brushes = document.querySelectorAll('.brush__size');
const close = document.querySelector('.shortcuts__header_close');
const shortcuts = document.querySelector('.shortcuts');
const showShortcuts = document.querySelector('.keys__binds');
const colorSwap = document.querySelector('.colors__swap');
const firstColor = document.querySelector('.cur-color');
const secColor = document.querySelector('.sec-color');
const colors = document.querySelector('.colors');
const fps = document.querySelector('.fps__change');
const curFps = document.querySelector('.fps__current');
const addFrame = document.querySelector('.add-frame');
const frames = document.querySelector('.frames-container');
const preview = document.querySelector('.preview');
const previewIcon = document.querySelector('.preview-icon');
const ctx = canvas.getContext('2d');
const tools = ['bucket', 'floodfill', 'colorPicker', 'pencil', 'eraser', 'stroke'];
const pencilCode = 80;
const bucketCode = 66;
const chooseCode = 67;
const strokeCode = 76;
const eraserCode = 69;
const floodCode = 70;
const swapCode = 88;
const maxFieldSize = canvas.height * 5;
const small = 32;
const medium = 64;
const large = 128;
const sec = 1000;
const imgArr = [];

let pickerActive = false;
let currentColor = firstColor.value;
let activeTool = 'pencil';
let sc = null;
let previousPosition = null;
let prevPos = null;
let draw = false;
let erase = false;
let strokeEnable = false;
let filling = false;
let dragging = false;
let currentFrame = 0;
let fpsNum = +fps.value;
let now;
let index;
let then;
let elapsed;
let activeFrame;
let dragStartLocation;
let removeFrame = document.querySelector('.frame-remove');
let copyFrame = document.querySelector('.frame-copy');
let snapshot;
let brush;
let block;
let temp;
let canvasFrame;
let timeoutMs = sec / fpsNum;

// default settings
let size = large;
pencil.classList.add('active-tool');
curFps.innerText = fps.value + ' ' + 'FPS';
brush = 1;
brushes[0].classList.add('active-brush');
sizeSwitcher[sizeSwitcher.length - 1].classList.add('current-size');
checkbox[sizeSwitcher.length - 1].classList.add('current-size__checkbox');
copyFrame.addEventListener('mousedown', copy);
function clearCanvas() {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearCanvas();
// 

function setCanvasSize(size) {
  sc = maxFieldSize / size;
  canvas.width = maxFieldSize / sc;
  canvas.height = maxFieldSize / sc;
  preview.width = size;
  preview.height = size;
  canvasFrame.forEach((elem) => {
    elem.width = size;
    elem.height = size;
  })
}

function fpsChange() {
  curFps.innerText = fps.value + ' ' + 'FPS';
  fpsNum = +fps.value;
  timeoutMs = Math.round(sec / fpsNum);
}

function changeColors() {
  temp = firstColor.value;
  firstColor.value = secColor.value;
  secColor.value = temp;
}

function createFrame() {
  frames.insertAdjacentHTML('beforeend', `<div class = "frame-block">
  <div class = "frame-num"></div>
  <div class = "frame-remove">
      <img src = "https://img.icons8.com/material-sharp/20/000000/filled-trash.png">
  </div>
  <canvas class = "frame" height = "128" width = "128"></canvas>
  <div class = "frame-copy">
      <img src="https://img.icons8.com/ios-filled/20/000000/copy.png">
  </div>
  </div>`);
  frameCounter();
}

function animate() {
  requestAnimationFrame(animate);
  now = Date.now();
  elapsed = now - then;
  if (elapsed > timeoutMs) {
    then = now - (elapsed % timeoutMs);
    const preview = document.querySelector('.preview');
    const previewCtx = preview.getContext('2d');
    currentFrame = (currentFrame + 1) % imgArr.length;
    previewCtx.clearRect(0, 0, preview.width, preview.height);
    const img = new Image();
    img.src = imgArr[currentFrame];
    img.onload = () => {
      previewCtx.drawImage(img, 0, 0, preview.width, preview.height);
    };
  }
}

function startAnimating() {
  timeoutMs = 1000 / fpsNum;
  then = Date.now();
  animate();
}

function previewAnim() {
  frameCounter();
  for (let i = 0; i < canvasFrame.length; i += 1) {
    const each = canvasFrame[i];
    const image = each.toDataURL();
    imgArr[i] = image;
  }
}

function drawFrame() {
  startAnimating(timeoutMs);
  const smallCanvas = document.querySelector('.active-frame');
  const smallCtx = smallCanvas.getContext('2d');
  const toPaste = ctx.getImageData(0, 0, maxFieldSize, maxFieldSize);
  smallCtx.putImageData(toPaste, 0, 0);
}

function deleteFrame() {
  this.parentElement.remove();
  index -= 1;
  imgArr.length = index;
  frameCounter();
}

function copy(e) {
  const parent = e.currentTarget.parentElement;
  const parentCanv = parent.children[2];
  const parentCtx = parentCanv.getContext('2d');
  const pasteCopy = parentCtx.getImageData(0, 0, parentCanv.width, parentCanv.height);
  parent.insertAdjacentHTML('afterend', `<div class = "frame-block">
  <div class = "frame-num"></div>
  <div class = "frame-remove">
      <img src = "https://img.icons8.com/material-sharp/20/000000/filled-trash.png">
  </div>
  <canvas class = "frame" height = "${size}" width = "${size}"></canvas>
  <div class = "frame-copy">
      <img src="https://img.icons8.com/ios-filled/20/000000/copy.png">
  </div>
  </div>`);
  frameCounter();
  const newCanv = parent.nextElementSibling.children[2];
  const newCtx = newCanv.getContext('2d');
  newCtx.putImageData(pasteCopy, 0, 0);
}

function frameCounter() {
  block = document.querySelectorAll('.frame-block');
  canvasFrame = document.querySelectorAll('.frame');
  block.forEach((elem, i) => {
    const num = elem.querySelector('.frame-num');
    num.innerText = i + 1;
  });
  for (let i = 0; i < canvasFrame.length; i += 1) {
    canvasFrame[i].addEventListener('click', () => {
      for (let j = 0; j < canvasFrame.length; j += 1) {
        canvasFrame[j].classList.remove('active-frame');
      }
      canvasFrame[i].classList.add('active-frame');
    })
  }
  canvasFrame.forEach((elem) => {
    elem.addEventListener('click', save);
  });
  removeFrame = document.querySelectorAll('.frame-remove');
  for (let i = 0; i < removeFrame.length; i += 1) {
    removeFrame[i].addEventListener('mousedown', deleteFrame);
  }
  copyFrame = document.querySelectorAll('.frame-copy');
  for (let i = 0; i < copyFrame.length; i += 1) {
    copyFrame[i].addEventListener('mousedown', copy);
  }
  for (let i = 0; i < block.length; i += 1) {
    block[i].addEventListener('click', () => {
      ctx.clearRect(0, 0, maxFieldSize, maxFieldSize);
    })
  }
}

function save() {
  previewAnim();
  activeFrame = document.querySelector('.active-frame');
  index = +activeFrame.parentElement.children[0].textContent;
  if (!imgArr[index - 1]) {
    return
  } else {
    const restore = new Image();
    restore.src = imgArr[index - 1];
    restore.onload = () => {
      ctx.drawImage(restore, 0, 0, canvas.width, canvas.height);
    };
  }
}

function selectColor() {
  currentColor = firstColor.value;
}

function getCursorPosition(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  return [x, y];
}

function getErasePosition(event) {
  const ex = event.offsetX;
  const ey = event.offsetY;
  return [ex, ey];
}

function getStrokePosition(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  return [x, y];
}

function rgbConvert(r, g, b) {
  let redConvert = r.toString(16);
  let greenConvert = g.toString(16);
  let blueConvert = b.toString(16);
  if (redConvert.length === 1) redConvert = `0${redConvert}`;
  if (greenConvert.length === 1) greenConvert = `0${greenConvert}`;
  if (blueConvert.length === 1) blueConvert = `0${blueConvert}`;
  return `#${redConvert}${greenConvert}${blueConvert}`;
}

function pencilTool(position) {
  let x = position[0];
  let y = position[1];
  x = Math.floor(x / (maxFieldSize / canvas.height));
  y = Math.floor(y / (maxFieldSize / canvas.width));
  ctx.fillStyle = currentColor;
  ctx.fillRect(x, y, brush, brush);
}

function eraserTool(pos) {
  let ex = pos[0];
  let ey = pos[1];
  ex = Math.floor(ex / (maxFieldSize / canvas.height));
  ey = Math.floor(ey / (maxFieldSize / canvas.width));
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(ex, ey, brush, brush);
}

function pencilLine(position1, position2) {
  let x0 = position1[0];
  let y0 = position1[1];
  const x1 = position2[0];
  const y1 = position2[1];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  while (true) {
    pencilTool([x0, y0]);
    if ((x0 === x1) && (y0 === y1)) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

function eraserLine(pos1, pos2) {
  let ex0 = pos1[0];
  let ey0 = pos1[1];
  const ex1 = pos2[0];
  const ey1 = pos2[1];
  const edx = Math.abs(ex1 - ex0);
  const edy = Math.abs(ey1 - ey0);
  const esx = (ex0 < ex1) ? 1 : -1;
  const esy = (ey0 < ey1) ? 1 : -1;
  let e_err = edx - edy;
  while (true) {
    eraserTool([ex0, ey0]);
    if ((ex0 === ex1) && (ey0 === ey1)) break;
    const e_e2 = 2 * e_err;
    if (e_e2 > -edy) { e_err -= edy; ex0 += esx; }
    if (e_e2 < edx) { e_err += edx; ey0 += esy; }
  }
}

function takeSnapshot() {
  snapshot = ctx.getImageData(0, 0, maxFieldSize, maxFieldSize);
}

function restoreSnapshot() {
  ctx.putImageData(snapshot, 0, 0);
}

function drawLine(position) {
  let x = position[0];
  let y = position[1];
  let x1 = dragStartLocation[0];
  let y1 = dragStartLocation[1];
  x = Math.floor(x / (maxFieldSize / canvas.height));
  y = Math.floor(y / (maxFieldSize / canvas.width));
  x1 = Math.floor(x1 / (maxFieldSize / canvas.height));
  y1 = Math.floor(y1 / (maxFieldSize / canvas.width));
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function dragStart(event) {
  takeSnapshot();
  dragging = true;
  strokeEnable = true;
  dragStartLocation = getStrokePosition(event);
}

function drag(event) {
  if (dragging) {
    restoreSnapshot();
    const position = getStrokePosition(event);
    drawLine(position);
  }
}

function dragStop(event) {
  dragging = false;
  strokeEnable = false;
  restoreSnapshot();
  const position = getStrokePosition(event);
  drawLine(position);
}

function strokeTool() {
  if (strokeEnable) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brush;
    ctx.lineCap = 'square';
    canvas.addEventListener('mousedown', dragStart);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', dragStop);
  } else {
    canvas.removeEventListener('mousedown', dragStart);
    canvas.removeEventListener('mousemove', drag);
    canvas.removeEventListener('mouseup', dragStop);
  }
}

function fillBucket(position) {
  const x = position[0];
  const y = position[1];
  const targetColorArr = ctx.getImageData(Math.floor(x / (maxFieldSize / canvas.height)), Math.floor(y / (maxFieldSize / canvas.width)), 1, 1).data;
  const targetColor = rgbConvert(targetColorArr[0], targetColorArr[1], targetColorArr[2]);
  [ctx.fillStyle] = [colors[0]];
  if (targetColor === colors[0]) return;
  function floodFill(x, y) {
    ctx.fillStyle = currentColor;
    const newPointColorArray = ctx.getImageData(x, y, 1, 1).data;
    const newPointColor = rgbConvert(newPointColorArray[0], newPointColorArray[1], newPointColorArray[2]);
    if (targetColor !== newPointColor) return;
    ctx.fillRect(x, y, 1, 1);
    if (x > 0) {
      floodFill(x - 1, y);
    }
    if (y > 0) {
      floodFill(x, y - 1);
    }
    if (x < maxFieldSize) {
      floodFill(x + 1, y);
    }
    if (y < maxFieldSize) {
      floodFill(x, y + 1);
    }
  }
  floodFill(Math.floor(x / (maxFieldSize / canvas.height)), Math.floor(y / (maxFieldSize / canvas.width)));
}

function colorPicker(pos) {
  const x = pos[0];
  const y = pos[1];
  if (pickerActive) {
    const r = ctx.getImageData(Math.floor(x / (maxFieldSize / canvas.height)), Math.floor(y / (maxFieldSize / canvas.width)), 1, 1).data[0];
    const g = ctx.getImageData(Math.floor(x / (maxFieldSize / canvas.height)), Math.floor(y / (maxFieldSize / canvas.width)), 1, 1).data[1];
    const b = ctx.getImageData(Math.floor(x / (maxFieldSize / canvas.height)), Math.floor(y / (maxFieldSize / canvas.width)), 1, 1).data[2];
    currentColor = rgbConvert(r, g, b);
    firstColor.value = currentColor;
    activeTool = 'colorPicker';
  }
}

function selectTool(e) {
  for (let i = 0; i < tool.length; i += 1) {
    tool[i].classList.remove('active-tool');
    if (e.currentTarget === tool[i]) {
      tool[i].classList.add('active-tool');
      activeTool = tools[i];
      if (activeTool !== 'colorPicker') {
        pickerActive = false;
      } else {
        pickerActive = true;
      }
    }
  }
}

function binds(event) {
  switch (event.keyCode) {
    case pencilCode:
      for (let i = 0; i < tool.length; i += 1) {
        tool[i].classList.remove('active-tool');
      }
      pencil.classList.add('active-tool');
      activeTool = 'pencil';
      pickerActive = false;
      strokeEnable = false;
      break;
    case bucketCode:
      for (let i = 0; i < tool.length; i += 1) {
        tool[i].classList.remove('active-tool');
      }
      bucket.classList.add('active-tool');
      activeTool = 'bucket';
      pickerActive = false;
      strokeEnable = false;
      break;
    case chooseCode:
      for (let i = 0; i < tool.length; i += 1) {
        tool[i].classList.remove('active-tool');
      }
      choose.classList.add('active-tool');
      activeTool = 'colorPicker';
      pickerActive = true;
      strokeEnable = false;
      break;
    case strokeCode:
      for (let i = 0; i < tool.length; i += 1) {
        tool[i].classList.remove('active-tool');
      }
      stroke.classList.add('active-tool');
      activeTool = 'stroke';
      pickerActive = false;
      strokeEnable = true;
      break;
    case eraserCode:
      for (let i = 0; i < tool.length; i += 1) {
        tool[i].classList.remove('active-tool');
      }
      eraser.classList.add('active-tool');
      pickerActive = false;
      strokeEnable = false;
      activeTool = 'eraser';
      break;
    case floodCode:
      for (let i = 0; i < tool.length; i += 1) {
        tool[i].classList.remove('active-tool');
      }
      flood.classList.add('active-tool');
      pickerActive = false;
      strokeEnable = false;
      activeTool = 'floodfill';
      break;
    case swapCode: {
      changeColors();
    }
  }
}

function drawMouseDown(event) {
  if (activeTool === 'pencil') {
    erase = false;
    filling = false;
    draw = true;
    pickerActive = false;
    strokeEnable = false;
    previousPosition = getCursorPosition(event);
    pencilTool(getCursorPosition(event), 255, 0, 0, 255);
  } else if (activeTool === 'eraser') {
    draw = false;
    pickerActive = false;
    erase = true;
    filling = false;
    strokeEnable = false;
    prevPos = getErasePosition(event);
    eraserTool(getErasePosition(event), 255, 0, 0, 255);
  } else if (activeTool === 'floodfill') {
    strokeEnable = false;
    draw = false;
    pickerActive = false;
    erase = false;
    filling = true;
  } else if (activeTool === 'stroke') {
    strokeEnable = true;
    draw = false;
    erase = false;
    pickerActive = false;
    filling = false;
  } else if (activeTool === 'colorPicker') {
    pickerActive = true;
    strokeEnable = false;
    draw = false;
    erase = false;
    filling = false;
  } else if (activeTool === 'bucket') {
    ctx.fillStyle = currentColor;
    ctx.fillRect(0, 0, maxFieldSize, maxFieldSize);
    draw = false;
    strokeEnable = false;
    filling = false;
    erase = false;
    pickerActive = false;
  }
}

function drawMouseMove(event) {
  if (draw) {
    pencilLine(previousPosition, getCursorPosition(event));
    previousPosition = getCursorPosition(event);
  }
  if (erase) {
    eraserLine(prevPos, getErasePosition(event));
    prevPos = getErasePosition(event);
  }
}

function drawMouseUp() {
  draw = false;
  erase = false;
  filling = false;
  strokeEnable = false;
}

function drawMouseOut() {
  draw = false;
  erase = false;
  filling = false;
  strokeEnable = false;
}

function fill(event) {
  if (filling) {
    fillBucket(getCursorPosition(event));
  }
}

function choosing(event) {
  colorPicker(getCursorPosition(event));
}
    
function toggleFullScreen() {
  if (!document.mozFullScreen && !document.webkitFullScreen) {
    if (preview.mozRequestFullScreen) {
      preview.mozRequestFullScreen();
    } else {
      preview.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitCancelFullScreen();
    }
  }
}

for (let i = 0; i < tool.length; i += 1) {
  tool[i].addEventListener('mousedown', selectTool);
}

for (let i = 0; i < sizeSwitcher.length; i += 1) {
  sizeSwitcher[i].addEventListener('mouseup', () => {
    for (let j = 0; j < sizeSwitcher.length; j += 1) {
      sizeSwitcher[j].className = 'switcher__size';
      checkbox[j].className = 'switcher__size_checkbox';
    }
    if (sizeSwitcher[i].innerText === '32x32') {
      sizeSwitcher[i].classList.add('current-size');
      checkbox[i].classList.add('current-size__checkbox');
      size = small;
    }
    if (sizeSwitcher[i].innerText === '64x64') {
      sizeSwitcher[i].classList.add('current-size');
      checkbox[i].classList.add('current-size__checkbox');
      size = medium;
    }
    if (sizeSwitcher[i].innerText === '128x128') {
      sizeSwitcher[i].classList.add('current-size');
      checkbox[i].classList.add('current-size__checkbox');
      size = large;
    }
    setCanvasSize(size);
  });
}

for (let i = 0; i < brushes.length; i += 1) {
  brushes[i].addEventListener('mouseup', () => {
    for (let j = 0; j < brushes.length; j += 1) {
      brushes[j].classList.remove('active-brush');
    }
    if (brushes[i].classList.contains('small')) {
      brushes[i].classList.add('active-brush');
      brush = 1;
    }
    if (brushes[i].classList.contains('medium')) {
      brushes[i].classList.add('active-brush');
      brush = 2;
    }
    if (brushes[i].classList.contains('large')) {
      brushes[i].classList.add('active-brush');
      brush = 3;
    }
    if (brushes[i].classList.contains('extralarge')) {
      brushes[i].classList.add('active-brush');
      brush = 4;
    }
  });
}

showShortcuts.onclick = () => shortcuts.classList.remove('closed');
close.onclick = () => shortcuts.classList.add('closed');
addFrame.addEventListener('click', createFrame);
canvas.addEventListener('mousedown', choosing);
previewIcon.addEventListener('click', toggleFullScreen);
canvas.addEventListener('mousedown', drawMouseDown);
canvas.addEventListener('mousemove', drawMouseMove);
canvas.addEventListener('mouseup', drawMouseUp);
canvas.addEventListener('mouseout', drawMouseOut);
canvas.addEventListener('mousedown', strokeTool);
canvas.addEventListener('mousedown', fill);
document.addEventListener('keyup', binds);
canvas.addEventListener('mousemove', selectColor);
colorSwap.addEventListener('mousedown', changeColors);
fps.addEventListener('mousedown', fpsChange);
fps.addEventListener('mousemove', fpsChange);
canvas.addEventListener('mouseup', drawFrame);
canvas.addEventListener('mousemove', previewAnim);
