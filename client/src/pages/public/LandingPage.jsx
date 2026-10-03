import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Users, FolderKanban, FileText, BarChart3,
  ArrowRight, CheckCircle2, Star, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { Button, MotionButton, GlassCard, Badge } from '../../components/ui';
import { ROUTES, APP_NAME, APP_TAGLINE } from '../../constants';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const featureCards = [
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Centralize all your customer data, track interactions, and never miss a follow-up.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  {
    icon: FolderKanban,
    title: 'Project Tracking',
    description: 'Visualize progress with Kanban boards, set milestones, and keep teams aligned.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: FileText,
    title: 'Invoicing',
    description: 'Create professional invoices in seconds, send them, and track payment status.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    description: 'Understand revenue trends, expenses, and profitability at a glance.',
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
  },
];

const stats = [
  { value: '10,000+', label: 'Businesses' },
  { value: '$2.4B', label: 'Invoiced' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'Rating' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] bg-[var(--topbar-bg)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {['Product', 'Features', 'Pricing'].map((item) => (
            <Link
              key={item}
              to={item === 'Pricing' ? ROUTES.PRICING : '#'}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={ROUTES.LOGIN} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            Sign in
          </Link>
          <Button as={Link} to={ROUTES.REGISTER} variant="primary" size="sm">
            Start Free
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--glass-bg)] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-[var(--glass-border)] px-4 py-4 space-y-3 bg-[var(--surface-secondary)]"
        >
          {['Product', 'Features', 'Pricing'].map((item) => (
            <Link
              key={item}
              to={item === 'Pricing' ? ROUTES.PRICING : '#'}
              className="block text-sm text-[var(--text-secondary)] py-1"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-default)]">
            <Button as={Link} to={ROUTES.LOGIN} variant="secondary" fullWidth>Sign in</Button>
            <Button as={Link} to={ROUTES.REGISTER} variant="primary" fullWidth>Start Free</Button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

const HeroDemoPreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 32, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
    className="relative mt-16 max-w-5xl mx-auto"
  >
    {/* Glow */}
    <div className="absolute -inset-4 bg-brand-500/10 rounded-3xl blur-3xl pointer-events-none" />

    {/* Browser chrome */}
    <div className="relative glass-heavy rounded-2xl overflow-hidden border border-[var(--glass-border)]">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex-1 mx-4 h-6 bg-[var(--glass-bg)] rounded-md flex items-center px-3">
          <span className="text-xs text-[var(--text-muted)]">app.bizora.io/dashboard</span>
        </div>
      </div>

      {/* Mock UI */}
      <div className="flex h-[340px] sm:h-[400px]">
        {/* Sidebar preview */}
        <div className="w-44 shrink-0 border-r border-[var(--glass-border)] p-3 space-y-1.5 hidden sm:block bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[var(--sidebar-item-active)]">
            <div className="w-3.5 h-3.5 rounded bg-brand-500/40" />
            <div className="h-2.5 w-16 bg-brand-400/60 rounded" />
          </div>
          {[70, 60, 80, 55, 65, 72].map((w, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
              <div className="w-3.5 h-3.5 rounded bg-[var(--glass-bg-heavy)]" />
              <div className={`h-2 w-${w > 70 ? '20' : w > 60 ? '16' : '14'} bg-[var(--glass-bg-heavy)] rounded`} />
            </div>
          ))}
        </div>

        {/* Content preview */}
        <div className="flex-1 p-5 space-y-4 overflow-hidden">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['$48,290', '142', '28', '$12.4k'].map((val, i) => (
              <div key={i} className="glass rounded-xl p-3">
                <div className="h-1.5 w-12 bg-[var(--glass-bg-heavy)] rounded mb-2" />
                <div className={`h-5 ${i === 0 ? 'w-20' : i === 1 ? 'w-10' : i === 2 ? 'w-8' : 'w-16'} bg-[var(--text-muted)]/30 rounded`} />
              </div>
            ))}
          </div>

          {/* Chart preview */}
          <div className="glass rounded-xl p-4 flex-1">
            <div className="h-2 w-24 bg-[var(--glass-bg-heavy)] rounded mb-4" />
            <div className="flex items-end gap-2 h-28">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-brand-500/20 relative"
                  style={{ height: `${h}%` }}
                >
                  {i === 9 && (
                    <div className="absolute inset-0 rounded-t-sm bg-brand-500/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-primary)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-8">
        <div className="bg-gradient-hero absolute inset-0 pointer-events-none" />

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center relative"
        >
          <motion.div {...fadeUp}>
            <Badge variant="primary" className="mb-6">
              <Zap className="w-3 h-3" />
              Phase 1 — Foundation Release
            </Badge>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6"
          >
            Run your business from{' '}
            <span className="text-gradient-brand">one powerful workspace.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage customers, projects, tasks, invoices, payments and daily operations
            from one modern platform. Business management, simplified.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MotionButton
              as={Link}
              to={ROUTES.REGISTER}
              variant="primary"
              size="lg"
              rightIcon={ArrowRight}
            >
              Start Free
            </MotionButton>
            <MotionButton
              as={Link}
              to={ROUTES.DASHBOARD}
              variant="secondary"
              size="lg"
            >
              View Demo
            </MotionButton>
          </motion.div>
        </motion.div>

        {/* Demo preview */}
        <HeroDemoPreview />
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 border-y border-[var(--border-default)]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything your business needs
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              A complete suite of tools designed for modern small businesses — from first customer to last invoice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <GlassCard
                key={card.title}
                animate
                hover
                delay={i * 0.1}
                variant="interactive"
              >
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {card.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <GlassCard variant="highlight" className="py-14 px-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              Ready to simplify your business?
            </h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
              Join thousands of businesses using Bizora to manage operations, delight customers, and grow faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <MotionButton as={Link} to={ROUTES.REGISTER} variant="primary" size="lg" rightIcon={ArrowRight}>
                Get started free
              </MotionButton>
              <MotionButton as={Link} to={ROUTES.PRICING} variant="secondary" size="lg">
                View pricing
              </MotionButton>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[var(--text-muted)]">
              {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{APP_NAME}</span>
            <span className="text-xs text-[var(--text-muted)]">— {APP_TAGLINE}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} {APP_NAME}. Phase 1 — Foundation Release.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
