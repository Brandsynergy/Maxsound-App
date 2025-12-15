import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('⚠️ WARNING: Cloudinary credentials not configured!');
  console.error('Missing:', {
    cloud_name: !process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !process.env.CLOUDINARY_API_KEY,
    api_secret: !process.env.CLOUDINARY_API_SECRET
  });
}

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload track with audio and cover image
router.post('/', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, price } = req.body;
    
    if (!title || !artist || !price || !req.files.audio || !req.files.cover) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const trackId = uuidv4();
    
    // Upload cover image to Cloudinary
    const coverUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'maxsound/covers',
          public_id: `cover_${trackId}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.files.cover[0].buffer);
    });

    // Upload full audio to Cloudinary
    const audioUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'maxsound/audio/full',
          public_id: `audio_${trackId}`,
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          format: 'mp3'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.files.audio[0].buffer);
    });

    // Create preview (first 20 seconds) using Cloudinary transformation
    const previewUrl = cloudinary.url(`maxsound/audio/full/audio_${trackId}`, {
      resource_type: 'video',
      duration: '20',
      format: 'mp3'
    });

    // Save to database
    await pool.query(
      `INSERT INTO tracks (id, title, artist, price, cover_image_url, full_audio_url, preview_audio_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        trackId,
        title,
        artist,
        parseFloat(price),
        coverUpload.secure_url,
        audioUpload.secure_url,
        previewUrl
      ]
    );

    // Generate share URL - prefer explicit FRONTEND_URL; otherwise derive from request host in production,
    // and fall back to localhost in development.
    const baseUrl = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? `https://${req.get('host')}`
        : 'http://localhost:5173');

    // Fire-and-forget push notification (non-blocking)
    import('../utils/notifications.js').then(({ notifyNewTrack }) => {
      notifyNewTrack({ id: trackId, title, artist }).catch(() => {})
    }).catch(() => {})

    res.json({
      success: true,
      trackId,
      shareUrl: `${baseUrl}/track/${trackId}`
    });
  } catch (error) {
    console.error('Error uploading track:', error);
    
    // Detailed error message
    let errorMessage = 'Failed to upload track';
    if (error.message) {
      errorMessage += ': ' + error.message;
    }
    
    // Check if it's a Cloudinary error
    if (error.http_code) {
      errorMessage = `Cloudinary error (${error.http_code}): ${error.message}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
