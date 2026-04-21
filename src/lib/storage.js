import { roomTemplates } from '../constants/rooms.js';

export const STORAGE_KEY = 'tetris-casa:plan';
const CURRENT_VERSION = 1;

const TEMPLATES_BY_KEY = new Map(roomTemplates.map(t => [t.key, t]));

export function serializePlan(state) {
  return {
    version: CURRENT_VERSION,
    land: [...state.landCells],
    rooms: state.rooms.map(r => ({
      id: r.id,
      key: r.template.key,
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
    })),
    nextRoomId: state.nextRoomId,
  };
}

export function deserializePlan(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.version !== CURRENT_VERSION) return null;

  const landCells = new Set(Array.isArray(data.land) ? data.land.filter(k => typeof k === 'string') : []);

  const rooms = [];
  const rawRooms = Array.isArray(data.rooms) ? data.rooms : [];
  let maxId = 0;
  for (const r of rawRooms) {
    if (!r || typeof r !== 'object') continue;
    const template = TEMPLATES_BY_KEY.get(r.key);
    if (!template) continue;
    if (![r.x, r.y, r.w, r.h, r.id].every(Number.isFinite)) continue;
    rooms.push({ id: r.id, template, x: r.x, y: r.y, w: r.w, h: r.h });
    if (r.id > maxId) maxId = r.id;
  }

  const nextRoomId = Number.isFinite(data.nextRoomId) && data.nextRoomId > maxId
    ? data.nextRoomId
    : maxId + 1;

  return { landCells, rooms, nextRoomId };
}

export function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return deserializePlan(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePlan(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializePlan(state)));
  } catch {
    // Storage full, private mode, etc. — silently ignore.
  }
}

export function exportPlan(state) {
  const payload = {
    ...serializePlan(state),
    exportedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = payload.exportedAt.replace(/[:.]/g, '-');
  a.href = url;
  a.download = `tetris-casa-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readPlanFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const plan = deserializePlan(parsed);
        if (!plan) reject(new Error('Invalid plan file'));
        else resolve(plan);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsText(file);
  });
}
