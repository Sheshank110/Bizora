/**
 * GlassPanel — A larger glass surface for sections/panels.
 */
const GlassPanel = ({ children, className = '', blur = 'default', ...props }) => {
  const blurs = {
    light: 'backdrop-blur-sm',
    default: 'backdrop-blur-md',
    heavy: 'backdrop-blur-xl',
  };

  return (
    <div
      className={`
        rounded-2xl
        bg-[var(--glass-bg)]
        ${blurs[blur] || blurs.default}
        border border-[var(--glass-border)]
        shadow-[var(--glass-shadow)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
