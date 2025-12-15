import express from 'express'
import { saveSubscription, removeSubscription } from '../utils/notifications.js'

const router = express.Router()

router.get('/public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' })
})

router.post('/subscribe', async (req, res) => {
  try {
    await saveSubscription(req.body)
    res.json({ ok: true })
  } catch (e) {
    console.error('Subscribe failed', e)
    res.status(500).json({ error: 'Subscribe failed' })
  }
})

router.delete('/subscribe', async (req, res) => {
  try {
    const { endpoint } = req.body
    await removeSubscription(endpoint)
    res.json({ ok: true })
  } catch (e) {
    console.error('Unsubscribe failed', e)
    res.status(500).json({ error: 'Unsubscribe failed' })
  }
})

export default router