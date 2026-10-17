export default function EmptyState({ title, message, action = null }) {
  return <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center"><h2 className="text-base font-semibold text-text">{title}</h2><p className="mt-2 text-sm text-muted">{message}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}
