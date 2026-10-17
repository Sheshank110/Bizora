import { useState, useEffect } from 'react';
import { IconBuildingSkyscraper, IconCoin, IconDeviceFloppy } from '@tabler/icons-react';
import { Button, Input, Alert } from '../../components/ui';
import useBusiness from '../../hooks/useBusiness';

const INDUSTRIES = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'services', label: 'Professional Services & Consulting' },
  { value: 'agency', label: 'Digital Agency & Marketing' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'healthcare', label: 'Healthcare & Wellness' },
  { value: 'manufacturing', label: 'Manufacturing & Logistics' },
  { value: 'other', label: 'Other Industry' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const SettingsPage = () => {
  const { activeBusiness, activeRole, updateBusiness, isUpdatingBusiness } = useBusiness();

  const isEditable = activeRole === 'owner' || activeRole === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    industry: 'technology',
    currency: 'USD',
    timezone: 'UTC',
    description: '',
    taxId: '',
  });

  useEffect(() => {
    if (activeBusiness) {
      setFormData({
        name: activeBusiness.name || '',
        industry: activeBusiness.industry || 'technology',
        currency: activeBusiness.currency || 'USD',
        timezone: activeBusiness.timezone || 'UTC',
        description: activeBusiness.description || '',
        taxId: activeBusiness.taxId || '',
      });
    }
  }, [activeBusiness]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) return;

    try {
      await updateBusiness(formData);
    } catch {
      // Toast handled by useBusiness
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Workspace Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          General details, reporting currency, and company identifiers
        </p>
      </div>

      {!isEditable && (
        <Alert variant="info">
          You are viewing this workspace as an <strong>{activeRole}</strong>. Only workspace owners and administrators can modify settings.
        </Alert>
      )}

      <div className="bg-[var(--surface-primary)] rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 mb-4">
              <IconBuildingSkyscraper size={16} stroke={1.75} className="text-[#2563EB]" />
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Workspace name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditable}
                required
              />

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  disabled={!isEditable}
                  className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB] disabled:opacity-60"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Business description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of business operations"
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-transparent">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 mb-4">
              <IconCoin size={16} stroke={1.75} className="text-[#2563EB]" />
              Localization & Accounting
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Primary currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  disabled={!isEditable}
                  className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB] disabled:opacity-60"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Operating timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={!isEditable}
              />

              <Input
                label="Tax / VAT ID (Optional)"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="e.g. US-12345678"
                disabled={!isEditable}
              />
            </div>
          </div>

          {isEditable && (
            <div className="flex justify-end pt-4 border-t border-transparent">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isUpdatingBusiness}
                leftIcon={IconDeviceFloppy}
              >
                Save workspace settings
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
