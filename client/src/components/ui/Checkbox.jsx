import { forwardRef } from 'react';
import { IconCheck } from '@tabler/icons-react';

const Checkbox = forwardRef(({ label, className = '', id, ...props }, ref) => {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-2.5 cursor-pointer group select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className="w-4 h-4 rounded border-0 bg-[var(--surface-secondary)] transition-colors peer-checked:bg-[#2563EB] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563EB]" />
        <IconCheck size={12} stroke={2.5} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
