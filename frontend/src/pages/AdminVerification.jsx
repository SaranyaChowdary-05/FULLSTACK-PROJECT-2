import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const AdminVerification = () => {
  const [ticketId, setTicketId] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!ticketId) return;
    
    setLoading(true);
    setTicketData(null);
    try {
      const response = await axios.get(`/api/admin/verify/${ticketId}`);
      setTicketData(response.data);
      showNotification('Ticket Found!', 'success');
    } catch (err) {
      showNotification('Invalid Ticket ID', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`/api/admin/checkin/${ticketId}`);
      setTicketData(response.data);
      showNotification('Student Checked In Successfully!', 'success');
    } catch (err) {
      showNotification('Failed to Check In', 'error');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text">Ticket Verification</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter a Ticket ID to verify student registration.</p>
      </div>

      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Enter Ticket ID (e.g. 1234)"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              borderRadius: '12px', 
              border: '1px solid var(--glass-border)',
              fontSize: '1.1rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ padding: '0 2rem' }}
          >
            {loading ? '...' : 'Verify'}
          </button>
        </form>
      </div>

      {ticketData && (
        <div className="glass fade-in" style={{ padding: '2rem', borderLeft: '5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>{ticketData.userName}</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0' }}>{ticketData.userEmail}</p>
            </div>
            <span style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              background: ticketData.status === 'Checked In' ? '#e6fffa' : '#fffaf0',
              color: ticketData.status === 'Checked In' ? '#2c7a7b' : '#b7791f',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              border: '1px solid currentColor'
            }}>
              {ticketData.status.toUpperCase()}
            </span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Event Information</h4>
            <div style={{ fontWeight: '600' }}>{ticketData.event.title}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {ticketData.event.location} | 📅 {ticketData.event.date}</div>
          </div>

          {ticketData.status !== 'Checked In' && (
            <button 
              onClick={handleCheckIn}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
            >
              ✅ Confirm Attendance & Check In
            </button>
          )}

          {ticketData.status === 'Checked In' && (
            <div style={{ textAlign: 'center', color: '#2c7a7b', fontWeight: 'bold' }}>
              ✓ Student is already checked in for this event.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
