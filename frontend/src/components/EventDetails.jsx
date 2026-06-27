import React, { useState, useEffect } from 'react';
import { waitlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function EventDetails({ event }) {
  const { user } = useAuth();
  const [waitlistPos, setWaitlistPos] = useState(null);
  const [joining, setJoining] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);

  const isSoldOut = event.registrations >= event.capacity;

  useEffect(() => {
    if (isSoldOut && event) {
      waitlistService.getForEvent(event._id || event.id).then(res => {
        const waiting = res.data.filter(w => w.status === 'waiting');
        setWaitlistCount(waiting.length);
        const mySpot = waiting.findIndex(w => String(w.userId) === String(user?.id));
        if (mySpot !== -1) setWaitlistPos(mySpot + 1);
      }).catch(() => {});
    }
  }, [event, isSoldOut, user?.id]);

  const handleJoinWaitlist = async () => {
    setJoining(true);
    try {
      const res = await waitlistService.join({
        eventId: event._id || event.id,
        userId: user.id,
        userName: user.name
      });
      setWaitlistPos(res.data.position);
      setWaitlistCount(prev => prev + 1);
    } catch (err) { console.error(err); }
    finally { setJoining(false); }
  };

  if (!event) return null;

  const formattedDate = new Date(event.date || event.eventDate).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      {event.imageUrl && (
        <div style={{ width: '100%', height: '300px', marginBottom: '2rem', borderRadius: '24px', overflow: 'hidden' }}>
          <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{event.title || event.eventName}</h2>
          <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', background: 'var(--lavender)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>
            {event.category}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
            {event.price === 0 ? 'FREE' : `₹${event.price}`}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per attendee</div>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        {event.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DATE & TIME</div>
          <div style={{ fontWeight: '600' }}>{formattedDate}</div>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>VENUE / LOCATION</div>
          <div style={{ fontWeight: '600' }}>{event.location || event.venue}</div>
        </div>
      </div>

      {/* Capacity / Waitlist Section */}
      <div style={{ 
        padding: '1.5rem', borderRadius: '16px', 
        background: isSoldOut ? '#fff5f5' : 'rgba(147, 112, 219, 0.05)',
        border: `1px solid ${isSoldOut ? '#ff4d4d' : 'var(--primary)'}`,
        textAlign: 'center'
      }}>
        {isSoldOut ? (
          <div>
            <div style={{ color: '#ff4d4d', fontWeight: '700', marginBottom: '1rem' }}>⚠️ This event is currently sold out!</div>
            
            {waitlistPos ? (
              <div style={{ 
                padding: '1rem', background: '#fffaf0', borderRadius: '12px', border: '1px solid #f6ad55',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
              }}>
                <div style={{ fontSize: '2rem' }}>📋</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#dd6b20' }}>You're on the Waitlist!</div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    Position <strong>#{waitlistPos}</strong> of {waitlistCount} — You'll be notified if a spot opens up.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
                  {waitlistCount > 0 ? `${waitlistCount} students already waiting` : 'Be the first on the waitlist!'}
                  {' '}— If someone cancels, you get a 10-minute window to claim the spot.
                </p>
                <button 
                  className="btn" 
                  onClick={handleJoinWaitlist}
                  disabled={joining}
                  style={{ 
                    background: 'linear-gradient(135deg, #f6ad55, #ed8936)', color: 'white', 
                    border: 'none', padding: '0.8rem 2rem', fontWeight: 'bold', fontSize: '0.9rem'
                  }}
                >
                  {joining ? 'Joining...' : '📋 Join Waitlist'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--primary)', fontWeight: '600' }}>
            ✨ {event.capacity - event.registrations} spots available out of {event.capacity}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
