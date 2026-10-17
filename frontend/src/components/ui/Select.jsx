export default function Select({ label, error, id, children, ...props }) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-text">{label}</span>
      <select id={id} className={`w-full rounded-xl border bg-background px-3.5 py-3 text-sm text-text outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/15 ${error ? 'border-red-400/70' : 'border-border'}`} {...props}>{children}</select>
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
