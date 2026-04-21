import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { cellKey, canPlace, onLandArea } from '../lib/geometry.js';
import { GRID_W, GRID_H } from '../constants/grid.js';
import { loadPlan, savePlan, exportPlan, readPlanFile } from '../lib/storage.js';

const emptyState = {
  mode: 'land',
  landTool: 'add',
  roomTool: 'select',
  landCells: new Set(),
  rooms: [],
  nextRoomId: 1,
  selectedRoomIds: [],
  activeTemplate: null,
  ghostRotation: 0,
};

function hydrateInitial() {
  const stored = loadPlan();
  if (!stored) return emptyState;
  return {
    ...emptyState,
    landCells: stored.landCells,
    rooms: stored.rooms,
    nextRoomId: stored.nextRoomId,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE': {
      if (state.mode === action.mode) return state;
      return {
        ...state,
        mode: action.mode,
        activeTemplate: null,
        ghostRotation: 0,
        selectedRoomIds: [],
      };
    }

    case 'SET_LAND_TOOL':
      return { ...state, landTool: action.tool };

    case 'SET_ROOM_TOOL':
      return { ...state, roomTool: action.tool };

    case 'ADD_RECT': {
      const landCells = new Set(state.landCells);
      for (let cx = action.x1; cx <= action.x2; cx++) {
        for (let cy = action.y1; cy <= action.y2; cy++) {
          landCells.add(cellKey(cx, cy));
        }
      }
      return { ...state, landCells };
    }

    case 'CLEAR_RECT': {
      const landCells = new Set(state.landCells);
      for (let cx = action.x1; cx <= action.x2; cx++) {
        for (let cy = action.y1; cy <= action.y2; cy++) {
          landCells.delete(cellKey(cx, cy));
        }
      }
      return { ...state, landCells };
    }

    case 'CLEAR_ALL':
      return {
        ...state,
        landCells: new Set(),
        rooms: [],
        selectedRoomIds: [],
      };

    case 'WIPE_ROOMS':
      return { ...state, rooms: [], selectedRoomIds: [] };

    case 'SELECT_TEMPLATE':
      return {
        ...state,
        mode: 'rooms',
        activeTemplate: action.template,
        ghostRotation: 0,
        selectedRoomIds: [],
      };

    case 'CLEAR_TEMPLATE':
      return { ...state, activeTemplate: null, ghostRotation: 0 };

    case 'ROTATE_GHOST':
      return { ...state, ghostRotation: (state.ghostRotation + 1) % 2 };

    case 'PLACE_ROOM': {
      const room = {
        id: state.nextRoomId,
        template: action.template,
        x: action.x,
        y: action.y,
        w: action.w,
        h: action.h,
      };
      return {
        ...state,
        rooms: [...state.rooms, room],
        nextRoomId: state.nextRoomId + 1,
      };
    }

    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(r => (r.id === action.id ? { ...r, ...action.patch } : r)),
      };

    case 'DELETE_ROOMS': {
      const ids = new Set(action.ids);
      return {
        ...state,
        rooms: state.rooms.filter(r => !ids.has(r.id)),
        selectedRoomIds: state.selectedRoomIds.filter(id => !ids.has(id)),
      };
    }

    case 'SELECT_ROOMS':
      return { ...state, selectedRoomIds: action.ids, activeTemplate: null, ghostRotation: 0 };

    case 'MOVE_ROOMS': {
      if (!action.ids.length || (action.dx === 0 && action.dy === 0)) return state;
      const ids = new Set(action.ids);
      return {
        ...state,
        rooms: state.rooms.map(r =>
          ids.has(r.id) ? { ...r, x: r.x + action.dx, y: r.y + action.dy } : r,
        ),
      };
    }

    case 'ROTATE_SELECTED': {
      if (state.selectedRoomIds.length !== 1) return state;
      const id = state.selectedRoomIds[0];
      const r = state.rooms.find(x => x.id === id);
      if (!r) return state;
      const nw = r.h;
      const nh = r.w;
      const offsets = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
      ];
      for (const [dx, dy] of offsets) {
        if (canPlace(r.x + dx, r.y + dy, nw, nh, state.rooms, r.id)) {
          return {
            ...state,
            rooms: state.rooms.map(x =>
              x.id === r.id ? { ...x, x: x.x + dx, y: x.y + dy, w: nw, h: nh } : x,
            ),
          };
        }
      }
      return state;
    }

    case 'RESET_DRAFT':
      return {
        ...state,
        activeTemplate: null,
        ghostRotation: 0,
        selectedRoomIds: [],
      };

    case 'MOVE_LAND': {
      if (state.landCells.size === 0) return state;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const k of state.landCells) {
        const [x, y] = k.split(',').map(Number);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      for (const r of state.rooms) {
        if (r.x < minX) minX = r.x;
        if (r.x + r.w - 1 > maxX) maxX = r.x + r.w - 1;
        if (r.y < minY) minY = r.y;
        if (r.y + r.h - 1 > maxY) maxY = r.y + r.h - 1;
      }
      const dx = Math.max(-minX, Math.min(GRID_W - 1 - maxX, action.dx));
      const dy = Math.max(-minY, Math.min(GRID_H - 1 - maxY, action.dy));
      if (dx === 0 && dy === 0) return state;
      const landCells = new Set();
      for (const k of state.landCells) {
        const [x, y] = k.split(',').map(Number);
        landCells.add(cellKey(x + dx, y + dy));
      }
      const rooms = state.rooms.map(r => ({ ...r, x: r.x + dx, y: r.y + dy }));
      return { ...state, landCells, rooms };
    }

    case 'LOAD_PLAN': {
      return {
        ...state,
        landCells: action.plan.landCells,
        rooms: action.plan.rooms,
        nextRoomId: action.plan.nextRoomId,
        selectedRoomIds: [],
        activeTemplate: null,
        ghostRotation: 0,
      };
    }

    default:
      return state;
  }
}

export function useFloorPlan() {
  const [state, dispatch] = useReducer(reducer, null, hydrateInitial);

  useEffect(() => {
    savePlan({ landCells: state.landCells, rooms: state.rooms, nextRoomId: state.nextRoomId });
  }, [state.landCells, state.rooms, state.nextRoomId]);

  const stats = useMemo(() => {
    const land = state.landCells.size;
    const used = state.rooms.reduce((s, r) => s + onLandArea(r, state.landCells), 0);
    const offLand = state.rooms.reduce((s, r) => s + r.w * r.h - onLandArea(r, state.landCells), 0);
    const remaining = Math.max(0, land - used);
    const coverage = land > 0 ? Math.round((used / land) * 100) : 0;
    return { land, used, offLand, remaining, coverage };
  }, [state.landCells, state.rooms]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const actions = useMemo(() => ({
    setMode: mode => dispatch({ type: 'SET_MODE', mode }),
    setLandTool: tool => dispatch({ type: 'SET_LAND_TOOL', tool }),
    setRoomTool: tool => dispatch({ type: 'SET_ROOM_TOOL', tool }),
    addRect: (x1, y1, x2, y2) => dispatch({ type: 'ADD_RECT', x1, y1, x2, y2 }),
    clearRect: (x1, y1, x2, y2) => dispatch({ type: 'CLEAR_RECT', x1, y1, x2, y2 }),
    clearAll: () => dispatch({ type: 'CLEAR_ALL' }),
    wipeRooms: () => dispatch({ type: 'WIPE_ROOMS' }),
    selectTemplate: template => dispatch({ type: 'SELECT_TEMPLATE', template }),
    clearTemplate: () => dispatch({ type: 'CLEAR_TEMPLATE' }),
    rotateGhost: () => dispatch({ type: 'ROTATE_GHOST' }),
    placeRoom: (template, x, y, w, h) => dispatch({ type: 'PLACE_ROOM', template, x, y, w, h }),
    updateRoom: (id, patch) => dispatch({ type: 'UPDATE_ROOM', id, patch }),
    moveRooms: (ids, dx, dy) => dispatch({ type: 'MOVE_ROOMS', ids, dx, dy }),
    deleteRooms: ids => dispatch({ type: 'DELETE_ROOMS', ids }),
    selectRooms: ids => dispatch({ type: 'SELECT_ROOMS', ids }),
    rotateSelected: () => dispatch({ type: 'ROTATE_SELECTED' }),
    resetDraft: () => dispatch({ type: 'RESET_DRAFT' }),
    moveLand: (dx, dy) => dispatch({ type: 'MOVE_LAND', dx, dy }),
    loadPlan: plan => dispatch({ type: 'LOAD_PLAN', plan }),
    exportPlan: () => exportPlan(stateRef.current),
    importPlan: async file => {
      const plan = await readPlanFile(file);
      dispatch({ type: 'LOAD_PLAN', plan });
    },
  }), [stateRef]);

  const canPlaceHere = useCallback(
    (x, y, w, h, ignoreId = null) => canPlace(x, y, w, h, state.rooms, ignoreId),
    [state.rooms],
  );

  return { state, stats, actions, canPlaceHere };
}
