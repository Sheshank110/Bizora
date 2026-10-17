import { forwardRef } from 'react';
import { IconLoader2 } from '@tabler/icons-react';

const variants = {
  primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#2563EB]',
  secondary: 'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500',
  outline: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]',
  'outline-light': 'bg-transparent text-white hover:bg-white/10',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-md font-medium',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md font-medium',
  md: 'px-4 py-2 text-sm gap-2 rounded-md font-medium',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-md font-semibold',
  xl: 'px-6 py-3 text-base gap-2.5 rounded-md font-semibold',
  icon: 'p-2 aspect-square rounded-md flex items-center justify-center shrink-0',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      disabled = false,
      fullWidth = false,
      circle = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      icon: Icon,
      className = '',
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || loading;
    const isDisabled = disabled || isBusy;
    const ResolvedLeftIcon = LeftIcon || Icon;
    const hasText = Boolean(children);
    const isIconOnly = !hasText && Boolean(ResolvedLeftIcon || RightIcon);

    return (
      <Component
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          transition-colors duration-150 select-none
          disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
          border-none outline-none
          ${variants[variant] || variants.primary}
          ${isIconOnly ? sizes.icon : (sizes[size] || sizes.md)}
          ${circle ? 'rounded-full' : 'rounded-md'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isBusy ? (
          <IconLoader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : !hasText && ResolvedLeftIcon ? (
          <ResolvedLeftIcon className="w-4 h-4 shrink-0 stroke-[1.75]" />
        ) : null}
        {hasText && <span>{children}</span>}
        {!hasText && RightIcon && !isBusy && (
          <RightIcon className="w-4 h-4 shrink-0 stroke-[1.75]" />
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;

export const MotionButton = Button;
