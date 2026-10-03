import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button, Input, Checkbox, Alert } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';

/**
 * LoginPage — Phase 1 Foundation.
 * Authentication functionality will be implemented in Phase 2.
 * The form and UI are complete; backend integration is pending.
 */
const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Bizora account"
      footerText="Don't have an account?"
      footerLink={ROUTES.REGISTER}
      footerLinkText="Create one free"
    >
      <Alert variant="info" className="mb-6">
        <strong>Phase 1:</strong> Authentication will be implemented in Phase 2. This form is a UI foundation only.
      </Alert>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="you@company.com"
          leftIcon={Mail}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Your password"
          leftIcon={Lock}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" name="remember" />
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" disabled>
          Sign in (Phase 2)
        </Button>

        <div className="relative flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[var(--border-default)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--border-default)]" />
        </div>

        <Button type="button" variant="secondary" fullWidth disabled>
          Continue with Google (Phase 2)
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
