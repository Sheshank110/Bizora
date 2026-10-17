import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconCreditCard,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { Button, Input, Select, Badge, Modal, Spinner } from '../../components/ui';
import paymentService from '../../services/paymentService';
import invoiceService from '../../services/invoiceService';
import customerService from '../../services/customerService';
import { useAuthStore } from '../../store/authStore';

const statusVariants = {
  SUCCEEDED: 'success',
  PENDING: 'warning',
  PROCESSING: 'info',
  FAILED: 'danger',
  REFUNDED: 'default',
};

const PaymentsPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: '',
    customerId: '',
    amount: '',
    method: 'card',
    provider: 'Stripe',
  });

  const { data: paymentsRes, isLoading } = useQuery({
    queryKey: ['payments', currentBusiness?._id || currentBusiness?.id, search, statusFilter],
    queryFn: () => paymentService.getPayments({
      search,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const { data: invoicesRes } = useQuery({
    queryKey: ['invoices-selector-payments', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => invoiceService.getInvoices({ limit: 50 }),
  });

  const { data: customersRes } = useQuery({
    queryKey: ['customers-selector-payments', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => customerService.getCustomers({ limit: 50 }),
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      setFormData({ invoiceId: '', customerId: '', amount: '', method: 'card', provider: 'Stripe' });
    },
  });

  const payments = paymentsRes?.data || [];
  const invoices = invoicesRes?.data || [];
  const customers = customersRes?.data || [];

  const totalProcessed = payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const successCount = payments.filter((p) => p.status === 'SUCCEEDED').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').length;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;
    createPaymentMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Payments</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Monitor client payment records, gateway transactions, and reconciliation
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={IconPlus}>
          Record payment
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Total processed</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">${totalProcessed.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Completed transactions</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{successCount}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Pending / processing</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{pendingCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction ID or reference..."
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 text-xs"
        >
          <option value="ALL">All statuses</option>
          <option value="SUCCEEDED">Succeeded</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </Select>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconCreditCard size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No payments found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Payments will appear here when client invoices are paid or webhook events are received.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const customerName = typeof p.customerId === 'object' && p.customerId
                  ? (p.customerId.name || `${p.customerId.firstName} ${p.customerId.lastName}`)
                  : 'Customer';

                const invoiceNumber = typeof p.invoiceId === 'object' && p.invoiceId
                  ? p.invoiceId.invoiceNumber
                  : (p.invoiceId || '—');

                return (
                  <tr key={p._id || p.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)]">
                      {p.providerTransactionId || p.reference || (p._id || p.id).substring(0, 10)}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {customerName}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)] font-mono">
                      {invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)] font-mono">
                      ${(p.amount || 0).toLocaleString()} {p.currency || 'USD'}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                      <span className="capitalize">{p.method || 'card'}</span>
                      {p.provider && <span className="ml-1 text-[11px] text-[var(--text-muted)]">({p.provider})</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariants[p.status] || 'default'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)]">
                      {p.paidAt || p.createdAt ? new Date(p.paidAt || p.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Invoice</label>
            <Select
              value={formData.invoiceId}
              onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
            >
              <option value="">Select invoice (optional)...</option>
              {invoices.map((inv) => (
                <option key={inv._id || inv.id} value={inv._id || inv.id}>
                  {inv.invoiceNumber} — ${inv.total} ({inv.status})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Customer</label>
            <Select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name || `${c.firstName} ${c.lastName}`}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Amount ($) *</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Payment Method</label>
              <Select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              >
                <option value="card">Credit / Debit Card</option>
                <option value="bank_transfer">Bank Wire</option>
                <option value="upi">UPI / Instant Pay</option>
                <option value="cash">Cash / Cheque</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={createPaymentMutation.isPending}>
              Record transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
