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
  const [duration, setDuration] = useState(10);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

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

    return () => {
      audio.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [track.id]);

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

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barCount = 50;
    const barWidth = width / barCount;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(0.5, '#3B82F6');
      gradient.addColorStop(1, '#8B5CF6');

      for (let i = 0; i < barCount; i++) {
        // Create animated wave effect
        const progress = currentTime / duration;
        const barProgress = i / barCount;
        
        // Height varies based on position and time
        const baseHeight = Math.sin(i * 0.5 + currentTime * 3) * 0.3 + 0.5;
        const playingMultiplier = isPlaying ? (1 + Math.sin(currentTime * 10 + i * 0.3) * 0.3) : 0.5;
        const barHeight = height * baseHeight * playingMultiplier;

        // Color bars differently based on progress
        if (barProgress <= progress) {
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        }

        const x = i * barWidth + barWidth * 0.2;
        const y = (height - barHeight) / 2;
        
        ctx.fillRect(x, y, barWidth * 0.6, barHeight);
      }

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
          <div className="mb-6 bg-black bg-opacity-30 rounded-xl p-6 backdrop-blur-sm">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={100}
              className="w-full h-24"
            />
            {isPlaying && (
              <div className="mt-3 text-center text-white text-sm">
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </div>
            )}
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
              {isPlaying ? '⏸ Stop Preview' : '▶ Listen to 10s Preview'}
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
