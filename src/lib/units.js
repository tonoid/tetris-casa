const M2_PER_CELL = 1;
const FT2_PER_M2 = 10.7639;

export function unitSuffix(units) {
  return units === 'feet' ? 'FT²' : 'M²';
}

export function cellsToArea(cells, units) {
  const m2 = cells * M2_PER_CELL;
  if (units === 'feet') return Math.round(m2 * FT2_PER_M2);
  return m2;
}

export function formatArea(cells, units) {
  return `${cellsToArea(cells, units)} ${unitSuffix(units)}`;
}

export function padArea(cells, units) {
  const n = cellsToArea(cells, units);
  const padded = String(n).padStart(units === 'feet' ? 4 : 3, '0');
  return `${padded} ${unitSuffix(units)}`;
}

export function scaleUnit(units) {
  return units === 'feet' ? 'FT' : 'M';
}
