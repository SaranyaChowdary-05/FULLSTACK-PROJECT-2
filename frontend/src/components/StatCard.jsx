import React from 'react';

const StatCard = ({ title, value, icon, trend, color }) => {
  return (
    <div className="glass glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          background: color || 'var(--lavender)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}>
          {icon}
        </div>
        <div style={{ 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          color: trend.startsWith('+') ? '#10B981' : '#EF4444',
          background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '0.2rem 0.6rem',
          borderRadius: '10px'
        }}>
          {trend}
        </div>
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{title}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--deep-purple)' }}>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
