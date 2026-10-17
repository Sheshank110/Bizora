import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IconPackage,
  IconPlus,
  IconSearch,
  IconArrowsSort,
  IconEye,
} from '@tabler/icons-react';
import { Button, Input, Select, Badge, Modal, Spinner } from '../../components/ui';
import inventoryService from '../../services/inventoryService';
import { useAuthStore } from '../../store/authStore';
import { MOCK_INVENTORY } from '../../data/mockData';

const InventoryPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [createFormData, setCreateFormData] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    description: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: 10,
    minimumStock: 5,
    location: 'Warehouse A',
  });

  const [adjustFormData, setAdjustFormData] = useState({
    type: 'ADJUSTMENT',
    quantity: 1,
    notes: 'Regular stock count adjustment',
  });

  const { data: inventoryRes, isLoading } = useQuery({
    queryKey: ['inventory', currentBusiness?._id || currentBusiness?.id, search, statusFilter],
    queryFn: () => inventoryService.getItems({
      search,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const createItemMutation = useMutation({
    mutationFn: inventoryService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: '',
        sku: '',
        category: 'Hardware',
        description: '',
        costPrice: '',
        sellingPrice: '',
        stockQuantity: 10,
        minimumStock: 5,
        location: 'Warehouse A',
      });
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryService.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsAdjustModalOpen(false);
      setSelectedItem(null);
    },
  });

  const items = (inventoryRes?.data && inventoryRes.data.length > 0) ? inventoryRes.data : MOCK_INVENTORY;

  const totalValue = items.reduce((acc, it) => acc + (it.stockQuantity * (it.sellingPrice || 0)), 0);
  const lowStockCount = items.filter((it) => it.stockQuantity <= it.minimumStock && it.stockQuantity > 0).length;
  const outOfStockCount = items.filter((it) => it.stockQuantity <= 0).length;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createFormData.name.trim() || !createFormData.sku.trim()) return;
    createItemMutation.mutate({
      ...createFormData,
      costPrice: Number(createFormData.costPrice) || 0,
      sellingPrice: Number(createFormData.sellingPrice) || 0,
      stockQuantity: Number(createFormData.stockQuantity) || 0,
      minimumStock: Number(createFormData.minimumStock) || 0,
    });
  };

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustFormData({
      type: 'ADJUSTMENT',
      quantity: 1,
      notes: 'Inventory adjustment',
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    adjustStockMutation.mutate({
      id: selectedItem._id || selectedItem.id,
      data: {
        type: adjustFormData.type,
        quantity: Number(adjustFormData.quantity) || 0,
        notes: adjustFormData.notes,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Inventory</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage SKU tracking, warehouse stock counts, and replenishment thresholds
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} leftIcon={IconPlus}>
          Add inventory item
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Total inventory value</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">${totalValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Tracked SKUs</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{items.length}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Low stock alerts</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{lowStockCount}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Out of stock</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, or category..."
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 text-xs"
        >
          <option value="ALL">All items</option>
          <option value="LOW_STOCK">Low stock only</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </Select>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconPackage size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No inventory items found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Track components, equipment, and retail items with threshold alerts and stock logs.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isOutOfStock = item.stockQuantity <= 0;
                const isLowStock = !isOutOfStock && item.stockQuantity <= item.minimumStock;

                return (
                  <tr key={item._id || item.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/app/inventory/${item._id || item.id}`} className="font-semibold text-[var(--text-primary)] hover:text-[#2563EB]">
                        {item.name}
                      </Link>
                      <span className="block font-mono text-[11px] text-[var(--text-muted)]">
                        SKU: {item.sku}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      {item.category || 'General'}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[var(--text-primary)] font-mono">
                      {item.stockQuantity}
                      <span className="text-[11px] font-normal text-[var(--text-muted)] ml-1">
                        (min: {item.minimumStock})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)] font-mono">
                      ${(item.costPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)] font-mono">
                      ${(item.sellingPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <Badge variant="danger" size="sm">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning" size="sm">Low Stock</Badge>
                      ) : (
                        <Badge variant="success" size="sm">In Stock</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAdjust(item)}
                          className="text-xs"
                          leftIcon={IconArrowsSort}
                        >
                          Adjust
                        </Button>
                        <Link to={`/app/inventory/${item._id || item.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View History">
                            <IconEye size={15} stroke={1.75} />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Item Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Inventory Item">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Product name *</label>
              <Input
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="e.g. Wireless Router Pro"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">SKU *</label>
              <Input
                value={createFormData.sku}
                onChange={(e) => setCreateFormData({ ...createFormData, sku: e.target.value })}
                placeholder="e.g. HW-RTR-001"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category</label>
              <Input
                value={createFormData.category}
                onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                placeholder="e.g. Hardware"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Location / Bin</label>
              <Input
                value={createFormData.location}
                onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                placeholder="e.g. Shelf B2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Cost price ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={createFormData.costPrice}
                onChange={(e) => setCreateFormData({ ...createFormData, costPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Selling price ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={createFormData.sellingPrice}
                onChange={(e) => setCreateFormData({ ...createFormData, sellingPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Initial stock</label>
              <Input
                type="number"
                min="0"
                value={createFormData.stockQuantity}
                onChange={(e) => setCreateFormData({ ...createFormData, stockQuantity: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Min threshold</label>
              <Input
                type="number"
                min="0"
                value={createFormData.minimumStock}
                onChange={(e) => setCreateFormData({ ...createFormData, minimumStock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={createItemMutation.isPending}>Add item</Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={`Adjust Stock: ${selectedItem?.name || ''}`}>
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Transaction type</label>
            <Select
              value={adjustFormData.type}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, type: e.target.value })}
            >
              <option value="PURCHASE">Purchase (Addition)</option>
              <option value="SALE">Sale (Reduction)</option>
              <option value="ADJUSTMENT">Adjustment (Count correction)</option>
              <option value="RETURN">Return (Addition)</option>
              <option value="DAMAGE">Damaged / Written off</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Quantity delta (+/-) *
            </label>
            <Input
              type="number"
              value={adjustFormData.quantity}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, quantity: e.target.value })}
              required
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Current stock: <span className="font-semibold text-[var(--text-primary)] font-mono">{selectedItem?.stockQuantity || 0}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Reason / Notes</label>
            <Input
              value={adjustFormData.notes}
              onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
              placeholder="e.g. Quarterly physical count audit"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={adjustStockMutation.isPending}>Save adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
