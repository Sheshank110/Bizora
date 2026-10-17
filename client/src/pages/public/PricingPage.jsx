import { Link } from 'react-router-dom';
import { IconCheck, IconSun, IconMoon } from '@tabler/icons-react';
import { Button, Logo } from '../../components/ui';
import { ROUTES } from '../../constants';
import { useThemeStore } from '../../store/themeStore';

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-neutral-100 dark:hover:bg-[#222222] transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <IconSun size={15} stroke={1.75} /> : <IconMoon size={15} stroke={1.75} />}
    </button>
  );
};

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'For solo operators and early-stage consulting.',
    features: ['1 workspace owner', 'Up to 25 customers', 'Kanban project tracking', 'Standard invoice generation', 'Community support'],
    cta: 'Start Free',
    variant: 'secondary',
  },
  {
    name: 'Business',
    price: '$29',
    period: 'per month',
    description: 'For growing teams requiring full operations and team delegation.',
    features: ['Up to 10 team seats', 'Unlimited customers', 'Real-time collaboration', 'Client portal access', 'Automated recurring billing', 'Priority email support'],
    cta: 'Start Trial',
    variant: 'primary',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For larger agencies and multi-entity operations.',
    features: ['Unlimited team seats', 'Dedicated database instance', 'Custom integrations & SLA', 'Audit trail logs', 'Dedicated account manager'],
    cta: 'Contact Sales',
    variant: 'secondary',
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      {/* Minimal Topbar: NO borders */}
      <header className="bg-[var(--surface-primary)] select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo to={ROUTES.HOME} variant="horizontal" size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button as={Link} to={ROUTES.REGISTER} variant="primary" size="sm">
              Start Free
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Simple, predictable pricing
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2">
            Transparent plans for independent businesses and growing agencies.
          </p>
        </div>

        {/* Pricing Cards: Separated by layout & contrast, NO container borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-6 rounded-lg bg-[var(--surface-secondary)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    {plan.name}
                  </h3>
                  {plan.variant === 'primary' && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded font-medium bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                      Recommended
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs text-[var(--text-muted)]">/{plan.period}</span>
                  )}
                </div>

                <p className="text-xs text-[var(--text-muted)] mb-6">
                  {plan.description}
                </p>

                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <IconCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5 stroke-[2]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                as={Link}
                to={ROUTES.REGISTER}
                variant={plan.variant}
                fullWidth
                size="md"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
