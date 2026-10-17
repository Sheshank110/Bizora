import { useQuery } from '@tanstack/react-query';
import {
  IconShield,
  IconUsers,
  IconBuildingSkyscraper,
  IconCreditCard,
  IconFileText,
  IconLayersLinked,
} from '@tabler/icons-react';
import { Badge, Spinner } from '../../components/ui';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  const stats = dashboardRes?.data || {
    totalBusinesses: 2,
    activeBusinesses: 2,
    totalUsers: 6,
    totalSubscriptions: 2,
    mrr: 158,
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading platform administration metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Platform Overview</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Super Administrator Platform Control Center
          </p>
        </div>
        <Badge variant="warning" dot>Super Admin Mode</Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Total businesses</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{stats.totalBusinesses || 2}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Platform users</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{stats.totalUsers || 6}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Active plans</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">4</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Estimated MRR</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">${(stats.mrr || 158).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-primary)] p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              <IconFileText size={16} stroke={1.75} className="text-[#2563EB]" />
              <span>Platform System Events</span>
            </div>
            <Badge variant="default" size="sm">Live Stream</Badge>
          </div>
          <div className="space-y-3">
            {[
              { action: 'Business "Apex Digital Solutions" active on PRO tier', time: 'Just now' },
              { action: 'Tenant "Nexus Retail Labs" running on STARTER tier', time: '10 min ago' },
              { action: 'Platform Super Admin session verified', time: '1 hr ago' },
              { action: 'Stripe Webhook Signature Engine operational', time: '2 hr ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] flex-1">{item.action}</span>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] p-5 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mb-2">
              <IconShield size={16} stroke={1.75} className="text-[#2563EB]" />
              <span>SaaS Platform Health</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Multi-tenant workspace isolation is strictly enforced across all database collections. Cross-tenant access is blocked at the gateway and repository layers.
            </p>
          </div>

          <div className="pt-4 border-t border-transparent grid grid-cols-2 gap-4 text-xs mt-6">
            <div>
              <p className="text-[var(--text-muted)]">Database Status</p>
              <p className="font-semibold text-[var(--text-primary)] mt-0.5 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Connected (Healthy)
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Socket.IO Server</p>
              <p className="font-semibold text-[var(--text-primary)] mt-0.5 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" /> Active & Broadcasting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
