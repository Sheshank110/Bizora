import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { Button, GlassCard, Badge } from '../../components/ui';
import { ROUTES, APP_NAME } from '../../constants';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'Perfect for freelancers and solo operators.',
    features: ['1 user', '10 customers', 'Basic invoicing', 'Project tracking', 'Community support'],
    cta: 'Start Free',
    variant: 'secondary',
    badge: null,
  },
  {
    name: 'Business',
    price: '$29',
    period: 'per month',
    description: 'For growing teams that need full operational control.',
    features: ['Up to 10 users', 'Unlimited customers', 'Advanced invoicing', 'Expense tracking', 'Reports & analytics', 'Priority support'],
    cta: 'Start Trial',
    variant: 'primary',
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for larger organizations.',
    features: ['Unlimited users', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'Custom workflows', 'On-premise option'],
    cta: 'Contact Sales',
    variant: 'outline',
    badge: null,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-primary)]">
      {/* Minimal nav */}
      <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] bg-[var(--topbar-bg)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[var(--text-primary)]">{APP_NAME}</span>
          </Link>
          <Button as={Link} to={ROUTES.REGISTER} variant="primary" size="sm">
            Start Free
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
            Start free. Scale when you&apos;re ready. No surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <GlassCard
              key={plan.name}
              animate
              delay={i * 0.1}
              variant={plan.badge ? 'highlight' : 'default'}
              className="relative"
            >
              {plan.badge && (
                <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-[var(--text-primary)]">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-[var(--text-muted)]">/{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)]">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                as={Link}
                to={ROUTES.REGISTER}
                variant={plan.variant}
                fullWidth
                rightIcon={plan.cta !== 'Contact Sales' ? ArrowRight : undefined}
              >
                {plan.cta}
              </Button>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
