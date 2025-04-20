// Initialize Fabric canvas
const canvas = new fabric.Canvas('room-canvas', {
  selection: true,
  preserveObjectStacking: true,
});

// Room structure
const floor = new fabric.Rect({
  left: 100,
  top: 150,
  width: 800,
  height: 400,
  fill: '#e9e3d5',
  selectable: false
});

const leftWall = new fabric.Rect({
  left: 100,
  top: 50,
  width: 150,
  height: 400,
  fill: '#d3c6ae',
  angle: -10,
  selectable: false
});

const rightWall = new fabric.Rect({
  left: 750,
  top: 50,
  width: 150,
  height: 400,
  fill: '#d3c6ae',
  angle: 10,
  selectable: false
});

canvas.add(floor);
canvas.add(leftWall);
canvas.add(rightWall);

// Add furniture
window.addItemToCanvas = function (imgPath) {
  fabric.Image.fromURL(imgPath, function (img) {
    img.set({
      left: 200,
      top: 200,
      scaleX: 0.5,
      scaleY: 0.5,
      angle: 0,
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    canvas.add(img);
  }, { crossOrigin: 'anonymous' }); // Important for PNG export in Wix!
};

// Rotate selected item
window.rotateSelected = function (angle) {
  const active = canvas.getActiveObject();
  if (active && active !== floor && active !== leftWall && active !== rightWall) {
    active.rotate((active.angle || 0) + angle);
    canvas.requestRenderAll();
  }
};

// Wall/floor color controls
document.getElementById('wall-color').addEventListener('input', (e) => {
  leftWall.set({ fill: e.target.value });
  rightWall.set({ fill: e.target.value });
  canvas.requestRenderAll();
});

document.getElementById('floor-color').addEventListener('input', (e) => {
  floor.set({ fill: e.target.value });
  canvas.requestRenderAll();
});

// Delete on double-click
canvas.on('mouse:dblclick', function (e) {
  const obj = e.target;
  if (obj && obj !== floor && obj !== leftWall && obj !== rightWall) {
    canvas.remove(obj);
  }
});

// Snap to 50px grid
canvas.on('object:moving', function (e) {
  const obj = e.target;
  obj.set({
    left: Math.round(obj.left / 50) * 50,
    top: Math.round(obj.top / 50) * 50
  });
});

// Save as image (FIXED for Wix!)
document.getElementById('save-png').addEventListener('click', function () {
  try {
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    });

    const link = document.createElement('a');
    link.download = 'moakits-room.png';
    link.href = dataURL;
    link.click();
  } catch (err) {
    alert('⚠️ Export failed. Make sure all images are loaded from the same origin.');
  }
});

// Save as JSON
document.getElementById('save-json').addEventListener('click', function () {
  const json = JSON.stringify(canvas.toJSON(['selectable', 'angle', 'scaleX', 'scaleY']));
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'moakits-room.json';
  link.href = URL.createObjectURL(blob);
  link.click();
});

// Load from JSON
document.getElementById('load-json').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const json = event.target.result;
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
    });
  };

  reader.readAsText(file);
});
