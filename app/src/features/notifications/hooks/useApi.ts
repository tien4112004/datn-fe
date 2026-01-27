import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationApiService } from '../api';
import type { RegisterDeviceRequest, SendNotificationRequest } from '../types';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (page: number, size: number) => [...notificationQueryKeys.all, 'list', page, size] as const,
  unreadCount: () => [...notificationQueryKeys.all, 'unread-count'] as const,
};

export function useRegisterDevice() {
  const notificationService = useNotificationApiService();

  return useMutation({
    mutationFn: (request: RegisterDeviceRequest) => notificationService.registerDevice(request),
  });
}

export function useSendNotification() {
  const notificationService = useNotificationApiService();

  return useMutation({
    mutationFn: (request: SendNotificationRequest) => notificationService.sendNotification(request),
  });
}

export function useNotifications(page = 0, size = 20) {
  const notificationService = useNotificationApiService();

  return useQuery({
    queryKey: notificationQueryKeys.list(page, size),
    queryFn: () => notificationService.getNotifications(page, size),
  });
}

export function useUnreadCount() {
  const notificationService = useNotificationApiService();

  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });
}

export function useMarkAsRead() {
  const notificationService = useNotificationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const notificationService = useNotificationApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
