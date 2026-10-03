import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      containerClassName = '',
      required = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              w-full px-4 py-2.5 rounded-lg text-sm
              bg-[var(--glass-bg)] backdrop-blur-md
              border transition-all duration-200
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500' : 'border-[var(--glass-border)] hover:border-[var(--border-default)]'}
              ${LeftIcon ? 'pl-10' : ''}
              ${isPassword || RightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {RightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <RightIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
