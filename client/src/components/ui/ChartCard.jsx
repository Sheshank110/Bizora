import GlassCard from './GlassCard';

const ChartCard = ({ title, subtitle, children, actions, className = '', ...props }) => {
  return (
    <GlassCard className={`flex flex-col ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </GlassCard>
  );
};

export default ChartCard;
