import { useQuery } from '@tanstack/react-query';
import { IconCheck } from '@tabler/icons-react';
import { Badge, Spinner } from '../../components/ui';
import adminService from '../../services/adminService';

const AdminPlansPage = () => {
  const { data: plansRes, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => adminService.getPlans(),
  });

  const plans = plansRes?.data || [
    { slug: 'free', name: 'Free', price: 0, limits: { employees: 3, customers: 10, projects: 5, storageMb: 100 } },
    { slug: 'starter', name: 'Starter', price: 29, limits: { employees: 10, customers: 50, projects: 25, storageMb: 5000 } },
    { slug: 'pro', name: 'Pro', price: 79, limits: { employees: 50, customers: -1, projects: -1, storageMb: 25000 } },
    { slug: 'business', name: 'Business', price: 199, limits: { employees: -1, customers: -1, projects: -1, storageMb: 100000 } },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Platform SaaS Plans</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Configure tier pricing, resource quotas, and platform feature gating
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div key={p.slug} className="bg-[var(--surface-primary)] p-5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] capitalize">{p.name}</h3>
                  <Badge variant="default" size="sm">{p.slug.toUpperCase()}</Badge>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">
                  ${p.price}
                  <span className="text-xs font-normal text-[var(--text-muted)]"> / mo</span>
                </p>

                <div className="mt-4 space-y-2 pt-3 border-t border-transparent text-xs text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>Max team members:</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {p.limits?.employees === -1 ? 'Unlimited' : p.limits?.employees}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max customers:</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {p.limits?.customers === -1 ? 'Unlimited' : p.limits?.customers}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max projects:</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {p.limits?.projects === -1 ? 'Unlimited' : p.limits?.projects}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cloud storage:</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {((p.limits?.storageMb || 1000) / 1000).toFixed(0)} GB
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-transparent">
                <span className="text-[11px] text-[#2563EB] flex items-center gap-1 font-medium">
                  <IconCheck size={14} stroke={2} /> Server-enforced limits
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPlansPage;
