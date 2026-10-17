import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconBell,
  IconCheck,
  IconChecks,
  IconClock,
  IconAlertTriangle,
  IconCreditCard,
  IconFileText,
  IconChecklist,
  IconPackage,
  IconUserPlus,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Button, Badge, Spinner } from '../../components/ui';
import notificationService from '../../services/notificationService';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';

const iconMap = {
  TASK_ASSIGNED: IconChecklist,
  TASK_DUE_SOON: IconClock,
  INVOICE_SENT: IconFileText,
  INVOICE_OVERDUE: IconAlertTriangle,
  PAYMENT_RECEIVED: IconCreditCard,
  LOW_STOCK: IconPackage,
  PROJECT_UPDATED: IconInfoCircle,
  EMPLOYEE_INVITED: IconUserPlus,
};

const NotificationsPage = () => {
  const { currentBusiness } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notificationsRes, isLoading } = useQuery({
    queryKey: ['notifications', currentBusiness?._id || currentBusiness?.id],
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('payment:received', handleNewNotification);
    socket.on('task:assigned', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('payment:received', handleNewNotification);
      socket.off('task:assigned', handleNewNotification);
    };
  }, [queryClient]);

  const notifications = notificationsRes?.data || [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="brand" size="sm">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Operational activity stream and alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            loading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            leftIcon={IconChecks}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-primary)] rounded-lg p-8">
          <IconBell size={32} stroke={1.5} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No notifications</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            You are all caught up! Real-time workspace alerts will appear here as events happen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || IconBell;
            const isUnread = !n.readAt;

            return (
              <div
                key={n._id || n.id}
                className={`p-4 rounded-lg bg-[var(--surface-primary)] flex items-start gap-3 transition-colors ${
                  isUnread ? 'bg-[var(--surface-secondary)]' : 'opacity-80'
                }`}
              >
                <div className="mt-0.5 text-[var(--text-muted)] shrink-0">
                  <Icon size={18} stroke={1.75} className={isUnread ? 'text-[#2563EB]' : ''} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs font-semibold ${isUnread ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-mono">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 p-1 h-7 w-7"
                    title="Mark as read"
                    onClick={() => markReadMutation.mutate(n._id || n.id)}
                  >
                    <IconCheck size={14} stroke={2} />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
