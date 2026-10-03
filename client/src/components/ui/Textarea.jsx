import { forwardRef } from 'react';

const Textarea = forwardRef(
  ({ label, error, hint, className = '', required = false, id, rows = 4, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`
            w-full px-4 py-2.5 rounded-lg text-sm resize-y min-h-[80px]
            bg-[var(--glass-bg)] backdrop-blur-md
            border transition-all duration-200
            text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500' : 'border-[var(--glass-border)] hover:border-[var(--border-default)]'}
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
