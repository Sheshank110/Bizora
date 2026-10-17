import { Link } from 'react-router-dom';
import { Logo } from '../../components/ui';
import { ROUTES, APP_NAME } from '../../constants';

/**
 * AuthLayout — Shared wrapper for authentication flows
 * Monochrome B2B Minimal: Clean typography, no 3D decorations, no glass panes.
 */
const AuthLayout = ({ title, subtitle, children, footerText, footerLink, footerLinkText }) => {
  return (
    <div className="min-h-screen flex bg-[var(--surface-primary)] text-[var(--text-primary)]">
      {/* Left editorial panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[var(--surface-secondary)] select-none">
        {/* Brand */}
        <div>
          <Logo to={ROUTES.HOME} variant="horizontal" size="md" />
        </div>

        {/* Minimal statement */}
        <div className="max-w-md my-auto space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Business Management SaaS
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-snug">
            Designed for execution, clarity, and control.
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Unify customer relationships, deliverables, financial records, and operational workflows inside one reliable system.
          </p>

          <div className="pt-6 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Multi-Tenancy</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 block">
                Strict Workspace Isolation
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Real-Time Sync</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 block">
                Instant Updates &amp; Alerts
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 lg:hidden">
            <Logo to={ROUTES.HOME} variant="horizontal" size="sm" />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footerText && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-6">
              {footerText}{' '}
              <Link
                to={footerLink}
                className="text-[#2563EB] dark:text-[#3B82F6] hover:underline font-medium transition-colors"
              >
                {footerLinkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
