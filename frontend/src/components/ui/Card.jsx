export default function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-border bg-surface shadow-panel ${className}`}>{children}</div>;
}