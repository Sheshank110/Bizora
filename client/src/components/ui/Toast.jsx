import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconCircleCheck, IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { useToastStore } from '../../store/toastStore';

const icons = {
  success: IconCircleCheck,
  error: IconAlertCircle,
  warning: IconAlertTriangle,
  info: IconInfoCircle,
};

const iconColors = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-[#2563EB]',
};

const ToastItem = ({ toast, onRemove }) => {
  const Icon = icons[toast.type] || icons.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-[var(--surface-elevated)] rounded-lg px-4 py-3 min-w-[300px] max-w-[400px]
        border-0 shadow-lg flex items-start gap-3
      `}
    >
      <Icon size={18} stroke={1.75} className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <IconX size={15} stroke={1.75} />
      </button>
    </motion.div>
  );
};

/**
 * ToastContainer — Renders all active toasts.
 */
const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
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
