// Initialize Fabric canvas
const canvas = new fabric.Canvas('room-canvas', {
  selection: true,
  preserveObjectStacking: true,
});

// Optional: add room "floor" background
const room = new fabric.Rect({
  left: 0,
  top: 0,
  fill: '#f2f2f2',
  width: 1000,
  height: 600,
  selectable: false
});
canvas.add(room);

// Make images draggable from the sidebar
document.querySelectorAll('.item').forEach(img => {
  img.setAttribute('draggable', true);
  img.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('src'));
  });
});

// Handle drop on canvas-wrapper
const canvasWrapper = document.getElementById('canvas-wrapper');

canvasWrapper.addEventListener('dragover', function (e) {
  e.preventDefault();
});

canvasWrapper.addEventListener('drop', function (e) {
  e.preventDefault();
  const imageUrl = e.dataTransfer.getData('text/plain');
  const rect = canvasWrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  fabric.Image.fromURL(imageUrl, function (img) {
    img.set({
      left: x,
      top: y,
      scaleX: 0.5,
      scaleY: 0.5,
      angle: 0,
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    canvas.add(img);
  });
});

// 🔁 Rotate selected item with "R" key
document.addEventListener('keydown', function (e) {
  const active = canvas.getActiveObject();
  if (!active) return;

  if (e.key === 'r' || e.key === 'R') {
    active.rotate((active.angle || 0) + 15);
    canvas.requestRenderAll();
  }
});

// 🗑️ Double-click to delete any object
canvas.on('mouse:dblclick', function (e) {
  const obj = e.target;
  if (obj && obj !== room) {
    canvas.remove(obj);
  }
});

// 📐 Snap to 50x50 grid when moving
canvas.on('object:moving', function (e) {
  const obj = e.target;
  obj.set({
    left: Math.round(obj.left / 50) * 50,
    top: Math.round(obj.top / 50) * 50
  });
});

// 📸 Save canvas as PNG image
document.getElementById('save-png').addEventListener('click', function () {
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
  });

  const link = document.createElement('a');
  link.download = 'moakits-room.png';
  link.href = dataURL;
  link.click();
});

// 💾 Export canvas as JSON
document.getElementById('save-json').addEventListener('click', function () {
  const json = JSON.stringify(canvas.toJSON());
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'moakits-room.json';
  link.href = URL.createObjectURL(blob);
  link.click();
});

// 📂 Load JSON back into canvas
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
