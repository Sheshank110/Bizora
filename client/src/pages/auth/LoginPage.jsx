import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IconMail, IconLock } from '@tabler/icons-react';
import { Button, Input, Checkbox } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';
import useAuth from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

const DEMO_ACCOUNTS = [
  {
    role: 'Founder',
    name: 'Sheshank G.',
    email: 'sheshankgahlawat2428@gmail.com',
    password: 'Password123!',
  },
  {
    role: 'Owner',
    name: 'Alex Morgan',
    email: 'owner@bizora.demo',
    password: 'Password123!',
  },
  {
    role: 'Manager',
    name: 'Sarah Chen',
    email: 'manager@bizora.demo',
    password: 'Password123!',
  },
  {
    role: 'Employee',
    name: 'David Kim',
    email: 'employee@bizora.demo',
    password: 'Password123!',
  },
];

const LoginPage = () => {
  const { login, isLoggingIn } = useAuth();
  const [activeDemo, setActiveDemo] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch {
      // Error toast handled by useAuth
    }
  };

  const handleFillDemo = (account) => {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
    setActiveDemo(account.role);
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your Bizora workspace"
      footerText="Don't have an account?"
      footerLink={ROUTES.REGISTER}
      footerLinkText="Create one free"
    >
      {/* Quick Switcher Banner */}
      <div className="mb-6 p-3 rounded-lg bg-[var(--surface-secondary)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Quick Sign In Accounts
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleFillDemo(acc)}
              className={`p-2 rounded text-left transition-colors text-xs flex flex-col gap-0.5 ${
                activeDemo === acc.role
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[#EFEFEF] dark:hover:bg-[#181818]'
              }`}
            >
              <span className="font-medium truncate">{acc.role}</span>
              <span className={`text-[10px] truncate ${activeDemo === acc.role ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
                {acc.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={IconMail}
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          leftIcon={IconLock}
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs">
          <Checkbox label="Remember me" {...register('remember')} />
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          loading={isLoggingIn}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
