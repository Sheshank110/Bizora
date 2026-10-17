import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconPlus,
  IconSearch,
  IconLayoutKanban,
  IconList,
  IconChevronRight,
  IconCheck,
} from '@tabler/icons-react';
import { Button, Input, Select, Modal, Spinner, Badge, EmptyState } from '../../components/ui';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { useAuthStore } from '../../store/authStore';

const COLUMNS = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'DONE', label: 'Completed' },
];

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const TasksPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const { data: tasksRes, isLoading } = useQuery({
    queryKey: ['tasks', currentBusiness?._id || currentBusiness?.id, search, projectFilter, priorityFilter],
    queryFn: () => taskService.getTasks({
      search,
      projectId: projectFilter || undefined,
      priority: priorityFilter || undefined,
    }),
  });

  const { data: projectsRes } = useQuery({
    queryKey: ['projects-list-selector', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => projectService.getProjects({ limit: 50 }),
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', projectId: '', priority: 'MEDIUM', dueDate: '' });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const tasks = tasksRes?.data || [];
  const projects = projectsRes?.data || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    createTaskMutation.mutate({
      ...formData,
      projectId: formData.projectId || undefined,
    });
  };

  const moveStatus = (task, newStatus) => {
    updateTaskStatusMutation.mutate({
      id: task._id || task.id,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Tasks &amp; Kanban
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Deliverable throughput and execution pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="p-1 rounded-md bg-[var(--surface-secondary)] inline-flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[var(--surface-primary)] text-[var(--text-primary)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Kanban view"
            >
              <IconLayoutKanban className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--surface-primary)] text-[var(--text-primary)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="List view"
            >
              <IconList className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            New Task
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar: Filled, NO container borders */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-[var(--text-muted)]">Loading tasks...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD: Clean monochrome columns with NO container borders */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div key={col.id} className="p-3 rounded-lg bg-[var(--surface-secondary)] space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    {col.label}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      /* Task Card: Contains only Task Name, Assignee, Priority, Due Date. NO decorative icon blocks, NO giant shadows */
                      <div
                        key={task._id || task.id}
                        className="p-3 rounded bg-[var(--surface-primary)] hover:bg-[#EFEFEF] dark:hover:bg-[#181818] transition-colors space-y-2 select-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-xs text-[var(--text-primary)] leading-snug">
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                          <span>{task.assignedTo?.name || task.assignedToName || 'Unassigned'}</span>
                          <span>{task.dueDate || 'No due date'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-transparent text-[11px]">
                          <span className="font-medium text-[var(--text-muted)]">
                            {priorityLabels[task.priority] || task.priority}
                          </span>

                          {/* Quick advance status */}
                          {col.id !== 'DONE' && (
                            <button
                              onClick={() => {
                                const order = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
                                const nextIndex = order.indexOf(col.id) + 1;
                                if (nextIndex < order.length) {
                                  moveStatus(task, order[nextIndex]);
                                }
                              }}
                              className="text-[10px] text-[#2563EB] hover:underline inline-flex items-center"
                            >
                              Advance <IconChevronRight className="w-3 h-3 stroke-[2]" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to track operational deliverables and assignments."
          action={() => setIsModalOpen(true)}
          actionLabel="New Task"
          className="bg-[var(--surface-secondary)] rounded-lg py-16"
        />
      ) : (
        /* LIST VIEW: Clean table */
        <div className="p-2 rounded-lg bg-[var(--surface-secondary)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-2.5 px-3">Task Name</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {tasks.map((task) => (
                <tr key={task._id || task.id} className="hover:bg-[var(--surface-primary)] transition-colors">
                  <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                    {task.title}
                  </td>
                  <td className="py-3 px-3">
                    {task.assignedTo?.name || task.assignedToName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[var(--text-secondary)] font-medium">
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {task.dueDate || '—'}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                      size="xs"
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Task"
          description="Add a deliverable to your operational pipeline."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Task Title"
              placeholder="e.g. Security audit and compliance review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Project Linkage
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">None (Independent task)</option>
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={createTaskMutation.isPending}>
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TasksPage;
