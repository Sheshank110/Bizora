import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IconPlus,
  IconFileText,
  IconFolder,
  IconArrowUpRight,
  IconAlertCircle,
  IconCheck,
  IconClock,
} from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../../components/ui';
import { ROUTES } from '../../constants';
import dashboardService from '../../services/dashboardService';
import projectService from '../../services/projectService';
import invoiceService from '../../services/invoiceService';
import { useAuthStore } from '../../store/authStore';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_CHART,
  MOCK_TASKS,
  MOCK_ACTIVITY,
} from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-md p-2 text-xs bg-[#FFFFFF] dark:bg-[#181818] shadow-md border-none text-[var(--text-primary)]">
        <p className="font-semibold mb-1 text-[var(--text-muted)]">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="text-[var(--text-secondary)]">{entry.name}:</span>
            <span className="font-bold">${Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, currentBusiness } = useAuthStore();

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', currentBusiness?._id || currentBusiness?.id],
    queryFn: dashboardService.getStats,
    staleTime: 30000,
  });

  const realStats = statsData?.data;
  const stats = {
    revenue: realStats?.revenue || MOCK_DASHBOARD_STATS.revenue,
    projects: realStats?.projects || MOCK_DASHBOARD_STATS.projects,
    tasks: realStats?.tasks || MOCK_DASHBOARD_STATS.tasks,
    customers: realStats?.customers || MOCK_DASHBOARD_STATS.customers,
  };

  const tasksAttention = MOCK_TASKS.filter((t) => t.status !== 'DONE').slice(0, 4);
  const recentActivities = MOCK_ACTIVITY.slice(0, 5);

  const firstName = user?.firstName || 'there';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header: Typography-first */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Good morning, {firstName}. Here&apos;s what needs your attention today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.INVOICES, { state: { openNew: true } })}
          >
            New Invoice
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.PROJECTS, { state: { openNew: true } })}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* 4 Core Metrics: Typography & Whitespace, NO container borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Revenue</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            ${(stats.revenue?.monthly || 48290).toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-flex items-center gap-0.5">
            <IconArrowUpRight className="w-3.5 h-3.5 stroke-[2]" /> +14.2%
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Active Projects</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            {stats.projects?.active || 8}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            {stats.projects?.total || 16} total
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Open Tasks</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            {stats.tasks?.open || 18}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            {stats.tasks?.completionRate || 86}% throughput
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Customers</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            {stats.customers?.total || 342}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            +{stats.customers?.newThisMonth || 6} new
          </span>
        </div>
      </div>

      {/* Revenue Overview Chart: Flat surface with NO borders */}
      <div className="p-5 rounded-lg bg-[var(--surface-secondary)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Revenue Overview
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Monthly cashflow &amp; collections trajectory
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">USD ($)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_REVENUE_CHART} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="monoRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="month" stroke="rgba(128,128,128,0.6)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(128,128,128,0.6)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2} fill="url(#monoRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Layout: Tasks requiring attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Requiring Attention */}
        <div className="p-5 rounded-lg bg-[var(--surface-secondary)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Tasks Requiring Attention
            </h2>
            <Link to={ROUTES.TASKS} className="text-xs text-[#2563EB] hover:underline font-medium">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {tasksAttention.map((task) => (
              <div
                key={task._id || task.id}
                className="p-3 rounded bg-[var(--surface-primary)] flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-medium text-[var(--text-primary)] block">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                    Due {task.dueDate || 'Soon'} &bull; {task.priority} priority
                  </span>
                </div>
                <Badge
                  variant={
                    task.status === 'IN_PROGRESS' ? 'info' :
                    task.status === 'REVIEW' ? 'warning' :
                    task.status === 'DONE' ? 'success' : 'neutral'
                  }
                  size="xs"
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-5 rounded-lg bg-[var(--surface-secondary)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Recent Activity
            </h2>
            <Link to={ROUTES.ACTIVITY} className="text-xs text-[#2563EB] hover:underline font-medium">
              Full log
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act._id || act.id}
                className="p-3 rounded bg-[var(--surface-primary)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-medium text-[var(--text-primary)] block truncate">
                    {act.action || act.description || act.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block truncate">
                    {act.userName || 'System user'} &bull; {act.entityType || 'Workspace'}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                  {act.timeAgo || 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
