import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function BrowsePage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTracksCount, setNewTracksCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);

  useEffect(() => {
    // Get last visit time from localStorage
    const lastVisitTime = localStorage.getItem('lastBrowseVisit');
    setLastVisit(lastVisitTime ? new Date(lastVisitTime) : null);
    
    fetchTracks();
    
    // Update last visit time when component unmounts
    return () => {
      localStorage.setItem('lastBrowseVisit', new Date().toISOString());
    };
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks');
      const data = await response.json();
      console.log('📀 Fetched tracks:', data.length);
      setTracks(data);
      
      // Count new tracks (uploaded after last visit)
      const lastVisitTime = localStorage.getItem('lastBrowseVisit');
      console.log('⏰ Last visit:', lastVisitTime);
      
      if (lastVisitTime) {
        const lastVisitDate = new Date(lastVisitTime);
        const newTracks = data.filter(track => {
          if (!track.created_at) return false;
          const trackDate = new Date(track.created_at);
          const isNew = trackDate > lastVisitDate;
          if (isNew) {
            console.log('🆕 New track found:', track.title, 'created:', track.created_at);
          }
          return isNew;
        });
        console.log(`✨ Found ${newTracks.length} new tracks`);
        setNewTracksCount(newTracks.length);
      } else {
        console.log('👋 First visit - no new tracks to show');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const isTrackNew = (track) => {
    if (!lastVisit || !track.created_at) return false;
    const isNew = new Date(track.created_at) > new Date(lastVisit);
    return isNew;
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
          
          {/* New Tracks Banner */}
          {newTracksCount > 0 && (
            <div className="mt-6 mx-auto max-w-md bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
              <span className="font-bold">🎵 {newTracksCount} new track{newTracksCount > 1 ? 's' : ''} available!</span>
            </div>
          )}
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
                className="group bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 relative"
              >
                {/* NEW Badge */}
                {isTrackNew(track) && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
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
