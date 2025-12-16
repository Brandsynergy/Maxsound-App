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

// Stream 20s preview via server to avoid CORS issues
router.get('/:id/preview-stream', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT preview_audio_url FROM tracks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const previewUrl = result.rows[0].preview_audio_url;
    const upstream = await fetch(previewUrl);
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ error: 'Failed to fetch preview audio' });
    }

    // Pass through content type and length if available
    const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
    const contentLength = upstream.headers.get('content-length');
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=300');

    // Pipe the upstream audio to the client
    const { Readable } = await import('node:stream');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    console.error('Error streaming preview:', error);
    res.status(500).json({ error: 'Preview stream failed' });
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

// Delete track
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if track exists
    const trackResult = await pool.query(
      'SELECT * FROM tracks WHERE id = $1',
      [id]
    );
    
    if (trackResult.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Delete related purchases first (foreign key constraint)
    await pool.query('DELETE FROM purchases WHERE track_id = $1', [id]);
    
    // Delete the track
    await pool.query('DELETE FROM tracks WHERE id = $1', [id]);
    
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
