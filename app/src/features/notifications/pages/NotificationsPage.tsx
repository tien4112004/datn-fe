import { useState } from 'react';
import { Bell, Lock, Settings, Loader2, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { useFCM } from '../hooks/useFCM';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '../hooks/useApi';
import { NotificationItem } from '../components/NotificationItem';
import type { AppNotification } from '../types';

export function NotificationsPage() {
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
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Bell className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Status</CardTitle>
            <CardDescription>
              Manage how you receive updates about class activities and assignments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSupported ? (
              <Alert variant="destructive">
                <AlertTitle>Not Supported</AlertTitle>
                <AlertDescription>
                  Your browser does not support push notifications. Please try using a modern browser like
                  Chrome, Firefox, or Edge.
                </AlertDescription>
              </Alert>
            ) : isBlocked ? (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertTitle>Notifications are Blocked</AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                  <p className="mb-2">
                    We cannot send you updates because notifications are blocked in your browser settings.
                  </p>
                  <div className="bg-destructive/10 mt-2 rounded-md p-4">
                    <p className="mb-2 font-semibold">How to unblock:</p>
                    <ol className="list-inside list-decimal space-y-1 text-sm">
                      <li>
                        Click the <span className="font-bold">Lock icons</span> or{' '}
                        <span className="font-bold">Settings icon</span> in your address bar URL{' '}
                      </li>
                      <li>Find "Notifications" or "Permissions"</li>
                      <li>Change the setting from "Block" to "Allow" or "Reset"</li>
                      <li>Reload this page</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            ) : isGranted ? (
              <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300">
                <Settings className="h-4 w-4" />
                <AlertTitle>Active</AlertTitle>
                <AlertDescription>
                  You are all set! You will receive notifications for new posts and updates.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="bg-muted flex flex-col items-center justify-between gap-4 rounded-lg p-4 sm:flex-row">
                <div>
                  <h3 className="font-semibold">Enable Notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    Get instant updates when teachers post announcements.
                  </p>
                </div>
                <Button onClick={() => initialize()}>Enable Now</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                {pagination?.totalItems ?? 0} total notifications
                {unreadCount > 0 && ` (${unreadCount} unread)`}
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
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No notifications yet</div>
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
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {page + 1} of {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
