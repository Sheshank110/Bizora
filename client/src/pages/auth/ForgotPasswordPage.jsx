import { useState } from 'react';
import { IconMail, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';
import authService from '../../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="Password reset instructions have been dispatched."
        footerText="Didn't get the email?"
        footerLink="#"
        footerLinkText="Click to resend"
      >
        <div className="text-center py-4">
          <IconCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500 mx-auto mb-3 stroke-[2]" />
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            If an account exists for <strong className="text-[var(--text-primary)]">{email}</strong>, you will receive password reset instructions shortly.
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline"
          >
            <IconArrowLeft className="w-4 h-4 stroke-[1.75]" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive a password reset link."
      footerText="Remember your password?"
      footerLink={ROUTES.LOGIN}
      footerLinkText="Back to sign in"
    >
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          leftIcon={IconMail}
          required
        />
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
