import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import WaveformPlayer from './WaveformPlayer';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function TrackDisplay({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(track.preview_audio_url));
  const [isPurchased, setIsPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [waveformLoading, setWaveformLoading] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Check for Stripe Checkout success
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    
    if (success === 'true' && sessionId) {
      verifyCheckoutSession(sessionId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if already purchased
    const paymentIntentId = localStorage.getItem(`payment_${track.id}`);
    if (paymentIntentId) {
      checkPurchaseStatus(paymentIntentId);
    }

    // Set up audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    // Load and decode audio for waveform
    setTimeout(() => {
      loadAudioData();
    }, 500);

    return () => {
      audio.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [track.id]);

  const loadAudioData = async () => {
    try {
      setWaveformLoading(true);
      
      // Fetch the audio file
      const response = await fetch(track.preview_audio_url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const decodedData = await audioContext.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(decodedData);
      setWaveformLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setWaveformLoading(false);
    }
  };

  const drawStaticWaveform = (buffer) => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Get raw audio data
    const rawData = buffer.getChannelData(0);
    const samples = width;
    const blockSize = Math.floor(rawData.length / samples);
    const centerY = height / 2;

    // Draw waveform
    ctx.fillStyle = '#4A9FDB';
    
    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      const amplitude = sum / blockSize;
      const barHeight = amplitude * height;
      
      ctx.fillRect(i, centerY - barHeight / 2, 1, Math.max(barHeight, 2));
    }
  };

  const verifyCheckoutSession = async (sessionId) => {
    try {
      const response = await axios.get(`/api/payments/verify-session?session_id=${sessionId}`);
      if (response.data.purchased) {
        localStorage.setItem(`payment_${track.id}`, response.data.paymentIntentId);
        setIsPurchased(true);
        setDownloadUrl(response.data.downloadUrl);
        alert('✅ Payment successful! You can now download the full track.');
      }
    } catch (error) {
      console.error('Error verifying session:', error);
    }
  };

  const checkPurchaseStatus = async (paymentIntentId) => {
    try {
      const response = await axios.get(`/api/tracks/${track.id}/purchased?payment_intent_id=${paymentIntentId}`);
      if (response.data.purchased) {
        setIsPurchased(true);
        setDownloadUrl(track.full_audio_url);
      }
    } catch (error) {
      console.error('Error checking purchase:', error);
    }
  };

  const playPreview = () => {
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear canvas when stopped
      clearCanvas();
    } else {
      audio.play();
      setIsPlaying(true);
      drawWaveform();
      
      audio.onended = () => {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        // Clear canvas when ended
        clearCanvas();
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };


  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      // If we have real audio buffer, use it; otherwise draw from audio analysis
      if (audioBuffer) {
        drawStaticWaveform(audioBuffer);
      } else {
        // Draw real-time waveform using audio element
        drawLiveWaveform();
      }
      
      const progress = currentTime / duration;
      const progressX = Math.floor(width * progress);

      // Draw playhead line - thick and bright
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
  };

  const drawLiveWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform based on current time and track characteristics
    ctx.fillStyle = '#4A9FDB';
    const centerY = height / 2;
    
    // Use track ID to generate consistent pattern
    const seed = track.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const timeOffset = currentTime * 100;
    
    for (let i = 0; i < width; i++) {
      const x = i / width;
      // Create realistic audio pattern
      const bass = Math.sin((x * 10 + seed) * Math.PI) * 0.5;
      const mid = Math.sin((x * 30 + seed * 2) * Math.PI) * 0.3;
      const high = Math.sin((x * 100 + seed * 3 + timeOffset * 0.1) * Math.PI) * 0.15;
      const noise = Math.sin((i * 0.5 + timeOffset) * 0.1) * 0.05;
      
      const amplitude = Math.abs(bass + mid + high + noise);
      const barHeight = amplitude * height * 0.8;
      
      ctx.fillRect(i, centerY - barHeight / 2, 1, Math.max(barHeight, 2));
    }
  };

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      
      // Create payment intent
      const { data } = await axios.post('/api/payments/create-payment-intent', {
        trackId: track.id
      });

      const stripe = await stripePromise;
      
      // For simplicity, using card element - in production you'd have a full checkout form
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            // This is a simplified version - you'd need to implement Stripe Elements
            // For now, we'll redirect to a payment page
          }
        }
      });

      if (error) {
        alert('Payment failed: ' + error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const confirmResponse = await axios.post('/api/payments/confirm-payment', {
          paymentIntentId: paymentIntent.id,
          email: 'customer@example.com' // In production, collect this from user
        });

        localStorage.setItem(`payment_${track.id}`, paymentIntent.id);
        setIsPurchased(true);
        setDownloadUrl(confirmResponse.data.downloadUrl);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsProcessing(true);
      
      // Create Stripe Checkout Session
      const { data } = await axios.post('/api/payments/create-checkout-session', {
        trackId: track.id
      });
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start checkout: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Album Cover */}
        <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={track.cover_image_url} 
            alt={track.title}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {track.views} views
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {track.title}
          </h1>
          <p className="text-xl text-white text-opacity-90 font-medium uppercase tracking-wider">
            {track.artist}
          </p>
        </div>

        {/* Waveform Player (professional, synced) */}
        {!isPurchased && (
          <div className="mb-6 bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 relative">
            <span className="absolute -top-3 left-4 bg-black text-white text-xs tracking-widest px-2 py-1 rounded shadow">20s PREVIEW</span>
            <WaveformPlayer url={`/api/tracks/${track.id}/preview-stream`} height={100} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Buy Button */}
          {!isPurchased && (
            <button
              onClick={handleBuyNow}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-200 shadow-lg text-lg uppercase tracking-wide disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Buy Song - $${track.price}`}
            </button>
          )}

          {/* Download Button (shown after purchase) */}
          {isPurchased && (
            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-600 transition duration-200 shadow-lg text-lg uppercase tracking-wide"
            >
              ⬇ Download Full Song
            </button>
          )}
        </div>

        {/* Price Display */}
        {!isPurchased && (
          <div className="mt-6 text-center">
            <p className="text-white text-opacity-75 text-sm">
              Own this track for just <span className="font-bold text-lg">${track.price}</span>
            </p>
          </div>
        )}

        {/* Purchased Badge */}
        {isPurchased && (
          <div className="mt-6 text-center">
            <div className="inline-block bg-green-500 bg-opacity-20 text-green-200 px-4 py-2 rounded-full text-sm font-medium">
              ✓ Purchased
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
