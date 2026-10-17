import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useBusinessStore from '../../store/businessStore';
import Spinner from '../../components/ui/Spinner';

export const RequireAuth = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { businesses } = useBusinessStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--surface-base)]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-medium text-[var(--text-muted)]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no active workspaces and is not already on onboarding, direct them there
  if (businesses.length === 0 && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export const RequireGuest = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--surface-base)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/app/dashboard';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export const RequireRole = ({ allowedRoles = [] }) => {
  const { activeRole } = useBusinessStore();

  if (!activeRole) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Owner always has permission
  if (activeRole === 'owner' || allowedRoles.includes(activeRole)) {
    return <Outlet />;
  }

  return (
    <div className="p-8 max-w-md mx-auto text-center mt-12 bg-[var(--surface-primary)] rounded-lg">
      <div className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] mx-auto flex items-center justify-center mb-3 text-base font-bold">
        ✕
      </div>
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">Access Restricted</h2>
      <p className="text-[var(--text-muted)] text-xs mb-5">
        Your role (<strong className="capitalize text-[var(--text-primary)]">{activeRole}</strong>) does not have permission to view this section.
      </p>
      <a
        href="/app/dashboard"
        className="inline-flex px-4 py-2 text-xs font-medium rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  );
};
