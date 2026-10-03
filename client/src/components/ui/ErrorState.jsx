import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={RefreshCw}>
          Try again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;
