import React from 'react';

/**
 * GlassPanel — Converted to Clean Monochrome Panel
 */
const GlassPanel = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        rounded-xl
        bg-[var(--surface-secondary)]
        border-none shadow-none
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
