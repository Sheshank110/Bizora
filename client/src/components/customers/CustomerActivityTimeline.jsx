import {
  IconUserPlus,
  IconEdit,
  IconUserCheck,
  IconTag,
  IconMessage,
  IconArchive,
  IconRotateClockwise,
  IconClock,
  IconPlus,
} from '@tabler/icons-react';
import { Avatar } from '../ui';

const ACTIVITY_ICONS = {
  CREATED: { icon: IconPlus, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
  UPDATED: { icon: IconEdit, color: 'text-[var(--text-secondary)] bg-[var(--surface-secondary)]' },
  ASSIGNED: { icon: IconUserCheck, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
  STATUS_CHANGED: { icon: IconRotateClockwise, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
  NOTE_ADDED: { icon: IconMessage, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
  NOTE_DELETED: { icon: IconMessage, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
  ARCHIVED: { icon: IconArchive, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
  RESTORED: { icon: IconRotateClockwise, color: 'text-[var(--text-primary)] bg-[var(--surface-secondary)]' },
};

export const CustomerActivityTimeline = ({ activities = [] }) => {
  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getActivityTitle = (act) => {
    switch (act.type) {
      case 'CREATED':
        return 'Customer created in workspace';
      case 'ASSIGNED':
        return act.metadata?.assignedToName
          ? `Assigned to ${act.metadata.assignedToName}`
          : 'Assignment updated';
      case 'STATUS_CHANGED':
        return `Status changed from ${act.metadata?.from || '—'} to ${act.metadata?.to || '—'}`;
      case 'NOTE_ADDED':
        return 'Note logged on customer profile';
      case 'NOTE_DELETED':
        return 'Note removed from customer profile';
      case 'ARCHIVED':
        return 'Customer archived';
      case 'UPDATED':
        return 'Customer details modified';
      default:
        return 'Customer activity recorded';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--surface-primary)] rounded-lg">
        No recorded activity events for this customer yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[var(--surface-secondary)]">
      {activities.map((act) => {
        const conf = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.UPDATED;
        const IconComponent = conf.icon;
        const actorName = act.userId
          ? `${act.userId.firstName || ''} ${act.userId.lastName || ''}`.trim()
          : 'System';

        return (
          <div key={act._id || act.id} className="relative flex items-start gap-3">
            {/* Timeline icon node */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${conf.color}`}
            >
              <IconComponent size={12} stroke={2} />
            </div>

            {/* Event content */}
            <div className="flex-1 bg-[var(--surface-primary)] p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {getActivityTitle(act)}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                  {formatTime(act.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>By {actorName}</span>
              </div>

              {act.metadata?.notePreview && (
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 p-2.5 rounded-md bg-[var(--surface-secondary)] leading-relaxed italic">
                  "{act.metadata.notePreview}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerActivityTimeline;
