import webpush from 'web-push'
import pool from '../database.js'

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:admin@example.com'
  
  if (publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey)
      console.log('✓ VAPID keys configured successfully')
    } catch (error) {
      console.error('Failed to configure VAPID keys:', error.message)
      console.warn('Push notifications disabled due to invalid VAPID configuration')
    }
  } else {
    console.warn('VAPID keys not configured; push disabled')
  }
}

export async function saveSubscription(sub) {
  await pool.query(
    `INSERT INTO push_subscriptions(endpoint, data)
     VALUES ($1, $2)
     ON CONFLICT (endpoint) DO UPDATE SET data = EXCLUDED.data`,
    [sub.endpoint, sub]
  )
}

export async function removeSubscription(endpoint) {
  await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])
}

export async function notifyNewTrack({ id, title, artist }) {
  const res = await pool.query('SELECT data FROM push_subscriptions')
  console.log(`📤 Sending push notification to ${res.rows.length} subscribers`)
  
  const payload = JSON.stringify({
    title: 'New upload on MAXSOUND',
    body: `${artist} – ${title}`,
    url: `/track/${id}`,
    badge: 1,
    icon: '/pwa-192.png',
    vibrate: [200, 100, 200]
  })
  
  let successCount = 0
  let failCount = 0
  
  for (const row of res.rows) {
    try {
      await webpush.sendNotification(row.data, payload)
      successCount++
    } catch (e) {
      failCount++
      if (e.statusCode === 410 || e.statusCode === 404) {
        console.log('🗑️ Removing stale subscription')
        await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.data.endpoint])
      } else {
        console.error('❌ Push send failed:', e?.statusCode || e.message)
      }
    }
  }
  
  console.log(`✅ Push notifications sent: ${successCount} succeeded, ${failCount} failed`)
}
