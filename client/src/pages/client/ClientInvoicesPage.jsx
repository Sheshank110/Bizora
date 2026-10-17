import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { IconFileText, IconEye } from '@tabler/icons-react';
import { Button, Badge, Spinner } from '../../components/ui';
import clientPortalService from '../../services/clientPortalService';
import { MOCK_INVOICES } from '../../data/mockData';

const statusVariants = {
  DRAFT: 'default',
  SENT: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'default',
};

const ClientInvoicesPage = () => {
  const { data: invoicesRes, isLoading } = useQuery({
    queryKey: ['client-invoices'],
    queryFn: () => clientPortalService.getInvoices(),
  });

  const invoices = (invoicesRes?.data && invoicesRes.data.length > 0) ? invoicesRes.data : MOCK_INVOICES.slice(0, 2);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Invoices & Statements</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Review itemized invoices, payment receipts, and balance statements
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconFileText size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No invoices issued</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Invoices issued for your project contracts and retainers will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue date</th>
                <th className="py-3 px-4">Due date</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Statement</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id || inv.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                    {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)] font-mono">
                    ${(inv.total || 0).toLocaleString()}
                    {inv.amountDue > 0 && inv.status !== 'PAID' && (
                      <span className="block text-[11px] font-normal text-[var(--text-muted)]">
                        Due: ${inv.amountDue.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariants[inv.status] || 'default'} size="sm">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/app/invoices/${inv._id || inv.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs" leftIcon={IconEye}>
                        View / Print PDF
                      </Button>
                    </Link>
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

export default ClientInvoicesPage;
