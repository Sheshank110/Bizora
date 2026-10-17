import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { IconMailCheck, IconCheck, IconX } from '@tabler/icons-react';
import { Button, Spinner } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';
import authService from '../../services/authService';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const doVerify = async () => {
      try {
        await authService.verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          setMessage('Your email address has been verified successfully!');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'Verification link is invalid or has expired.');
        }
      }
    };

    doVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await authService.resendVerification(resendEmail);
      setResendSent(true);
    } catch {
      // Ignore
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle={
        status === 'verifying'
          ? 'Confirming account...'
          : status === 'success'
          ? 'Account confirmed'
          : 'Verify your email address'
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        {status === 'verifying' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-[var(--text-secondary)]">Verifying token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="w-full">
            <IconCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500 mx-auto mb-3 stroke-[2]" />
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Email Verified</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">{message}</p>
            <Button as={Link} to={ROUTES.LOGIN} variant="primary" fullWidth size="md">
              Continue to Sign In
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full">
            <IconX className="w-8 h-8 text-rose-600 dark:text-rose-500 mx-auto mb-3 stroke-[2]" />
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Verification Failed</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">{message}</p>

            <form onSubmit={handleResend} className="space-y-3 mb-4 text-left">
              <label className="text-xs text-[var(--text-secondary)]">
                Enter email to receive a new link:
              </label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                required
              />
              <Button type="submit" variant="secondary" fullWidth size="md" loading={isResending}>
                {resendSent ? 'Link Sent' : 'Resend Verification Link'}
              </Button>
            </form>

            <Link
              to={ROUTES.LOGIN}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        )}

        {status === 'idle' && (
          <div className="w-full">
            <IconMailCheck className="w-8 h-8 text-[#2563EB] mx-auto mb-3 stroke-[1.75]" />
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Please check your inbox and click the verification link sent to your email address to complete registration.
            </p>
            <Button as={Link} to={ROUTES.LOGIN} variant="secondary" fullWidth size="md">
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
