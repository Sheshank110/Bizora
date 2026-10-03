import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-4
          ${variant === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10'}
        `}>
          <AlertTriangle
            className={`w-7 h-7 ${variant === 'danger' ? 'text-rose-500' : 'text-amber-500'}`}
          />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">
          {message}
        </p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            fullWidth
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
