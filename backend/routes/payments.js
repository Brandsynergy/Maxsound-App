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

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
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
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: track.title,
              description: `By ${track.artist}`,
              images: [track.cover_image_url],
            },
            unit_amount: Math.round(track.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/track/${trackId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/track/${trackId}?canceled=true`,
      metadata: {
        trackId: track.id,
      },
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Verify Checkout Session and record purchase
router.get('/verify-session', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      const trackId = session.metadata.trackId;
      
      // Check if already recorded
      const existing = await pool.query(
        'SELECT * FROM purchases WHERE payment_intent_id = $1',
        [session.payment_intent]
      );
      
      if (existing.rows.length === 0) {
        // Record purchase
        await pool.query(
          `INSERT INTO purchases (track_id, payment_intent_id, customer_email, amount)
           VALUES ($1, $2, $3, $4)`,
          [
            trackId,
            session.payment_intent,
            session.customer_details.email,
            session.amount_total / 100
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
        purchased: true,
        downloadUrl: trackResult.rows[0].full_audio_url,
        paymentIntentId: session.payment_intent
      });
    } else {
      res.json({ success: false, purchased: false });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Failed to verify session' });
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
