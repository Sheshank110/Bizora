const Card = ({ children, className = '', padding = 'md', ...props }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-xl bg-[var(--surface-secondary)]
        border border-[var(--border-default)]
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
