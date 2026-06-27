import React from 'react';

const Certificate = ({ userName, eventName, date, bookingId }) => {
  return (
    <div id="certificate-content" style={{
      width: '800px',
      padding: '40px',
      background: 'white',
      border: '20px solid var(--lavender)',
      position: 'relative',
      fontFamily: "'Playfair Display', serif",
      color: '#333',
      margin: '0 auto',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
    }}>
      {/* Decorative Border */}
      <div style={{
        border: '2px solid var(--primary)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--primary)', letterSpacing: '5px', margin: 0 }}>NEXUS INSTITUTE</h2>
          <div style={{ width: '100px', height: '2px', background: 'var(--primary)', margin: '10px auto' }}></div>
          <p style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>CENTER OF EXCELLENCE</p>
        </div>

        <h1 style={{ fontSize: '3.5rem', margin: '20px 0', color: '#1a1a1a' }}>CERTIFICATE</h1>
        <p style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>OF PARTICIPATION</p>

        <p style={{ margin: '30px 0 10px 0' }}>This is to certify that</p>
        <h2 style={{ fontSize: '2.5rem', borderBottom: '2px solid #eee', display: 'inline-block', padding: '0 40px', margin: '10px 0' }}>
          {userName || 'Student Name'}
        </h2>

        <p style={{ margin: '20px 0' }}>
          has successfully participated in the workshop on <br />
          <strong style={{ fontSize: '1.4rem' }}>{eventName}</strong>
        </p>

        <p>held on <strong>{new Date(date).toLocaleDateString()}</strong></p>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '50px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', height: '1px', background: '#333', marginBottom: '10px' }}></div>
            <p style={{ fontSize: '0.8rem' }}>DR. SARANYA CHOWDARY<br/>Event Coordinator</p>
          </div>

          {/* QR Code Simulation */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #ddd',
            fontSize: '0.5rem',
            textAlign: 'center',
            padding: '5px'
          }}>
            VERIFIED<br/>ID: {bookingId}<br/>[QR CODE]
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', height: '1px', background: '#333', marginBottom: '10px' }}></div>
            <p style={{ fontSize: '0.8rem' }}>PROF. DAVID BLAKE<br/>Head of Department</p>
          </div>
        </div>
      </div>

      {/* Gold Seal Decoration */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        width: '80px',
        height: '80px',
        background: '#FFD700',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 5px 15px rgba(218, 165, 32, 0.4)',
        border: '4px double #DAA520'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🏅</span>
      </div>
    </div>
  );
};

export default Certificate;
