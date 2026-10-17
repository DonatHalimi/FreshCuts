export default function Card({ children, className = '', ...props }) {
  return <div className={`rounded-2xl border border-border bg-surface shadow-md ${className}`} {...props}>{children}</div>;
}