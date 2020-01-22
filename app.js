const canvas = document.querySelector('canvas');
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
const pencilCode = 80;
const bucketCode = 66;
const chooseCode = 67;
const strokeCode = 76;
const eraserCode = 69;
const floodCode = 70;
const maxFieldSize = canvas.height * 5;
const small = 32;
const medium = 64;
const large = 128;
const ctx = canvas.getContext('2d');
const previous = document.querySelector('.previous-color');
const colors = document.querySelector('.colors');
const tools = ['bucket', 'floodfill', 'colorPicker', 'pencil', 'eraser', 'stroke'];

let pickerActive = false;
let currentColor = '#FFC107';
let previousColor = '#FFEB3B';
let activeTool = 'pencil';
let sc = null;
let previousPosition = null;
let prevPos = null;
let draw = false;
let erase = false;
let strokeEnable = false;
let filling = false;
let dragging = false;
let dragStartLocation;
let snapshot;
let brush;

// default settings
pencil.classList.add('active-tool');
brush = 1;
brushes[0].classList.add('active-brush');
sizeSwitcher[sizeSwitcher.length - 1].classList.add('current-size');
checkbox[sizeSwitcher.length - 1].classList.add('current-size__checkbox');
// 

function setCanvasSize(size) {
  sc = maxFieldSize / size;
  canvas.width = maxFieldSize / sc;
  canvas.height = maxFieldSize / sc;
}

function changeColors() {
  if (previousColor === currentColor) return;
  document.querySelector('.cur-color').style.backgroundColor = currentColor;
  document.querySelector('.prev-color').style.backgroundColor = previousColor;
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
    previousColor = currentColor;
    currentColor = rgbConvert(r, g, b);
    if (previousColor === currentColor) {
      return;
    }
    changeColors();
    activeTool = 'colorPicker';
  }
}

function changeCurrentColor(e) {
  if (e.target === previous || e.target === previous.children[1]) {
    const temp = currentColor;
    currentColor = previousColor;
    previousColor = temp;
    changeColors();
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

function selectCurrentColor() {
  previousColor = currentColor;
  changeColors();
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
      setCanvasSize(small);
    }
    if (sizeSwitcher[i].innerText === '64x64') {
      sizeSwitcher[i].classList.add('current-size');
      checkbox[i].classList.add('current-size__checkbox');
      setCanvasSize(medium);
    }
    if (sizeSwitcher[i].innerText === '128x128') {
      sizeSwitcher[i].classList.add('current-size');
      checkbox[i].classList.add('current-size__checkbox');
      setCanvasSize(large);
    }
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
colors.addEventListener('mousedown', changeCurrentColor);
canvas.addEventListener('mousedown', choosing);
choose.addEventListener('input', selectCurrentColor);
canvas.addEventListener('mousedown', drawMouseDown);
canvas.addEventListener('mousemove', drawMouseMove);
canvas.addEventListener('mouseup', drawMouseUp);
canvas.addEventListener('mouseout', drawMouseOut);
canvas.addEventListener('mousedown', strokeTool);
canvas.addEventListener('mousedown', fill);
document.addEventListener('keyup', binds);
