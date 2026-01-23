import { useMutation } from '@tanstack/react-query';
import { useNotificationApiService } from '../api';
import type { RegisterDeviceRequest, SendNotificationRequest } from '../types';

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
