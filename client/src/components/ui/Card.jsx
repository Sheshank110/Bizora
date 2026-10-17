import React from 'react';

/**
 * Card — Clean Monochrome Surface
 * Strict enforcement: NO container borders, restrained 8px radius, no heavy shadows.
 */
const Card = ({ children, className = '', padding = 'md', solid = false, ...props }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

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

export default Card;
