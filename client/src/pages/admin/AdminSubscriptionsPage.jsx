import { useQuery } from '@tanstack/react-query';
import { Badge, Spinner } from '../../components/ui';
import adminService from '../../services/adminService';

const AdminSubscriptionsPage = () => {
  const { data: businessesRes, isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => adminService.getBusinesses(),
  });

  const businesses = businessesRes?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Platform Subscriptions</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Tenant subscription statuses, Stripe sandbox billing states, and MRR contribution
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Monthly Rate</th>
                <th className="py-3 px-4 text-right">Billing Cycle</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => {
                const plan = biz.plan || 'Starter';
                const rate = plan.toLowerCase() === 'pro' ? 79 : plan.toLowerCase() === 'business' ? 199 : 29;

                return (
                  <tr key={biz._id || biz.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {biz.name}
                    </td>
                    <td className="py-3 px-4 font-medium capitalize text-[var(--text-secondary)]">
                      {plan}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" size="sm">Active (Subscribed)</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)] font-mono">
                      ${rate}/mo
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)]">
                      Monthly Auto-Renew
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionsPage;
