export function localDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function nextBookingDateInputValue(date = new Date()) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  while (nextDate.getDay() === 0) nextDate.setDate(nextDate.getDate() + 1);
  return localDateInputValue(nextDate);
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function isFuture(value) {
  return new Date(value) > new Date();
}