const GHPATH = '';
const APP_PREFIX = 'gppwa_';
const VERSION = 'version_005'; // Increment the version to trigger an update
const CACHE_NAME = APP_PREFIX + VERSION;

// The list of URLs for the "app shell" that will be cached on install.
const APP_SHELL_URLS = [
  `${GHPATH}/`,
  `${GHPATH}/index.css`,
  `${GHPATH}/index.js`,
  `${GHPATH}/manifest.webmanifest`,
  `${GHPATH}/icons/favicon.ico`,
  `${GHPATH}/icons/icon-192x192.png`,
  `${GHPATH}/icons/icon-512x512.png`,
];

// Respond with cached resources, falling back to the network.
// This strategy also dynamically caches new assets as they are requested.
self.addEventListener('fetch', (e) => {
  // We only want to cache GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // For all other requests, use a cache-first strategy.
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        return response;
      });
    })
  );
});

// Cache the app shell on install
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(APP_SHELL_URLS);
    })
  );

});

// Delete old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
            console.log('Deleting old cache : ' + key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});