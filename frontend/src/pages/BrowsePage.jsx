import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function BrowsePage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNewTracks, setHasNewTracks] = useState(false);
  const [newTrackCount, setNewTrackCount] = useState(0);

  useEffect(() => {
    fetchTracks();
  }, []);

  const isTrackNew = (track) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const uploadDate = new Date(track.uploaded_at || track.created_at);
    return uploadDate > sevenDaysAgo;
  };

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks');
      const data = await response.json();
      setTracks(data);
      
      // Check for tracks uploaded in the last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const newTracks = data.filter(track => {
        const uploadDate = new Date(track.uploaded_at || track.created_at);
        return uploadDate > sevenDaysAgo;
      });
      
      if (newTracks.length > 0) {
        setHasNewTracks(true);
        setNewTrackCount(newTracks.length);
      }
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

        {/* New Tracks Banner */}
        {hasNewTracks && (
          <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 shadow-lg border border-purple-400 animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎵</span>
              <div className="text-center">
                <p className="text-white font-bold text-lg">
                  {newTrackCount} New Track{newTrackCount > 1 ? 's' : ''} Available!
                </p>
                <p className="text-purple-100 text-sm">
                  Fresh music uploaded in the last 7 days
                </p>
              </div>
              <span className="text-2xl">✨</span>
            </div>
          </div>
        )}

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
                className="group bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 relative"
              >
                {/* NEW Badge */}
                {isTrackNew(track) && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-bounce">
                    NEW
                  </div>
                )}
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
                    <span className="text-gray-300">
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

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <button
            onClick={() => {
              if (window.confirm('To close the app, use your phone\'s home button or swipe up gesture.')) {
                // User acknowledged
              }
            }}
            className="mb-4 text-gray-400 hover:text-gray-300 text-sm transition"
          >
            How to close this app?
          </button>
          <p className="text-gray-500 text-sm">
            © 2025 Mediad Innovation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
