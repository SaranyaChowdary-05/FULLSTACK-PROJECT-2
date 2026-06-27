import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err) {
      showNotification('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCapacity = async (eventId, currentCapacity, delta) => {
    const newCapacity = currentCapacity + delta;
    if (newCapacity < 0) return;

    try {
      await api.patch(`/events/${eventId}/capacity`, { capacity: newCapacity });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, capacity: newCapacity } : e));
      showNotification(`Capacity successfully updated to ${newCapacity}`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Server Connection Error';
      showNotification(`Update Failed: ${errorMsg}`, 'error');
      console.error("Capacity Update Error:", err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading events...</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text">Manage Event Inventory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Increase or decrease available tickets in real-time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {events.map(event => (
          <div key={event.id} className="glass card flex-col-mobile" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} 
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.3rem 0' }}>{event.title}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.category}</p>
              
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Tickets: <span style={{ color: 'var(--primary)' }}>{event.registrations}/{event.capacity}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => updateCapacity(event.id, event.capacity, -5)}
                    className="btn" 
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#fff5f5', color: '#e53e3e' }}
                  >
                    -5
                  </button>
                  <button 
                    onClick={() => updateCapacity(event.id, event.capacity, 5)}
                    className="btn" 
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#f0fff4', color: '#38a169' }}
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                height: '40px', width: '40px', borderRadius: '50%', 
                background: event.registrations >= event.capacity ? '#fed7d7' : '#f0fff4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem'
              }}>
                {event.registrations >= event.capacity ? '🚫' : '✅'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;
