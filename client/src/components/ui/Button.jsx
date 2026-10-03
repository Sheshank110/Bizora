import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-600/20',
  secondary:
    'bg-[var(--glass-bg-heavy)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--glass-bg)] hover:border-[var(--border-focus)] backdrop-blur-md',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-600/20',
  outline:
    'bg-transparent text-brand-500 border border-brand-500/40 hover:bg-brand-500/10 hover:border-brand-500',
  'outline-light':
    'bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/40',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-md',
  sm: 'px-3.5 py-1.5 text-sm gap-2 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  xl: 'px-8 py-3.5 text-base gap-3 rounded-xl',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <Component
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-200 ease-out
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variants[variant] || variants.primary}
          ${sizes[size] || sizes.md}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : LeftIcon ? (
          <LeftIcon className="w-4 h-4 shrink-0" />
        ) : null}
        {children}
        {RightIcon && !isLoading && <RightIcon className="w-4 h-4 shrink-0" />}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;

/**
 * MotionButton — Button with Framer Motion tap/hover animation
 */
export const MotionButton = forwardRef(({ children, ...props }, ref) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  >
    <Button ref={ref} {...props}>
      {children}
    </Button>
  </motion.div>
));

MotionButton.displayName = 'MotionButton';
