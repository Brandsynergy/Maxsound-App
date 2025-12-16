const CACHE_VERSION = 'maxsound-v3';
const OLD_CACHES = ['maxsound-v1', 'maxsound-v2'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION)
    await cache.addAll(['/','/browse','/index.html'])
  })()
)})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => OLD_CACHES.includes(name))
        .map(name => caches.delete(name))
    );
    await clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith((async () => {
    try {
      const fresh = await fetch(request)
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, fresh.clone())
      return fresh
    } catch (e) {
      const cached = await caches.match(request)
      if (cached) return cached
      return caches.match('/')
    }
  })()
)})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data?.json() || {} } catch {}
  const title = data.title || 'MAXSOUND'
  const body = data.body || 'New upload available'
  const url = data.url || '/'
  const options = {
    body,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    data: { url }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})