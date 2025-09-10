self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('gw-v1').then(cache => cache.addAll(['/','/index.html','/manifest.webmanifest'])));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  // Only handle same-origin GET requests; let network handle POST/PUT and cross-origin
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
let lastShownAt = 0
self.addEventListener('message', (e) => {
  const msg = e.data || {}
  if (msg.type === 'notify') {
    const now = Date.now()
    if (now - lastShownAt < 60 * 1000) return
    lastShownAt = now
    const title = msg.title || 'GesundWerk'
    const body = msg.body || 'Zeit für eine kurze Pause!'
    const data = msg.data || {}
    e.waitUntil(self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag: data.activityId || 'gw-reminder',
      requireInteraction: true,
      data
    }))
  }
})
self.addEventListener('notificationclick', (e) => {
  const data = e.notification.data || {}
  e.notification.close()
  e.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    let client = all.find(c => 'focus' in c)
    if (client) {
      client = await client.focus()
      client && client.postMessage({ type: 'openReminder', activityId: data.activityId })
    } else {
      const newClient = await clients.openWindow('/')
      newClient && newClient.postMessage({ type: 'openReminder', activityId: data.activityId })
    }
  })())
})
self.addEventListener('push', (e) => {
  let data = { title: 'Erinnerung', body: 'Zeit für eine kurze Pause!' }
  try { data = e.data ? JSON.parse(e.data.text()) : data } catch {}
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icons/icon-192.png', requireInteraction: true }))
});
