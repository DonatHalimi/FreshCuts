import { combineDateAndMinutes } from '../../shared/utils/dates.js';
import { subtractMany } from './timeRange.js';

function dayOfWeekMondayFirst(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function resolveSchedule({ date, workingHours, breaks, timeOff }) {
  const day = dayOfWeekMondayFirst(date);
  const ranges = workingHours
    .filter((row) => row.dayOfWeek === day && row.isActive)
    .map((row) => ({ start: combineDateAndMinutes(date, row.startMin), end: combineDateAndMinutes(date, row.endMin) }));

  const recurringBreaks = breaks
    .filter((row) => row.dayOfWeek === day)
    .map((row) => ({ start: combineDateAndMinutes(date, row.startMin), end: combineDateAndMinutes(date, row.endMin) }));

  const exceptions = timeOff
    .filter((row) => row.startAt < new Date(date.getTime() + 24 * 60 * 60 * 1000) && row.endAt > date)
    .map((row) => ({ start: row.startAt, end: row.endAt }));

  return subtractMany(ranges, [...recurringBreaks, ...exceptions]);
}
