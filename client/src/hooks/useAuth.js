import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import useAuthStore from '../store/authStore';
import useBusinessStore from '../store/businessStore';
import useToastStore from '../store/toastStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading, isInitialized, setAuth, logout, updateUser, setInitialized } =
    useAuthStore();
  const { setBusinesses, clearBusiness } = useBusinessStore();
  const { addToast } = useToastStore();

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (response) => {
      const data = response.data;
      setAuth({ user: data.user, accessToken: data.accessToken });
      setBusinesses(data.workspaces || []);

      addToast({
        type: 'success',
        title: `Welcome back, ${data.user.firstName}!`,
        message: 'Successfully logged in to your workspace.',
      });

      if (data.requiresOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/app/dashboard');
      }
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Please check your email and password.',
      });
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (response) => {
      const data = response.data;
      setAuth({ user: data.user, accessToken: data.accessToken });
      if (data.business) {
        setBusinesses([data.business]);
      }

      addToast({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to Bizora. Please check your email to verify your account.',
      });

      if (data.requiresOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/app/dashboard');
      }
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Unable to create account. Please try again.',
      });
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      clearBusiness();
      queryClient.clear();
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been safely signed out.',
      });
      navigate('/login');
    },
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal profile has been updated.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Could not update profile.',
      });
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwords) => userService.changePassword(passwords),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password was changed successfully.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        message: error.message || 'Please verify your current password.',
      });
    },
  });

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isInitialized,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};

export default useAuth;
