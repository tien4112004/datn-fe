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

    // Only auto-initialize if user hasn't been prompted before
    // This prevents annoying permission prompts on every login
    if (!hasRequestedPermission) {
      hasInitialized.current = true;
      initialize();
    }
  }, [isAuthenticated, isLoading, isSupported, hasRequestedPermission, initialize]);

  // This component doesn't render anything
  return null;
}
