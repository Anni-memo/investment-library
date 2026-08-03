// NOTE: bump this version (v1 -> v2 -> ...) whenever precached files
// (shared.css / shared.js / offline.html / the homepage shell) change.
// The activate handler below deletes any cache that doesn't match this
// name, so bumping it is what makes returning visitors pick up updates
// to these cache-first static assets. HTML navigation itself is always
// network-first (see below) and does NOT need a version bump to show
// new articles.
const CACHE_NAME = 'shosai-v2';
const HOME_URL = '/investment-library/';
const OFFLINE_URL = '/investment-library/offline.html';

const PRECACHE = [
  HOME_URL,
  '/investment-library/shared.css',
  '/investment-library/shared.js',
  OFFLINE_URL
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // Network-first for HTML: always try the network so new/updated
    // articles are never masked by a stale cached page. Only when the
    // network is unreachable do we fall back to a cached copy — the
    // precached homepage shell if that's what was requested, otherwise
    // the generic offline page.
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then(cached => cached || caches.match(OFFLINE_URL))
      )
    );
    return;
  }
  // Cache-first for static assets (CSS/JS precached above): serves
  // instantly from cache when available, falls back to network for
  // anything not explicitly precached.
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
