export default function Badge({ children, tone = 'neutral' }) {
  const styles = {
    neutral: 'border-border bg-surface-2 text-muted',
    success: 'border-sage/30 bg-sage/10 text-sage-bright',
    danger: 'border-red-400/30 bg-red-400/10 text-red-200',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[tone]}`}>{children}</span>;
}
