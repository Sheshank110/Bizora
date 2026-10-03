import { forwardRef } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(({ label, className = '', id, ...props }, ref) => {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-2.5 cursor-pointer group ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className="w-5 h-5 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md transition-all duration-200 peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30 group-hover:border-[var(--border-default)]" />
        <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
