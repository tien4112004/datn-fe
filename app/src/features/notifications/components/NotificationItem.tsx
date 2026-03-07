import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  MessageSquare,
  GraduationCap,
  Megaphone,
  Clock,
  Settings,
  ClipboardList,
  Presentation,
  Network,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { cn } from '@/shared/lib/utils';
import type { AppNotification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: AppNotification;
  onClick?: (notification: AppNotification) => void;
  compact?: boolean;
}

const typeIcons: Record<NotificationType, React.ElementType> = {
  POST: FileText,
  ASSIGNMENT: ClipboardList,
  COMMENT: MessageSquare,
  GRADE: GraduationCap,
  ANNOUNCEMENT: Megaphone,
  REMINDER: Clock,
  SYSTEM: Settings,
  SHARED_PRESENTATION: Presentation,
  SHARED_MINDMAP: Network,
};

const typeColors: Record<NotificationType, string> = {
  POST: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  ASSIGNMENT: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  COMMENT: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  GRADE: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  ANNOUNCEMENT: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  REMINDER: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  SYSTEM: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30',
  SHARED_PRESENTATION: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
  SHARED_MINDMAP: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
};

export function NotificationItem({ notification, onClick, compact = false }: NotificationItemProps) {
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
        {notification.body &&
          (compact ? (
            <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{notification.body}</p>
          ) : (
            <div className="text-muted-foreground mt-0.5 text-xs [&_em]:italic [&_h1]:mb-0.5 [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:mb-0.5 [&_h2]:text-xs [&_h2]:font-semibold [&_h3]:mb-0.5 [&_h3]:text-xs [&_h3]:font-medium [&_p]:mb-0.5 [&_p]:last:mb-0 [&_strong]:font-semibold">
              <ReactMarkdown allowedElements={['h1', 'h2', 'h3', 'p', 'strong', 'em', 'br']} unwrapDisallowed>
                {notification.body}
              </ReactMarkdown>
            </div>
          ))}
        <p className="text-muted-foreground mt-1 text-xs">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: getLocaleDateFns(),
          })}
        </p>
      </div>
    </div>
  );
}
