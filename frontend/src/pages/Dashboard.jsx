import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import Certificate from '../components/Certificate';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getUserBookings(user.id);
      setBookings(response.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await bookingService.cancel(bookingId);
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const handleRefund = async (bookingId) => {
    try {
      await bookingService.refund(bookingId);
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const isEventCompleted = (eventDate) => new Date() >= new Date(eventDate);

  if (loading) return <div style={{ padding: '2rem' }}>Loading registrations...</div>;

  return (
    <div className="fade-in">
      <h1 className="gradient-text">My Registrations</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {bookings.map((b) => {
          const completed = isEventCompleted(b.event.date);
          const isCancelled = b.status === 'Cancelled';
          const isRefunded = b.status === 'Refunded';

          return (
            <div key={b.id} className="glass card" style={{ padding: '1.5rem', borderLeft: `6px solid ${isCancelled ? '#e53e3e' : isRefunded ? '#f6ad55' : 'var(--primary)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="category-badge">{b.event.category}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>#{b.id}</span>
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{b.event.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 {b.event.date} | 📍 {b.event.location}</p>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {completed && !isCancelled && !isRefunded ? (
                  <button className="btn btn-primary" onClick={() => setSelectedCertificate(b)}>📜 Download E-Certificate</button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isCancelled && !isRefunded && (
                       <button className="btn" style={{ flex: 1, background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7' }} onClick={() => handleCancel(b.id)}>🗑️ Cancel Ticket</button>
                    )}
                    {user?.role === 'admin' && isCancelled && (
                       <button className="btn btn-primary" style={{ flex: 1, background: '#f6ad55', border: 'none' }} onClick={() => handleRefund(b.id)}>Process Refund ₹</button>
                    )}
                  </div>
                )}
                
                <div style={{ 
                  padding: '0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center',
                  background: isCancelled ? '#fff5f5' : isRefunded ? '#fffaf0' : 'var(--lavender)',
                  color: isCancelled ? '#e53e3e' : isRefunded ? '#dd6b20' : 'var(--primary)'
                }}>
                  {b.status || 'Confirmed'} • ₹{b.event?.price}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCertificate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <Certificate userName={user.name} eventName={selectedCertificate.event.title} date={selectedCertificate.event.date} bookingId={selectedCertificate.id} />
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setSelectedCertificate(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
