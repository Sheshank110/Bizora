import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  IconX,
  IconUser,
  IconPhone,
  IconMail,
  IconBuildingSkyscraper,
  IconTag,
} from '@tabler/icons-react';
import { Button, Input, Alert } from '../ui';
import useBusiness from '../../hooks/useBusiness';

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  source: z.enum([
    'WEBSITE',
    'REFERRAL',
    'SOCIAL_MEDIA',
    'WALK_IN',
    'ADVERTISEMENT',
    'PHONE',
    'EMAIL',
    'OTHER',
  ]),
  assignedEmployee: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  tagsInput: z.string().optional(),
  notesSummary: z.string().max(2000).optional(),
});

export const CustomerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEdit = !!initialData;
  const { members } = useBusiness();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      company: '',
      jobTitle: '',
      status: 'ACTIVE',
      source: 'WEBSITE',
      assignedEmployee: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      tagsInput: '',
      notesSummary: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        company: initialData.company || '',
        jobTitle: initialData.jobTitle || '',
        status: initialData.status || 'ACTIVE',
        source: initialData.source || 'WEBSITE',
        assignedEmployee:
          initialData.assignedEmployee?._id ||
          initialData.assignedEmployee?.id ||
          initialData.assignedEmployee ||
          '',
        street: initialData.address?.street || '',
        city: initialData.address?.city || '',
        state: initialData.address?.state || '',
        country: initialData.address?.country || '',
        postalCode: initialData.address?.postalCode || '',
        tagsInput: initialData.tags?.join(', ') || '',
        notesSummary: initialData.notesSummary || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        company: '',
        jobTitle: '',
        status: 'ACTIVE',
        source: 'WEBSITE',
        assignedEmployee: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        tagsInput: '',
        notesSummary: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    setError('');
    try {
      const tags = data.tagsInput
        ? data.tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || '',
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        status: data.status,
        source: data.source,
        assignedEmployee: data.assignedEmployee || null,
        tags,
        notesSummary: data.notesSummary || '',
        address: {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postalCode: data.postalCode || '',
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving customer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="max-w-xl w-full my-8 rounded-lg bg-[var(--surface-primary)] p-6 shadow-2xl relative border-0">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {isEdit ? 'Edit customer' : 'Add customer'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isEdit
                ? 'Update customer contact information and status'
                : 'Enter details to register customer'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <IconX size={18} stroke={1.75} />
          </button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First name"
              required
              leftIcon={IconUser}
              placeholder="e.g. Jonathan"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last name"
              required
              placeholder="e.g. Sterling"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone number"
              required
              leftIcon={IconPhone}
              placeholder="+1 (555) 000-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email address"
              type="email"
              leftIcon={IconMail}
              placeholder="jonathan@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Company & Job */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company name"
              leftIcon={IconBuildingSkyscraper}
              placeholder="e.g. Acme Corp"
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              label="Job title"
              placeholder="e.g. Director of Operations"
              error={errors.jobTitle?.message}
              {...register('jobTitle')}
            />
          </div>

          {/* Assignment, Status & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Status
              </label>
              <select
                className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                {...register('status')}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Source
              </label>
              <select
                className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                {...register('source')}
              >
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="WALK_IN">Walk In</option>
                <option value="ADVERTISEMENT">Advertisement</option>
                <option value="PHONE">Phone</option>
                <option value="EMAIL">Email</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Assigned to
              </label>
              <select
                className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                {...register('assignedEmployee')}
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const u = m.user;
                  if (!u) return null;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.fullName || `${u.firstName} ${u.lastName}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Tags */}
          <Input
            label="Tags"
            leftIcon={IconTag}
            placeholder="VIP, Enterprise, Returning (comma separated)"
            {...register('tagsInput')}
          />

          {/* Address Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Input label="City" placeholder="New York" {...register('city')} />
            <Input label="State" placeholder="NY" {...register('state')} />
            <Input label="Country" placeholder="United States" {...register('country')} />
            <Input label="Postal code" placeholder="10001" {...register('postalCode')} />
          </div>

          {/* Initial Note */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Initial note / summary
              </label>
              <textarea
                rows={2}
                placeholder="Background notes or context..."
                className="w-full p-2.5 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                {...register('notesSummary')}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isLoading} disabled={isLoading}>
              {isEdit ? 'Save changes' : 'Create customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
