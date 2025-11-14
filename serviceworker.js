const GHPATH = '';
const APP_PREFIX = 'gppwa_';
const VERSION = 'version_002'; // Increment the version to trigger an update
const CACHE_NAME = APP_PREFIX + VERSION;

// The list of URLs for the "app shell" that will be cached on install.
const APP_SHELL_URLS = [
  `${GHPATH}/index.html`,
  `${GHPATH}/index.css`,
  `${GHPATH}/index.js`,
  `${GHPATH}/manifest.webmanifest`,
  `${GHPATH}/icons/favicon.ico`,
  `${GHPATH}/icons/icon192x192.png`,
  `${GHPATH}/icons/icon512x512.png`,
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

// Cache the app shell on install, logging errors without failing
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Installing cache : ' + CACHE_NAME);

      // Create an array of promises
      const promises = APP_SHELL_URLS.map((url) => {
        // Create a new Request object
        const request = new Request(url);

        return fetch(request)
          .then((response) => {
            // If the response is not ok (e.g., 404)
            if (!response.ok) {
              console.error(`Failed to fetch ${url} for cache: ${response.status}`);
              return; // Don't cache it, but don't fail the install
            }
            // If successful, put it in the cache
            return cache.put(request, response);
          })
          .catch((err) => {
            // Handle network errors (e.g., offline)
            console.error(`Network error fetching ${url}: ${err.message}`);
          });
      });

      // Wait for all individual fetch/cache operations to finish
      return Promise.all(promises);
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