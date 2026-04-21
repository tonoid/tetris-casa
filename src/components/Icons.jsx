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
