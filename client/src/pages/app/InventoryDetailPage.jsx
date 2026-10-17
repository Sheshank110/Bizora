import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconArrowLeft,
  IconArrowsSort,
  IconHistory,
} from '@tabler/icons-react';
import { Button, Badge, Spinner, Modal, Input, Select, Alert } from '../../components/ui';
import inventoryService from '../../services/inventoryService';

const InventoryDetailPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustFormData, setAdjustFormData] = useState({
    type: 'ADJUSTMENT',
    quantity: 1,
    notes: 'Count reconciliation',
  });

  const { data: itemRes, isLoading: isLoadingItem } = useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: () => inventoryService.getItem(itemId),
  });

  const { data: txRes, isLoading: isLoadingTx } = useQuery({
    queryKey: ['inventory-transactions', itemId],
    queryFn: () => inventoryService.getItemTransactions(itemId),
  });

  const adjustStockMutation = useMutation({
    mutationFn: (data) => inventoryService.adjustStock(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions', itemId] });
      setIsAdjustModalOpen(false);
    },
  });

  const item = itemRes?.data;
  const transactions = txRes?.data || [];

  if (isLoadingItem && !item) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-4">
        <Alert variant="danger">Item not found or access denied.</Alert>
        <Button variant="secondary" size="sm" onClick={() => navigate('/app/inventory')} leftIcon={IconArrowLeft}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  const isOutOfStock = item.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && item.stockQuantity <= item.minimumStock;
  const margin = item.sellingPrice > 0
    ? (((item.sellingPrice - (item.costPrice || 0)) / item.sellingPrice) * 100).toFixed(1)
    : 0;

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    adjustStockMutation.mutate({
      type: adjustFormData.type,
      quantity: Number(adjustFormData.quantity) || 0,
      notes: adjustFormData.notes,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/inventory')} leftIcon={IconArrowLeft}>
            Inventory
          </Button>
          <span className="text-[var(--text-muted)]">/</span>
          <h1 className="text-base font-semibold text-[var(--text-primary)]">
            {item.name}
          </h1>
          <span className="font-mono text-xs text-[var(--text-muted)]">SKU: {item.sku}</span>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAdjustModalOpen(true)} leftIcon={IconArrowsSort}>
          Adjust stock
        </Button>
      </div>

      {/* Grid: Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Current stock</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{item.stockQuantity}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Min threshold: {item.minimumStock}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Selling price</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">${(item.sellingPrice || 0).toFixed(2)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Cost: ${(item.costPrice || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Gross margin</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{margin}%</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Category: {item.category || 'General'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Stock status</p>
          <div className="mt-2">
            {isOutOfStock ? (
              <Badge variant="danger">Out of Stock</Badge>
            ) : isLowStock ? (
              <Badge variant="warning">Low Stock</Badge>
            ) : (
              <Badge variant="success">Optimal</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Audit Trail / Stock Transactions History */}
      <div className="bg-[var(--surface-primary)] rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <IconHistory size={16} stroke={1.75} className="text-[#2563EB]" />
            <span>Stock Audit Trail</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">{transactions.length} record(s)</span>
        </div>

        {isLoadingTx ? (
          <div className="py-12 flex justify-center"><Spinner size="sm" /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">
            No stock transactions recorded yet for this item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Delta</th>
                  <th className="py-2.5 px-3 text-right">Stock before</th>
                  <th className="py-2.5 px-3 text-right">Stock after</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id || tx.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-2.5 px-3 text-[var(--text-muted)]">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] font-medium text-[11px] text-[var(--text-secondary)]">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium font-mono text-[var(--text-primary)]">
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--text-muted)] font-mono">{tx.previousStock ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-[var(--text-primary)] font-mono">{tx.newStock ?? '—'}</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">{tx.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Adjust Stock Quantity">
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Transaction type</label>
            <Select
              value={adjustFormData.type}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, type: e.target.value })}
            >
              <option value="PURCHASE">Purchase (+)</option>
              <option value="SALE">Sale (-)</option>
              <option value="ADJUSTMENT">Adjustment (+/-)</option>
              <option value="RETURN">Return (+)</option>
              <option value="DAMAGE">Damaged (-)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Quantity delta (e.g. 5 or -2) *
            </label>
            <Input
              type="number"
              value={adjustFormData.quantity}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, quantity: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Reason / Notes *</label>
            <Input
              value={adjustFormData.notes}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={adjustStockMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryDetailPage;
