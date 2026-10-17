import Modal from './Modal';
import Button from './Button';
import { IconAlertTriangle } from '@tabler/icons-react';

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
        <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 bg-[var(--surface-secondary)] text-[var(--text-primary)]">
          <IconAlertTriangle size={22} stroke={1.75} />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-5 max-w-xs leading-relaxed">
          {message}
        </p>
        <div className="flex items-center gap-2.5 w-full">
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
