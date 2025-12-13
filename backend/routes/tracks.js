import express from 'express';
import pool from '../database.js';

const router = express.Router();

// Get track by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    await pool.query(
      'UPDATE tracks SET views = views + 1 WHERE id = $1',
      [id]
    );
    
    // Get track data
    const result = await pool.query(
      'SELECT * FROM tracks WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tracks (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tracks ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if track was purchased
router.get('/:id/purchased', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_intent_id } = req.query;
    
    if (!payment_intent_id) {
      return res.json({ purchased: false });
    }
    
    const result = await pool.query(
      'SELECT * FROM purchases WHERE track_id = $1 AND payment_intent_id = $2',
      [id, payment_intent_id]
    );
    
    res.json({ purchased: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
