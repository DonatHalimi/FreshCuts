import React from 'react';

export default function Input({
  label,
  error,
  id,
  trailing,
  className = '',
  onFocus,
  onBlur,
  onChange,
  placeholder,
  ...props
}) {
  return (
    <label htmlFor={id} className={`block w-full space-y-2 ${className}`}>
      <div className="relative">
        <input
          id={id}
          placeholder={placeholder ?? ' '}
          {...props}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
          className={`peer w-full rounded-xl border bg-background px-4 pb-2 pt-6 text-sm text-text outline-none transition-all duration-200 ${error ? 'border-red-400/80' : 'border-border'} ${trailing ? 'pr-11' : ''}`}
        />
        {label ? (
          <span
            className={`
              pointer-events-none absolute left-4 z-10
              bg-background px-1
              text-sm font-medium text-muted/70
              transition-all duration-200

              top-1/2 -translate-y-1/2

              peer-focus:top-1.5
              peer-focus:translate-y-0
              peer-focus:text-[11px]
              peer-focus:font-semibold
              peer-focus:uppercase
              peer-focus:tracking-wide
              peer-focus:text-sage

              peer-[:not(:placeholder-shown)]:top-1.5
              peer-[:not(:placeholder-shown)]:translate-y-0
              peer-[:not(:placeholder-shown)]:text-[11px]
              peer-[:not(:placeholder-shown)]:font-semibold
              peer-[:not(:placeholder-shown)]:uppercase
              peer-[:not(:placeholder-shown)]:tracking-wide
              peer-[:not(:placeholder-shown)]:text-sage

              ${error ? 'peer-focus:text-red-400 peer-[:not(:placeholder-shown)]:text-red-400' : ''}
            `}
          >
            {label}
          </span>
        ) : null}

        {trailing ? (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>

      {error ? (
        <span className="pl-1 text-xs text-red-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}