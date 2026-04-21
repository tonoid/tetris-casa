import { useCallback, useEffect, useRef } from 'react';
import { CELL, GRID_W, GRID_H } from '../../constants/grid.js';
import {
  canPlace,
  roomAt,
  edgeHit,
  edgeCursor,
  resizedBox,
  ghostDim,
} from '../../lib/geometry.js';

const initialTransient = () => ({
  mousePos: null,
  rectStart: null,
  landMove: null,
  draggingRoom: null,
  resizing: null,
  ghost: null,
  ghostValid: false,
});

export function useCanvasInteractions({ canvasRef, state, actions, canPlaceHere, requestDraw }) {
  const transientRef = useRef(initialTransient());

  const cellFromEvent = useCallback(e => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / CELL),
      y: Math.floor((e.clientY - rect.top) / CELL),
    };
  }, [canvasRef]);

  const pixelFromEvent = useCallback(e => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [canvasRef]);

  const updateGhost = useCallback((x, y) => {
    const t = transientRef.current;
    if (!state.activeTemplate) {
      t.ghost = null;
      t.ghostValid = false;
      return;
    }
    const [w, h] = ghostDim(state.activeTemplate, state.ghostRotation);
    t.ghost = { template: state.activeTemplate, x, y, w, h };
    t.ghostValid = canPlaceHere(x, y, w, h);
  }, [state.activeTemplate, state.ghostRotation, canPlaceHere]);

  const setCursor = useCallback(cursor => {
    if (canvasRef.current) canvasRef.current.style.cursor = cursor || '';
  }, [canvasRef]);

  // Reset transient when mode / template / rotation actually change. The
  // function deps (updateGhost, setCursor, requestDraw) are intentionally
  // excluded — they change identity whenever state.rooms changes, and re-running
  // this on every drag-induced updateRoom would wipe the in-progress drag.
  useEffect(() => {
    const t = transientRef.current;
    t.rectStart = null;
    t.draggingRoom = null;
    t.resizing = null;
    t.landMove = null;
    setCursor('');
    if (!state.activeTemplate) {
      t.ghost = null;
    } else if (t.mousePos) {
      updateGhost(t.mousePos.x, t.mousePos.y);
    }
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, state.activeTemplate, state.ghostRotation]);

  const handleMouseDown = useCallback(e => {
    const { x, y } = cellFromEvent(e);
    if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return;
    const t = transientRef.current;
    t.mousePos = { x, y };

    if (state.mode === 'land') {
      if (e.shiftKey) {
        const hit = roomAt(state.rooms, x, y);
        if (hit) {
          actions.setMode('rooms');
          const current = state.selectedRoomIds;
          const next = current.includes(hit.id)
            ? current.filter(i => i !== hit.id)
            : [...current, hit.id];
          actions.selectRooms(next);
          if (next.includes(hit.id)) {
            t.draggingRoom = {
              anchorId: hit.id,
              ids: next,
              offsetX: x - hit.x,
              offsetY: y - hit.y,
              origs: next.map(id => {
                const r = state.rooms.find(rr => rr.id === id);
                return { id, x: r.x, y: r.y };
              }),
              moved: false,
            };
            setCursor('grabbing');
          }
        }
        requestDraw();
        return;
      }
      if (state.landTool === 'move') {
        t.landMove = { lastCell: { x, y } };
        setCursor('grabbing');
      } else {
        t.rectStart = { x, y };
      }
      requestDraw();
      return;
    }

    if (state.activeTemplate && t.ghost) {
      if (t.ghostValid) {
        actions.placeRoom(state.activeTemplate, t.ghost.x, t.ghost.y, t.ghost.w, t.ghost.h);
      }
      requestDraw();
      return;
    }

    if (
      state.roomTool === 'select' &&
      state.selectedRoomIds.length === 1 &&
      !e.shiftKey
    ) {
      const selected = state.rooms.find(r => r.id === state.selectedRoomIds[0]);
      if (selected) {
        const px = pixelFromEvent(e);
        const edge = edgeHit(selected, px.x, px.y);
        if (edge) {
          t.resizing = {
            id: selected.id,
            edge,
            startCell: { x, y },
            orig: { x: selected.x, y: selected.y, w: selected.w, h: selected.h },
          };
          setCursor(edgeCursor(edge));
          requestDraw();
          return;
        }
      }
    }

    const hit = roomAt(state.rooms, x, y);
    if (hit) {
      const current = state.selectedRoomIds;
      let next;
      if (e.shiftKey) {
        next = current.includes(hit.id)
          ? current.filter(i => i !== hit.id)
          : [...current, hit.id];
      } else {
        next = current.includes(hit.id) ? current : [hit.id];
      }
      actions.selectRooms(next);
      if (next.includes(hit.id)) {
        t.draggingRoom = {
          anchorId: hit.id,
          ids: next,
          offsetX: x - hit.x,
          offsetY: y - hit.y,
          origs: next.map(id => {
            const r = state.rooms.find(rr => rr.id === id);
            return { id, x: r.x, y: r.y };
          }),
          moved: false,
        };
        setCursor('grabbing');
      }
    } else if (!e.shiftKey) {
      actions.selectRooms([]);
    }
    requestDraw();
  }, [
    cellFromEvent,
    pixelFromEvent,
    state.mode,
    state.landTool,
    state.roomTool,
    state.activeTemplate,
    state.rooms,
    state.selectedRoomIds,
    actions,
    setCursor,
    requestDraw,
  ]);

  const handleMouseMove = useCallback(e => {
    const { x, y } = cellFromEvent(e);
    const t = transientRef.current;
    t.mousePos = { x, y };

    if (t.draggingRoom) {
      const anchor = state.rooms.find(r => r.id === t.draggingRoom.anchorId);
      if (anchor) {
        const nx = x - t.draggingRoom.offsetX;
        const ny = y - t.draggingRoom.offsetY;
        const dx = nx - anchor.x;
        const dy = ny - anchor.y;
        if (dx !== 0 || dy !== 0) {
          t.draggingRoom.moved = true;
          actions.moveRooms(t.draggingRoom.ids, dx, dy);
        }
      }
      requestDraw();
      return;
    }

    if (state.mode === 'land') {
      if (e.shiftKey) {
        setCursor(roomAt(state.rooms, x, y) ? 'grab' : '');
      } else if (t.landMove) {
        const dx = x - t.landMove.lastCell.x;
        const dy = y - t.landMove.lastCell.y;
        if (dx !== 0 || dy !== 0) {
          actions.moveLand(dx, dy);
          t.landMove.lastCell = { x, y };
        }
      }
      requestDraw();
      return;
    }

    if (t.resizing) {
      const room = state.rooms.find(r => r.id === t.resizing.id);
      if (!room) return;
      const box = resizedBox(t.resizing.edge, t.resizing.startCell, { x, y }, t.resizing.orig);
      if (canPlaceHere(box.x, box.y, box.w, box.h, room.id)) {
        actions.updateRoom(room.id, box);
      }
      requestDraw();
      return;
    }

    if (state.activeTemplate) {
      updateGhost(x, y);
      requestDraw();
      return;
    }

    // Idle hover: set cursor
    if (state.roomTool === 'move') {
      setCursor(roomAt(state.rooms, x, y) ? 'grab' : '');
    } else {
      const singleSelId =
        state.selectedRoomIds.length === 1 ? state.selectedRoomIds[0] : null;
      const selected = singleSelId != null
        ? state.rooms.find(r => r.id === singleSelId)
        : null;
      if (selected) {
        const px = pixelFromEvent(e);
        const edge = edgeHit(selected, px.x, px.y);
        if (edge) setCursor(edgeCursor(edge));
        else if (roomAt(state.rooms, x, y) === selected) setCursor('grab');
        else setCursor('');
      } else {
        setCursor(roomAt(state.rooms, x, y) ? 'grab' : '');
      }
    }
    requestDraw();
  }, [
    cellFromEvent,
    pixelFromEvent,
    state.mode,
    state.rooms,
    state.roomTool,
    state.activeTemplate,
    state.selectedRoomIds,
    actions,
    canPlaceHere,
    updateGhost,
    setCursor,
    requestDraw,
  ]);

  const handleMouseUp = useCallback(e => {
    const t = transientRef.current;
    if (t.draggingRoom) {
      if (t.draggingRoom.moved) {
        const dragIds = new Set(t.draggingRoom.ids);
        const others = state.rooms.filter(r => !dragIds.has(r.id));
        const dragged = state.rooms.filter(r => dragIds.has(r.id));
        const collides = dragged.some(
          r => !canPlace(r.x, r.y, r.w, r.h, others, null),
        );
        if (collides) {
          const anchor = dragged.find(r => r.id === t.draggingRoom.anchorId);
          const anchorOrig = t.draggingRoom.origs.find(
            o => o.id === t.draggingRoom.anchorId,
          );
          actions.moveRooms(
            t.draggingRoom.ids,
            anchorOrig.x - anchor.x,
            anchorOrig.y - anchor.y,
          );
        }
      }
      t.draggingRoom = null;
      setCursor('');
      requestDraw();
      return;
    }
    if (state.mode === 'land') {
      if (t.rectStart) {
        const end = cellFromEvent(e);
        const x1 = Math.max(0, Math.min(t.rectStart.x, end.x));
        const x2 = Math.min(GRID_W - 1, Math.max(t.rectStart.x, end.x));
        const y1 = Math.max(0, Math.min(t.rectStart.y, end.y));
        const y2 = Math.min(GRID_H - 1, Math.max(t.rectStart.y, end.y));
        if (state.landTool === 'add') actions.addRect(x1, y1, x2, y2);
        else if (state.landTool === 'remove') actions.clearRect(x1, y1, x2, y2);
        t.rectStart = null;
      }
      if (t.landMove) {
        t.landMove = null;
        setCursor('');
      }
    } else if (t.resizing) {
      t.resizing = null;
      setCursor('');
    }
    requestDraw();
  }, [
    cellFromEvent,
    state.mode,
    state.landTool,
    state.rooms,
    actions,
    setCursor,
    requestDraw,
  ]);

  const handleMouseLeave = useCallback(() => {
    const t = transientRef.current;
    t.mousePos = null;
    t.landMove = null;
    setCursor('');
    requestDraw();
  }, [setCursor, requestDraw]);

  const handleContextMenu = useCallback(e => {
    e.preventDefault();
    if (state.activeTemplate) actions.rotateGhost();
    else if (state.selectedRoomIds.length === 1) actions.rotateSelected();
  }, [state.activeTemplate, state.selectedRoomIds, actions]);

  // Keyboard
  useEffect(() => {
    const onKey = e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') {
        if (state.activeTemplate) actions.rotateGhost();
        else if (state.selectedRoomIds.length === 1) actions.rotateSelected();
      } else if (e.key === 'Escape') {
        actions.resetDraft();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedRoomIds.length > 0) {
          e.preventDefault();
          actions.deleteRooms(state.selectedRoomIds);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.activeTemplate, state.selectedRoomIds, actions]);

  const handleDragOver = useCallback(e => {
    if (!state.activeTemplate) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const { x, y } = cellFromEvent(e);
    const t = transientRef.current;
    t.mousePos = { x, y };
    updateGhost(x, y);
    canvasRef.current?.classList.add('drop-hover');
    requestDraw();
  }, [state.activeTemplate, cellFromEvent, updateGhost, canvasRef, requestDraw]);

  const handleDragLeave = useCallback(() => {
    canvasRef.current?.classList.remove('drop-hover');
  }, [canvasRef]);

  const handleDrop = useCallback(e => {
    if (!state.activeTemplate) return;
    e.preventDefault();
    canvasRef.current?.classList.remove('drop-hover');
    const t = transientRef.current;
    if (t.ghost && t.ghostValid) {
      actions.placeRoom(state.activeTemplate, t.ghost.x, t.ghost.y, t.ghost.w, t.ghost.h);
    }
    requestDraw();
  }, [state.activeTemplate, actions, canvasRef, requestDraw]);

  return {
    transientRef,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onContextMenu: handleContextMenu,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
