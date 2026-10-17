import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { IconBuilding, IconUser, IconLock, IconArrowRight } from '@tabler/icons-react';
import { Button, Input, Alert } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';
import invitationService from '../../services/invitationService';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToastStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Missing invitation token in the link.');
      return;
    }

    if (!isAuthenticated && (!password || password.length < 8)) {
      setError('Please choose a password with at least 8 characters.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await invitationService.acceptInvitation({
        token,
        firstName,
        lastName,
        password: isAuthenticated ? undefined : password,
      });

      addToast({
        type: 'success',
        title: 'Invitation Accepted',
        message: res.message || 'You have successfully joined the workspace.',
      });

      if (isAuthenticated) {
        navigate('/app/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Failed to accept invitation. Link may have expired or been revoked.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Accept invitation"
      subtitle="Join your team workspace on Bizora."
      footerText="Already have an account?"
      footerLink={ROUTES.LOGIN}
      footerLinkText="Sign in"
    >
      <div className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        {!token && (
          <Alert variant="warning">
            No invitation token was found in the link. Please ask your workspace administrator to resend the invite.
          </Alert>
        )}

        <form onSubmit={handleAccept} className="space-y-4">
          {!isAuthenticated && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  leftIcon={IconUser}
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Create Password"
                type="password"
                leftIcon={IconLock}
                placeholder="Min. 8 characters"
                hint="Set your account password to complete registration."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {isAuthenticated && (
            <div className="p-3 rounded-md bg-[var(--surface-secondary)] text-xs text-[var(--text-secondary)] text-center">
              Signed in as <strong className="text-[var(--text-primary)]">{user?.email}</strong>.
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            loading={isLoading}
            disabled={isLoading || !token}
          >
            Accept &amp; Join Workspace
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default AcceptInvitePage;
