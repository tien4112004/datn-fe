import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';
import { useMarkAsRead } from './useApi';
import { getNotificationUrl } from '../utils';
import type { AppNotification } from '../types';

export function useNotificationNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const markAsRead = useMarkAsRead();
  const role = user?.role ?? 'teacher';

  const navigateToNotification = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    if (notification.referenceId) {
      const classId = notification.data?.classId;
      const url = getNotificationUrl(notification.type, notification.referenceId, role, classId);
      navigate(url);
    }
  };

  const getViewAllUrl = (): string => {
    return role === 'student' ? '/student/notifications' : '/notifications';
  };

  return { navigateToNotification, getViewAllUrl };
}
