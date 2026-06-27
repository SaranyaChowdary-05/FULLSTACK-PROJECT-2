import React, { useState } from 'react';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Ticket from './Ticket';

const BookingForm = ({ event, onComplete, onCancel }) => {
  const { user, updateUserInfo } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [bookingData, setBookingData] = useState(null);

  const maxTickets = Math.min(10, event.capacity - event.registrations);
  const subtotal = event.price * tickets;
  const finalPrice = Math.max(0, subtotal - discount);

  const increaseTickets = () => { if (tickets < maxTickets) setTickets(t => t + 1); };
  const decreaseTickets = () => { if (tickets > 1) setTickets(t => t - 1); };

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    let discAmount = 0;
    if (code === 'NEXUS50') discAmount = subtotal * 0.5;
    else if (code === 'STUDENT10') discAmount = subtotal * 0.1;
    else if (code === 'SARANYA') discAmount = 50;
    else { showNotification('Invalid Promo Code', 'error'); return; }
    setDiscount(discAmount); setAppliedCode(code);
    showNotification(`Promo Code ${code} Applied!`, 'success');
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingService.create({
        eventId: event.id || event._id,
        userId: user?.id || 999,
        userName: user?.name || 'Guest',
        userEmail: user?.email || 'guest@nexus.edu',
        tickets: tickets,
        paidAmount: finalPrice,
        promoUsed: appliedCode
      });
      setBookingData(response.data);
      
      // Update global user state with new XP, Level, and Badges
      if (response.data.newXP !== undefined) {
        updateUserInfo({ 
          xp: response.data.newXP, 
          level: response.data.newLevel,
          badges: response.data.newBadges
        });
      }

      showNotification(`${tickets} ticket(s) for ${event.title} booked! 🎉`, 'success');
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.message || 'Error';
      showNotification(`Booking Failed: ${errorDetail}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (bookingData) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
        <h3 className="gradient-text" style={{ marginBottom: '1.5rem' }}>Success! Your Ticket is Ready</h3>
        <Ticket booking={bookingData} event={event} />
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>🖨️ Print Ticket</button>
          <button onClick={onComplete} className="btn btn-primary" style={{ flex: 1 }}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Confirm Registration</h3>
      
      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '15px', marginBottom: '1.5rem' }}>
        <h4 style={{ margin: 0 }}>{event.title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📅 {event.date} | 📍 {event.location}</p>
      </div>

      {/* Ticket Quantity Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          NUMBER OF TICKETS
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={decreaseTickets} 
            disabled={tickets <= 1}
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #ddd',
              background: tickets <= 1 ? '#f5f5f5' : 'white', cursor: tickets <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem', fontWeight: 'bold', color: tickets <= 1 ? '#ccc' : 'var(--primary)'
            }}
          >−</button>
          <div style={{ 
            fontSize: '1.5rem', fontWeight: 'bold', minWidth: '50px', textAlign: 'center',
            color: 'var(--primary)'
          }}>{tickets}</div>
          <button 
            onClick={increaseTickets} 
            disabled={tickets >= maxTickets}
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #ddd',
              background: tickets >= maxTickets ? '#f5f5f5' : 'white', cursor: tickets >= maxTickets ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem', fontWeight: 'bold', color: tickets >= maxTickets ? '#ccc' : 'var(--primary)'
            }}
          >+</button>
          <span style={{ fontSize: '0.75rem', color: '#999' }}>
            (Max {maxTickets})
          </span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          <span>₹{event.price} × {tickets} ticket{tickets > 1 ? 's' : ''}</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38a169', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <span>Promo ({appliedCode}):</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid var(--primary)' }}>
          <span>Total:</span>
          <span>₹{finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo Code */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" placeholder="Promo Code" value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.9rem' }}
          />
          <button onClick={applyPromo} className="btn btn-secondary">Apply</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
        <button onClick={handleBooking} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
          {loading ? 'Processing...' : `Book ${tickets} Ticket${tickets > 1 ? 's' : ''} Now`}
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
