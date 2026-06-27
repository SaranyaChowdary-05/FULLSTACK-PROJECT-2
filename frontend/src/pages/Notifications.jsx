import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const { notifications, markAllAsRead } = useNotification();

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ margin: 0 }}>Notification Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Stay updated with your bookings and platform news.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          style={{ fontSize: '0.8rem' }}
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <FilterTab active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
        <FilterTab active={filter === 'booking'} label="Bookings" onClick={() => setFilter('booking')} />
        <FilterTab active={filter === 'system'} label="System" onClick={() => setFilter('system')} />
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(n => (
          <div key={n.id} className="glass" style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            gap: '1.5rem', 
            alignItems: 'flex-start',
            borderLeft: n.read ? '1px solid var(--glass-border)' : '4px solid var(--primary)',
            background: n.read ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
            animation: 'slideIn 0.3s ease forwards'
          }}>
            <div style={{ fontSize: '1.5rem' }}>
              {n.type === 'booking' ? '🎫' : n.type === 'system' ? '🚀' : '🔔'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>{n.title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(n.time)}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8 }}>{n.message}</p>
            </div>
            {!n.read && (
              <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p>No notifications found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterTab = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '0.5rem 1.2rem',
      borderRadius: '20px',
      border: 'none',
      background: active ? 'var(--primary)' : 'var(--lavender)',
      color: active ? 'white' : 'var(--primary)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
  >
    {label}
  </button>
);

export default Notifications;
