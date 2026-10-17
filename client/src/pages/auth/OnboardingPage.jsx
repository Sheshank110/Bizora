import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconBuilding,
  IconCurrencyDollar,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconWorld,
} from '@tabler/icons-react';
import { Button, Input, Logo } from '../../components/ui';
import useBusiness from '../../hooks/useBusiness';
import useAuthStore from '../../store/authStore';

const INDUSTRIES = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'services', label: 'Professional Services & Consulting' },
  { value: 'agency', label: 'Digital Agency & Marketing' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'healthcare', label: 'Healthcare & Wellness' },
  { value: 'manufacturing', label: 'Manufacturing & Logistics' },
  { value: 'other', label: 'Other Industry' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createBusiness, isCreatingBusiness } = useBusiness();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'technology',
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const generatedSlug = formData.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-') || 'my-workspace';

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrors({ name: 'Workspace name is required' });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    try {
      await createBusiness({
        name: formData.name,
        industry: formData.industry,
        currency: formData.currency,
        timezone: formData.timezone,
        description: formData.description,
      });

      navigate('/app/dashboard');
    } catch {
      // Toast handled by useBusiness
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-primary)] px-4 py-12 text-[var(--text-primary)]">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <Logo variant="horizontal" size="md" />
        </div>

        {/* Step Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-xs font-medium text-[var(--text-muted)]">
            <span>Step {step} of 3</span>
            <span>
              {step === 1 && 'Workspace Profile'}
              {step === 2 && 'Currency & Timezone'}
              {step === 3 && 'Activation'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded transition-colors ${
                  s <= step ? 'bg-[#2563EB]' : 'bg-[var(--surface-secondary)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Container: Clean filled surface with NO borders */}
        <div className="p-6 rounded-lg bg-[var(--surface-secondary)]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Name your workspace
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Configure your primary business identity.
                </p>
              </div>

              <Input
                label="Workspace Name"
                placeholder="e.g. Apex Digital Solutions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />

              <div className="p-2.5 rounded bg-[var(--surface-primary)] text-xs text-[var(--text-muted)] flex items-center gap-2 font-mono">
                <IconWorld className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>bizora.app/{generatedSlug}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Industry Category
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-md text-sm bg-[var(--surface-primary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="md" onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Currency &amp; Timezone
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Set reporting currency and local timezone.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Default Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-md text-sm bg-[var(--surface-primary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Operating Timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="America/New_York"
              />

              <Input
                label="Short Description (Optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Full-service consulting firm"
              />

              <div className="pt-2 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Ready to activate
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Summary of your workspace configuration.
                </p>
              </div>

              <div className="p-3 rounded bg-[var(--surface-primary)] space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[var(--text-muted)]">Workspace:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formData.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--text-muted)]">Industry:</span>
                  <span className="capitalize text-[var(--text-primary)]">{formData.industry}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--text-muted)]">Currency:</span>
                  <span className="font-mono text-[var(--text-primary)]">{formData.currency}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--text-muted)]">Role:</span>
                  <span className="font-semibold text-[var(--text-primary)]">Owner</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleFinish}
                  loading={isCreatingBusiness}
                  disabled={isCreatingBusiness}
                >
                  {isCreatingBusiness ? 'Creating...' : 'Launch Workspace'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
