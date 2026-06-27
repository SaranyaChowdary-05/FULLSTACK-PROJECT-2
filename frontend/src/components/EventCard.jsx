import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSoldOut = event.registrations >= event.capacity;
  
  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days Left` : 'Happening Now';
  };
  const fillPercentage = (event.registrations / event.capacity) * 100;

  return (
    <div className={`glass glass-card ${isSoldOut ? 'sold-out-card' : ''}`} style={{ 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease',
      position: 'relative'
    }}>
      {isSoldOut && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '-35px',
          background: '#ff4d4d',
          color: 'white',
          padding: '5px 40px',
          transform: 'rotate(45deg)',
          zIndex: 10,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          SOLD OUT
        </div>
      )}

      <div style={{ position: 'relative', height: '200px' }}>
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isSoldOut ? 'grayscale(100%)' : 'none' }}
        />
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.9)',
          padding: '0.3rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: '700',
          color: 'var(--primary)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          {getDaysLeft(event.date)}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'rgba(255,255,255,0.9)',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: 'var(--primary)'
        }}>
          {event.category}
        </div>
      </div>

      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{event.title}</h3>
        <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold' }}>₹{event.price}</div>
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)', 
          marginBottom: '1.5rem', 
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </p>

        {/* Capacity Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
            <span>{isSoldOut ? 'No seats left' : `${event.capacity - event.registrations} seats remaining`}</span>
            <span>{Math.round(fillPercentage)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${fillPercentage}%`, 
              background: fillPercentage > 80 ? '#ff4d4d' : 'var(--primary)',
              transition: 'width 1s ease'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{event.price === 0 ? 'FREE' : `₹${event.price}`}</div>
          <button 
            className={`btn ${isSoldOut ? '' : 'btn-primary'}`} 
            style={{ 
              padding: '0.6rem 1.2rem',
              background: isSoldOut ? 'linear-gradient(135deg, #f6ad55, #ed8936)' : undefined,
              color: isSoldOut ? 'white' : undefined,
              border: isSoldOut ? 'none' : undefined
            }}
            onClick={() => navigate(`/events/${event._id || event.id}`)}
          >
            {user?.role === 'admin' ? 'View Details' : (isSoldOut ? '📋 Waitlist' : 'Book Now')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
