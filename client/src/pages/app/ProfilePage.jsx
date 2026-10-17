import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
} from '@tabler/icons-react';
import { Button, Input, Badge } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { updateProfile, changePassword } = useAuth();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user, profileForm]);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(data);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Profile Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Manage your personal details and account credentials
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-[var(--surface-primary)] rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold text-lg flex items-center justify-center">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {user?.fullName || `${user?.firstName} ${user?.lastName}`}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">Email Verified</Badge>
            <Badge variant="default" size="sm">Active Account</Badge>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First name"
              leftIcon={IconUser}
              required
              error={profileForm.formState.errors.firstName?.message}
              {...profileForm.register('firstName')}
            />
            <Input
              label="Last name"
              required
              error={profileForm.formState.errors.lastName?.message}
              {...profileForm.register('lastName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email address (read-only)"
              value={user?.email || ''}
              leftIcon={IconMail}
              disabled
            />
            <Input
              label="Phone number"
              leftIcon={IconPhone}
              placeholder="+1 (555) 000-0000"
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" loading={isUpdatingProfile}>
              Save profile changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="bg-[var(--surface-primary)] rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <IconLock size={16} stroke={1.75} className="text-[#2563EB]" />
            Change Password
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Ensure your account uses a secure password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            leftIcon={IconLock}
            required
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="New password"
              type="password"
              leftIcon={IconLock}
              required
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              leftIcon={IconLock}
              required
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="secondary" size="sm" loading={isChangingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
