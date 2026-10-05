export default function Alert({ children, tone = 'error' }) {
  const classes = {
    error: 'border-red-400/30 bg-red-400/10 text-red-100',
    success: 'border-sage/30 bg-sage/10 text-sage-bright',
    info: 'border-border bg-surface-2 text-muted',
  };

  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes[tone]}`}>{children}</div>;
}