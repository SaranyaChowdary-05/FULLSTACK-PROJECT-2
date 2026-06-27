import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const Ticket = ({ booking, event }) => {
  if (!booking || !event) return null;

  return (
    <div className="ticket-container fade-in">
      <div className="ticket-card">
        {/* Ticket Header */}
        <div className="ticket-header">
          <div className="nexus-logo">NEXUS</div>
          <div className="ticket-type">ADMIT ONE</div>
        </div>

        {/* Event Image */}
        <div className="ticket-visual">
          <img src={event.imageUrl} alt={event.title} />
          <div className="event-overlay">
            <h2 className="event-title">{event.title}</h2>
          </div>
        </div>

        {/* Ticket Info Section */}
        <div className="ticket-info">
          <div className="info-row">
            <div className="info-item">
              <label>DATE</label>
              <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="info-item">
              <label>TIME</label>
              <span>06:00 PM</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>VENUE</label>
              <span>{event.location || event.venue}</span>
            </div>
            <div className="info-item">
              <label>SEAT</label>
              <span>GENERAL</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item full">
              <label>HOLDER</label>
              <span>{booking.attendeeName || 'Nexus Student'}</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="ticket-footer">
          <div className="qr-wrapper">
            <QRCodeSVG 
              value={JSON.stringify({
                id: booking.id,
                event: event.title,
                user: booking.attendeeName
              })} 
              size={100}
              level={"H"}
              includeMargin={true}
            />
          </div>
          <div className="booking-id">
            <label>BOOKING ID</label>
            <span>#NX-{booking.id.toString().padStart(5, '0')}</span>
          </div>
        </div>

        {/* Perforation Line */}
        <div className="ticket-stub-line">
          <div className="notch left"></div>
          <div className="notch right"></div>
        </div>
      </div>

      <style>{`
        .ticket-container {
          display: flex;
          justify-content: center;
          padding: 1rem;
        }

        .ticket-card {
          width: 350px;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          font-family: 'Outfit', sans-serif;
        }

        .ticket-header {
          background: #1a1a1a;
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nexus-logo {
          font-weight: 900;
          letter-spacing: 2px;
          font-size: 1.2rem;
        }

        .ticket-type {
          font-size: 0.7rem;
          font-weight: 700;
          opacity: 0.6;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .ticket-visual {
          height: 180px;
          position: relative;
        }

        .ticket-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: white;
        }

        .event-title {
          margin: 0;
          font-size: 1.4rem;
          line-height: 1.2;
        }

        .ticket-info {
          padding: 1.5rem;
          background: white;
        }

        .info-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.2rem;
        }

        .info-item {
          flex: 1;
        }

        .info-item label {
          display: block;
          font-size: 0.65rem;
          font-weight: 800;
          color: #aaa;
          margin-bottom: 4px;
        }

        .info-item span {
          font-weight: 700;
          color: #333;
          font-size: 0.9rem;
        }

        .ticket-footer {
          padding: 1.5rem;
          background: #fdfdfd;
          border-top: 1px dashed #eee;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .qr-wrapper {
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .booking-id {
          display: flex;
          flex-direction: column;
        }

        .booking-id span {
          font-family: monospace;
          font-weight: 700;
          font-size: 1rem;
          color: var(--primary);
        }

        .ticket-stub-line {
          position: absolute;
          bottom: 130px; /* Aligned with ticket-footer border */
          width: 100%;
          pointer-events: none;
        }

        .notch {
          width: 20px;
          height: 20px;
          background: var(--bg-main);
          border-radius: 50%;
          position: absolute;
          top: -10px;
        }

        .notch.left { left: -10px; }
        .notch.right { right: -10px; }
      `}</style>
    </div>
  );
};

export default Ticket;
