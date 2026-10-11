/** Shuffle once on the server so the first paint and hydration share an order. */
export function shufflePhotos<T>(photos: readonly T[]): T[] {
  const ordered = [...photos];
  for (let i = ordered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  return ordered;
}

/** Vary the composition, keeping the final row from becoming a lone thumbnail. */
export function photoMosaicRows(count: number): number[] {
  const rows: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    const size = Math.min(remaining, 3 + Math.floor(Math.random() * 3));
    const tail = remaining - size;
    if (tail > 0 && tail < 3) {
      rows.push(remaining);
      break;
    }
    rows.push(size);
    remaining = tail;
  }
  return rows;
}
