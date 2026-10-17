import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconReceipt,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Input, Select, Modal, Spinner } from '../../components/ui';
import expenseService from '../../services/expenseService';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = ['All', 'Office', 'Marketing', 'Travel', 'Software', 'Equipment', 'Salary', 'Utilities', 'Other'];

const ExpensesPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Software',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const { data: expensesRes, isLoading } = useQuery({
    queryKey: ['expenses', currentBusiness?._id || currentBusiness?.id, search, selectedCategory],
    queryFn: () => expenseService.getExpenses({
      search,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
    }),
  });

  const createExpenseMutation = useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Software',
        amount: '',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const expenses = expensesRes?.data || [];
  const totalSpent = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;
    createExpenseMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Expenses</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Track business operating costs, vendor disbursements, and expenditures
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={IconPlus}>
          Log expense
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Total recorded expenses</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">${totalSpent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Recorded entries</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{expenses.length}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Active category</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{selectedCategory}</p>
        </div>
      </div>

      {/* Filter and Category Strip */}
      <div className="space-y-3">
        <div className="relative">
          <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses by title or vendor..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconReceipt size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No expenses found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Log your business operating costs, team software, and hardware expenses.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Expense title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id || exp.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                    {exp.title}
                    {exp.notes && (
                      <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{exp.notes}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                    {exp.vendor || '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                    {exp.date ? new Date(exp.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)] font-mono">
                    -${(exp.amount || 0).toLocaleString()} {exp.currency || 'USD'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="p-1 text-[var(--text-muted)] hover:text-rose-600 transition-colors rounded"
                      onClick={() => {
                        if (window.confirm(`Delete expense "${exp.title}"?`)) {
                          deleteExpenseMutation.mutate(exp._id || exp.id);
                        }
                      }}
                      title="Delete expense"
                    >
                      <IconTrash size={15} stroke={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Business Expense">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Expense title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AWS Cloud Infrastructure Bill"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Vendor / Payee</label>
              <Input
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Amazon Web Services"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Notes</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Project or invoice memo"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={createExpenseMutation.isPending}>
              Record expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
