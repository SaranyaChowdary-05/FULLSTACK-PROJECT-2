import React from 'react';

function BookingSummary({ summary, onReset }) {
  if (!summary) return null;

  return (
    <div className="glass-card" style={{ border: '1px solid var(--success)' }}>
      <h2 style={{ color: 'var(--success)', background: 'none', WebkitBackgroundClip: 'unset' }}>
        ✅ Booking Confirmed!
      </h2>
      <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>
        Your tickets have been successfully booked. An email confirmation has been sent to {summary.emailId}.
      </p>

      <div className="summary-details">
        <div className="summary-item">
          <span>Name:</span>
          <span>{summary.userName}</span>
        </div>
        <div className="summary-item">
          <span>Department:</span>
          <span>{summary.department}</span>
        </div>
        <div className="summary-item">
          <span>Event:</span>
          <span>{summary.event.eventName}</span>
        </div>
        <div className="summary-item">
          <span>Tickets Booked:</span>
          <span>{summary.numberOfTickets}</span>
        </div>
        <div className="summary-item">
          <span>Total Amount:</span>
          <span>${summary.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={onReset} className="btn btn-primary">
        Book Another Ticket
      </button>
    </div>
  );
}

export default BookingSummary;
