import { useEffect, useRef } from 'react';

const GitHubCalendar = ({ username = 'ADAMSmugwe' }) => {
  const calendarRef = useRef(null);

  useEffect(() => {
    if (calendarRef.current && username) {
      // Create script element for GitHubCalendar library
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/github-calendar@latest/dist/github-calendar.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.GitHubCalendar) {
          window.GitHubCalendar(calendarRef.current, username, {
            responsive: true,
            tooltips: true,
          });
        }
      };

      document.body.appendChild(script);

      // Add CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/github-calendar@latest/dist/github-calendar-responsive.css';
      document.head.appendChild(link);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
    }
  }, [username]);

  return <div ref={calendarRef} className="calendar"></div>;
};

export default GitHubCalendar;
