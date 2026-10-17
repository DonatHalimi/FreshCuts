import { describe, expect, it } from 'vitest';
import { resolveSchedule } from '../src/utils/scheduleResolver.js';
import { generateSlots } from '../src/utils/slotGenerator.js';

function at(hour, minute = 0) {
  return new Date(2025, 0, 6, hour, minute);
}

describe('provider availability', () => {
  it('subtracts recurring breaks and time off from working hours', () => {
    const date = at(0);
    const ranges = resolveSchedule({
      date,
      workingHours: [{ dayOfWeek: 1, startMin: 540, endMin: 780, isActive: true }],
      breaks: [{ dayOfWeek: 1, startMin: 600, endMin: 615 }],
      timeOff: [{ startAt: at(11), endAt: at(12) }],
    });

    expect(ranges).toEqual([
      { start: at(9), end: at(10) },
      { start: at(10, 15), end: at(11) },
      { start: at(12), end: at(13) },
    ]);
  });

  it('includes service buffers when generating slots and excludes conflicts', () => {
    const slots = generateSlots({
      ranges: [{ start: at(9), end: at(11, 30) }],
      durationMin: 30,
      bufferBeforeMin: 10,
      bufferAfterMin: 5,
      intervalMin: 30,
      existing: [{ blockStartAt: at(9, 45), blockEndAt: at(10) }],
      now: at(8),
    });

    expect(slots).toEqual([
      {
        startAt: at(9, 10).toISOString(),
        endAt: at(9, 40).toISOString(),
        blockStartAt: at(9).toISOString(),
        blockEndAt: at(9, 45).toISOString(),
      },
      {
        startAt: at(10, 10).toISOString(),
        endAt: at(10, 40).toISOString(),
        blockStartAt: at(10).toISOString(),
        blockEndAt: at(10, 45).toISOString(),
      },
      {
        startAt: at(10, 40).toISOString(),
        endAt: at(11, 10).toISOString(),
        blockStartAt: at(10, 30).toISOString(),
        blockEndAt: at(11, 15).toISOString(),
      },
    ]);
  });
});
