import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconPlus,
  IconSearch,
  IconFileText,
  IconArrowRight,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';
import { Button, Input, Modal, Spinner, Badge, EmptyState } from '../../components/ui';
import invoiceService from '../../services/invoiceService';
import customerService from '../../services/customerService';
import { useAuthStore } from '../../store/authStore';

const statusVariants = {
  PAID: 'success',
  SENT: 'warning',
  OVERDUE: 'danger',
  DRAFT: 'default',
  CANCELLED: 'default',
};

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: 'Payment is due within net-14 terms.',
    items: [{ description: 'Consulting Services', quantity: 1, unitPrice: 500 }],
  });

  const { data: invoicesRes, isLoading } = useQuery({
    queryKey: ['invoices', currentBusiness?._id || currentBusiness?.id, search, statusFilter],
    queryFn: () => invoiceService.getInvoices({
      search,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const { data: customersRes } = useQuery({
    queryKey: ['customers-selector-invoices', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => customerService.getCustomers({ limit: 50 }),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: invoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      setFormData({
        customerId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: 'Payment is due within net-14 terms.',
        items: [{ description: 'Consulting Services', quantity: 1, unitPrice: 500 }],
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: invoiceService.markPaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const invoices = invoicesRes?.data || [];
  const customers = customersRes?.data || [];

  // Summary statistics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.amountDue || 0), 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE').length;

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = field === 'description' ? value : Number(value) || 0;
    setFormData({ ...formData, items: updated });
  };

  const invoiceTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.customerId) return;
    createInvoiceMutation.mutate({
      ...formData,
      total: invoiceTotal,
      amountDue: invoiceTotal,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Invoices &amp; Receivables
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage billing statements, client receipts, and net payment schedules.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          New Invoice
        </Button>
      </div>

      {/* Financial Summary: 4 Clear Numbers, Aligned, NO container borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Total Billed</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
            ${totalInvoiced.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            {invoices.length} invoices issued
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Collected</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
            ${totalPaid.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            Paid in full
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Outstanding Balance</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
            ${totalOutstanding.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            Pending settlements
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)] block">Overdue Invoices</span>
          <span className="text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
            {overdueCount}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
            Requires follow-up
          </span>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search by invoice number or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Conservative Invoicing Table: Aligned numbers, obvious statuses */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-[var(--text-muted)]">Loading ledger...</p>
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices created yet"
          description="Create your first client invoice to bill for deliverables and track payments."
          action={() => setIsModalOpen(true)}
          actionLabel="Create Invoice"
          className="bg-[var(--surface-secondary)] rounded-lg py-16"
        />
      ) : (
        <div className="p-2 rounded-lg bg-[var(--surface-secondary)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                {invoices.map((inv) => (
                  <tr
                    key={inv._id || inv.id}
                    className="hover:bg-[var(--surface-primary)] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <Link
                        to={`/app/invoices/${inv._id || inv.id}`}
                        className="font-mono font-semibold text-[var(--text-primary)] hover:text-[#2563EB]"
                      >
                        {inv.invoiceNumber || `INV-${inv._id?.slice(-4) || '1001'}`}
                      </Link>
                    </td>

                    <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                      {inv.customerName || inv.clientName || 'Direct Client'}
                    </td>

                    <td className="py-3 px-3 text-[var(--text-muted)]">
                      {inv.issueDate || '—'}
                    </td>

                    <td className="py-3 px-3 text-[var(--text-muted)]">
                      {inv.dueDate || '—'}
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={statusVariants[inv.status] || 'default'} size="xs">
                        {inv.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[var(--text-primary)]">
                      ${Number(inv.total || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => markPaidMutation.mutate(inv._id || inv.id)}
                            className="text-[11px] text-[var(--text-primary)] hover:underline font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                        <Link
                          to={`/app/invoices/${inv._id || inv.id}`}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[#2563EB]"
                          title="View statement"
                        >
                          <IconArrowRight className="w-4 h-4 stroke-[1.75]" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Invoice"
          description="Issue an itemized billing statement to a client."
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Customer
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                  required
                >
                  <option value="">Select client...</option>
                  {customers.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Issue Date"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />

              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Line Items
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-[#2563EB] hover:underline font-medium"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Service or product description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-16 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] text-center focus:ring-2 focus:ring-[#2563EB]"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-24 px-3 py-1.5 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] text-right font-mono focus:ring-2 focus:ring-[#2563EB]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-500"
                    >
                      <IconTrash className="w-4 h-4 stroke-[1.75]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total display */}
            <div className="pt-3 border-t border-transparent flex items-center justify-between text-sm font-semibold">
              <span>Invoice Total</span>
              <span className="font-mono text-base text-[var(--text-primary)]">
                ${invoiceTotal.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={createInvoiceMutation.isPending}>
                Create Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InvoicesPage;
