import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from './GlassCard';

const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-brand-400',
  iconBg = 'bg-brand-500/15',
  delay = 0,
  className = '',
}) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <GlassCard animate delay={delay} className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-muted)] font-medium truncate">
            {title}
          </p>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1, duration: 0.3 }}
            className="text-2xl font-bold text-[var(--text-primary)] mt-1"
          >
            {value}
          </motion.p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                  isPositive
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : isNegative
                    ? 'text-rose-500 bg-rose-500/10'
                    : 'text-[var(--text-muted)] bg-[var(--glass-bg)]'
                }`}
              >
                <TrendIcon className="w-3 h-3" />
                {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-[var(--text-muted)]">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
