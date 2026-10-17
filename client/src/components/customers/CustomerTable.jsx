import { Link } from 'react-router-dom';
import { IconEye, IconEdit, IconArchive, IconDots } from '@tabler/icons-react';
import { Badge, Dropdown, Avatar } from '../ui';

export const CustomerTable = ({
  customers = [],
  onEdit,
  onArchive,
  canManage = true,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'ARCHIVED':
        return <Badge variant="danger">Archived</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Table: No container borders */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Company</th>
              <th className="py-2.5 px-3">Contact</th>
              <th className="py-2.5 px-3">Assigned Lead</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            {customers.map((c) => {
              const fullName = `${c.firstName} ${c.lastName}`.trim();
              const assigned = c.assignedEmployee;

              return (
                <tr
                  key={c.id || c._id}
                  className="hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <td className="py-3 px-3">
                    <Link
                      to={`/app/customers/${c.id || c._id}`}
                      className="flex items-center gap-2.5 hover:text-[#2563EB] transition-colors"
                    >
                      <Avatar name={fullName} size="sm" src={c.avatar} />
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-[var(--text-primary)] block truncate">
                          {fullName}
                        </span>
                        {c.jobTitle && (
                          <span className="text-[11px] text-[var(--text-muted)] block truncate">
                            {c.jobTitle}
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="py-3 px-3">
                    {c.company ? (
                      <span className="truncate block max-w-[140px] text-[var(--text-primary)] font-medium">
                        {c.company}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-0.5">
                      <span>{c.phone || '—'}</span>
                      {c.email && (
                        <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[160px]">
                          {c.email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {assigned ? (
                      <span className="truncate max-w-[130px] block">
                        {assigned.firstName} {assigned.lastName}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {getStatusBadge(c.status)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          aria-label="Actions"
                        >
                          <IconDots className="w-4 h-4 stroke-[1.75]" />
                        </button>
                      }
                    >
                      {({ close }) => (
                        <div className="py-1">
                          <Link
                            to={`/app/customers/${c.id || c._id}`}
                            onClick={close}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[#F7F7F7] dark:hover:bg-[#111111] hover:text-[var(--text-primary)]"
                          >
                            <IconEye className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span>View Details</span>
                          </Link>
                          {canManage && (
                            <>
                              <button
                                onClick={() => {
                                  close();
                                  onEdit(c);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[#F7F7F7] dark:hover:bg-[#111111] hover:text-[var(--text-primary)]"
                              >
                                <IconEdit className="w-3.5 h-3.5 stroke-[1.75]" />
                                <span>Edit Customer</span>
                              </button>
                              <div className="my-1 h-px bg-[#EFEFEF] dark:bg-[#111111]" />
                              <button
                                onClick={() => {
                                  close();
                                  onArchive(c);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                              >
                                <IconArchive className="w-3.5 h-3.5 stroke-[1.75]" />
                                <span>Archive</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
