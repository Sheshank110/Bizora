import React from 'react';

const variantDots = {
  default: 'bg-[var(--text-muted)]',
  neutral: 'bg-[var(--text-muted)]',
  primary: 'bg-[#2563EB]',
  brand: 'bg-[#2563EB]',
  secondary: 'bg-[var(--text-muted)]',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-[#2563EB]',
};

const variantStyles = {
  default: 'bg-[#EAEAEA] dark:bg-[#1C1C1E] text-[var(--text-primary)]',
  neutral: 'bg-[#EAEAEA] dark:bg-[#1C1C1E] text-[var(--text-primary)]',
  primary: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[var(--text-primary)]',
  brand: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[var(--text-primary)]',
  secondary: 'bg-[#EAEAEA] dark:bg-[#1C1C1E] text-[var(--text-primary)]',
  success: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-[var(--text-primary)]',
  warning: 'bg-amber-500/10 dark:bg-amber-500/20 text-[var(--text-primary)]',
  danger: 'bg-rose-500/10 dark:bg-rose-500/20 text-[var(--text-primary)]',
  info: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[var(--text-primary)]',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded',
  sm: 'px-2 py-0.5 text-xs rounded',
  md: 'px-2.5 py-1 text-xs rounded',
  lg: 'px-3 py-1 text-sm rounded',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = true,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium border-none
        ${variantStyles[variant] || variantStyles.default}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${variantDots[variant] || variantDots.default}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
