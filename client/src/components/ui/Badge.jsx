const variantStyles = {
  default: 'bg-[var(--glass-bg)] text-[var(--text-secondary)] border-[var(--glass-border)]',
  primary: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  success: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  danger: 'bg-rose-500/15 text-rose-500 border-rose-500/20',
  info: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${variantStyles[variant] || variantStyles.default}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" />
      )}
      {children}
    </span>
  );
};

export default Badge;
