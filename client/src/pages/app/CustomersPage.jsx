import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IconSearch,
  IconUserPlus,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { Button, Spinner, EmptyState } from '../../components/ui';
import CustomerTable from '../../components/customers/CustomerTable';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import { useCustomersList, useCustomerMutations } from '../../hooks/useCustomers';
import useBusiness from '../../hooks/useBusiness';

const CustomersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRole, members } = useBusiness();
  const { createCustomer, updateCustomer, archiveCustomer, isCreating, isUpdating } =
    useCustomerMutations();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const assigned = searchParams.get('assigned') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        updateQuery({ search: searchInput || undefined, page: 1 });
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '') {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    setSearchParams(next);
  };

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search,
      status: status || undefined,
      assignedEmployee: assigned || undefined,
    }),
    [page, limit, search, status, assigned]
  );

  const { data, isLoading } = useCustomersList(queryParams);
  const customers = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: customers.length, totalPages: 1 };

  const canManage = activeRole === 'owner' || activeRole === 'manager' || activeRole === 'employee';

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleArchive = async (customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`;
    if (window.confirm(`Are you sure you want to archive ${fullName}?`)) {
      await archiveCustomer(customer.id || customer._id);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingCustomer) {
      await updateCustomer({
        customerId: editingCustomer.id || editingCustomer._id,
        data: formData,
      });
    } else {
      await createCustomer(formData);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Customers
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage client accounts, contact information, and account leads.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
          >
            Add Customer
          </Button>
        )}
      </div>

      {/* Controls Bar: Search & Filter without container borders */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => updateQuery({ status: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Assigned employee filter */}
          {members && members.length > 0 && (
            <select
              value={assigned}
              onChange={(e) => updateQuery({ assigned: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Leads</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.firstName} {m.user?.lastName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-[var(--text-muted)]">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer to manage contacts, leads, and invoices."
          action={canManage ? () => { setEditingCustomer(null); setIsModalOpen(true); } : undefined}
          actionLabel="Add Customer"
          className="bg-[var(--surface-secondary)] rounded-lg py-16"
        />
      ) : (
        <div className="bg-[var(--surface-secondary)] rounded-lg p-2">
          <CustomerTable
            customers={customers}
            onEdit={handleEdit}
            onArchive={handleArchive}
            canManage={canManage}
          />
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:pointer-events-none text-[var(--text-primary)]"
            >
              <IconChevronLeft className="w-4 h-4 stroke-[1.75]" />
            </button>
            <span className="px-2 font-mono">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => updateQuery({ page: Math.min(pagination.totalPages, page + 1) })}
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:pointer-events-none text-[var(--text-primary)]"
            >
              <IconChevronRight className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingCustomer}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default CustomersPage;
