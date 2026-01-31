/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase with placeholder config
// The actual config will be passed via postMessage from the main app
let firebaseConfig = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initializeFirebase();
  }
});

function initializeFirebase() {
  if (!firebaseConfig) {
    return;
  }

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  } else {
    // If it already exists, we might want to check if config changed, but for now just reuse/re-init
    // Note: firebase-compat usually handles singleton, but explicit check avoids error
    // If we strictly need to re-init with new config, we'd need to delete app first.
    // But usually we just want to avoid the crash.
    console.log('[firebase-messaging-sw.js] Firebase already initialized');
  }
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: payload.data,
      tag: payload.data?.tag || 'default',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Compute URL from notification type and referenceId
function getUrlFromNotificationData(data) {
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

  // Fallback: legacy url field
  if (data.url) {
    return data.url;
  }

  return '/notifications';
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  event.notification.close();

  const urlToOpen = getUrlFromNotificationData(event.notification.data);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
