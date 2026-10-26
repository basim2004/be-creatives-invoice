/**
 * BE CREATIVES — Service Worker Self-Purge & Immediate Fresh Sync
 * Clears any stale caches, unregisters old workers, and forces fresh network fetches.
 */

const CACHE_NAME = 'be-invoice-v14-purge';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always go straight to network
  event.respondWith(
    fetch(event.request).catch(err => {
      return caches.match(event.request);
    })
  );
});
