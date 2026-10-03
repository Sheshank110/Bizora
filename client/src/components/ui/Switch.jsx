import { forwardRef } from 'react';

const Switch = forwardRef(({ label, className = '', id, size = 'md', ...props }, ref) => {
  const inputId = id || props.name;
  const sizes = {
    sm: { track: 'w-8 h-[18px]', thumb: 'w-3.5 h-3.5 peer-checked:translate-x-3.5' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5 peer-checked:translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6 peer-checked:translate-x-7' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...props}
        />
        <div className={`${s.track} rounded-full bg-[var(--border-default)] peer-checked:bg-brand-600 transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30`} />
        <div className={`${s.thumb} absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200`} />
      </div>
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
});

Switch.displayName = 'Switch';

export default Switch;
