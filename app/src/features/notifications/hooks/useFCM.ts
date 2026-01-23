import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  isNotificationSupported,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
} from '@/shared/config/firebase';
import { useNotificationStore } from '../stores/notificationStore';
import { useRegisterDevice } from './useApi';

export function useFCM() {
  const {
    fcmToken,
    isRegistered,
    hasRequestedPermission,
    setFcmToken,
    setIsRegistered,
    setHasRequestedPermission,
  } = useNotificationStore();

  const registerDevice = useRegisterDevice();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const initializeServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      // Send Firebase config to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          },
        });
      }

      // Wait for service worker to be ready
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({
          type: 'FIREBASE_CONFIG',
          config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          },
        });
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }, []);

  const requestPermissionAndGetToken = useCallback(async (): Promise<string | null> => {
    if (!isNotificationSupported()) {
      console.warn('Push notifications are not supported in this browser');
      return null;
    }

    setHasRequestedPermission(true);

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Initialize service worker first
    await initializeServiceWorker();

    const token = await getFCMToken();
    if (token) {
      setFcmToken(token);
    }

    return token;
  }, [setHasRequestedPermission, setFcmToken, initializeServiceWorker]);

  const registerWithBackend = useCallback(
    async (token: string) => {
      if (isRegistered) {
        return;
      }

      try {
        await registerDevice.mutateAsync({ token });
        setIsRegistered(true);
        console.log('Device registered with backend');
      } catch (error) {
        console.error('Failed to register device with backend:', error);
      }
    },
    [isRegistered, registerDevice, setIsRegistered]
  );

  const initialize = useCallback(async () => {
    // If already have a token and registered, just setup foreground listener
    if (fcmToken && isRegistered) {
      return;
    }

    // Request permission and get token
    const token = await requestPermissionAndGetToken();
    if (token) {
      await registerWithBackend(token);
    }
  }, [fcmToken, isRegistered, requestPermissionAndGetToken, registerWithBackend]);

  // Setup foreground message listener
  useEffect(() => {
    if (!fcmToken) {
      return;
    }

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);

      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';

      // Show toast notification for foreground messages
      toast(title, {
        description: body,
        duration: 5000,
      });
    });

    if (unsubscribe) {
      unsubscribeRef.current = unsubscribe;
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [fcmToken]);

  return {
    fcmToken,
    isRegistered,
    hasRequestedPermission,
    isSupported: isNotificationSupported(),
    initialize,
    requestPermissionAndGetToken,
  };
}
