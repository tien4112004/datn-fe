import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Bell, Lock, Settings, Loader2, Check } from 'lucide-react';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Alert, AlertDescription, AlertTitle } from '@ui/alert';
import { useFCM } from '../hooks/useFCM';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '../hooks/useApi';
import { NotificationItem } from '../components/NotificationItem';
import type { AppNotification } from '../types';

export function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();
  const { isSupported, initialize } = useFCM();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useNotifications(page, pageSize);
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
  const isBlocked = permission === 'denied';
  const isGranted = permission === 'granted';

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;
  const unreadCount = unreadData?.count ?? 0;
  const hasMore = pagination ? pagination.currentPage < pagination.totalPages - 1 : false;
  const hasPrevious = page > 0;

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
      }
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Bell className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('status.title')}</CardTitle>
            <CardDescription>{t('status.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSupported ? (
              <Alert variant="destructive">
                <AlertTitle>{t('status.notSupported.title')}</AlertTitle>
                <AlertDescription>{t('status.notSupported.description')}</AlertDescription>
              </Alert>
            ) : isBlocked ? (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertTitle>{t('status.blocked.title')}</AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                  <p className="mb-2">{t('status.blocked.description')}</p>
                  <div className="bg-destructive/10 mt-2 rounded-md p-4">
                    <p className="mb-2 font-semibold">{t('status.blocked.howToUnblock')}</p>
                    <ol className="list-inside list-decimal space-y-1 text-sm">
                      <li>
                        <Trans
                          i18nKey="status.blocked.step1"
                          ns="notifications"
                          components={{ bold: <span className="font-bold" /> }}
                        />
                      </li>
                      <li>{t('status.blocked.step2')}</li>
                      <li>{t('status.blocked.step3')}</li>
                      <li>{t('status.blocked.step4')}</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            ) : isGranted ? (
              <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300">
                <Settings className="h-4 w-4" />
                <AlertTitle>{t('status.active.title')}</AlertTitle>
                <AlertDescription>{t('status.active.description')}</AlertDescription>
              </Alert>
            ) : (
              <div className="bg-muted flex flex-col items-center justify-between gap-4 rounded-lg p-4 sm:flex-row">
                <div>
                  <h3 className="font-semibold">{t('status.enable.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('status.enable.description')}</p>
                </div>
                <Button onClick={() => initialize()}>{t('status.enable.button')}</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>
                {t('list.totalNotifications', { count: pagination?.totalItems ?? 0 })}
                {unreadCount > 0 && ` ${t('list.unreadCount', { count: unreadCount })}`}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {t('list.markAllAsRead')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                {t('list.loading')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">{t('list.empty')}</div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!hasPrevious}
                >
                  {t('pagination.previous')}
                </Button>
                <span className="text-muted-foreground text-sm">
                  {t('pagination.pageOf', { current: page + 1, total: pagination.totalPages })}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
                  {t('pagination.next')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
