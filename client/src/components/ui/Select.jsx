import { forwardRef } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

const Select = forwardRef(
  ({ label, error, hint, options = [], placeholder, className = '', required = false, id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2 pr-9 rounded-md text-sm appearance-none
              bg-[var(--surface-secondary)]
              border-none outline-none
              text-[var(--text-primary)]
              focus:ring-2 focus:ring-[#2563EB]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'ring-2 ring-rose-500/60' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-[var(--text-muted)] bg-[var(--surface-primary)]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={typeof opt === 'string' ? opt : opt.value}
                value={typeof opt === 'string' ? opt : opt.value}
                className="bg-[var(--surface-primary)] text-[var(--text-primary)]"
              >
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
          <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none stroke-[1.75]" />
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
