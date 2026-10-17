import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IconFolder,
  IconFileText,
  IconFolderOpen,
  IconArrowRight,
} from '@tabler/icons-react';
import { Button, Spinner } from '../../components/ui';
import clientPortalService from '../../services/clientPortalService';
import { useAuthStore } from '../../store/authStore';

const ClientDashboardPage = () => {
  const { user } = useAuthStore();

  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: () => clientPortalService.getDashboard(),
  });

  const dashboard = dashboardRes?.data || {
    activeProjectsCount: 1,
    pendingInvoicesCount: 1,
    recentProjects: [],
    recentInvoices: [],
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading client workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Headline */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome back, {user?.name || 'Client'}
        </h1>
        <p className="text-xs text-[var(--text-muted)] max-w-xl leading-relaxed">
          Track progress on your active project deliverables, review outstanding invoices, and access approved brand assets.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Active Projects</span>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">
            {dashboard.activeProjectsCount || 1}
          </p>
          <Link to="/client/projects" className="inline-flex items-center text-xs text-[#2563EB] font-medium mt-2 hover:underline">
            View projects <IconArrowRight size={13} className="ml-1" />
          </Link>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Invoices To Review</span>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">
            {dashboard.pendingInvoicesCount || 1}
          </p>
          <Link to="/client/invoices" className="inline-flex items-center text-xs text-[#2563EB] font-medium mt-2 hover:underline">
            Review invoices <IconArrowRight size={13} className="ml-1" />
          </Link>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Shared Documents</span>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">Available</p>
          <Link to="/client/files" className="inline-flex items-center text-xs text-[#2563EB] font-medium mt-2 hover:underline">
            Access files <IconArrowRight size={13} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-primary)] p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Permitted Projects</h2>
            <Link to="/client/projects" className="text-xs text-[#2563EB] font-medium hover:underline">
              All projects
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Monitor real-time task completion, project milestones, and deliverables shared with your organization.
          </p>
          <div className="pt-2">
            <Link to="/client/projects">
              <Button variant="secondary" size="sm">
                Browse projects
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Billing & Payment Invoices</h2>
            <Link to="/client/invoices" className="text-xs text-[#2563EB] font-medium hover:underline">
              All invoices
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Download professional PDF statements, review itemized line deliverables, and inspect receipt history.
          </p>
          <div className="pt-2">
            <Link to="/client/invoices">
              <Button variant="secondary" size="sm">
                Inspect invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
