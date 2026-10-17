import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  IconArrowLeft,
  IconEdit,
  IconArchive,
  IconPhone,
  IconMail,
  IconBuilding,
  IconCalendar,
  IconTag,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, Badge, Spinner, Avatar, Alert } from '../../components/ui';
import CustomerNotes from '../../components/customers/CustomerNotes';
import CustomerActivityTimeline from '../../components/customers/CustomerActivityTimeline';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import {
  useCustomerDetails,
  useCustomerNotes,
  useCustomerActivity,
  useCustomerMutations,
} from '../../hooks/useCustomers';
import useBusiness from '../../hooks/useBusiness';
import { MOCK_CUSTOMERS } from '../../data/mockData';

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { activeRole, members } = useBusiness();
  const [activeTab, setActiveTab] = useState('notes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const { data: customerData, isLoading } = useCustomerDetails(customerId);
  const fallbackCustomer = MOCK_CUSTOMERS.find((c) => c._id === customerId || c.id === customerId) || MOCK_CUSTOMERS[0];
  const customer = customerData || fallbackCustomer;

  const { data: notes = [], isLoading: isLoadingNotes } = useCustomerNotes(customerId);
  const { data: activities = [], isLoading: isLoadingActivities } = useCustomerActivity(customerId);

  const {
    updateCustomer,
    archiveCustomer,
    addNote,
    deleteNote,
    isUpdating,
    isAddingNote,
  } = useCustomerMutations();

  const canManage = activeRole === 'owner' || activeRole === 'manager' || activeRole === 'employee';

  if (isLoading && !customer) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading customer record...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Alert variant="danger">
          Customer not found or you do not have permission to view this record.
        </Alert>
        <Link to="/app/customers" className="inline-flex items-center gap-2 text-xs text-[#2563EB]">
          <IconArrowLeft className="w-4 h-4 stroke-[1.75]" /> Back to Customers
        </Link>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  const assigned = customer.assignedEmployee;

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive ${fullName}?`)) {
      await archiveCustomer(customer.id || customer._id);
      navigate('/app/customers');
    }
  };

  const handleEditSubmit = async (formData) => {
    await updateCustomer({ customerId, data: formData });
    setIsEditModalOpen(false);
  };

  const handleAssignChange = async (employeeId) => {
    await updateCustomer({
      customerId,
      data: { assignedEmployee: employeeId || null },
    });
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const existing = customer.tags || [];
    if (!existing.includes(newTagInput.trim())) {
      await updateCustomer({
        customerId,
        data: { tags: [...existing, newTagInput.trim()] },
      });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove) => {
    const existing = customer.tags || [];
    await updateCustomer({
      customerId,
      data: { tags: existing.filter((t) => t !== tagToRemove) },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/app/customers"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4 stroke-[1.75]" />
          <span>Customers</span>
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleArchive}
            >
              Archive
            </Button>
          </div>
        )}
      </div>

      {/* Main Customer Header: Typography & Data First */}
      <div className="p-6 rounded-lg bg-[var(--surface-secondary)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar name={fullName} size="lg" src={customer.avatar} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {fullName}
                </h1>
                <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {customer.status}
                </Badge>
              </div>

              {customer.jobTitle && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {customer.jobTitle} {customer.company ? `at ${customer.company}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Assigned Lead Selector */}
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[var(--text-muted)] block">Assigned Lead</span>
            {canManage ? (
              <select
                value={assigned?._id || assigned?.id || ''}
                onChange={(e) => handleAssignChange(e.target.value)}
                className="mt-1 px-2.5 py-1 text-xs rounded bg-[var(--surface-primary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.firstName} {m.user?.lastName} ({m.role})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-medium text-[var(--text-primary)] mt-1 block">
                {assigned ? `${assigned.firstName} ${assigned.lastName}` : 'Unassigned'}
              </span>
            )}
          </div>
        </div>

        {/* Contact details row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-transparent text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <IconMail className="w-4 h-4 text-[var(--text-muted)] stroke-[1.75]" />
            <a href={`mailto:${customer.email}`} className="hover:underline truncate">
              {customer.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <IconPhone className="w-4 h-4 text-[var(--text-muted)] stroke-[1.75]" />
            <span>{customer.phone || 'No phone recorded'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBuilding className="w-4 h-4 text-[var(--text-muted)] stroke-[1.75]" />
            <span className="truncate">{customer.city ? `${customer.city}, ${customer.country}` : 'No address recorded'}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          {(customer.tags || []).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[var(--surface-primary)] text-[var(--text-secondary)]"
            >
              <span>{tag}</span>
              {canManage && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500"
                  aria-label="Remove tag"
                >
                  <IconX className="w-3 h-3 stroke-[2]" />
                </button>
              )}
            </span>
          ))}

          {canManage && !isAddingTag && (
            <button
              onClick={() => setIsAddingTag(true)}
              className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              + Tag
            </button>
          )}

          {isAddingTag && (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Tag name"
                className="px-2 py-0.5 text-xs rounded bg-[var(--surface-primary)] border-none outline-none text-[var(--text-primary)] w-24"
                autoFocus
              />
              <button onClick={handleAddTag} className="text-xs text-[#2563EB]">
                Add
              </button>
              <button onClick={() => setIsAddingTag(false)} className="text-xs text-[var(--text-muted)]">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Notes & Activity */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-[var(--surface-secondary)] text-[#2563EB] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-[var(--surface-secondary)] text-[#2563EB] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Activity Timeline ({activities.length})
          </button>
        </div>

        {activeTab === 'notes' && (
          <div className="p-5 rounded-lg bg-[var(--surface-secondary)]">
            <CustomerNotes
              customerId={customerId}
              notes={notes}
              onAddNote={(content) => addNote({ customerId, content })}
              onDeleteNote={(noteId) => deleteNote({ customerId, noteId })}
              isAdding={isAddingNote}
              canAdd={canManage}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-5 rounded-lg bg-[var(--surface-secondary)]">
            <CustomerActivityTimeline activities={activities} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          initialData={customer}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default CustomerDetailPage;
