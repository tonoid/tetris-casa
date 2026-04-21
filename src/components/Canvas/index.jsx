import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CELL, GRID_W, GRID_H } from '../../constants/grid.js';
import { drawScene } from './renderer.js';
import { drawIsoScene } from './isoRenderer.js';
import { useCanvasInteractions } from './useCanvasInteractions.js';
import TopBar from './TopBar.jsx';
import Hint from './Hint.jsx';
import BottomToggles from '../BottomToggles/index.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { scaleUnit } from '../../lib/units.js';

export default function Canvas({ state, actions, canPlaceHere }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const sceneRef = useRef({ state, transient: null, settings: null });

  const { locale, units, view, viewRotation, rotateView, t } = useSettings();
  const settingsSignature = useMemo(
    () => ({ locale, units, view, viewRotation, t }),
    [locale, units, view, viewRotation, t],
  );

  useEffect(() => {
    if (view !== 'iso') return;
    const onKey = e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') rotateView();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, rotateView]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const payload = {
      state: sceneRef.current.state,
      transient: sceneRef.current.transient ?? {},
      settings: sceneRef.current.settings,
    };
    if (sceneRef.current.settings?.view === 'iso') drawIsoScene(ctx, payload);
    else drawScene(ctx, payload);
  }, []);

  const requestDraw = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      draw();
    });
  }, [draw]);

  const { transientRef, handlers } = useCanvasInteractions({
    canvasRef,
    state,
    actions,
    canPlaceHere,
    requestDraw,
  });

  useEffect(() => {
    sceneRef.current.state = state;
    sceneRef.current.transient = transientRef.current;
    sceneRef.current.settings = settingsSignature;
    draw();
  }, [state, transientRef, settingsSignature, draw]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  useEffect(() => {
    if (document.fonts?.ready) document.fonts.ready.then(draw);
  }, [draw]);

  return (
    <main className="canvas-area">
      <TopBar mode={state.mode} />
      <div className="canvas-frame">
        <div className="bolt tl" />
        <div className="bolt tr" />
        <div className="bolt bl" />
        <div className="bolt br" />
        <div className="frame-title">{t('frameTitle')}</div>
        <canvas
          ref={canvasRef}
          className={canvasClass(state, view)}
          width={GRID_W * CELL}
          height={GRID_H * CELL}
          {...(view === 'iso' ? {} : handlers)}
        />
        <div className="frame-scale">{t('scaleLabel', { unit: scaleUnit(units) })}</div>
      </div>
      {view === '2d' && <Hint state={state} />}
      <BottomToggles />
    </main>
  );
}

function canvasClass(state, view) {
  const classes = ['grid-canvas'];
  if (view === 'iso') classes.push('mode-iso');
  else if (state.mode === 'rooms') classes.push('mode-rooms');
  else if (state.landTool === 'move') classes.push('mode-land-move');
  return classes.join(' ');
}
