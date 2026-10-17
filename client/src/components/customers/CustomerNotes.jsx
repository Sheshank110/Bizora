import { useState } from 'react';
import { IconSend, IconTrash, IconMessage, IconClock } from '@tabler/icons-react';
import { Button, Avatar } from '../ui';
import useAuthStore from '../../store/authStore';

export const CustomerNotes = ({
  notes = [],
  onAddNote,
  onDeleteNote,
  isAddingNote = false,
  canAdd = true,
}) => {
  const [content, setContent] = useState('');
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onAddNote(content.trim());
    setContent('');
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Box */}
      {canAdd && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-lg bg-[var(--surface-primary)] space-y-3"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <IconMessage size={16} stroke={1.75} className="text-[#2563EB]" />
            <span>Add Customer Note</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Log call summary, client preference, follow-up item..."
            className="w-full p-3 text-sm rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors resize-none"
            maxLength={2000}
          />

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{content.length}/2000 characters</span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isAddingNote}
              disabled={isAddingNote || !content.trim()}
              leftIcon={IconSend}
            >
              Log Note
            </Button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-2.5">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--surface-primary)] rounded-lg">
            No notes logged for this customer yet.
          </div>
        ) : (
          notes.map((note) => {
            const author = note.authorId;
            const authorName = author
              ? `${author.firstName} ${author.lastName}`.trim()
              : 'Team Member';

            return (
              <div
                key={note._id || note.id}
                className="p-3.5 rounded-lg bg-[var(--surface-primary)] space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={authorName} size="xs" src={author?.avatar} />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {authorName}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <IconClock size={12} stroke={1.75} />
                      {formatDate(note.createdAt)}
                    </span>
                  </div>

                  {onDeleteNote && (
                    <button
                      onClick={() => onDeleteNote(note._id || note.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity rounded"
                      title="Delete note"
                    >
                      <IconTrash size={14} stroke={1.75} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed pl-6">
                  {note.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomerNotes;
