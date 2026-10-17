import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconArrowLeft,
  IconPlus,
  IconCheck,
  IconClock,
  IconFolder,
} from '@tabler/icons-react';
import { Button, Badge, Modal, Input, Spinner, Alert } from '../../components/ui';
import projectService from '../../services/projectService';
import taskService from '../../services/taskService';
import { useAuthStore } from '../../store/authStore';
import { MOCK_PROJECTS, MOCK_TASKS } from '../../data/mockData';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentBusiness } = useAuthStore();

  const [activeTab, setActiveTab] = useState('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const { data: projectRes, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId),
  });

  const { data: tasksRes, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => taskService.getTasks({ projectId }),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => projectService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskService.createTask({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalOpen(false);
      setTaskFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    },
  });

  const fallbackProject = MOCK_PROJECTS.find((p) => p._id === projectId || p.id === projectId) || MOCK_PROJECTS[0];
  const project = projectRes?.data || fallbackProject;
  const tasks = (tasksRes?.data && tasksRes.data.length > 0) ? tasksRes.data : MOCK_TASKS.slice(0, 4);

  if (isLoadingProject && !project) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2">
        <Spinner size="md" />
        <p className="text-xs text-[var(--text-muted)]">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <Alert variant="danger">Failed to load project or project not found.</Alert>
        <Button variant="secondary" onClick={() => navigate('/app/projects')}>
          <IconArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : (project.progress || 0);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;
    createTaskMutation.mutate(taskFormData);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/app/projects"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4 stroke-[1.75]" />
          <span>Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <select
            value={project.status}
            onChange={(e) => updateProjectMutation.mutate({ status: e.target.value })}
            className="px-2.5 py-1 text-xs rounded bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Project Statement: Section 19 layout */}
      <div className="p-6 rounded-lg bg-[var(--surface-secondary)] space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {project.name}
        </h1>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] flex-wrap">
          <span>{project.customerName || project.customer?.name || 'Direct Client'}</span>
          <span>&bull;</span>
          <span className="capitalize">{project.status?.toLowerCase()}</span>
          <span>&bull;</span>
          <span>Due {project.dueDate || 'Flexible'}</span>
          <span>&bull;</span>
          <span className="font-mono text-[var(--text-primary)]">${Number(project.budget || 0).toLocaleString()}</span>
        </div>

        {project.description && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl pt-2">
            {project.description}
          </p>
        )}

        {/* Progress meter */}
        <div className="pt-3 max-w-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Overall Completion</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">{taskProgress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--surface-primary)] overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section Tabs: Tasks, Overview, Activity */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Scope &amp; Deliverables
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === 'tasks' && (
          <div className="p-5 rounded-lg bg-[var(--surface-secondary)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Project Tasks &amp; Milestones
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {completedTasks} of {tasks.length} tasks completed
                </p>
              </div>

              <Button variant="primary" size="sm" onClick={() => setIsTaskModalOpen(true)}>
                Add Task
              </Button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task._id || task.id}
                  className="p-3 rounded bg-[var(--surface-primary)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className={`font-medium block truncate ${task.status === 'DONE' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                      {task.title}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                      {task.assignedToName || 'Unassigned'} &bull; Due {task.dueDate || 'Soon'}
                    </span>
                  </div>

                  <Badge variant={task.status === 'DONE' ? 'success' : 'default'} size="xs" className="shrink-0">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Scope & Overview */}
        {activeTab === 'overview' && (
          <div className="p-5 rounded-lg bg-[var(--surface-secondary)] space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Engagement Terms &amp; Scope
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[var(--text-secondary)]">
              <div>
                <span className="text-[var(--text-muted)] block">Target Milestone</span>
                <span className="font-medium text-[var(--text-primary)] mt-0.5 block">
                  Phase 1 Release Deliverable
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Invoice Strategy</span>
                <span className="font-medium text-[var(--text-primary)] mt-0.5 block">
                  Net-30 Milestone Scheduled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Add Deliverable"
          description={`Add a task to ${project.name}`}
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Task Title"
              placeholder="e.g. Complete sprint testing"
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Priority
                </label>
                <select
                  value={taskFormData.priority}
                  onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
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
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsTaskModalOpen(false)}>
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

export default ProjectDetailPage;
