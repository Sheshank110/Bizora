import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { IconLock, IconCheck } from '@tabler/icons-react';
import { Button, Input, Alert } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';
import authService from '../../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Missing or invalid reset token in URL');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authService.resetPassword({ token, password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Password reset failed. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="You can now sign in with your new credentials."
        footerText="Redirecting..."
        footerLink={ROUTES.LOGIN}
        footerLinkText="Go to sign in now"
      >
        <div className="text-center py-6">
          <IconCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500 mx-auto mb-3 stroke-[2]" />
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Your password has been changed successfully.
          </p>
          <Button as={Link} to={ROUTES.LOGIN} variant="primary" size="md">
            Sign In Now
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter a new password for your account."
      footerText="Back to"
      footerLink={ROUTES.LOGIN}
      footerLinkText="sign in"
    >
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!token && (
        <Alert variant="warning" className="mb-4">
          No reset token was found in the link. Please request a new password reset email.
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          leftIcon={IconLock}
          hint="Must contain at least 8 characters, with 1 uppercase letter and 1 number."
          required
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          leftIcon={IconLock}
          required
        />
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          loading={isLoading}
          disabled={isLoading || !token}
        >
          {isLoading ? 'Resetting password...' : 'Update Password'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
