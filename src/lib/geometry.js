import { GRID_W, GRID_H, CELL, HANDLE_MARGIN } from '../constants/grid.js';

export function cellKey(x, y) {
  return `${x},${y}`;
}

// Rooms are allowed to overhang the plot — placement only checks that the room
// stays inside the grid and does not overlap another room. Cells outside the
// plot are rendered with a warning stripe (see `offLandCells`).
export function canPlace(x, y, w, h, rooms, ignoreId = null) {
  if (x < 0 || y < 0 || x + w > GRID_W || y + h > GRID_H) return false;
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      const cx = x + dx;
      const cy = y + dy;
      for (const r of rooms) {
        if (r.id === ignoreId) continue;
        if (cx >= r.x && cx < r.x + r.w && cy >= r.y && cy < r.y + r.h) return false;
      }
    }
  }
  return true;
}

export function roomAt(rooms, x, y) {
  for (let i = rooms.length - 1; i >= 0; i--) {
    const r = rooms[i];
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return r;
  }
  return null;
}

export function offLandCells(room, landCells) {
  const out = [];
  for (let dx = 0; dx < room.w; dx++) {
    for (let dy = 0; dy < room.h; dy++) {
      const cx = room.x + dx;
      const cy = room.y + dy;
      if (!landCells.has(cellKey(cx, cy))) out.push([cx, cy]);
    }
  }
  return out;
}

export function onLandArea(room, landCells) {
  let n = 0;
  for (let dx = 0; dx < room.w; dx++) {
    for (let dy = 0; dy < room.h; dy++) {
      if (landCells.has(cellKey(room.x + dx, room.y + dy))) n++;
    }
  }
  return n;
}

export function edgeHit(room, pxX, pxY) {
  const rx = room.x * CELL;
  const ry = room.y * CELL;
  const rw = room.w * CELL;
  const rh = room.h * CELL;
  if (pxX < rx - HANDLE_MARGIN || pxX > rx + rw + HANDLE_MARGIN) return null;
  if (pxY < ry - HANDLE_MARGIN || pxY > ry + rh + HANDLE_MARGIN) return null;
  const nearL = Math.abs(pxX - rx) <= HANDLE_MARGIN;
  const nearR = Math.abs(pxX - (rx + rw)) <= HANDLE_MARGIN;
  const nearT = Math.abs(pxY - ry) <= HANDLE_MARGIN;
  const nearB = Math.abs(pxY - (ry + rh)) <= HANDLE_MARGIN;
  if (nearT && nearL) return 'NW';
  if (nearT && nearR) return 'NE';
  if (nearB && nearL) return 'SW';
  if (nearB && nearR) return 'SE';
  if (nearT) return 'N';
  if (nearB) return 'S';
  if (nearL) return 'W';
  if (nearR) return 'E';
  return null;
}

const CURSOR_MAP = {
  N: 'ns-resize',
  S: 'ns-resize',
  W: 'ew-resize',
  E: 'ew-resize',
  NW: 'nwse-resize',
  SE: 'nwse-resize',
  NE: 'nesw-resize',
  SW: 'nesw-resize',
};

export function edgeCursor(edge) {
  return CURSOR_MAP[edge];
}

export function resizedBox(edge, startCell, cur, orig) {
  const dx = cur.x - startCell.x;
  const dy = cur.y - startCell.y;
  let nx = orig.x;
  let ny = orig.y;
  let nw = orig.w;
  let nh = orig.h;

  if (edge.includes('N')) {
    ny = orig.y + dy;
    nh = orig.h - dy;
    if (nh < 1) {
      nh = 1;
      ny = orig.y + orig.h - 1;
    }
  }
  if (edge.includes('S')) {
    nh = orig.h + dy;
    if (nh < 1) nh = 1;
  }
  if (edge.includes('W')) {
    nx = orig.x + dx;
    nw = orig.w - dx;
    if (nw < 1) {
      nw = 1;
      nx = orig.x + orig.w - 1;
    }
  }
  if (edge.includes('E')) {
    nw = orig.w + dx;
    if (nw < 1) nw = 1;
  }

  return { x: nx, y: ny, w: nw, h: nh };
}

export function ghostDim(template, rotation) {
  return rotation === 0 ? [template.w, template.h] : [template.h, template.w];
}

export function clampCell(x, y) {
  return {
    x: Math.max(0, Math.min(GRID_W - 1, x)),
    y: Math.max(0, Math.min(GRID_H - 1, y)),
  };
}
