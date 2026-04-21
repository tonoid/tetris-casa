export function hexToRgb(hex) {
  const c = parseInt(hex.slice(1), 16);
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
}

export function rgbStr([r, g, b]) {
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

export function lighten(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbStr([r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt]);
}

export function darken(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbStr([r * (1 - amt), g * (1 - amt), b * (1 - amt)]);
}
