import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconUsers, IconSearch, IconCheck, IconX } from '@tabler/icons-react';
import { Input, Badge, Spinner } from '../../components/ui';
import adminService from '../../services/adminService';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminService.getUsers({ search }),
  });

  const users = usersRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Platform Users</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          View all registered global users across all SaaS workspaces
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user name or email..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconUsers size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <p className="text-xs text-[var(--text-muted)]">No users found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Platform Role</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                    {user.name || `${user.firstName || ''} ${user.lastName || ''}`}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'super_admin' ? 'warning' : 'default'} size="sm">
                      {user.role || 'user'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.isEmailVerified ? 'success' : 'default'} size="xs">
                      {user.isEmailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
