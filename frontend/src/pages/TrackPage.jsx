import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TrackDisplay from '../components/TrackDisplay';

export default function TrackPage() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await axios.get(`/api/tracks/${id}`);
        setTrack(response.data);
      } catch (err) {
        console.error('Error fetching track:', err);
        setError('Track not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-white text-2xl mb-4">{error || 'Track not found'}</div>
        <Link to="/browse" className="text-purple-400 hover:text-purple-300">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <Link to="/browse" className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center">
          ← Back to Browse
        </Link>
      </div>
      <TrackDisplay track={track} />
    </div>
  );
}
