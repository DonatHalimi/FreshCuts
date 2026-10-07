export function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function combineDateAndMinutes(date, minutes) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(minutes);
  return result;
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}
