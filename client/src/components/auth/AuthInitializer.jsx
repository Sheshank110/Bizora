import { useEffect } from 'react';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';
import useBusinessStore from '../../store/businessStore';

export const AuthInitializer = ({ children }) => {
  const { setAuth, setInitialized, logout } = useAuthStore();
  const { setBusinesses } = useBusinessStore();

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // Attempt token refresh via httpOnly cookie
        const refreshRes = await authService.refreshToken();
        const accessToken = refreshRes.data?.accessToken;

        if (accessToken) {
          // Fetch current user and workspaces
          // Set access token first so api requests include Authorization header
          useAuthStore.getState().setAccessToken(accessToken);

          const meRes = await authService.getMe();
          if (isMounted && meRes.data) {
            setAuth({
              user: meRes.data.user,
              accessToken,
            });
            setBusinesses(meRes.data.workspaces || []);
          }
        }
      } catch (err) {
        // No active session or token expired; proceed as guest
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setAuth, setBusinesses, setInitialized, logout]);

  return children;
};

export default AuthInitializer;
