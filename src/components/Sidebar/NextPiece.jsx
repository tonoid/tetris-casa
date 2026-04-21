import { useSettings } from '../../hooks/useSettings.js';

const MAX_DIM = 6;

export default function NextPiece({ template, rotation }) {
  const { t, formatArea } = useSettings();
  const piece = template
    ? rotation === 1
      ? { ...template, w: template.h, h: template.w }
      : template
    : null;

  return (
    <div className={`next-piece ${piece ? 'filled' : ''}`}>
      <div className="next-piece-badge">{t('queued')}</div>
      <div className="next-piece-frame">
        {piece ? <PieceGrid piece={piece} /> : <PieceGhost />}
      </div>
      <div className="next-piece-meta">
        {piece ? (
          <>
            <span className="next-name">{t(`rooms.${piece.key}`)}</span>
            <span className="next-size">
              {piece.w}×{piece.h} · {formatArea(piece.w * piece.h)}
            </span>
          </>
        ) : (
          <span className="next-name dim">{t('empty')}</span>
        )}
      </div>
    </div>
  );
}

function PieceGrid({ piece }) {
  const cells = [];
  for (let y = 0; y < piece.h; y++) {
    for (let x = 0; x < piece.w; x++) {
      cells.push(<span key={`${x},${y}`} className="piece-cell" />);
    }
  }

  const cellPx = Math.floor(96 / Math.max(piece.w, piece.h, MAX_DIM));
  return (
    <div
      className="piece-grid"
      style={{
        gridTemplateColumns: `repeat(${piece.w}, ${cellPx}px)`,
        gridTemplateRows: `repeat(${piece.h}, ${cellPx}px)`,
        '--piece-color': piece.color,
      }}
    >
      {cells}
    </div>
  );
}

function PieceGhost() {
  return <div className="piece-ghost" aria-hidden="true">?</div>;
}
