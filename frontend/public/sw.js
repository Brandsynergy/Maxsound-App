const CACHE_VERSION = 'maxsound-v4';
const OLD_CACHES = ['maxsound-v1', 'maxsound-v2', 'maxsound-v3'];

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
  
  event.waitUntil((async () => {
    // Get current badge count
    let badgeCount = await getBadgeCount();
    badgeCount++;
    await setBadgeCount(badgeCount);
    
    // Try multiple badge APIs (iOS support varies)
    try {
      if ('setAppBadge' in navigator) {
        await navigator.setAppBadge(badgeCount);
      } else if ('setExperimentalAppBadge' in navigator) {
        await navigator.setExperimentalAppBadge(badgeCount);
      }
    } catch (e) {
      console.log('Badge API not supported:', e);
    }
    
    // Show notification with badge count in title for iOS
    const options = {
      body,
      icon: '/pwa-192.png',
      badge: badgeCount, // iOS uses this for badge count
      tag: `track-${Date.now()}`, // Unique tag for each notification
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: { url, badgeCount }
    };
    
    await self.registration.showNotification(title, options);
  })());
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil((async () => {
    // Clear badge when notification is clicked
    if (navigator.clearAppBadge) {
      await navigator.clearAppBadge();
    }
    await setBadgeCount(0);
    
    // Open the URL
    await clients.openWindow(url);
  })());
});

// Badge count management
async function getBadgeCount() {
  const cache = await caches.open('maxsound-badge');
  const response = await cache.match('badge-count');
  if (response) {
    const data = await response.json();
    return data.count || 0;
  }
  return 0;
}

async function setBadgeCount(count) {
  const cache = await caches.open('maxsound-badge');
  await cache.put('badge-count', new Response(JSON.stringify({ count })));
}
