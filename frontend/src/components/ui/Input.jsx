export default function Input({ label, error, id, ...props }) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        id={id}
        className={`w-full rounded-lg border bg-background px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-sage focus:ring-2 focus:ring-sage/15 ${error ? 'border-red-400/70' : 'border-border'
          }`}
        {...props}
      />
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}