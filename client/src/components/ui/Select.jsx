import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  ({ label, error, hint, options = [], placeholder, className = '', required = false, id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 pr-10 rounded-lg text-sm appearance-none
              bg-[var(--glass-bg)] backdrop-blur-md
              border transition-all duration-200
              text-[var(--text-primary)]
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-rose-500/50' : 'border-[var(--glass-border)] hover:border-[var(--border-default)]'}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-[var(--text-muted)]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={typeof opt === 'string' ? opt : opt.value}
                value={typeof opt === 'string' ? opt : opt.value}
              >
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
