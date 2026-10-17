import React from 'react';
import { IconInbox } from '@tabler/icons-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = IconInbox,
  title = 'No records found',
  description = 'There is currently no data to display in this view.',
  action,
  actionLabel = 'Create new',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <Icon className="w-8 h-8 text-[var(--text-muted)] stroke-[1.5] mb-3" />
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4">
        {description}
      </p>
      {action && (
        <Button variant="secondary" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
