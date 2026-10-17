import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconCheck } from '@tabler/icons-react';
import { Button, Badge, Spinner, Modal } from '../../components/ui';
import subscriptionService from '../../services/subscriptionService';
import { useAuthStore } from '../../store/authStore';

const PLANS = [
  {
    slug: 'free',
    name: 'Free Trial',
    price: 0,
    description: 'Explore Bizora features for early-stage evaluation',
    features: ['Up to 3 Team Members', 'Up to 10 Customers', 'Up to 5 Projects', '100 MB Cloud Storage', 'Community Support'],
  },
  {
    slug: 'starter',
    name: 'Starter Tier',
    price: 29,
    description: 'Small studios, boutiques, and freelancers',
    features: ['Up to 10 Team Members', 'Up to 50 Customers', 'Up to 25 Projects', 'Standard Invoicing & Payments', '5 GB Cloud Storage', 'Email Support'],
  },
  {
    slug: 'pro',
    name: 'Professional',
    price: 79,
    popular: true,
    description: 'Fast-growing agencies and service companies',
    features: ['Up to 50 Team Members', 'Unlimited Customers', 'Unlimited Projects', 'Full Inventory & Low-Stock Alerts', '25 GB Cloud Storage', 'Priority Support'],
  },
  {
    slug: 'business',
    name: 'Enterprise Scale',
    price: 199,
    description: 'Multi-location companies with advanced audit',
    features: ['Unlimited Team Members', 'Unlimited Customers & Invoices', 'Custom Role Authorizations', '100 GB Cloud Storage', 'Dedicated SLA', 'Full Audit Log Ledger'],
  },
];

const BillingPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: subRes, isLoading } = useQuery({
    queryKey: ['subscription', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => subscriptionService.getSubscription(),
  });

  const changePlanMutation = useMutation({
    mutationFn: (planSlug) => subscriptionService.changePlan(planSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setIsUpgradeModalOpen(false);
      setSelectedPlan(null);
    },
  });

  const cancelSubMutation = useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  });

  const subscription = subRes?.data || {
    plan: 'starter',
    status: 'active',
    limits: { employees: 10, customers: 50, projects: 25 },
    usage: { employees: 3, customers: 12, projects: 6 },
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsUpgradeModalOpen(true);
  };

  const handleConfirmChange = () => {
    if (!selectedPlan) return;
    changePlanMutation.mutate(selectedPlan.slug);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading SaaS subscription details...</p>
      </div>
    );
  }

  const currentPlanSlug = typeof subscription.plan === 'object' && subscription.plan
    ? subscription.plan.slug
    : (subscription.plan || 'starter');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Subscription & Billing</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage your workspace plan, capacity limits, and billing tier
          </p>
        </div>

        <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
          {subscription.status?.toUpperCase() || 'ACTIVE'}
        </Badge>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-[var(--surface-primary)] p-6 rounded-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Active Plan</span>
            <div className="flex items-center gap-3 mt-0.5">
              <h2 className="text-xl font-bold text-[var(--text-primary)] capitalize">
                {currentPlanSlug} Plan
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Monthly billing • Business ID: {currentBusiness?.businessCode || currentBusiness?.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {subscription.status !== 'cancelled' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700 text-xs"
                onClick={() => {
                  if (window.confirm('Cancel this workspace subscription at the end of the billing period?')) {
                    cancelSubMutation.mutate();
                  }
                }}
              >
                Cancel subscription
              </Button>
            )}
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-transparent">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-[var(--text-secondary)]">Team members</span>
              <span className="text-[var(--text-primary)] font-mono">
                {subscription.usage?.employees || 3} / {subscription.limits?.employees || 10}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full"
                style={{ width: `${Math.min(100, ((subscription.usage?.employees || 3) / (subscription.limits?.employees || 10)) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-[var(--text-secondary)]">Active customers</span>
              <span className="text-[var(--text-primary)] font-mono">
                {subscription.usage?.customers || 12} / {subscription.limits?.customers || 50}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full"
                style={{ width: `${Math.min(100, ((subscription.usage?.customers || 12) / (subscription.limits?.customers || 50)) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-[var(--text-secondary)]">Projects capacity</span>
              <span className="text-[var(--text-primary)] font-mono">
                {subscription.usage?.projects || 6} / {subscription.limits?.projects || 25}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full"
                style={{ width: `${Math.min(100, ((subscription.usage?.projects || 6) / (subscription.limits?.projects || 25)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Comparison */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Workspace Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlanSlug.toLowerCase() === plan.slug;

            return (
              <div
                key={plan.slug}
                className="bg-[var(--surface-primary)] p-5 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{plan.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{plan.description}</p>

                  <div className="mt-3 mb-4">
                    <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">${plan.price}</span>
                    <span className="text-xs text-[var(--text-muted)]"> / month</span>
                  </div>

                  <div className="space-y-2 border-t border-transparent pt-3">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <IconCheck size={14} stroke={2} className="text-[#2563EB] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-transparent">
                  {isCurrent ? (
                    <Button variant="secondary" size="sm" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {plan.price > (PLANS.find(p => p.slug === currentPlanSlug)?.price || 0) ? 'Upgrade to ' : 'Switch to '} {plan.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title={`Confirm Plan Switch: ${selectedPlan?.name || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            You are switching your workspace plan to <strong>{selectedPlan?.name}</strong> at <strong>${selectedPlan?.price}/month</strong>.
          </p>
          <div className="p-3 bg-[var(--surface-secondary)] rounded-md text-xs text-[var(--text-muted)]">
            Resource limits and feature tiers will take effect immediately.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsUpgradeModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              loading={changePlanMutation.isPending}
              onClick={handleConfirmChange}
            >
              Confirm switch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BillingPage;
