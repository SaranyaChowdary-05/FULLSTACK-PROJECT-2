import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const LiveFeed = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = new SockJS(`http://${window.location.hostname}:8080/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe('/topic/notifications', (message) => {
          const notification = JSON.parse(message.body);
          addNotification(notification);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });

    client.activate();

    return () => client.deactivate();
  }, []);

  const addNotification = (notif) => {
    const id = Date.now();
    setNotifications(prev => [{ ...notif, id }, ...prev].slice(0, 5));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxWidth: '350px'
    }}>
      {notifications.map(notif => (
        <div key={notif.id} className="glass slide-in" style={{
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div style={{ fontSize: '1.5rem' }}>✨</div>
          <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{notif.message}</div>
          <button 
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default LiveFeed;
