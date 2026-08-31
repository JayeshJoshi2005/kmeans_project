export function formatNumber(val: number, maxDecimals: number = 3): string {
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    return 'N/A';
  }
  // Trim trailing zeros after decimal point
  const formatted = val.toFixed(maxDecimals);
  return parseFloat(formatted).toString();
}

export function formatCoord(val: number): string {
  return formatNumber(val, 3);
}

export function formatDist(val: number): string {
  return formatNumber(val, 3);
}
