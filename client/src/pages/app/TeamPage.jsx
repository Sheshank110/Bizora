import { useState } from 'react';
import { IconUsers, IconUserPlus, IconTrash, IconMail } from '@tabler/icons-react';
import { Button, Input, Modal, Alert, Spinner } from '../../components/ui';
import useBusiness from '../../hooks/useBusiness';
import useAuthStore from '../../store/authStore';

const TeamPage = () => {
  const { user } = useAuthStore();
  const {
    activeBusiness,
    activeRole,
    members,
    isLoadingMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  } = useBusiness();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteTitle, setInviteTitle] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const canManageMembers = activeRole === 'owner' || activeRole === 'manager' || activeRole === 'admin';
  const isOwner = activeRole === 'owner';

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      setInviteError('Email address is required');
      return;
    }
    setInviteError('');
    setIsSubmittingInvite(true);

    try {
      await inviteMember({
        email: inviteEmail,
        role: inviteRole,
        title: inviteTitle,
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteTitle('');
    } catch (err) {
      setInviteError(err.message || 'Could not send invitation');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole({
        memberId,
        data: { role: newRole },
      });
    } catch {
      // Toast handled by hook
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      try {
        await removeMember(memberId);
      } catch {
        // Toast handled by hook
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Team & Members</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage workspace collaborators and access roles for{' '}
            <strong className="text-[var(--text-primary)]">{activeBusiness?.name}</strong>
          </p>
        </div>

        {canManageMembers && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            leftIcon={IconUserPlus}
          >
            Invite member
          </Button>
        )}
      </div>

      {/* Members List */}
      <div className="bg-[var(--surface-primary)] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <IconUsers size={16} stroke={1.75} className="text-[#2563EB]" />
            Active Collaborators ({members.length})
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Your role: <strong className="capitalize text-[var(--text-primary)]">{activeRole}</strong>
          </span>
        </div>

        {isLoadingMembers ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="divide-y divide-transparent">
            {members.map((m) => {
              const memberUser = m.user;
              const isCurrentUser = memberUser?.id === (user?._id || user?.id);
              const isMemberOwner = m.role === 'owner';

              return (
                <div
                  key={m.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-secondary)] px-3 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] font-medium flex items-center justify-center text-xs">
                      {memberUser?.firstName?.charAt(0) || 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {memberUser?.fullName || `${memberUser?.firstName} ${memberUser?.lastName}`}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-secondary)] text-[var(--text-muted)] font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">{memberUser?.email}</p>
                      {m.title && (
                        <p className="text-[11px] text-[var(--text-secondary)]">{m.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role selector for owner or badge for others */}
                    {isOwner && !isMemberOwner ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="h-8 px-2 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      >
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-medium capitalize">
                        {m.role}
                      </span>
                    )}

                    {/* Delete button (Owner only, cannot delete self/owner) */}
                    {isOwner && !isMemberOwner && !isCurrentUser && (
                      <button
                        onClick={() =>
                          handleRemove(
                            m.id,
                            memberUser?.fullName || memberUser?.email || 'this member'
                          )
                        }
                        className="p-1 rounded text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                        title="Remove member"
                      >
                        <IconTrash size={15} stroke={1.75} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="max-w-md w-full rounded-lg bg-[var(--surface-primary)] p-6 shadow-2xl relative border-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">
              Invite Team Member
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Send an invitation to join <strong>{activeBusiness?.name}</strong>.
            </p>

            {inviteError && (
              <Alert variant="danger" className="mb-4">
                {inviteError}
              </Alert>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <Input
                label="Email address"
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
                  <option value="manager">Manager (Can invite & operate)</option>
                  <option value="employee">Employee (Standard access)</option>
                </select>
              </div>

              <Input
                label="Job title (optional)"
                placeholder="e.g. Lead Designer, Accountant"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
              />

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isSubmittingInvite}>
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

export default TeamPage;
