import { motion } from 'framer-motion';
import { IconAlertTriangle, IconRotateClockwise } from '@tabler/icons-react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-primary)] flex items-center justify-center mb-4">
        <IconAlertTriangle size={24} stroke={1.75} />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={IconRotateClockwise}>
          Try again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;
