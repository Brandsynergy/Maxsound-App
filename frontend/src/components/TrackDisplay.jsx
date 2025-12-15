import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

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
    loadAudioData();

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
      console.log('Loading audio for waveform from:', track.preview_audio_url);
      
      const response = await fetch(track.preview_audio_url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('Audio loaded, size:', arrayBuffer.byteLength);
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const decodedData = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Audio decoded successfully, duration:', decodedData.duration);
      
      setAudioBuffer(decodedData);
      setWaveformLoading(false);
      
      // Draw initial waveform
      setTimeout(() => {
        drawStaticWaveform(decodedData);
      }, 100);
    } catch (error) {
      console.error('Error loading audio data:', error);
      setWaveformLoading(false);
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
    } else {
      audio.play();
      setIsPlaying(true);
      drawWaveform();
      
      audio.onended = () => {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  };

  const drawStaticWaveform = (buffer) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }
    
    if (!buffer) {
      console.error('No audio buffer');
      return;
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    console.log('Drawing waveform, canvas size:', width, 'x', height);
    
    // Clear with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    console.log('Audio data points:', data.length, 'step:', step);

    // Draw waveform in blue/gray
    ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
    
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const yMin = (1 + min) * amp;
      const yMax = (1 + max) * amp;
      
      ctx.fillRect(i, yMin, 1, Math.max(yMax - yMin, 1));
    }
    
    console.log('Waveform drawn successfully');
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      // Clear with dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / width);
      const amp = height / 2;
      const progress = currentTime / duration;
      const progressX = Math.floor(width * progress);

      // Draw entire waveform in gray first
      ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        
        const yMin = (1 + min) * amp;
        const yMax = (1 + max) * amp;
        
        ctx.fillRect(i, yMin, 1, Math.max(yMax - yMin, 1));
      }

      // Draw played portion in blue gradient
      const gradient = ctx.createLinearGradient(0, 0, progressX, 0);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(1, '#60A5FA');
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < progressX; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        
        const yMin = (1 + min) * amp;
        const yMax = (1 + max) * amp;
        
        ctx.fillRect(i, yMin, 1, Math.max(yMax - yMin, 1));
      }

      // Draw playhead line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
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
    // Simple payment flow - clicking Buy now goes to Stripe Checkout
    try {
      setIsProcessing(true);
      const { data } = await axios.post('/api/payments/create-payment-intent', {
        trackId: track.id
      });
      
      // For demo purposes, we'll use a simplified flow
      // In production, implement full Stripe Checkout or Elements
      const userConfirmed = window.confirm(
        `Purchase "${track.title}" for $${track.price}?\n\n` +
        `In production, this would open Stripe Checkout.\n` +
        `Click OK to simulate a successful purchase.`
      );

      if (userConfirmed) {
        // Simulate successful payment for demo
        const mockPaymentIntentId = 'pi_demo_' + Date.now();
        localStorage.setItem(`payment_${track.id}`, mockPaymentIntentId);
        setIsPurchased(true);
        setDownloadUrl(track.full_audio_url);
        alert('Purchase successful! You can now download the full track.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
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

        {/* Waveform Visualization */}
        {!isPurchased && (
          <div className="mb-6 bg-black bg-opacity-40 rounded-xl p-6 backdrop-blur-sm">
            <div className="relative">
              {waveformLoading ? (
                <div className="w-full h-28 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="animate-pulse mb-2">Loading waveform...</div>
                    <div className="text-xs">Analyzing audio</div>
                  </div>
                </div>
              ) : (
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={120}
                  className="w-full h-28 rounded-lg bg-gray-900"
                  style={{ display: 'block' }}
                />
              )}
              <div className="mt-3 flex justify-between items-center text-white text-sm">
                <span className="text-blue-400 font-medium">
                  {Math.floor(currentTime)}s
                </span>
                <span className="text-gray-400">
                  Preview: {track.title}
                </span>
                <span className="text-gray-400">
                  {Math.floor(duration)}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Preview Button */}
          {!isPurchased && (
            <button
              onClick={playPreview}
              className="w-full bg-white text-purple-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-100 transition duration-200 shadow-lg text-lg uppercase tracking-wide"
            >
              {isPlaying ? '⏸ Stop Preview' : '▶ Listen to 20s Preview'}
            </button>
          )}

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
