export default function Textarea({
  label,
  error,
  id,
  className = '',
  rows = 3,
  ...props
}) {
  return (
    <label htmlFor={id} className={`block w-full space-y-2 ${className}`}>
      <div className="relative">
        <textarea
          id={id}
          rows={rows}
          placeholder=" "
          {...props}
          className={`peer min-h-24 w-full resize-y rounded-xl border bg-background px-4 pb-2 pt-6 text-sm text-text outline-none transition-all duration-200 ${error ? 'border-red-400/80' : 'border-border'}`}
        />
        {label ? (
          <span
            className={`
              pointer-events-none absolute left-4 top-1.5 z-10
              bg-background px-1
              text-[11px] font-semibold uppercase tracking-wide
              ${error ? 'text-red-400' : 'text-muted/70'}
              transition-all duration-200

              peer-placeholder-shown:top-6
              peer-placeholder-shown:text-sm
              peer-placeholder-shown:font-medium
              peer-placeholder-shown:normal-case
              peer-placeholder-shown:tracking-normal
              peer-placeholder-shown:text-muted/70

              peer-focus:top-1.5
              peer-focus:text-[11px]
              peer-focus:font-semibold
              peer-focus:uppercase
              peer-focus:tracking-wide
              peer-focus:text-sage

              ${error ? 'peer-focus:text-red-400' : ''}
            `}
          >
            {label}
          </span>
        ) : null}
      </div>
      {error ? <span className="pl-1 text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
