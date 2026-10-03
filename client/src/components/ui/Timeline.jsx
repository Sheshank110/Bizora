const Timeline = ({ items = [], className = '' }) => {
  if (!items.length) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border-default)]" />

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="relative flex gap-4 pl-1">
            {/* Dot */}
            <div className={`
              relative z-10 w-[10px] h-[10px] mt-1.5 rounded-full shrink-0
              ring-4 ring-[var(--surface-primary)]
              ${item.color || 'bg-brand-500'}
            `} />

            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {item.title}
                </p>
                {item.time && (
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
                    {item.time}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
