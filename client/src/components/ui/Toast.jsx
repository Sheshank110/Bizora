import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-rose-500/30 bg-rose-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-brand-500/30 bg-brand-500/10',
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-brand-400',
};

const ToastItem = ({ toast, onRemove }) => {
  const Icon = icons[toast.type] || icons.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        glass-heavy rounded-xl px-4 py-3 min-w-[320px] max-w-[420px]
        border ${styles[toast.type] || styles.info}
        flex items-start gap-3 shadow-xl
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

/**
 * ToastContainer — Renders all active toasts.
 * Place this once at the app root level.
 */
const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default ToastContainer;
