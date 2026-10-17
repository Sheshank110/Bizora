const Timeline = ({ items = [], className = '' }) => {
  if (!items.length) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--surface-secondary)]" />

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="relative flex gap-3 pl-0.5">
            {/* Dot */}
            <div className={`
              relative z-10 w-3 h-3 mt-1 rounded-full shrink-0
              bg-[var(--surface-primary)] border-2
              ${item.color || 'border-[#2563EB]'}
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
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
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
