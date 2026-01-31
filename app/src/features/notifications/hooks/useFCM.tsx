import { useEffect, useCallback, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  isNotificationSupported,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
} from '@/shared/config/firebase';
import { useNotificationStore } from '../stores/notificationStore';
import { useRegisterDevice } from './useApi';

function getUrlFromNotificationData(data: Record<string, string> | undefined): string {
  if (!data) return '/notifications';

  const { type, referenceId } = data;

  if (type && referenceId) {
    switch (type) {
      case 'POST':
      case 'ANNOUNCEMENT':
        return `/classes/${referenceId}`;
      case 'ASSIGNMENT':
        return `/assignments/${referenceId}`;
      case 'GRADE':
        return `/grades/${referenceId}`;
      case 'SHARED_PRESENTATION':
        return `/presentation/${referenceId}`;
      case 'SHARED_MINDMAP':
        return `/mindmap/${referenceId}`;
      default:
        return '/notifications';
    }
  }

  if (data.url) {
    return data.url;
  }

  return '/notifications';
}

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
      // Pass Firebase config via URL search params so it's available immediately
      // when the service worker loads (required for push event handlers)
      const params = new URLSearchParams({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });

      const swUrl = `/firebase-messaging-sw.js?${params.toString()}`;
      await navigator.serviceWorker.register(swUrl);
    } catch {
      // Service worker registration failed
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
      } catch {
        // Failed to register device
      }
    },
    [isRegistered, registerDevice, setIsRegistered]
  );

  const initialize = useCallback(async () => {
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
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      const url = getUrlFromNotificationData(payload.data);

      toast(title, {
        description: body,
        closeButton: true,
        duration: Infinity,
        classNames: {
          actionButton: '!bg-transparent !text-primary hover:!bg-primary/10 ',
        },
        action: {
          label: <ExternalLink className="size-4" />,
          onClick: () => (window.location.href = url),
        },
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
