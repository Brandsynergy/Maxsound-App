self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open('maxsound-v1')
    await cache.addAll(['/','/index.html'])
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith((async () => {
    const cached = await caches.match(request)
    if (cached) return cached
    try {
      const fresh = await fetch(request)
      const cache = await caches.open('maxsound-v1')
      cache.put(request, fresh.clone())
      return fresh
    } catch (e) {
      return caches.match('/')
    }
  })())
})

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