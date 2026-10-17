import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IconDownload,
  IconFolder,
  IconCircleCheck,
  IconPackage,
} from '@tabler/icons-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Button, Select, Spinner } from '../../components/ui';
import reportService from '../../services/reportService';
import { useAuthStore } from '../../store/authStore';
const emptySummary = {
  financial: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: '0%',
  },
  monthlyBreakdown: [
    { month: 'Jan', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Feb', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Mar', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Apr', revenue: 0, expenses: 0, profit: 0 },
    { month: 'May', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Jun', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Jul', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Aug', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Sep', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Oct', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Nov', revenue: 0, expenses: 0, profit: 0 },
    { month: 'Dec', revenue: 0, expenses: 0, profit: 0 },
  ],
  projects: {
    total: 0,
    active: 0,
    completed: 0,
  },
  tasks: {
    total: 0,
    completed: 0,
    pending: 0,
  },
  inventory: {
    totalItems: 0,
    lowStockCount: 0,
  },
};

const ReportsPage = () => {
  const { currentBusiness } = useAuthStore();
  const [exportType, setExportType] = useState('invoices');

  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['reports-summary', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => reportService.getSummary(),
  });

  const summary = summaryRes?.data || emptySummary;

  const handleExportCsv = () => {
    const url = reportService.exportCsvUrl(exportType);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Compiling financial analytics...</p>
      </div>
    );
  }

  const chartData = summary.monthlyBreakdown || emptySummary.monthlyBreakdown;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Reports & Analytics</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Financial performance, revenue and expenses comparison, and operational status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-36 text-xs"
          >
            <option value="invoices">Invoices CSV</option>
            <option value="expenses">Expenses CSV</option>
            <option value="projects">Projects CSV</option>
            <option value="inventory">Inventory CSV</option>
          </Select>
          <Button variant="secondary" size="sm" onClick={handleExportCsv} leftIcon={IconDownload}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Collected revenue</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">
            ${(summary.financial?.totalRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            From paid invoices
          </span>
        </div>

        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Operating expenses</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">
            ${(summary.financial?.totalExpenses || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            Recorded outlays
          </span>
        </div>

        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Net profit</p>
          <p className="text-2xl font-bold mt-1 font-mono text-[var(--text-primary)]">
            ${(summary.financial?.netProfit || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            Margin: <strong className="text-[var(--text-primary)]">{summary.financial?.profitMargin || 0}%</strong>
          </span>
        </div>

        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Task completion</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">
            {summary.tasks?.completed || 0} / {summary.tasks?.total || 0}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            Active Projects: <strong className="text-[var(--text-primary)]">{summary.projects?.active || 0}</strong>
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Bar Chart */}
        <div className="bg-[var(--surface-primary)] p-5 rounded-lg">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Revenue vs. Expenses</h2>
            <p className="text-xs text-[var(--text-muted)]">Monthly cashflow comparison</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Revenue ($)" fill="#2563EB" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses ($)" fill="#555555" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Profit Trajectory */}
        <div className="bg-[var(--surface-primary)] p-5 rounded-lg">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Net Profit Trajectory</h2>
            <p className="text-xs text-[var(--text-muted)]">Monthly profit curve</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit ($)"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Summary */}
      <div className="bg-[var(--surface-primary)] p-5 rounded-lg space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Operations Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-md bg-[var(--surface-secondary)] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <IconFolder size={16} stroke={1.75} className="text-[#2563EB]" />
              <span>Projects Health</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[var(--text-muted)]">Active in-flight:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.projects?.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Completed:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.projects?.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Total scoped:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.projects?.total || 0}</span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[var(--surface-secondary)] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <IconCircleCheck size={16} stroke={1.75} className="text-[#2563EB]" />
              <span>Task Throughput</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[var(--text-muted)]">Tasks completed:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.tasks?.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Tasks pending:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.tasks?.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Total velocity:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.tasks?.total || 0} tasks</span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[var(--surface-secondary)] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <IconPackage size={16} stroke={1.75} className="text-[#2563EB]" />
              <span>Stock & Supply</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[var(--text-muted)]">Tracked SKUs:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.inventory?.totalItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Low stock alerts:</span>
              <span className="font-semibold text-[var(--text-primary)]">{summary.inventory?.lowStockCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Health status:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {(summary.inventory?.lowStockCount || 0) === 0 ? 'Optimal' : 'Needs reorder'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
