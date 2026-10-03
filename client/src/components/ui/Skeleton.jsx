/**
 * Skeleton — Shimmer loading placeholder.
 * Use to build complex loading states.
 */

const Skeleton = ({ className = '', rounded = 'md', ...props }) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`skeleton ${roundedClasses[rounded] || roundedClasses.md} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

/** Pre-built skeleton variants */
export const PageSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" rounded="lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28" rounded="xl" />
      ))}
    </div>
    <Skeleton className="h-64" rounded="xl" />
  </div>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`glass rounded-xl p-6 space-y-3 ${className}`}>
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="glass rounded-xl overflow-hidden">
    <div className="p-4 border-b border-[var(--glass-border)]">
      <Skeleton className="h-5 w-40" />
    </div>
    <div className="divide-y divide-[var(--glass-border)]">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-4 flex-1"
              style={{ maxWidth: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ButtonSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <svg
      className={`animate-spin ${sizes[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

export const FullPageLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-primary)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      <p className="text-sm text-[var(--text-muted)] font-medium">Loading...</p>
    </div>
  </div>
);

export default Skeleton;
