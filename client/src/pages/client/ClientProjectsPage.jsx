import { useQuery } from '@tanstack/react-query';
import { IconFolder, IconCalendar } from '@tabler/icons-react';
import { Badge, Spinner } from '../../components/ui';
import clientPortalService from '../../services/clientPortalService';

const statusVariants = {
  PLANNING: 'default',
  ACTIVE: 'info',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const ClientProjectsPage = () => {
  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['client-projects'],
    queryFn: () => clientPortalService.getProjects(),
  });

  const projects = projectsRes?.data || [];

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">My Projects</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Projects currently active or completed for your organization
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconFolder size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No active projects</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Once your project scope is initiated by the team, live milestones and updates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const progress = p.progress || 0;

            return (
              <div key={p._id || p.id} className="bg-[var(--surface-primary)] p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</h3>
                    <Badge variant={statusVariants[p.status] || 'default'} size="sm">
                      {p.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4 leading-relaxed">
                    {p.description || 'Deliverables and scope managed by the project team.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-transparent space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">Progress</span>
                      <span className="font-medium text-[var(--text-primary)] font-mono">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {p.endDate && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <IconCalendar size={13} stroke={1.75} />
                      <span>Target Delivery: {new Date(p.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProjectsPage;
