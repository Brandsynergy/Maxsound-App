import webpush from 'web-push'
import pool from '../database.js'

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey)
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
  const payload = JSON.stringify({
    title: 'New upload on MAXSOUND',
    body: `${artist} – ${title}`,
    url: `/track/${id}`
  })
  for (const row of res.rows) {
    try {
      await webpush.sendNotification(row.data, payload)
    } catch (e) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.data.endpoint])
      } else {
        console.error('Push send failed', e?.statusCode || e)
      }
    }
  }
}