export function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function subtractRange(source, blocker) {
  if (!overlaps(source.start, source.end, blocker.start, blocker.end)) return [source];

  const ranges = [];
  if (source.start < blocker.start) ranges.push({ start: source.start, end: new Date(Math.min(source.end, blocker.start)) });
  if (blocker.end < source.end) ranges.push({ start: new Date(Math.max(source.start, blocker.end)), end: source.end });
  return ranges.filter((range) => range.start < range.end);
}

export function subtractMany(ranges, blockers) {
  return blockers.reduce((result, blocker) => result.flatMap((range) => subtractRange(range, blocker)), ranges);
}
