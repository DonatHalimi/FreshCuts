import { addMinutes } from '../../shared/utils/dates.js';
import { overlaps } from './timeRange.js';

export function generateSlots({ ranges, durationMin, bufferBeforeMin = 0, bufferAfterMin = 0, intervalMin = 15, existing = [], now = new Date() }) {
  const slots = [];

  for (const range of ranges) {
    let cursor = new Date(range.start);
    while (true) {
      const serviceStart = addMinutes(cursor, bufferBeforeMin);
      const serviceEnd = addMinutes(serviceStart, durationMin);
      const blockEnd = addMinutes(serviceEnd, bufferAfterMin);
      if (blockEnd > range.end) break;

      const available = serviceStart >= now && !existing.some((item) => overlaps(cursor, blockEnd, item.blockStartAt, item.blockEndAt));
      if (available) {
        slots.push({ startAt: serviceStart.toISOString(), endAt: serviceEnd.toISOString(), blockStartAt: cursor.toISOString(), blockEndAt: blockEnd.toISOString() });
      }
      cursor = addMinutes(cursor, intervalMin);
    }
  }

  return slots;
}
