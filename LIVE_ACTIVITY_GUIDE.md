# Live Activity Component Documentation

## Overview
The **Live Activity** component creates a real-time "pulse" of your professional life, making your CV feel alive and dynamic rather than static.

## Features

### 🔥 Live Status Indicator
- Animated pulse dot that shows when activity is recent
- Green pulse when you've committed code recently
- Gray when inactive
- Real-time beat animation

### 💻 Latest GitHub Commit
- Displays your most recent commit message
- Shows repository name
- Time ago indicator (e.g., "2h ago", "just now")
- Automatically updates every minute
- Direct link to repository

### 📍 Live Location
- IP-based geolocation showing current city and country
- Flag emoji for your country
- Real-time clock showing your local time
- Updates every second
- Timezone information

### 🎧 Coding Status
- Placeholder for Spotify integration (future feature)
- Shows "Focus Mode Active" status
- Can be extended with Spotify API for real music data

### ✨ Activity Pulse
- Shows current availability status
- "Open to opportunities" indicator
- Can be customized for different statuses

## Technical Implementation

### Real-time Updates
```javascript
// GitHub commits update every 60 seconds
useEffect(() => {
  fetchLatestCommit();
  const interval = setInterval(fetchLatestCommit, 60000);
  return () => clearInterval(interval);
}, [githubUsername]);
```

### Data Sources
1. **GitHub Events API**
   - Endpoint: `https://api.github.com/users/{username}/events/public`
   - Fetches last 10 events
   - Filters for PushEvents (commits)
   - Extracts latest commit message

2. **IP Geolocation**
   - Service: ipapi.co
   - Provides city, country, timezone
   - No API key required for basic usage

3. **Browser Time API**
   - Uses JavaScript Date object
   - Updates every second
   - Displays in 12-hour format

## Design Principles

### Apple Human Interface Guidelines
- **Cards**: Rounded corners (rounded-2xl), backdrop blur
- **Colors**: Uses CSS variables for theme consistency
- **Icons**: lucide-react icons with consistent sizing
- **Animations**: Smooth Framer Motion transitions
- **Typography**: Inter font with proper weight hierarchy

### Color Coding
- **Blue** (#0071E3): GitHub commits
- **Orange** (#FF9500): Location
- **Green** (#1DB954): Spotify/Music (Spotify brand color)
- **Purple** (#5856D6): Activity status

## Future Enhancements

### Spotify Integration
To add real music data:
1. Register app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Get OAuth token
3. Use [Currently Playing API](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track)
4. Display:
   - Track name
   - Artist
   - Album artwork
   - Progress bar

### GitHub Integration Improvements
- Show contribution streak
- Display most-used language today
- Show open PRs count
- Recent stars received

### Location Features
- Weather at current location
- Sunrise/sunset times
- Conference/event check-in
- Custom location messages

### Activity Enhancements
- Calendar integration (Google/Outlook)
- Show "In a meeting" status
- Custom availability messages
- Time-based automatic status

## Usage

```jsx
import LiveActivity from './components/LiveActivity';

// In your component
<LiveActivity 
  githubUsername="your-github-username"
  spotifyToken={null} // Optional: for future Spotify integration
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `githubUsername` | string | Yes | Your GitHub username |
| `spotifyToken` | string | No | Spotify access token (future feature) |

## Performance

- **GitHub API**: 60-second polling (safe for rate limits)
- **Geolocation**: Fetches once on mount
- **Clock**: Updates every second (minimal CPU usage)
- **Animations**: GPU-accelerated via Framer Motion

## API Rate Limits

### GitHub
- Unauthenticated: 60 requests/hour
- With this component: 1 request/minute = Safe
- To increase: Add GitHub personal access token

### ipapi.co
- Free tier: 1,000 requests/day
- With this component: 1 request per page load = Safe

## Browser Compatibility

- ✅ Chrome, Edge, Firefox, Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ All modern browsers with JavaScript enabled

## Privacy Considerations

- **Location**: Uses IP-based geolocation (city-level accuracy)
- **GitHub**: Public events only (no private repo data)
- **Spotify**: Would require explicit OAuth consent
- No personal data is stored or transmitted to third parties

## Customization

### Change Update Intervals
```javascript
// In LiveActivity.jsx
const interval = setInterval(fetchLatestCommit, 30000); // 30 seconds instead of 60
```

### Customize Time Format
```javascript
// In formatTime function
return date.toLocaleTimeString('en-GB', { // 24-hour format
  hour: '2-digit', 
  minute: '2-digit'
});
```

### Add Custom Status Cards
```jsx
<motion.div className="p-4 rounded-2xl backdrop-blur-md">
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-full" style={{ backgroundColor: '#FF3B30' }}>
      <CustomIcon className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-xs mb-1">Custom Status</p>
      <p className="text-sm font-medium">Your message here</p>
    </div>
  </div>
</motion.div>
```

## Troubleshooting

### GitHub API Not Working
- Check username is correct
- Verify you have recent public activity
- Check browser console for errors
- Ensure you're not hitting rate limits

### Location Not Showing
- Check internet connection
- ipapi.co might be blocked by firewall
- Try alternative: `https://api.ipify.org/` + geocoding

### Time Not Updating
- Check browser JavaScript is enabled
- Clear cache and reload
- Check console for errors

## Design Philosophy

This component embodies the philosophy of **"show, don't tell"**:
- Instead of saying "I code daily" → Show latest commit
- Instead of "Available worldwide" → Show current location
- Instead of "Active developer" → Show live status

It makes your CV feel like a **living document** that reflects your actual professional activity in real-time.
