import type { NotificationType } from '../types';

type UserRole = 'student' | 'teacher' | 'admin';

export function getNotificationUrl(
  type: NotificationType | string,
  referenceId: string | undefined,
  role: UserRole
): string {
  const isStudent = role === 'student';
  const prefix = isStudent ? '/student' : '';
  const notificationsPage = isStudent ? '/student/notifications' : '/notifications';

  if (!referenceId) return notificationsPage;

  switch (type) {
    case 'POST':
    case 'ANNOUNCEMENT':
      return `${prefix}/classes/${referenceId}`;
    case 'ASSIGNMENT':
    case 'GRADE':
      return isStudent ? `/student/assignments/${referenceId}/submissions` : `/assignment/${referenceId}`;
    case 'SHARED_PRESENTATION':
      return `${prefix}/presentation/${referenceId}`;
    case 'SHARED_MINDMAP':
      return `${prefix}/mindmap/${referenceId}`;
    default:
      return notificationsPage;
  }
}
