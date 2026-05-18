const CACHE_NAME = 'dreamsync-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/app.html',
  '/analysis.html',
  '/stats.html',
  '/dream.html',
  '/meditation.html',
  '/settings.html',
  '/share.html',
  '/install.html',
  '/onboarding.html',
  '/manifest.json',
  '/icons/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request).then(fetchRes => {
        if (!fetchRes || fetchRes.status !== 200) return fetchRes;
        const resClone = fetchRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return fetchRes;
      });
    }).catch(() => caches.match('/index.html'))
  );
});