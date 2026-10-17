import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  IconArrowRight,
  IconCheck,
  IconMenu2,
  IconX,
  IconUsers,
  IconFolder,
  IconReceipt,
  IconShieldLock,
  IconChartBar,
  IconSparkles,
  IconClock,
  IconFileText,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import { Button, Logo, GlassmorphismHeroMockup } from '../../components/ui';
import { ROUTES } from '../../constants';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';
import useBusinessStore from '../../store/businessStore';
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

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { setBusinesses, setActiveBusiness } = useBusinessStore();

  const handleLaunchDemo = async () => {
    try {
      setIsDemoLoading(true);
      const res = await authService.login({
        email: 'owner@bizora.demo',
        password: 'Password123!',
      });
      if (res?.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
        if (res.data.businesses) {
          setBusinesses(res.data.businesses);
          setActiveBusiness(res.data.businesses[0]);
        }
        navigate(ROUTES.DASHBOARD);
      }
    } catch {
      navigate(ROUTES.LOGIN);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const isMobileOrTall = el.offsetHeight > window.innerHeight - 100;
      el.scrollIntoView({ 
        behavior: 'smooth', 
        block: isMobileOrTall ? 'start' : 'center' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)] relative selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Background Architectural Grid Pattern */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_80%)]" 
      />

      {/* Floating Pill-Style Topbar (Matches reference image navbar) */}
      <div className="sticky top-4 z-50 max-w-5xl mx-auto px-4 select-none">
        <header className="bg-white/85 dark:bg-[#111111]/90 backdrop-blur-md rounded-2xl sm:rounded-full px-5 sm:px-7 py-3 border border-neutral-200/60 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center justify-between transition-all">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo to={ROUTES.HOME} variant="horizontal" size="sm" />
          </div>

          {/* Right Navigation & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden md:flex items-center gap-6 mr-1 text-xs font-medium text-[var(--text-secondary)]">
              <button
                onClick={() => scrollToSection('capabilities')}
                className="hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 rounded"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('insights')}
                className="hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 rounded"
              >
                Workflow
              </button>
              <Link 
                to={ROUTES.PRICING} 
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                Pricing
              </Link>
            </nav>

            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="hidden sm:inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1E1E1E] dark:hover:bg-[#282828] text-[var(--text-primary)] transition-colors border border-neutral-200/80 dark:border-white/10"
            >
              {isDemoLoading ? 'Launching...' : 'Live Demo'}
            </button>

            <ThemeToggle />

            <Link 
              to={ROUTES.LOGIN} 
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2.5 py-1.5"
            >
              Login
            </Link>
            <Button 
              as={Link} 
              to={ROUTES.REGISTER} 
              className="rounded-full px-5 py-2 text-xs font-semibold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all shadow-sm"
            >
              Sign Up
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <IconX size={18} stroke={2} /> : <IconMenu2 size={18} stroke={2} />}
            </button>
          </div>
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl bg-white dark:bg-[#141414] shadow-2xl border border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 text-[var(--text-secondary)]">
              <span>Theme</span>
              <ThemeToggle />
            </div>
            <button
              onClick={() => { scrollToSection('capabilities'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            >
              Features
            </button>
            <button
              onClick={() => { scrollToSection('insights'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            >
              Workflow
            </button>
            <Link to={ROUTES.PRICING} className="block py-1.5 text-[var(--text-primary)] font-medium">
              Pricing
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(false); handleLaunchDemo(); }}
              disabled={isDemoLoading}
              className="block w-full text-left py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            >
              {isDemoLoading ? 'Launching Demo...' : 'Live Demo'}
            </button>
            <Link to={ROUTES.LOGIN} className="block py-1.5 text-[var(--text-secondary)]">
              Login
            </Link>
            <Button as={Link} to={ROUTES.REGISTER} variant="primary" size="sm" fullWidth className="rounded-full mt-2">
              Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* Centered Hero Section (Matches reference layout & typography) */}
        <section className="pt-16 sm:pt-24 pb-8 max-w-5xl mx-auto px-4 text-center">
          {/* Top Eyebrow Tag */}
          <div className="mb-4 sm:mb-5">
            <span className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--text-muted)]">
              ALL-IN-ONE BUSINESS OPERATIONS PLATFORM
            </span>
          </div>

          {/* Primary Headline with Italic Serif Accent */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.08] max-w-4xl mx-auto">
            Run your business from
            <br />
            <span className="font-serif italic font-normal tracking-normal text-[var(--text-primary)]">one unified</span> workspace.
          </h1>

          {/* Subtitle Description */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-normal">
            Manage clients, projects, tasks, invoices, and cashflow in one seamless platform. Built for modern businesses that prioritize speed, clarity, and control.
          </p>

          {/* Dual Pill CTA Buttons (Centered) */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              as={Link}
              to={ROUTES.REGISTER}
              className="rounded-full px-7 py-3 text-xs sm:text-sm font-semibold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md transition-all"
            >
              Start Free Workspace
            </Button>

            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="rounded-full px-7 py-3 text-xs sm:text-sm font-semibold bg-transparent text-[var(--text-primary)] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              {isDemoLoading ? 'Launching Sandbox...' : 'Explore Live Demo'}
            </button>
          </div>
        </section>

        {/* Signature Layered Browser Mockup (Matches reference preview) */}
        <section className="px-2 sm:px-4">
          <GlassmorphismHeroMockup onOpenDemo={handleLaunchDemo} isDemoLoading={isDemoLoading} />
        </section>

        {/* Client Trust Logos Strip */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-transparent text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">
            Trusted by fast-moving companies, agencies, and growing businesses worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="font-semibold text-sm tracking-widest text-[var(--text-secondary)]">VANGUARD MED</span>
            <span className="font-semibold text-sm tracking-widest text-[var(--text-secondary)]">APEX CAPITAL</span>
            <span className="font-semibold text-sm tracking-widest text-[var(--text-secondary)]">MERIDIAN LABS</span>
            <span className="font-semibold text-sm tracking-widest text-[var(--text-secondary)]">COBALT SYSTEMS</span>
            <span className="font-semibold text-sm tracking-widest text-[var(--text-secondary)]">NEXUS RETAIL</span>
          </div>
        </section>

        {/* Core Capabilities Bento Section */}
        <section 
          id="capabilities" 
          className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-5rem)] flex flex-col justify-center py-16 sm:py-24 scroll-mt-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)] block mb-2">
              CORE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Everything you need to run daily operations
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-3 leading-relaxed">
              Eliminate tool fatigue. Connect your client pipeline, project delivery, and automated billing in a single high-performance workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Capability 1: Client CRM */}
            <div className="p-6 rounded-2xl bg-[#F9F9F9] dark:bg-[#121212] transition-all hover:-translate-y-1">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] flex items-center justify-center mb-4 shadow-sm">
                <IconUsers size={18} stroke={1.75} className="text-[#2563EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Client Directory &amp; CRM
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Maintain accurate records of every client, assigned team leads, interaction history, notes, and engagement scopes.
              </p>
            </div>

            {/* Capability 2: Kanban Delivery */}
            <div className="p-6 rounded-2xl bg-[#F9F9F9] dark:bg-[#121212] transition-all hover:-translate-y-1">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] flex items-center justify-center mb-4 shadow-sm">
                <IconFolder size={18} stroke={1.75} className="text-[#2563EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Kanban Project Delivery
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Track deliverables through structured stages (To Do, In Progress, Review, Completed) with automatic deadline calculations.
              </p>
            </div>

            {/* Capability 3: Invoicing */}
            <div className="p-6 rounded-2xl bg-[#F9F9F9] dark:bg-[#121212] transition-all hover:-translate-y-1">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] flex items-center justify-center mb-4 shadow-sm">
                <IconReceipt size={18} stroke={1.75} className="text-[#2563EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Invoicing &amp; Cashflow
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Generate itemized tax invoices, record real-time settlements, track operating expenses, and export statements.
              </p>
            </div>

            {/* Capability 4: Security */}
            <div className="p-6 rounded-2xl bg-[#F9F9F9] dark:bg-[#121212] transition-all hover:-translate-y-1">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] flex items-center justify-center mb-4 shadow-sm">
                <IconShieldLock size={18} stroke={1.75} className="text-[#2563EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Enterprise Multi-Tenancy
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Strict database workspace isolation, JWT tokens, audit logging, and granular role permissions across members.
              </p>
            </div>
          </div>
        </section>

        {/* Operational Workflow Section */}
        <section 
          id="insights" 
          className="max-w-5xl mx-auto px-4 min-h-[calc(100vh-5rem)] flex flex-col justify-center py-16 sm:py-24 scroll-mt-24"
        >
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F9F9F9] dark:bg-[#121212] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-2">
                OPERATIONAL EFFICIENCY
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Turn hours of administrative drag into minutes of execution
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                Bizora provides founders and team leads with real-time visibility across client relationships, project throughput, and financial performance without manual status syncs.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Button 
                  as={Link} 
                  to={ROUTES.REGISTER} 
                  className="rounded-full px-6 py-2.5 text-xs font-semibold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all shadow-sm"
                >
                  Start Free Workspace
                </Button>
                <button
                  onClick={handleLaunchDemo}
                  disabled={isDemoLoading}
                  className="rounded-full px-6 py-2.5 text-xs font-semibold bg-transparent text-[var(--text-primary)] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                >
                  Try Interactive Demo
                </button>
              </div>
            </div>

            <div className="w-full md:w-72 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1A] shadow-sm">
                <span className="text-[10px] text-[var(--text-muted)] block">INVOICE COLLECTION VELOCITY</span>
                <span className="text-xl font-bold text-[var(--text-primary)] mt-0.5 block">4.2x Faster</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1A] shadow-sm">
                <span className="text-[10px] text-[var(--text-muted)] block">PROJECT MILESTONE ACCURACY</span>
                <span className="text-xl font-bold text-[var(--text-primary)] mt-0.5 block">99.4% On Schedule</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1A] shadow-sm">
                <span className="text-[10px] text-[var(--text-muted)] block">ORGANIZATIONAL OVERHEAD</span>
                <span className="text-xl font-bold text-[var(--text-primary)] mt-0.5 block">-38% Admin Hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Footer Call to Action (Centered pill layout matching hero) */}
        <section className="py-24 sm:py-32 px-4 text-center max-w-4xl mx-auto min-h-[60vh] flex flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-3">
            GET STARTED TODAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            Ready to streamline your <span className="font-serif italic font-normal tracking-normal text-[var(--text-primary)]">business operations</span>?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-4 max-w-xl mx-auto leading-relaxed">
            Join modern teams using Bizora to organize projects, bill clients faster, and run day-to-day operations with ease. No credit card required to begin.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              as={Link}
              to={ROUTES.REGISTER}
              className="rounded-full px-8 py-3.5 text-xs sm:text-sm font-semibold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md transition-all"
            >
              Start Free Workspace
            </Button>
            <Link
              to={ROUTES.PRICING}
              className="rounded-full px-8 py-3.5 text-xs sm:text-sm font-semibold bg-transparent text-[var(--text-primary)] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              Review Pricing Plans
            </Link>
          </div>
        </section>
      </main>

      {/* Editorial Monochrome Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-[#F0F0F0] dark:border-[#1A1A1A] text-xs text-[var(--text-muted)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo to={ROUTES.HOME} variant="horizontal" size="sm" />
            <span className="text-[11px] text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} Bizora Technologies Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to={ROUTES.PRICING} className="hover:text-[var(--text-primary)] transition-colors">
              Pricing
            </Link>
            <Link to={ROUTES.LOGIN} className="hover:text-[var(--text-primary)] transition-colors">
              Sign In
            </Link>
            <Link to={ROUTES.REGISTER} className="hover:text-[var(--text-primary)] transition-colors">
              Get Started
            </Link>
            <a href="#capabilities" className="hover:text-[var(--text-primary)] transition-colors">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
