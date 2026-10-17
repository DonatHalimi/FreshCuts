export function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-panel">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-text">{value}</div>
      {detail ? <div className="mt-1 text-xs text-muted">{detail}</div> : null}
    </div>
  );
}
