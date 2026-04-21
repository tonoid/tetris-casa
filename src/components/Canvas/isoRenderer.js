import { CELL, GRID_W, GRID_H } from '../../constants/grid.js';
import { lighten, darken } from '../../lib/color.js';
import { cellsToArea, unitSuffix } from '../../lib/units.js';

const TILE_W = CELL;
const TILE_H = CELL / 2;
const WALL_H = Math.round(CELL * 0.9);

// Rotate a grid point (x, y) by rotation * 90° CW around the grid origin.
function rotatePoint(x, y, rotation) {
  switch (((rotation % 4) + 4) % 4) {
    case 1: return { x: GRID_H - y, y: x };
    case 2: return { x: GRID_W - x, y: GRID_H - y };
    case 3: return { x: y, y: GRID_W - x };
    default: return { x, y };
  }
}

function isoProj(rx, ry, ox, oy, zOff = 0) {
  return {
    x: ox + (rx - ry) * (TILE_W / 2),
    y: oy + (rx + ry) * (TILE_H / 2) - zOff,
  };
}

function isoPoint(x, y, rotation, ox, oy, zOff = 0) {
  const r = rotatePoint(x, y, rotation);
  return isoProj(r.x, r.y, ox, oy, zOff);
}

function sceneOffsets(canvas, rotation) {
  const corners = [
    rotatePoint(0, 0, rotation),
    rotatePoint(GRID_W, 0, rotation),
    rotatePoint(GRID_W, GRID_H, rotation),
    rotatePoint(0, GRID_H, rotation),
  ];
  let minSX = Infinity, maxSX = -Infinity, minSY = Infinity, maxSY = -Infinity;
  for (const c of corners) {
    const p = isoProj(c.x, c.y, 0, 0);
    if (p.x < minSX) minSX = p.x;
    if (p.x > maxSX) maxSX = p.x;
    if (p.y < minSY) minSY = p.y;
    if (p.y > maxSY) maxSY = p.y;
  }
  return {
    ox: (canvas.width - (maxSX - minSX)) / 2 - minSX,
    oy: (canvas.height - (maxSY - minSY) - WALL_H) / 2 + WALL_H - minSY,
  };
}

export function drawIsoScene(ctx, view) {
  const { state, settings } = view;
  const canvas = ctx.canvas;
  const rotation = settings?.viewRotation ?? 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#05050f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { ox, oy } = sceneOffsets(canvas, rotation);

  drawIsoGrid(ctx, rotation, ox, oy);
  drawIsoLand(ctx, state.landCells, rotation, ox, oy);
  drawIsoPlotOutline(ctx, state.landCells, rotation, ox, oy);

  // Painter's algorithm: sort by smallest rotated-corner sum (farthest back first).
  const sorted = [...state.rooms]
    .map(r => ({ r, key: backCornerSum(r, rotation) }))
    .sort((a, b) => a.key - b.key)
    .map(x => x.r);

  const selectedSet = new Set(state.selectedRoomIds);
  for (const r of sorted) {
    drawIsoRoom(ctx, r, selectedSet.has(r.id), rotation, ox, oy, settings);
  }
}

function backCornerSum(r, rotation) {
  const pts = roomCorners(r).map(([x, y]) => rotatePoint(x, y, rotation));
  let min = Infinity;
  for (const p of pts) {
    const s = p.x + p.y;
    if (s < min) min = s;
  }
  return min;
}

function roomCorners(r) {
  return [
    [r.x,        r.y       ],
    [r.x + r.w,  r.y       ],
    [r.x + r.w,  r.y + r.h ],
    [r.x,        r.y + r.h ],
  ];
}

function drawIsoGrid(ctx, rotation, ox, oy) {
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.10)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 0; y <= GRID_H; y++) {
    const a = isoPoint(0, y, rotation, ox, oy);
    const b = isoPoint(GRID_W, y, rotation, ox, oy);
    ctx.moveTo(a.x + 0.5, a.y + 0.5);
    ctx.lineTo(b.x + 0.5, b.y + 0.5);
  }
  for (let x = 0; x <= GRID_W; x++) {
    const a = isoPoint(x, 0, rotation, ox, oy);
    const b = isoPoint(x, GRID_H, rotation, ox, oy);
    ctx.moveTo(a.x + 0.5, a.y + 0.5);
    ctx.lineTo(b.x + 0.5, b.y + 0.5);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
  ctx.beginPath();
  for (let y = 0; y <= GRID_H; y += 5) {
    const a = isoPoint(0, y, rotation, ox, oy);
    const b = isoPoint(GRID_W, y, rotation, ox, oy);
    ctx.moveTo(a.x + 0.5, a.y + 0.5);
    ctx.lineTo(b.x + 0.5, b.y + 0.5);
  }
  for (let x = 0; x <= GRID_W; x += 5) {
    const a = isoPoint(x, 0, rotation, ox, oy);
    const b = isoPoint(x, GRID_H, rotation, ox, oy);
    ctx.moveTo(a.x + 0.5, a.y + 0.5);
    ctx.lineTo(b.x + 0.5, b.y + 0.5);
  }
  ctx.stroke();
}

function drawIsoLand(ctx, landCells, rotation, ox, oy) {
  ctx.fillStyle = '#131a38';
  for (const key of landCells) {
    const [x, y] = key.split(',').map(Number);
    const n = isoPoint(x, y, rotation, ox, oy);
    const e = isoPoint(x + 1, y, rotation, ox, oy);
    const s = isoPoint(x + 1, y + 1, rotation, ox, oy);
    const w = isoPoint(x, y + 1, rotation, ox, oy);
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.lineTo(e.x, e.y);
    ctx.lineTo(s.x, s.y);
    ctx.lineTo(w.x, w.y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawIsoPlotOutline(ctx, landCells, rotation, ox, oy) {
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 6;
  for (const key of landCells) {
    const [x, y] = key.split(',').map(Number);
    const n = isoPoint(x, y, rotation, ox, oy);
    const e = isoPoint(x + 1, y, rotation, ox, oy);
    const s = isoPoint(x + 1, y + 1, rotation, ox, oy);
    const w = isoPoint(x, y + 1, rotation, ox, oy);
    ctx.beginPath();
    if (!landCells.has(`${x - 1},${y}`)) { ctx.moveTo(n.x, n.y); ctx.lineTo(w.x, w.y); }
    if (!landCells.has(`${x + 1},${y}`)) { ctx.moveTo(e.x, e.y); ctx.lineTo(s.x, s.y); }
    if (!landCells.has(`${x},${y - 1}`)) { ctx.moveTo(n.x, n.y); ctx.lineTo(e.x, e.y); }
    if (!landCells.has(`${x},${y + 1}`)) { ctx.moveTo(w.x, w.y); ctx.lineTo(s.x, s.y); }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawIsoRoom(ctx, r, selected, rotation, ox, oy, settings) {
  const color = r.template.color;
  const corners = roomCorners(r);
  const topPts = corners.map(([cx, cy]) => isoPoint(cx, cy, rotation, ox, oy, WALL_H));
  const botPts = corners.map(([cx, cy]) => isoPoint(cx, cy, rotation, ox, oy, 0));

  // Front corner = the top-face corner with max screen y (closest to viewer).
  let fi = 0;
  for (let i = 1; i < 4; i++) if (topPts[i].y > topPts[fi].y) fi = i;
  const ni = (fi + 3) % 4;
  const nj = (fi + 1) % 4;
  const leftIdx = topPts[ni].x < topPts[nj].x ? ni : nj;
  const rightIdx = leftIdx === ni ? nj : ni;

  // Left-front wall
  ctx.fillStyle = darken(color, 0.5);
  ctx.beginPath();
  ctx.moveTo(topPts[leftIdx].x, topPts[leftIdx].y);
  ctx.lineTo(topPts[fi].x, topPts[fi].y);
  ctx.lineTo(botPts[fi].x, botPts[fi].y);
  ctx.lineTo(botPts[leftIdx].x, botPts[leftIdx].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(color, 0.75);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right-front wall
  ctx.fillStyle = darken(color, 0.25);
  ctx.beginPath();
  ctx.moveTo(topPts[fi].x, topPts[fi].y);
  ctx.lineTo(topPts[rightIdx].x, topPts[rightIdx].y);
  ctx.lineTo(botPts[rightIdx].x, botPts[rightIdx].y);
  ctx.lineTo(botPts[fi].x, botPts[fi].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(color, 0.75);
  ctx.stroke();

  // Top face
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(topPts[0].x, topPts[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = lighten(color, 0.45);
  ctx.lineWidth = 1;
  ctx.stroke();

  if (selected) {
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  const cx = (topPts[0].x + topPts[1].x + topPts[2].x + topPts[3].x) / 4;
  const cy = (topPts[0].y + topPts[1].y + topPts[2].y + topPts[3].y) / 4;
  const t = settings?.t;
  const units = settings?.units ?? 'meters';
  const name = t ? t(`rooms.${r.template.key}`) : r.template.key;

  ctx.fillStyle = '#0a0a1a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '10px "VT323", monospace';
  ctx.fillText(name, cx, cy - 6);
  ctx.font = '700 12px "VT323", monospace';
  ctx.fillText(
    `${r.w}×${r.h}·${cellsToArea(r.w * r.h, units)}${unitSuffix(units)}`,
    cx,
    cy + 6,
  );
}
