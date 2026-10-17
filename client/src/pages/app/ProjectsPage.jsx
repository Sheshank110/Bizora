import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IconPlus,
  IconSearch,
  IconFolder,
  IconArrowRight,
  IconCheck,
} from '@tabler/icons-react';
import { Button, Input, Modal, Badge, Spinner } from '../../components/ui';
import projectService from '../../services/projectService';
import customerService from '../../services/customerService';
import { useAuthStore } from '../../store/authStore';
import { MOCK_PROJECTS } from '../../data/mockData';

const ProjectsPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerId: '',
    budget: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', currentBusiness?._id || currentBusiness?.id, search, statusFilter],
    queryFn: () => projectService.getProjects({ search, status: statusFilter }),
    staleTime: 10000,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-list-selector', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => customerService.getCustomers({ limit: 50 }),
  });

  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', customerId: '', budget: '', priority: 'MEDIUM', status: 'ACTIVE' });
    },
  });

  const projects = (projectsData?.data && projectsData.data.length > 0) ? projectsData.data : MOCK_PROJECTS;
  const customers = customersData?.data || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createProjectMutation.mutate({
      ...formData,
      budget: Number(formData.budget) || 0,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Projects
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Client initiatives, budgets, milestones, and progress tracking.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar: Filled, NO borders */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search projects by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNING">Planning</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects List: Clean table or card list without nested cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-[var(--text-muted)]">Loading projects...</p>
        </div>
      ) : (
        <div className="p-2 rounded-lg bg-[var(--surface-secondary)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Budget</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                {projects.map((proj) => (
                  <tr
                    key={proj._id || proj.id}
                    className="hover:bg-[var(--surface-primary)] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <Link
                        to={`/app/projects/${proj._id || proj.id}`}
                        className="font-semibold text-sm text-[var(--text-primary)] hover:text-[#2563EB] block truncate"
                      >
                        {proj.name}
                      </Link>
                      {proj.description && (
                        <span className="text-[11px] text-[var(--text-muted)] block truncate max-w-sm">
                          {proj.description}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                      {proj.customerName || proj.customer?.name || proj.clientName || 'Direct Engagement'}
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        variant={proj.status === 'COMPLETED' ? 'success' : proj.status === 'ACTIVE' ? 'primary' : 'default'}
                        size="xs"
                      >
                        {proj.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--text-primary)]">
                      ${Number(proj.budget || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-[#EFEFEF] dark:bg-[#181818] overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full"
                            style={{ width: `${Math.min(100, proj.progress || 60)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {proj.progress || 60}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/app/projects/${proj._id || proj.id}`}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-[#2563EB] inline-flex items-center"
                      >
                        <IconArrowRight className="w-4 h-4 stroke-[1.75]" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Project"
          description="Initialize a new client engagement."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Project Name"
              placeholder="e.g. Enterprise Portal Modernization"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Linked Customer
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Select customer (optional)</option>
                {customers.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Budget (USD)"
                type="number"
                placeholder="25000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PLANNING">Planning</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={createProjectMutation.isPending}>
                Create Project
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsPage;
