import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data yet',
  description = 'This section is empty. Data will appear here once available.',
  action,
  actionLabel = 'Get started',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <Button variant="primary" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
