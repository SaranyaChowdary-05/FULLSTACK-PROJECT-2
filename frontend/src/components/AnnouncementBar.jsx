import React from 'react';

const AnnouncementBar = () => {
  const announcements = [
    "🚀 Flash Sale: 20% off on all Engineering workshops this week!",
    "📅 New Event Added: Urban Landscape Photography Masterclass - Register Now!",
    "🏆 Congratulations to Team Nexus for winning the Inter-University Hackathon!",
    "🔔 Reminder: Deadline for Annual Robotics Challenge registration is tomorrow."
  ];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
      color: 'white',
      padding: '0.5rem 0',
      fontSize: '0.85rem',
      fontWeight: '600',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1100
    }}>
      <div className="marquee" style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: 'marquee 30s linear infinite',
        gap: '4rem'
      }}>
        {announcements.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
        {/* Duplicate for seamless loop */}
        {announcements.map((text, i) => (
          <span key={`dup-${i}`}>{text}</span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
