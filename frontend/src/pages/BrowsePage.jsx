import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function BrowsePage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/tracks`);
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            MAXSOUND
          </h1>
          <p className="text-gray-400 text-lg">
            Premium Audio Experience
          </p>
        </div>

        {/* Tracks Grid */}
        {tracks.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl mb-4">No tracks available yet</p>
            <p className="text-sm">Check back soon for new releases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <Link
                key={track.id}
                to={`/track/${track.id}`}
                className="group bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-6">
                  {/* Track Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition">
                    {track.title}
                  </h3>
                  
                  {/* Artist */}
                  <p className="text-gray-400 text-sm mb-4">
                    {track.artist || 'Unknown Artist'}
                  </p>
                  
                  {/* Price & Views */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300 font-bold">
                      ${(track.price / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      {track.views || 0} views
                    </span>
                  </div>
                  
                  {/* Play Button Indicator */}
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <span className="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition">
                      Preview & Purchase →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
