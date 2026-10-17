import { IconCircleCheck, IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-react';
import { useState } from 'react';

const variants = {
  info: {
    bg: 'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
    icon: IconInfoCircle,
    iconColor: 'text-[#2563EB]',
  },
  success: {
    bg: 'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
    icon: IconCircleCheck,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
    icon: IconAlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    bg: 'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
    icon: IconAlertCircle,
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
};

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  className = '',
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const v = variants[variant] || variants.info;
  const Icon = v.icon;

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 px-4 py-3 rounded-md
        border-0 ${v.bg}
        ${className}
      `}
    >
      <Icon size={18} stroke={1.75} className={`shrink-0 mt-0.5 ${v.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
            {title}
          </p>
        )}
        <div className="text-xs leading-relaxed text-[var(--text-secondary)]">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <IconX size={16} stroke={1.75} />
        </button>
      )}
    </div>
  );
};

export default Alert;
