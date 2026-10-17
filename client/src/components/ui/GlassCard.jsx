import React from 'react';

const paddings = {
  none: '',
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * GlassCard — Converted to Clean Monochrome Surface
 * Strict enforcement: NO container borders, NO glassmorphism, NO neon glows.
 */
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
  return (
    <div
      className={`
        rounded-lg
        bg-[var(--surface-secondary)]
        border-none shadow-none
        ${paddings[padding] || paddings.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
