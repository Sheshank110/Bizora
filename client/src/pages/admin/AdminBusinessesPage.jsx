import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconBuildingSkyscraper,
  IconSearch,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { Button, Input, Badge, Spinner } from '../../components/ui';
import adminService from '../../services/adminService';

const AdminBusinessesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: businessesRes, isLoading } = useQuery({
    queryKey: ['admin-businesses', search],
    queryFn: () => adminService.getBusinesses({ search }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateBusinessStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-businesses'] }),
  });

  const businesses = businessesRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Businesses Directory</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Platform-wide tenant administration, account statuses, and suspension controls
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business by name or code..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconBuildingSkyscraper size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <p className="text-xs text-[var(--text-muted)]">No businesses found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Business name</th>
                <th className="py-3 px-4">Code / Slug</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => {
                const isSuspended = biz.status === 'SUSPENDED';

                return (
                  <tr key={biz._id || biz.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {biz.name}
                      {biz.email && (
                        <span className="block text-[11px] font-normal text-[var(--text-muted)]">{biz.email}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)]">
                      {biz.businessCode || biz.slug || biz._id || biz.id}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium capitalize text-[var(--text-secondary)]">
                      {biz.plan || 'Starter'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isSuspended ? 'danger' : 'success'} size="sm">
                        {biz.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isSuspended ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          loading={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ id: biz._id || biz.id, status: 'ACTIVE' })}
                          leftIcon={IconCheck}
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          loading={updateStatusMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Suspend business "${biz.name}"? Tenants will lose access.`)) {
                              updateStatusMutation.mutate({ id: biz._id || biz.id, status: 'SUSPENDED' });
                            }
                          }}
                          leftIcon={IconX}
                        >
                          Suspend
                        </Button>
                      )}
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

export default AdminBusinessesPage;
