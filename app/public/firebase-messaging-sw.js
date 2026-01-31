/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// Get config from URL params (available during registration)
const params = new URLSearchParams(self.location.search);
let firebaseConfig = null;

if (params.get('apiKey')) {
  firebaseConfig = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId'),
  };

  // Save to IndexedDB for future loads
  saveConfigToDB(firebaseConfig).catch(() => {});
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('firebase-messaging-sw', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config');
      }
    };
  });
}

async function saveConfigToDB(config) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('config', 'readwrite');
    tx.objectStore('config').put(config, 'firebaseConfig');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getConfigFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('config', 'readonly');
    const request = tx.objectStore('config').get('firebaseConfig');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function handleBackgroundMessage(payload) {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data,
    tag: payload.data?.tag || 'default',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}

// Async initialization fallback for when config isn't in URL params
async function initializeFromDB() {
  if (firebase.apps.length > 0) {
    return;
  }

  try {
    const config = await getConfigFromDB();
    if (config && config.apiKey) {
      firebase.initializeApp(config);
      const messaging = firebase.messaging();
      messaging.onBackgroundMessage(handleBackgroundMessage);
    }
  } catch {
    // Failed to initialize from IndexedDB
  }
}

// Synchronous initialization if config available from URL params
if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(handleBackgroundMessage);
} else {
  // Fallback: try to load from IndexedDB
  initializeFromDB();
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

  if (data.url) {
    return data.url;
  }

  return '/notifications';
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = getUrlFromNotificationData(event.notification.data);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
