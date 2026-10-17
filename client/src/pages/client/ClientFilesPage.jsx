import { useQuery } from '@tanstack/react-query';
import { IconFolder, IconFileText, IconDownload } from '@tabler/icons-react';
import { Spinner } from '../../components/ui';
import clientPortalService from '../../services/clientPortalService';

const ClientFilesPage = () => {
  const { data: filesRes, isLoading } = useQuery({
    queryKey: ['client-files'],
    queryFn: () => clientPortalService.getFiles(),
  });

  const files = filesRes?.data || [];

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Documents & Assets</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Access project scopes, deliverable files, and signed agreements shared with your organization
        </p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconFolder size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No shared documents</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Files uploaded by the project team for your account will be securely listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((f) => (
            <div key={f._id || f.id} className="bg-[var(--surface-primary)] p-5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#2563EB]">
                  <IconFileText size={20} stroke={1.75} />
                  <span className="text-xs text-[var(--text-muted)]">{f.mimeType || 'Document'}</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{f.filename}</h3>
              </div>

              <div className="mt-4 pt-3 border-t border-transparent flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">
                  {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''}
                </span>
                {f.url && (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[#2563EB] hover:underline font-medium"
                  >
                    Download <IconDownload size={13} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientFilesPage;
