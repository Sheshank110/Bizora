import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconFolder,
  IconPlus,
  IconSearch,
  IconFileText,
  IconPhoto,
  IconCode,
  IconFile,
  IconTrash,
  IconExternalLink,
} from '@tabler/icons-react';
import { Button, Input, Select, Modal, Spinner } from '../../components/ui';
import fileService from '../../services/fileService';
import { useAuthStore } from '../../store/authStore';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileIcon = (mimeType) => {
  if (!mimeType) return IconFile;
  if (mimeType.includes('image')) return IconPhoto;
  if (mimeType.includes('pdf') || mimeType.includes('text')) return IconFileText;
  if (mimeType.includes('json') || mimeType.includes('javascript')) return IconCode;
  return IconFile;
};

const FilesPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    filename: '',
    mimeType: 'application/pdf',
    size: 245000,
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
    entityType: 'General',
  });

  const { data: filesRes, isLoading } = useQuery({
    queryKey: ['files', currentBusiness?._id || currentBusiness?.id, search, entityFilter],
    queryFn: () => fileService.getFiles({
      search,
      entityType: entityFilter === 'ALL' ? undefined : entityFilter,
    }),
  });

  const uploadMutation = useMutation({
    mutationFn: fileService.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setIsUploadModalOpen(false);
      setFormData({
        filename: '',
        mimeType: 'application/pdf',
        size: 245000,
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        entityType: 'General',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });

  const files = filesRes?.data || [];
  const totalStorage = files.reduce((acc, f) => acc + (f.size || 0), 0);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!formData.filename.trim()) return;
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Files & Documents</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Cloud storage repository for contracts, attachments, and project deliverables
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsUploadModalOpen(true)} leftIcon={IconPlus}>
          Upload file
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Total storage used</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{formatBytes(totalStorage)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Stored files</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 font-mono">{files.length}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Storage system</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">Cloud Secure</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch size={16} stroke={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name..."
            className="pl-9"
          />
        </div>

        <Select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="w-full sm:w-44 text-xs"
        >
          <option value="ALL">All categories</option>
          <option value="Project">Project files</option>
          <option value="Invoice">Invoices / PDFs</option>
          <option value="Customer">Customer contracts</option>
          <option value="Expense">Expense receipts</option>
          <option value="General">General assets</option>
        </Select>
      </div>

      {/* Files List Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconFolder size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No files stored</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Upload documents, specifications, or brand assets to share securely with team members.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--surface-primary)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-transparent text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Size</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const Icon = getFileIcon(file.mimeType);

                return (
                  <tr key={file._id || file.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} stroke={1.75} className="text-[#2563EB] shrink-0" />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{file.filename}</p>
                          <span className="text-[11px] text-[var(--text-muted)]">{file.mimeType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)]">
                        {file.entityType || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-[var(--text-muted)] text-right">
                      {formatBytes(file.size)}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            title="Open link"
                          >
                            <IconExternalLink size={15} stroke={1.75} />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-7 w-7 text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            if (window.confirm(`Delete file "${file.filename}"?`)) {
                              deleteMutation.mutate(file._id || file.id);
                            }
                          }}
                          title="Delete file"
                        >
                          <IconTrash size={15} stroke={1.75} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File to Drive">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Filename *</label>
            <Input
              value={formData.filename}
              onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
              placeholder="e.g. Master_Services_Agreement_2026.pdf"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category / Entity</label>
              <Select
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
              >
                <option value="General">General File</option>
                <option value="Project">Project Asset</option>
                <option value="Invoice">Invoice / PDF</option>
                <option value="Customer">Customer Contract</option>
                <option value="Expense">Expense Receipt</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">File Type</label>
              <Select
                value={formData.mimeType}
                onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
              >
                <option value="application/pdf">PDF Document (.pdf)</option>
                <option value="image/png">PNG Image (.png)</option>
                <option value="image/jpeg">JPEG Image (.jpg)</option>
                <option value="text/plain">Plain Text (.txt)</option>
                <option value="application/json">Data File (.json)</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">File URL / Storage Link</label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://cloud-storage.com/..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={uploadMutation.isPending}>Upload record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FilesPage;
