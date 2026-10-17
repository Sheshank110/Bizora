import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconActivity, IconSearch } from '@tabler/icons-react';
import { Input, Select, Badge, Spinner } from '../../components/ui';
import auditLogService from '../../services/auditLogService';
import { useAuthStore } from '../../store/authStore';

const actionVariants = {
  USER_LOGGED_IN: 'default',
  USER_REGISTERED: 'info',
  BUSINESS_CREATED: 'info',
  PROJECT_CREATED: 'info',
  TASK_UPDATED: 'info',
  INVOICE_CREATED: 'warning',
  PAYMENT_RECEIVED: 'success',
  EXPENSE_CREATED: 'danger',
  INVENTORY_CHANGED: 'warning',
  EMPLOYEE_INVITED: 'info',
};

const ActivityPage = () => {
  const { currentBusiness } = useAuthStore();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs', currentBusiness?._id || currentBusiness?.id, search, actionFilter, entityFilter],
    queryFn: () => auditLogService.getAuditLogs({
      search,
      action: actionFilter === 'ALL' ? undefined : actionFilter,
      entity: entityFilter === 'ALL' ? undefined : entityFilter,
      limit: 50,
    }),
  });

  const logs = logsRes?.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Audit Log & Activity</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Operational and security events recorded across this workspace
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user, or IP address..."
            className="pl-9"
          />
        </div>

        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:w-44 text-xs"
        >
          <option value="ALL">All actions</option>
          <option value="USER_LOGGED_IN">User Login</option>
          <option value="PROJECT_CREATED">Project Created</option>
          <option value="TASK_UPDATED">Task Updated</option>
          <option value="INVOICE_CREATED">Invoice Created</option>
          <option value="PAYMENT_RECEIVED">Payment Received</option>
          <option value="EXPENSE_CREATED">Expense Created</option>
          <option value="INVENTORY_CHANGED">Inventory Changed</option>
        </Select>

        <Select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="w-full sm:w-36 text-xs"
        >
          <option value="ALL">All entities</option>
          <option value="Project">Project</option>
          <option value="Task">Task</option>
          <option value="Invoice">Invoice</option>
          <option value="Payment">Payment</option>
          <option value="Expense">Expense</option>
          <option value="InventoryItem">Inventory</option>
          <option value="User">User</option>
        </Select>
      </div>

      {/* Activity Timeline List */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconActivity size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No activity logs recorded</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Audit entries are automatically recorded on all create, update, payment, and security actions.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const userName = typeof log.userId === 'object' && log.userId
                  ? (log.userId.name || log.userId.email)
                  : (log.userId || 'System');

                return (
                  <tr key={log._id || log.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={actionVariants[log.action] || 'default'} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {log.entity || '—'}
                      {log.entityId && (
                        <span className="block font-mono text-[10px] text-[var(--text-muted)]">
                          ID: {String(log.entityId).substring(0, 12)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      {userName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)] font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
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

export default ActivityPage;
