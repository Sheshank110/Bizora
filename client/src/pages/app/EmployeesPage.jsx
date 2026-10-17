import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  IconUsers,
  IconUserPlus,
  IconSearch,
  IconMail,
  IconRotateClockwise,
  IconTrash,
  IconSend,
  IconEye,
} from '@tabler/icons-react';
import { Button, Input, Badge, Spinner, Avatar, Alert } from '../../components/ui';
import {
  useEmployeesList,
  useInvitationsList,
  useEmployeeMutations,
} from '../../hooks/useEmployees';
import useBusiness from '../../hooks/useBusiness';
import useAuthStore from '../../store/authStore';
import { MOCK_EMPLOYEES } from '../../data/mockData';

const EmployeesPage = () => {
  const { user } = useAuthStore();
  const { activeBusiness, activeRole } = useBusiness();
  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'invitations'
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteJobTitle, setInviteJobTitle] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [inviteError, setInviteError] = useState('');

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      role: roleFilter || undefined,
      department: deptFilter || undefined,
    }),
    [search, roleFilter, deptFilter]
  );

  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployeesList(queryParams);
  const { data: invitations = [], isLoading: isLoadingInvitations } = useInvitationsList();

  const {
    inviteEmployee,
    resendInvitation,
    revokeInvitation,
    isInviting,
  } = useEmployeeMutations();

  const employees = (employeesData?.data && employeesData.data.length > 0) ? employeesData.data : MOCK_EMPLOYEES;
  const canManageTeam = activeRole === 'owner' || activeRole === 'manager' || activeRole === 'admin';
  const isOwner = activeRole === 'owner';

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteError('');

    try {
      await inviteEmployee({
        email: inviteEmail,
        role: inviteRole,
        jobTitle: inviteJobTitle,
        department: inviteDept,
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteJobTitle('');
      setInviteDept('');
      setActiveTab('invitations');
    } catch (err) {
      setInviteError(err.message || 'Could not send invitation');
    }
  };

  const handleResend = async (invId) => {
    await resendInvitation(invId);
  };

  const handleRevoke = async (invId) => {
    if (window.confirm('Are you sure you want to revoke this invitation?')) {
      await revokeInvitation(invId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Team & Employees</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage teammates, roles, and workspace invitations for{' '}
            <strong className="text-[var(--text-primary)]">{activeBusiness?.name}</strong>
          </p>
        </div>

        {canManageTeam && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            leftIcon={IconUserPlus}
          >
            Invite teammate
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'team'
              ? 'bg-[#2563EB] text-white'
              : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Active Team ({employees.length})
        </button>

        {canManageTeam && (
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'invitations'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Pending Invitations ({invitations.length})
          </button>
        )}
      </div>

      {/* Team Tab View */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1 max-w-sm relative">
              <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                placeholder="Search teammates by name, title, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">All roles</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">All departments</option>
                <option value="Executive">Executive</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Support">Support</option>
                <option value="Sales">Sales</option>
              </select>

              {(search || roleFilter || deptFilter) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
                    setDeptFilter('');
                  }}
                  className="p-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md"
                  title="Clear filters"
                >
                  <IconRotateClockwise size={15} stroke={1.75} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoadingEmployees ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" />
              <p className="text-xs text-[var(--text-muted)]">Loading team members...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8 space-y-2">
              <IconUsers size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-1 opacity-50" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">No teammates found</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {search || roleFilter || deptFilter
                  ? 'No employees match your search criteria.'
                  : 'Start collaborating by inviting your first teammate.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Job title</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const isSelf = emp.userId === (user?._id || user?.id);

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-[var(--surface-secondary)] transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <Link
                            to={`/app/employees/${emp.id}`}
                            className="flex items-center gap-2.5 hover:text-[#2563EB] transition-colors"
                          >
                            <Avatar name={emp.fullName} size="sm" src={emp.avatar} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold block truncate text-[var(--text-primary)]">
                                  {emp.fullName}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-muted)] font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[var(--text-muted)] block truncate">
                                {emp.email}
                              </span>
                            </div>
                          </Link>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-xs capitalize text-[var(--text-secondary)] font-medium">
                            {emp.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                          {emp.jobTitle || '—'}
                        </td>

                        <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                          {emp.department || '—'}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              emp.status === 'ACTIVE'
                                ? 'success'
                                : emp.status === 'INVITED'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {emp.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                          {emp.joiningDate
                            ? new Date(emp.joiningDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/app/employees/${emp.id}`}
                            className="inline-flex p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            title="View Employee Profile"
                          >
                            <IconEye size={16} stroke={1.75} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invitations Tab View */}
      {activeTab === 'invitations' && canManageTeam && (
        <div className="bg-[var(--surface-primary)] rounded-lg p-5 space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <IconMail size={16} stroke={1.75} className="text-[#2563EB]" />
              Pending Workspace Invitations ({invitations.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              These teammates have received invitation links and can join upon acceptance.
            </p>
          </div>

          {isLoadingInvitations ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">
              No pending invitations. All invited members have joined!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Invitee email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Job title</th>
                    <th className="py-2.5 px-3">Invited by</th>
                    <th className="py-2.5 px-3">Expires</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => {
                    const inviterName = inv.invitedBy
                      ? `${inv.invitedBy.firstName} ${inv.invitedBy.lastName}`.trim()
                      : 'Admin';

                    return (
                      <tr key={inv._id || inv.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-xs text-[var(--text-primary)]">{inv.email}</td>
                        <td className="py-2.5 px-3 text-xs capitalize text-[var(--text-secondary)]">{inv.role}</td>
                        <td className="py-2.5 px-3 text-xs text-[var(--text-secondary)]">
                          {inv.jobTitle || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-[var(--text-muted)]">
                          {inviterName}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-[var(--text-muted)]">
                          {new Date(inv.expiresAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleResend(inv._id || inv.id)}
                              className="px-2 py-1 text-xs rounded bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[#EFEFEF] dark:hover:bg-[#181818] font-medium flex items-center gap-1"
                              title="Resend invitation email"
                            >
                              <IconSend size={12} stroke={1.75} /> Resend
                            </button>
                            <button
                              onClick={() => handleRevoke(inv._id || inv.id)}
                              className="p-1 rounded text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                              title="Revoke invitation"
                            >
                              <IconTrash size={14} stroke={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="max-w-md w-full rounded-lg bg-[var(--surface-primary)] p-6 shadow-2xl relative border-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">
              Invite Team Member
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Send an email invitation to collaborate on <strong>{activeBusiness?.name}</strong>.
            </p>

            {inviteError && (
              <Alert variant="danger" className="mb-4">
                {inviteError}
              </Alert>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <Input
                label="Work email address"
                type="email"
                placeholder="colleague@company.com"
                leftIcon={IconMail}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Role permission
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="employee">Employee (Standard Access)</option>
                  {isOwner && <option value="manager">Manager (Operations & Invites)</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Job title"
                  placeholder="e.g. Lead Engineer"
                  value={inviteJobTitle}
                  onChange={(e) => setInviteJobTitle(e.target.value)}
                />
                <Input
                  label="Department"
                  placeholder="e.g. Engineering"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isInviting}>
                  Send invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
