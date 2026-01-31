import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '../hooks/useApi';
import { NotificationItem } from './NotificationItem';
import type { AppNotification } from '../types';

interface NotificationDropdownProps {
  onClose?: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { t } = useTranslation('notifications', { keyPrefix: 'dropdown' });
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications(0, 5);
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type and referenceId
    if (notification.referenceId) {
      switch (notification.type) {
        case 'POST':
        case 'ANNOUNCEMENT':
          navigate(`/classes/${notification.referenceId}`);
          break;
        case 'ASSIGNMENT':
        case 'GRADE':
          navigate(`/assignment/${notification.referenceId}`);
          break;
        case 'SHARED_PRESENTATION':
          navigate(`/presentation/${notification.referenceId}`);
          break;
        case 'SHARED_MINDMAP':
          navigate(`/mindmap/${notification.referenceId}`);
          break;
        default:
          navigate('/notifications');
      }
    }
    onClose?.();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose?.();
  };

  const notifications = data?.data ?? [];
  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="w-80">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold">{t('title')}</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Check className="mr-1 h-3 w-3" />
            )}
            {t('markAllAsRead')}
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
            {t('empty')}
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      <Separator />
      <div className="p-2">
        <Button variant="ghost" className="w-full" onClick={handleViewAll}>
          {t('viewAll')}
        </Button>
      </div>
    </div>
  );
}
