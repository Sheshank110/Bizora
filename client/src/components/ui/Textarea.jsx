import { forwardRef } from 'react';

const Textarea = forwardRef(
  ({ label, error, hint, className = '', required = false, id, rows = 4, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`
            w-full px-3 py-2 rounded-md text-sm resize-y min-h-[80px]
            bg-[var(--surface-secondary)]
            border-none outline-none
            text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
            focus:ring-2 focus:ring-[#2563EB]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'ring-2 ring-rose-500/60' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
