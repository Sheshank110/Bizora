import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconArrowLeft,
  IconPrinter,
  IconSend,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { Button, Badge, Spinner, Alert } from '../../components/ui';
import invoiceService from '../../services/invoiceService';
import { useAuthStore } from '../../store/authStore';
import { MOCK_INVOICES } from '../../data/mockData';

const statusVariants = {
  DRAFT: 'default',
  SENT: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'default',
};

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentBusiness } = useAuthStore();

  const { data: invoiceRes, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceService.getInvoice(invoiceId),
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: () => invoiceService.sendInvoice(invoiceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
  });

  const markPaidMutation = useMutation({
    mutationFn: () => invoiceService.markPaid(invoiceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: () => invoiceService.cancelInvoice(invoiceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
  });

  const fallbackMock = MOCK_INVOICES.find((i) => i._id === invoiceId || i.id === invoiceId) || MOCK_INVOICES[0];
  const invoice = invoiceRes?.data || fallbackMock;

  if (isLoading && !invoice) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading invoice record...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-4">
        <Alert variant="danger">Invoice not found or access denied.</Alert>
        <Button variant="secondary" size="sm" onClick={() => navigate('/app/invoices')} leftIcon={IconArrowLeft}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const customer = typeof invoice.customerId === 'object' && invoice.customerId ? invoice.customerId : null;
  const customerName = customer ? (customer.name || `${customer.firstName} ${customer.lastName}`) : (invoice.customerName || 'Sterling Capital Retail');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/invoices')} leftIcon={IconArrowLeft}>
            Invoices
          </Button>
          <span className="text-[var(--text-muted)]">/</span>
          <h1 className="text-base font-semibold text-[var(--text-primary)]">
            {invoice.invoiceNumber}
          </h1>
          <Badge variant={statusVariants[invoice.status] || 'default'}>{invoice.status}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} leftIcon={IconPrinter}>
            Print / PDF
          </Button>

          {invoice.status === 'DRAFT' && (
            <Button
              variant="secondary"
              size="sm"
              loading={sendInvoiceMutation.isPending}
              onClick={() => sendInvoiceMutation.mutate()}
              leftIcon={IconSend}
            >
              Send to client
            </Button>
          )}

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Button
              variant="primary"
              size="sm"
              loading={markPaidMutation.isPending}
              onClick={() => markPaidMutation.mutate()}
              leftIcon={IconCircleCheck}
            >
              Mark as paid
            </Button>
          )}

          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700"
              loading={cancelInvoiceMutation.isPending}
              onClick={() => {
                if (window.confirm('Cancel this invoice?')) cancelInvoiceMutation.mutate();
              }}
              leftIcon={IconCircleX}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-[var(--surface-primary)] rounded-lg p-8 sm:p-10 shadow-none border-0 print:p-0 print:bg-white print:text-black">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-transparent">
          <div>
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] print:text-black">
              {currentBusiness?.name || 'Bizora SaaS'}
            </span>
            <p className="text-xs text-[var(--text-muted)] print:text-gray-600 mt-1">
              Business ID: {currentBusiness?.businessCode || currentBusiness?.id || 'Apex-101'}
            </p>
            <p className="text-xs text-[var(--text-muted)] print:text-gray-600">
              {currentBusiness?.email || 'billing@bizora.demo'}
            </p>
          </div>

          <div className="sm:text-right">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-[var(--text-muted)] print:text-black">
              Invoice Statement
            </h2>
            <p className="text-base font-bold text-[var(--text-primary)] print:text-black mt-0.5">
              #{invoice.invoiceNumber}
            </p>
            <div className="mt-2 space-y-0.5 text-xs text-[var(--text-muted)] print:text-gray-600">
              <p>Issue Date: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</p>
              <p>Due Date: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>

        {/* Bill To & Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-transparent">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] print:text-gray-500 mb-1.5">
              Billed to
            </h3>
            <p className="text-sm font-semibold text-[var(--text-primary)] print:text-black">
              {customerName}
            </p>
            {customer?.company && (
              <p className="text-xs text-[var(--text-secondary)] print:text-gray-700">{customer.company}</p>
            )}
            {customer?.email && (
              <p className="text-xs text-[var(--text-secondary)] print:text-gray-700">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-xs text-[var(--text-secondary)] print:text-gray-700">{customer.phone}</p>
            )}
          </div>

          <div className="sm:text-right">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] print:text-gray-500 mb-1.5">
              Payment status
            </h3>
            <Badge variant={statusVariants[invoice.status] || 'default'}>
              {invoice.status}
            </Badge>
            {invoice.amountDue > 0 && invoice.status !== 'PAID' && (
              <p className="text-xs font-semibold text-[var(--text-primary)] print:text-black mt-2">
                Amount Due: ${invoice.amountDue.toLocaleString()} {invoice.currency || 'USD'}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] print:text-gray-600 uppercase tracking-wider">
                <th className="py-2.5 px-2">Item & Description</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Price</th>
                <th className="py-2.5 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-[var(--surface-secondary)] transition-colors print:text-black">
                  <td className="py-3 px-2 font-medium text-[var(--text-primary)] print:text-black">
                    {item.description}
                  </td>
                  <td className="py-3 px-2 text-center text-[var(--text-secondary)] print:text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right text-[var(--text-secondary)] print:text-gray-700 font-mono">
                    ${(item.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-[var(--text-primary)] print:text-black font-mono">
                    ${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation summary */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between gap-6">
          <div className="max-w-xs space-y-3">
            {invoice.notes && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] print:text-gray-700 mb-0.5">Notes</p>
                <p className="text-xs text-[var(--text-muted)] print:text-gray-600 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] print:text-gray-700 mb-0.5">Payment Terms</p>
                <p className="text-xs text-[var(--text-muted)] print:text-gray-600 whitespace-pre-line leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-[var(--text-secondary)] print:text-gray-700">
              <span>Subtotal</span>
              <span className="font-mono">${(invoice.subtotal || invoice.total || 0).toFixed(2)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-[var(--text-secondary)] print:text-gray-700">
                <span>Tax</span>
                <span className="font-mono">${invoice.tax.toFixed(2)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-[var(--text-secondary)] print:text-gray-700">
                <span>Discount</span>
                <span className="font-mono">-${invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] print:text-black pt-2">
              <span>Total</span>
              <span className="font-mono">${(invoice.total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)] print:text-gray-700">
              <span>Amount Paid</span>
              <span className="font-mono">${(invoice.amountPaid || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[var(--text-primary)] print:text-black pt-1">
              <span>Amount Due</span>
              <span className="font-mono">${(invoice.amountDue !== undefined ? invoice.amountDue : invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
