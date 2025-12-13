import express from 'express';
import Stripe from 'stripe';
import pool from '../database.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { trackId } = req.body;
    
    // Get track details
    const result = await pool.query(
      'SELECT * FROM tracks WHERE id = $1',
      [trackId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    const track = result.rows[0];
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(track.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        trackId: track.id,
        trackTitle: track.title,
        artist: track.artist
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: track.price
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and record purchase
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, email } = req.body;
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    const trackId = paymentIntent.metadata.trackId;
    
    // Check if already recorded
    const existing = await pool.query(
      'SELECT * FROM purchases WHERE payment_intent_id = $1',
      [paymentIntentId]
    );
    
    if (existing.rows.length === 0) {
      // Record purchase
      await pool.query(
        `INSERT INTO purchases (track_id, payment_intent_id, customer_email, amount)
         VALUES ($1, $2, $3, $4)`,
        [
          trackId,
          paymentIntentId,
          email,
          paymentIntent.amount / 100
        ]
      );
    }
    
    // Get track with download URL
    const trackResult = await pool.query(
      'SELECT * FROM tracks WHERE id = $1',
      [trackId]
    );
    
    res.json({
      success: true,
      downloadUrl: trackResult.rows[0].full_audio_url
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

export default router;
