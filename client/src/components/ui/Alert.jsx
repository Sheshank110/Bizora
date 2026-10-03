import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

const variants = {
  info: {
    bg: 'bg-brand-500/10 border-brand-500/25',
    icon: Info,
    iconColor: 'text-brand-400',
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/25',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  error: {
    bg: 'bg-rose-500/10 border-rose-500/25',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
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
        flex items-start gap-3 px-4 py-3.5 rounded-xl
        border ${v.bg}
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${v.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
            {title}
          </p>
        )}
        <div className="text-sm text-[var(--text-secondary)]">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
