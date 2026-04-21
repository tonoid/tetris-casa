import { CELL, GRID_W, GRID_H } from '../../constants/grid.js';
import { lighten, darken } from '../../lib/color.js';
import { cellsToArea, unitSuffix } from '../../lib/units.js';
import { offLandCells } from '../../lib/geometry.js';

export function drawScene(ctx, view) {
  const { state, transient, settings } = view;
  const w = GRID_W * CELL;
  const h = GRID_H * CELL;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#05050f';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#131a38';
  for (const key of state.landCells) {
    const [x, y] = key.split(',').map(Number);
    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
  }

  drawGrid(ctx, w, h);
  drawPlotOutline(ctx, state.landCells);

  const singleSelection =
    state.roomTool !== 'move' && state.selectedRoomIds.length === 1;
  const selectedSet = new Set(state.selectedRoomIds);
  for (const r of state.rooms) {
    drawRoom(
      ctx,
      r,
      selectedSet.has(r.id),
      1,
      false,
      settings,
      state.landCells,
      singleSelection,
    );
  }

  if (state.mode === 'land' && transient.rectStart && transient.mousePos) {
    drawRectPreview(ctx, transient.rectStart, transient.mousePos, settings, state.landTool);
  }

  if (state.mode === 'rooms' && transient.ghost && transient.mousePos) {
    const valid = transient.ghostValid;
    drawRoom(
      ctx,
      {
        template: transient.ghost.template,
        x: transient.ghost.x,
        y: transient.ghost.y,
        w: transient.ghost.w,
        h: transient.ghost.h,
      },
      false,
      valid ? 0.55 : 0.3,
      !valid,
      settings,
      state.landCells,
    );
  }

  if (
    state.mode === 'land' &&
    state.landTool !== 'move' &&
    transient.mousePos &&
    !transient.isPainting &&
    !transient.rectStart &&
    !transient.landMove
  ) {
    drawHoverCell(ctx, transient.mousePos, state.landTool);
  }
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.10)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= GRID_W; i++) {
    ctx.moveTo(i * CELL + 0.5, 0);
    ctx.lineTo(i * CELL + 0.5, h);
  }
  for (let j = 0; j <= GRID_H; j++) {
    ctx.moveTo(0, j * CELL + 0.5);
    ctx.lineTo(w, j * CELL + 0.5);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
  ctx.beginPath();
  for (let i = 0; i <= GRID_W; i += 5) {
    ctx.moveTo(i * CELL + 0.5, 0);
    ctx.lineTo(i * CELL + 0.5, h);
  }
  for (let j = 0; j <= GRID_H; j += 5) {
    ctx.moveTo(0, j * CELL + 0.5);
    ctx.lineTo(w, j * CELL + 0.5);
  }
  ctx.stroke();
}

function drawPlotOutline(ctx, landCells) {
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  for (const key of landCells) {
    const [x, y] = key.split(',').map(Number);
    ctx.beginPath();
    if (!landCells.has(`${x - 1},${y}`)) {
      ctx.moveTo(x * CELL, y * CELL);
      ctx.lineTo(x * CELL, (y + 1) * CELL);
    }
    if (!landCells.has(`${x + 1},${y}`)) {
      ctx.moveTo((x + 1) * CELL, y * CELL);
      ctx.lineTo((x + 1) * CELL, (y + 1) * CELL);
    }
    if (!landCells.has(`${x},${y - 1}`)) {
      ctx.moveTo(x * CELL, y * CELL);
      ctx.lineTo((x + 1) * CELL, y * CELL);
    }
    if (!landCells.has(`${x},${y + 1}`)) {
      ctx.moveTo(x * CELL, (y + 1) * CELL);
      ctx.lineTo((x + 1) * CELL, (y + 1) * CELL);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawRectPreview(ctx, start, cur, settings, tool = 'add') {
  const x1 = Math.min(start.x, cur.x);
  const x2 = Math.max(start.x, cur.x);
  const y1 = Math.min(start.y, cur.y);
  const y2 = Math.max(start.y, cur.y);
  const dw = x2 - x1 + 1;
  const dh = y2 - y1 + 1;

  const isErase = tool === 'remove';
  const strokeColor = isErase ? '#ff2e5a' : '#00f0ff';
  const fillColor = isErase ? 'rgba(255, 46, 90, 0.18)' : 'rgba(0, 240, 255, 0.18)';

  ctx.fillStyle = fillColor;
  ctx.fillRect(x1 * CELL, y1 * CELL, dw * CELL, dh * CELL);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 6;
  ctx.strokeRect(x1 * CELL + 1, y1 * CELL + 1, dw * CELL - 2, dh * CELL - 2);
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  const units = settings?.units ?? 'meters';
  ctx.fillStyle = strokeColor;
  ctx.font = '700 14px "VT323", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `${dw}×${dh} · ${cellsToArea(dw * dh, units)} ${unitSuffix(units)}`,
    (x1 + dw / 2) * CELL,
    (y1 + dh / 2) * CELL,
  );
}

function drawHoverCell(ctx, pos, tool) {
  if (pos.x < 0 || pos.y < 0 || pos.x >= GRID_W || pos.y >= GRID_H) return;
  ctx.fillStyle = tool === 'remove' ? 'rgba(255, 46, 90, 0.22)' : 'rgba(0, 240, 255, 0.2)';
  ctx.fillRect(pos.x * CELL, pos.y * CELL, CELL, CELL);
  ctx.strokeStyle = tool === 'remove' ? '#ff2e5a' : '#00f0ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pos.x * CELL + 0.75, pos.y * CELL + 0.75, CELL - 1.5, CELL - 1.5);
}

function drawRoom(ctx, r, selected, alpha = 1, invalid = false, settings = null, landCells = null, showHandles = true) {
  const { w, h } = r;
  const px = r.x * CELL;
  const py = r.y * CELL;
  const pw = w * CELL;
  const ph = h * CELL;
  const color = invalid ? '#ff2e5a' : r.template.color;

  ctx.globalAlpha = alpha;

  ctx.fillStyle = darken(color, 0.55);
  ctx.fillRect(px, py, pw, ph);

  ctx.fillStyle = color;
  ctx.fillRect(px + 3, py + 3, pw - 6, ph - 6);

  ctx.fillStyle = lighten(color, 0.5);
  ctx.fillRect(px, py, pw, 3);
  ctx.fillRect(px, py, 3, ph);

  ctx.fillStyle = darken(color, 0.5);
  ctx.fillRect(px, py + ph - 3, pw, 3);
  ctx.fillRect(px + pw - 3, py, 3, ph);

  if (landCells && !invalid) drawOffLandWarning(ctx, r, landCells);

  ctx.strokeStyle = invalid ? '#ff2e5a' : 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.strokeRect(px + 3.5, py + 3.5, pw - 7, ph - 7);

  if (selected) drawSelection(ctx, px, py, pw, ph, showHandles);

  drawRoomLabel(ctx, r, px, py, pw, ph, settings);

  ctx.globalAlpha = 1;
}

function drawOffLandWarning(ctx, room, landCells) {
  const bad = offLandCells(room, landCells);
  if (bad.length === 0) return;
  ctx.save();
  for (const [cx, cy] of bad) {
    const x = cx * CELL;
    const y = cy * CELL;
    ctx.fillStyle = 'rgba(255, 46, 90, 0.45)';
    ctx.fillRect(x, y, CELL, CELL);

    ctx.beginPath();
    ctx.rect(x, y, CELL, CELL);
    ctx.clip();
    ctx.strokeStyle = 'rgba(40, 0, 10, 0.55)';
    ctx.lineWidth = 2;
    for (let i = -CELL; i < CELL * 2; i += 6) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + CELL, y + CELL);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
  }
  ctx.restore();
}

function drawSelection(ctx, px, py, pw, ph, showHandles = true) {
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 10;
  ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  if (!showHandles) return;

  const hs = 9;
  const hs2 = hs / 2;
  const handles = [
    [px, py],
    [px + pw, py],
    [px, py + ph],
    [px + pw, py + ph],
    [px + pw / 2, py],
    [px + pw / 2, py + ph],
    [px, py + ph / 2],
    [px + pw, py + ph / 2],
  ];
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 6;
  for (const [hx, hy] of handles) {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(hx - hs2, hy - hs2, hs, hs);
    ctx.strokeStyle = '#0a0a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(hx - hs2 + 0.5, hy - hs2 + 0.5, hs - 1, hs - 1);
  }
  ctx.shadowBlur = 0;
}

function drawRoomLabel(ctx, r, px, py, pw, ph, settings) {
  const minDim = Math.min(r.w, r.h);
  const units = settings?.units ?? 'meters';
  const name = settings?.t
    ? settings.t(`rooms.${r.template.key}`)
    : r.template.key;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0a0a1a';

  if (minDim >= 2) {
    const nameSize = Math.min(16, Math.max(14, 9 + minDim));
    ctx.font = `${nameSize}px "VT323", monospace`;
    ctx.fillText(name, px + pw / 2, py + ph / 2 - 6);
    ctx.font = '700 14px "VT323", monospace';
    ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
    ctx.fillText(
      `${r.w}×${r.h}·${cellsToArea(r.w * r.h, units)}${unitSuffix(units)}`,
      px + pw / 2,
      py + ph / 2 + 10,
    );
    return;
  }

  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);
  if (r.h > r.w) ctx.rotate(-Math.PI / 2);
  ctx.font = '14px "VT323", monospace';
  ctx.fillText(name, 0, 0);
  ctx.restore();
}
