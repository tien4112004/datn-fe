import { useEffect, useRef } from 'react';
import { useAuth } from '@/shared/context/auth';
import { useFCM } from '../hooks/useFCM';

export function NotificationInitializer() {
  const { isAuthenticated, isLoading } = useAuth();
  const { initialize, isSupported, hasRequestedPermission } = useFCM();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Don't initialize if:
    // - Auth is still loading
    // - User is not authenticated
    // - Notifications are not supported
    // - Already initialized
    if (isLoading || !isAuthenticated || !isSupported || hasInitialized.current) {
      return;
    }

    const permission = Notification.permission;
    const shouldInitialize = permission === 'default' || permission === 'granted';

    if (shouldInitialize) {
      hasInitialized.current = true;
      initialize();
    } else if (permission === 'denied') {
      console.warn('[NotificationInitializer] Notifications are explicitly blocked by the user/browser.');
    }
  }, [isAuthenticated, isLoading, isSupported, hasRequestedPermission, initialize]);

  // This component doesn't render anything
  return null;
}
