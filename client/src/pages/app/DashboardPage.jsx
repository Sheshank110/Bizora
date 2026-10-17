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
  IconChartLine,
} from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../../components/ui';
import { ROUTES } from '../../constants';
import dashboardService from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';

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
    revenue: realStats?.revenue || { monthly: 0, total: 0, change: 0 },
    projects: realStats?.projects || { active: 0, total: 0 },
    tasks: realStats?.tasks || { open: 0, total: 0, completionRate: 0 },
    customers: realStats?.customers || { total: 0, active: 0, newThisMonth: 0 },
  };

  const tasksAttention = realStats?.tasksAttention || [];
  const recentActivities = realStats?.recentActivities || [];
  const revenueChartData = realStats?.revenueChart || [];
  const hasRevenueData = revenueChartData.some((d) => (d.revenue || 0) > 0);

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

      {/* 4 Core Metrics: Real Data / Zero-State */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Revenue</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            ${(stats.revenue?.monthly ?? 0).toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-flex items-center gap-0.5">
            {stats.revenue?.change ? (
              <>
                <IconArrowUpRight className="w-3.5 h-3.5 stroke-[2]" /> +{stats.revenue.change}%
              </>
            ) : (
              'This month'
            )}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Active Projects</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            {stats.projects?.active ?? 0}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            {stats.projects?.total ?? 0} total
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Open Tasks</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            {stats.tasks?.open ?? 0}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            {stats.tasks?.completionRate ?? 0}% throughput
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Customers</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block tracking-tight">
            {stats.customers?.total ?? 0}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            +{stats.customers?.newThisMonth ?? 0} new
          </span>
        </div>
      </div>

      {/* Revenue Overview Chart: Real Data or Clean Zero State */}
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

        {hasRevenueData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        ) : (
          <div className="h-48 w-full flex flex-col items-center justify-center text-center p-6 bg-[var(--surface-primary)] rounded-md">
            <IconChartLine className="w-8 h-8 text-[var(--text-muted)] stroke-[1.5] mb-2" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">No revenue recorded yet</p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-sm mt-0.5">
              Monthly cashflow and revenue trajectory will be charted here automatically as invoices are paid.
            </p>
          </div>
        )}
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

          {tasksAttention.length > 0 ? (
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
          ) : (
            <div className="p-6 text-center flex flex-col items-center justify-center bg-[var(--surface-primary)] rounded-md">
              <IconCheck className="w-6 h-6 text-[var(--text-muted)] stroke-[1.5] mb-2" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">No open tasks</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 mb-3">
                You&apos;re all caught up! Create a project or task to track work.
              </p>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => navigate(ROUTES.TASKS, { state: { openNew: true } })}
              >
                Create Task
              </Button>
            </div>
          )}
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

          {recentActivities.length > 0 ? (
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
          ) : (
            <div className="p-6 text-center flex flex-col items-center justify-center bg-[var(--surface-primary)] rounded-md">
              <IconClock className="w-6 h-6 text-[var(--text-muted)] stroke-[1.5] mb-2" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">No recent activity</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Actions and events across your workspace will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

