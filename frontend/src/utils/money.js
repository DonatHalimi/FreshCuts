export function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
}