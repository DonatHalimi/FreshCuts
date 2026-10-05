export default function Spinner({ size = 'md' }) {
  const className = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return <span aria-label="Loading" className={`inline-block animate-spin rounded-full border-2 border-sage/25 border-t-sage ${className}`} />;
}