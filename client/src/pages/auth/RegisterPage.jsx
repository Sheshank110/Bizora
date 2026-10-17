import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IconMail, IconLock, IconUser, IconBuilding } from '@tabler/icons-react';
import { Button, Input, Checkbox } from '../../components/ui';
import AuthLayout from './AuthLayout';
import { ROUTES } from '../../constants';
import useAuth from '../../hooks/useAuth';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  businessName: z.string().min(1, 'Company or workspace name is required').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include at least one uppercase letter')
    .regex(/[0-9]/, 'Must include at least one number'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service',
  }),
});

const RegisterPage = () => {
  const { register: registerUser, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      businessName: '',
      password: '',
      terms: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        businessName: data.businessName,
        password: data.password,
      });
    } catch {
      // Toast handled by useAuth
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start your workspace. No credit card required."
      footerText="Already have an account?"
      footerLink={ROUTES.LOGIN}
      footerLinkText="Sign in"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Jane"
            leftIcon={IconUser}
            required
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            required
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Work email"
          type="email"
          placeholder="jane@company.com"
          leftIcon={IconMail}
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Workspace name"
          placeholder="Acme Solutions"
          leftIcon={IconBuilding}
          required
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 chars, 1 uppercase & 1 number"
          leftIcon={IconLock}
          hint="At least 8 characters with 1 capital letter and 1 number."
          required
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div>
          <Checkbox
            label={
              <span className="text-xs text-[var(--text-secondary)]">
                I agree to the{' '}
                <a href="#terms" className="text-[#2563EB] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-[#2563EB] hover:underline">
                  Privacy Policy
                </a>
              </span>
            }
            {...register('terms')}
          />
          {errors.terms && (
            <p className="text-xs text-rose-500 mt-1">{errors.terms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          loading={isRegistering}
          disabled={isRegistering}
        >
          {isRegistering ? 'Creating workspace...' : 'Create Account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
