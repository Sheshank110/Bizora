import React from 'react';

/**
 * StatCard — Monochrome B2B Metric Display
 * Hierarchy through typography & whitespace. NO container borders, NO icons in rounded boxes.
 */
const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className = '',
}) => {
  const isPositive = typeof change === 'number' ? change > 0 : String(change || '').startsWith('+');
  const isNegative = typeof change === 'number' ? change < 0 : String(change || '').startsWith('-');

  return (
    <div className={`p-4 rounded-lg bg-[var(--surface-secondary)] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {title}
        </span>
        {Icon && (
          <Icon className="w-4 h-4 text-[var(--text-muted)] stroke-[1.5]" />
        )}
      </div>

      <div className="mt-2">
        <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          {value}
        </div>

        {change !== undefined && change !== null && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <span className="font-medium text-[var(--text-muted)]">
              {typeof change === 'number' ? `${isPositive ? '+' : ''}${change}%` : change}
            </span>
            {changeLabel && (
              <span className="text-[11px] text-[var(--text-muted)]">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
