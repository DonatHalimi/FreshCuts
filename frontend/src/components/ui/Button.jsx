export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}) {
  const styles = {
    primary: 'bg-sage text-background hover:bg-sage-bright',
    secondary: 'bg-surface-2 text-text hover:bg-border',
    ghost: 'border border-border text-text hover:bg-surface-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}