// Zyntra QuickDrop Service Worker v1.0.0
const CACHE_NAME = 'quickdrop-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/pair',
  '/settings',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets might not exist yet, ignore errors
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch Strategy: Network-first, fallback to cache ───────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, Firebase, and cross-origin requests
  if (
    request.method !== 'GET' ||
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('firebase.googleapis.com') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // API routes - network only
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Return offline page for navigation
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ─── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: 'QuickDrop', body: event.data.text() } };
  }

  const { notification = {}, data = {} } = payload;
  const title = notification.title || 'Zyntra QuickDrop';
  const body = notification.body || 'New message received';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'quickdrop-message',
      renotify: true,
      vibrate: [100, 50, 100],
      data: { url: '/dashboard', messageId: data.messageId, text: data.text },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'copy', title: 'Copy' },
      ],
    })
  );
});

// ─── Notification Click ──────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  if (event.action === 'copy' && event.notification.data?.text) {
    // Try to copy — limited in SW context, open app instead
    event.waitUntil(
      clients.openWindow(targetUrl + '?copy=1')
    );
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// ─── Firebase Messaging Background ───────────────────────────────────────────
// Import FCM compat for background messages
try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: self.__FIREBASE_CONFIG?.apiKey || '',
    projectId: self.__FIREBASE_CONFIG?.projectId || '',
    messagingSenderId: self.__FIREBASE_CONFIG?.messagingSenderId || '',
    appId: self.__FIREBASE_CONFIG?.appId || '',
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { notification = {}, data = {} } = payload;
    self.registration.showNotification(
      notification.title || 'QuickDrop Message',
      {
        body: notification.body || data.text || 'New message',
        icon: '/icons/icon-192x192.png',
        data: { url: '/dashboard', ...data },
      }
    );
  });
} catch (e) {
  // FCM not available or Firebase config not injected
}
