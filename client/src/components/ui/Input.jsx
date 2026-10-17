import { forwardRef, useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

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
            className="text-xs font-medium text-[var(--text-secondary)]"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              <LeftIcon className="w-4 h-4 stroke-[1.75]" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              w-full px-3 py-2 rounded-md text-sm
              bg-[var(--surface-secondary)]
              border-none outline-none
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:ring-2 focus:ring-[#2563EB]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'ring-2 ring-rose-500/60' : ''}
              ${LeftIcon ? 'pl-9' : ''}
              ${isPassword || RightIcon ? 'pr-9' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IconEyeOff className="w-4 h-4 stroke-[1.75]" /> : <IconEye className="w-4 h-4 stroke-[1.75]" />}
            </button>
          )}
          {RightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              <RightIcon className="w-4 h-4 stroke-[1.75]" />
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
