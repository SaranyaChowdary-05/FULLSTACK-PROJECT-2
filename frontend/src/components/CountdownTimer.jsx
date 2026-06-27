import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} style={{ textAlign: 'center', minWidth: '60px' }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          color: 'var(--primary)',
          background: 'rgba(147, 112, 219, 0.1)',
          padding: '0.5rem',
          borderRadius: '8px',
          marginBottom: '0.2rem'
        }}>
          {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
        </div>
        <div style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {interval}
        </div>
      </div>
    );
  });

  return (
    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
      {timerComponents.length ? timerComponents : (
        <span style={{ fontWeight: '700', color: '#ff4d4d' }}>Event has started!</span>
      )}
    </div>
  );
};

export default CountdownTimer;
