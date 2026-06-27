import React from 'react';

const AdminAnalytics = ({ data }) => {
  // Mock data for fallback
  const chartData = data || [
    { label: 'CS', value: 85, color: '#6e8efb' },
    { label: 'Eng', value: 65, color: '#a777e3' },
    { label: 'Arts', value: 45, color: '#ff6b6b' },
    { label: 'Sports', value: 95, color: '#2ecc71' },
    { label: 'IT', value: 75, color: '#f1c40f' }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="glass fade-in" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📊</span> Nexus Performance Analytics
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Registration Bar Chart */}
        <div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>REGISTRATIONS BY DEPARTMENT</h4>
          <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '2rem', borderBottom: '2px solid #eee' }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '15%' }}>
                {/* Bar */}
                <div 
                  className="bar-animate"
                  style={{ 
                    width: '100%', 
                    height: `${(d.value / maxValue) * 200}px`, 
                    background: d.color,
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '0.75rem', fontWeight: 'bold', color: d.color 
                  }}>
                    {d.value}
                  </div>
                </div>
                {/* Label */}
                <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PLATFORM INSIGHTS</h4>
          
          {[
            { label: 'Booking Rate', value: '+12.5%', icon: '📈', color: '#2ecc71' },
            { label: 'User Retention', value: '88%', icon: '👥', color: '#6e8efb' },
            { label: 'Server Load', value: '24ms', icon: '⚡', color: '#f1c40f' }
          ].map((stat, i) => (
            <div key={i} className="glass-hover" style={{ 
              padding: '1.2rem', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderLeft: `4px solid ${stat.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</span>
              </div>
              <span style={{ fontWeight: 'bold', color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .bar-animate:hover {
          filter: brightness(1.1);
          transform: scaleX(1.05);
        }
        .glass-hover:hover {
          background: rgba(255,255,255,0.05);
          transform: translateX(5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;
