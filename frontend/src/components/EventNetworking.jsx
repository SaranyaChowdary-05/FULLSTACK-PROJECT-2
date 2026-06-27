import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const EventNetworking = ({ eventId }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [attendees, setAttendees] = useState([]);
  const [connecting, setConnecting] = useState({});

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await api.get(`/events/${eventId}/attendees`);
        setAttendees(res.data.filter(a => String(a.id) !== String(user?.id)));
      } catch (err) { console.error(err); }
    };
    if (eventId) fetchAttendees();
  }, [eventId, user?.id]);

  const handleConnect = async (targetId) => {
    setConnecting(prev => ({ ...prev, [targetId]: true }));
    try {
      await api.post('/users/connect', { fromId: user.id, toId: targetId });
      showNotification('Connection Request Sent! 🤝', 'success');
    } catch (err) {
      showNotification('Failed to connect', 'error');
    } finally {
      setConnecting(prev => ({ ...prev, [targetId]: false }));
    }
  };

  if (attendees.length === 0) return null;

  return (
    <div className="glass fade-in" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        🤝 Network with Attendees
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Connect with other students attending this event to collaborate or carpool!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {attendees.map(a => (
          <div key={a.id} className="glass-hover" style={{ 
            padding: '1.2rem', borderRadius: '15px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '50%', background: 'var(--lavender)', 
              margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold'
            }}>
              {a.name[0]}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{a.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{a.dept || 'Student'}</div>
            
            <button 
              onClick={() => handleConnect(a.id)}
              disabled={connecting[a.id]}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
            >
              {connecting[a.id] ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventNetworking;
