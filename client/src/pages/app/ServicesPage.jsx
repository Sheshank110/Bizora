import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconBriefcase,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconClock,
} from '@tabler/icons-react';
import { Button, Input, Select, Badge, Modal, Spinner } from '../../components/ui';
import serviceService from '../../services/serviceService';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'Consulting', 'Support', 'Other'];

const ServicesPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Development',
    price: '',
    duration: '1 week',
    tax: 0,
    status: 'ACTIVE',
  });

  const { data: servicesRes, isLoading } = useQuery({
    queryKey: ['services', currentBusiness?._id || currentBusiness?.id, search, selectedCategory, statusFilter],
    queryFn: () => serviceService.getServices({
      search,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const createServiceMutation = useMutation({
    mutationFn: serviceService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeModal();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => serviceService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeModal();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: serviceService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const services = servicesRes?.data || [];

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: 'Development',
      price: '',
      duration: '1 week',
      tax: 0,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category || 'Development',
      price: service.price,
      duration: service.duration || '',
      tax: service.tax || 0,
      status: service.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      tax: Number(formData.tax) || 0,
    };

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService._id || editingService.id,
        data: payload,
      });
    } else {
      createServiceMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Services Catalog</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Standard service packages, rates, and project scopes
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal} leftIcon={IconPlus}>
          Add service
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services by title or description..."
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 text-xs"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        {/* Category Pills */}
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

      {/* Service Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconBriefcase size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No services found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Create standard service packages to attach directly to invoices and project scopes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service._id || service.id} className="bg-[var(--surface-primary)] p-5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                    {service.category || 'General'}
                  </span>
                  <Badge variant={service.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                    {service.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {service.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-3 leading-relaxed">
                  {service.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-transparent space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Price</p>
                    <p className="text-base font-bold text-[var(--text-primary)] font-mono">
                      ${(service.price || 0).toLocaleString()}
                      <span className="text-xs font-normal text-[var(--text-muted)]"> {service.currency || 'USD'}</span>
                    </p>
                  </div>

                  {service.duration && (
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Duration</p>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 justify-end mt-0.5">
                        <IconClock size={12} stroke={1.75} className="text-[var(--text-muted)]" /> {service.duration}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(service)}
                    className="text-xs"
                    leftIcon={IconEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Delete service "${service.name}"?`)) {
                        deleteServiceMutation.mutate(service._id || service.id);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700"
                    leftIcon={IconTrash}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Service name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Full-Stack Web App Development"
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
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Support">Support</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Standard price ($) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Duration / Timeline</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 2 weeks"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deliverables included, expectations, terms"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={closeModal}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={createServiceMutation.isPending || updateServiceMutation.isPending}
            >
              {editingService ? 'Save changes' : 'Create service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServicesPage;
