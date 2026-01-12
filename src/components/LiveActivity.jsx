import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitCommit, MapPin, Activity, Clock } from 'lucide-react';

const appleEase = [0.22, 1, 0.36, 1];

const LiveActivity = ({ githubUsername, spotifyToken = null }) => {
  const [latestCommit, setLatestCommit] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(false);

  // Fetch latest GitHub commit
  useEffect(() => {
    const fetchLatestCommit = async () => {
      if (!githubUsername) return;
      
      try {
        const response = await fetch(
          `https://api.github.com/users/${githubUsername}/events/public?per_page=10`
        );
        if (response.ok) {
          const events = await response.json();
          const pushEvent = events.find(e => e.type === 'PushEvent');
          
          if (pushEvent && pushEvent.payload?.commits?.length > 0) {
            const commit = pushEvent.payload.commits[0];
            const repo = pushEvent.repo.name;
            const timeAgo = getTimeAgo(new Date(pushEvent.created_at));
            
            setLatestCommit({
              message: commit.message,
              repo: repo,
              time: timeAgo,
              url: pushEvent.repo.url
            });
            setIsLive(true);
          }
        }
      } catch (error) {
        console.error('Error fetching GitHub commits:', error);
      }
    };

    fetchLatestCommit();
    const interval = setInterval(fetchLatestCommit, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [githubUsername]);

  // Fetch location (using IP-based geolocation)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          setLocation({
            city: data.city,
            country: data.country_name,
            timezone: data.timezone,
            emoji: data.country_code === 'US' ? '🇺🇸' : 
                   data.country_code === 'GB' ? '🇬🇧' :
                   data.country_code === 'IN' ? '🇮🇳' :
                   data.country_code === 'CA' ? '🇨🇦' : '🌍'
          });
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  // Get current time
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: appleEase }}
      className="relative"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl -z-10"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Live Pulse Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="relative w-3 h-3"
          animate={isLive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div 
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: isLive ? '#34C759' : '#8E8E93' }}
          />
          {isLive && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: '#34C759' }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
        <span 
          className="text-sm font-medium"
          style={{ 
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {isLive ? 'Live Activity' : 'Recent Activity'}
        </span>
      </div>

      {/* Activity Cards */}
      <div className="grid gap-4">
        {/* Latest Commit */}
        <AnimatePresence mode="wait">
          {latestCommit && (
            <motion.div
              key="commit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: appleEase }}
              className="p-4 rounded-2xl backdrop-blur-md"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--apple-blue)' }}>
                  <GitCommit className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Latest Commit
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {latestCommit.time}
                    </p>
                  </div>
                  <p 
                    className="text-sm font-medium truncate mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {latestCommit.message}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {latestCommit.repo}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Location & Time */}
        {location && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: appleEase, delay: 0.1 }}
            className="p-4 rounded-2xl backdrop-blur-md"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: '#FF9500' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Currently in
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {location.emoji} {location.city}, {location.country}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatTime(lastUpdated)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Coding Status (Placeholder for Spotify integration) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: appleEase, delay: 0.2 }}
          className="p-4 rounded-2xl backdrop-blur-md"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: '#1DB954' }}>
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Coding Vibes
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                🎧 Focus Mode Active
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Building amazing things
              </p>
            </div>
          </div>
        </motion.div>

        {/* Activity Pulse */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: appleEase, delay: 0.3 }}
          className="p-4 rounded-2xl backdrop-blur-md"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: '#5856D6' }}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Status
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                ✨ Open to opportunities
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Available for collaboration
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Last Updated */}
      <motion.p
        className="text-xs mt-4 text-center"
        style={{ color: 'var(--text-tertiary)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Updated {formatTime(lastUpdated)}
      </motion.p>
    </motion.div>
  );
};

export default LiveActivity;
