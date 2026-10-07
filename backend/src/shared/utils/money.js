export function formatCents(cents, currency = 'EUR') {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
