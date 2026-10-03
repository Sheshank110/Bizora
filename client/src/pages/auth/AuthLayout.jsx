import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { GlassCard, Alert } from '../../components/ui';
import { ROUTES, APP_NAME, APP_TAGLINE } from '../../constants';

/**
 * AuthLayout — shared wrapper for all auth pages.
 */
const AuthLayout = ({ title, subtitle, children, footerText, footerLink, footerLinkText }) => {
  return (
    <div className="min-h-screen flex bg-[var(--surface-primary)]">
      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-950 via-dark-800 to-brand-900 flex-col justify-between p-10">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        {/* Subtle orbs */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

        <Link to={ROUTES.HOME} className="relative flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">{APP_NAME}</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {APP_TAGLINE}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            One platform for customers, projects, invoices, and everything your business needs to thrive.
          </p>
        </div>

        <p className="relative text-white/30 text-xs">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[var(--text-primary)]">{APP_NAME}</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
          </div>

          {children}

          {footerText && (
            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              {footerText}{' '}
              <Link to={footerLink} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                {footerLinkText}
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
