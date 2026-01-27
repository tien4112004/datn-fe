import {
  FileText,
  MessageSquare,
  GraduationCap,
  Megaphone,
  Clock,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AppNotification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: AppNotification;
  onClick?: (notification: AppNotification) => void;
}

const typeIcons: Record<NotificationType, React.ElementType> = {
  POST: FileText,
  ASSIGNMENT: ClipboardList,
  COMMENT: MessageSquare,
  GRADE: GraduationCap,
  ANNOUNCEMENT: Megaphone,
  REMINDER: Clock,
  SYSTEM: Settings,
};

const typeColors: Record<NotificationType, string> = {
  POST: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  ASSIGNMENT: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  COMMENT: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  GRADE: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  ANNOUNCEMENT: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  REMINDER: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  SYSTEM: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Settings;
  const colorClass = typeColors[notification.type] || typeColors.SYSTEM;

  return (
    <div
      className={cn(
        'hover:bg-accent flex cursor-pointer gap-3 rounded-lg p-3 transition-colors',
        !notification.isRead && 'bg-accent/50'
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>{notification.title}</p>
          {!notification.isRead && <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />}
        </div>
        {notification.body && (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{notification.body}</p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">{formatTimeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );
}
