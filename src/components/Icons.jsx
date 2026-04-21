// Pixel-art icons for the toolbar. Each icon is a 16×16 SVG drawn in `currentColor`
// so they inherit the button text color. Keep edges on integer coordinates for
// the chunky arcade feel.

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'currentColor',
  'aria-hidden': true,
  shapeRendering: 'crispEdges',
};

const isoBase = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'currentColor',
  'aria-hidden': true,
};

export function IconLand(props) {
  return (
    <svg {...isoBase} {...props}>
      {/* Top face — bright diamond */}
      <polygon points="8,3 14,6.5 8,10 2,6.5" />
      {/* Left slab face — darker */}
      <polygon points="2,6.5 8,10 8,13.5 2,10" fillOpacity="0.45" />
      {/* Right slab face — medium */}
      <polygon points="14,6.5 8,10 8,13.5 14,10" fillOpacity="0.7" />
      {/* Top grid subdivision */}
      <line x1="8" y1="3" x2="8" y2="10" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
      <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
    </svg>
  );
}

export function IconRooms(props) {
  return (
    <svg {...isoBase} {...props}>
      {/* Roof — top diamond */}
      <polygon points="8,1.5 14,5 8,8.5 2,5" />
      {/* Left wall — darker */}
      <polygon points="2,5 8,8.5 8,14 2,10.5" fillOpacity="0.5" />
      {/* Right wall — medium */}
      <polygon points="14,5 8,8.5 8,14 14,10.5" fillOpacity="0.75" />
      {/* Door cut on right wall */}
      <polygon points="10,10 12,9 12,12.5 10,13.5" fillOpacity="0.3" />
      {/* Window on left wall */}
      <polygon points="4,7 6,8 6,9 4,8" fillOpacity="0.3" />
    </svg>
  );
}

export function IconPaint(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="2" width="2" height="12" />
      <rect x="2" y="7" width="12" height="2" />
    </svg>
  );
}

export function IconErase(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="7" width="12" height="2" />
    </svg>
  );
}

export function IconGitHub(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
}

export function IconSelect(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <polygon points="3,2 3,13 6,10 8,14 10,13 8,9 12,9" />
    </svg>
  );
}

export function IconMove(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="1" width="2" height="14" />
      <rect x="1" y="7" width="14" height="2" />
      <rect x="5" y="3" width="2" height="2" />
      <rect x="9" y="3" width="2" height="2" />
      <rect x="5" y="11" width="2" height="2" />
      <rect x="9" y="11" width="2" height="2" />
      <rect x="3" y="5" width="2" height="2" />
      <rect x="11" y="5" width="2" height="2" />
      <rect x="3" y="9" width="2" height="2" />
      <rect x="11" y="9" width="2" height="2" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="2" width="10" height="2" />
      <rect x="6" y="1" width="4" height="1" />
      <rect x="3" y="5" width="10" height="2" />
      <rect x="4" y="7" width="2" height="7" />
      <rect x="10" y="7" width="2" height="7" />
      <rect x="7" y="7" width="2" height="7" />
      <rect x="3" y="13" width="10" height="1" />
    </svg>
  );
}

export function IconBroom(props) {
  return (
    <svg {...base} {...props}>
      <rect x="10" y="2" width="2" height="6" transform="rotate(45 11 5)" />
      <rect x="4" y="8" width="8" height="2" />
      <rect x="3" y="10" width="2" height="4" />
      <rect x="6" y="10" width="2" height="4" />
      <rect x="9" y="10" width="2" height="4" />
      <rect x="12" y="10" width="2" height="3" />
    </svg>
  );
}

export function IconExport(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="2" width="2" height="7" />
      <rect x="5" y="6" width="2" height="2" />
      <rect x="9" y="6" width="2" height="2" />
      <rect x="3" y="4" width="2" height="2" />
      <rect x="11" y="4" width="2" height="2" />
      <rect x="2" y="12" width="12" height="2" />
    </svg>
  );
}

export function IconImport(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="5" width="2" height="7" />
      <rect x="5" y="6" width="2" height="2" />
      <rect x="9" y="6" width="2" height="2" />
      <rect x="3" y="8" width="2" height="2" />
      <rect x="11" y="8" width="2" height="2" />
      <rect x="2" y="2" width="12" height="2" />
    </svg>
  );
}
