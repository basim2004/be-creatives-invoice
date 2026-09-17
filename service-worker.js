/**
 * BE CREATIVES — Progressive Web App Service Worker
 * Version: be-invoice-v4
 * Provides resilient offline support with Network-First strategy for local assets,
 * ensuring immediate updates without stale-cache issues, while strictly preserving localStorage.
 */

const CACHE_NAME = 'be-invoice-v8';

const STATIC_ASSETS = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'favicon.png',
  'app icon.png',
  'B BADGE.png',
  'be badge.png',
  'be creatives agency.png',
  'qr code.png',
  'assets/qrcode.js',
  'assets/html2canvas.min.js',
  'assets/html2pdf.bundle.min.js',
  'assets/khatabook-data.js',
  'assets/historical-ledger-data.js',
  'assets/signature-be-creatives.svg',
  'assets/stamp-seal.svg',
  'assets/be-creatives-stamp.svg',
  'assets/gpay-logo.svg',
  'assets/authorized-signature.svg',
  'assets/b-badge.png'
];

// Install Event: Cache assets safely using allSettled so individual missing assets don't fail installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const cachePromises = STATIC_ASSETS.map(url => {
        return fetch(url)
          .then(res => {
            if (res.ok) return cache.put(url, res);
            return Promise.resolve();
          })
          .catch(() => Promise.resolve());
      });
      return Promise.allSettled(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Instantly remove all older cache versions and take immediate control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First for local origin, ensuring live code always updates instantly
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Same-origin requests (App Shell, HTML, CSS, JS, local images) -> Network-First
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            if (request.mode === 'navigate') {
              return caches.match('index.html') || caches.match('./');
            }
          });
        })
    );
    return;
  }

  // External assets (Google Fonts, FontAwesome CDNs): Cache-first with network fallback
  if (url.origin.includes('fonts.googleapis.com') ||
      url.origin.includes('fonts.gstatic.com') ||
      url.origin.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {/* Ignore font offline failures */});
      })
    );
    return;
  }

  // Default network fetch with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
