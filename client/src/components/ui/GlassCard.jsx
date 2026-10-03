import { motion } from 'framer-motion';

const variantStyles = {
  default: 'glass',
  subtle: 'glass-subtle',
  interactive: 'glass-interactive',
  highlight: 'glass border-brand-500/20 shadow-brand-500/5',
  danger: 'glass border-rose-500/20',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const GlassCard = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  animate = false,
  delay = 0,
  hover = false,
  ...props
}) => {
  const baseClasses = `
    rounded-xl
    ${variantStyles[variant] || variantStyles.default}
    ${paddings[padding] || paddings.md}
    ${className}
  `;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
