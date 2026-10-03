import { forwardRef } from 'react';

const Radio = forwardRef(({ label, className = '', id, ...props }, ref) => {
  const inputId = id || `${props.name}-${props.value}`;

  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-2.5 cursor-pointer group ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="peer sr-only"
          {...props}
        />
        <div className="w-5 h-5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md transition-all duration-200 peer-checked:border-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30 group-hover:border-[var(--border-default)]" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-brand-600 opacity-0 peer-checked:opacity-100 transition-all duration-200 scale-0 peer-checked:scale-100" />
      </div>
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
});

Radio.displayName = 'Radio';

export default Radio;
