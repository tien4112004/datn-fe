import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase configuration is missing. Push notifications will not work.');
    return null;
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseMessaging(): Messaging | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }
  return messaging;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  return await Notification.requestPermission();
}

export async function getFCMToken(): Promise<string | null> {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('VAPID key is not configured. FCM token cannot be retrieved.');
    return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  return onMessage(messaging, callback);
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}
