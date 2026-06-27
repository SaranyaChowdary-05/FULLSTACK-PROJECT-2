import React, { useState, useEffect } from 'react';
import { eventService } from '../services/api';

const CampusMap = () => {
  const [buildings, setBuildings] = useState([]);
  const [activeBuilding, setActiveBuilding] = useState(null);

  useEffect(() => {
    const fetchHeatData = async () => {
      try {
        const res = await eventService.getAll();
        const locMap = {};
        res.data.forEach(event => {
          const loc = event.location || event.venue;
          if (!locMap[loc]) locMap[loc] = { location: loc, count: 0, events: [], topEvent: event.title };
          locMap[loc].count += (event.registrations || 0);
          if (!locMap[loc].events.includes(event.title)) {
            locMap[loc].events.push(event.title);
          }
        });
        setBuildings(Object.values(locMap));
      } catch (err) { console.error(err); }
    };
    fetchHeatData();
  }, []);

  const getHeatLevel = (count) => {
    if (count >= 200) return 'high';
    if (count >= 50)  return 'medium';
    if (count > 0)    return 'low';
    return 'none';
  };

  const positions = {
    'Main Auditorium':    { x: 30, y: 20, icon: '🏛️', color: '#9370db' },
    'University Stadium': { x: 70, y: 30, icon: '🏟️', color: '#6e8efb' },
    'CS Lab 1':           { x: 15, y: 55, icon: '🖥️', color: '#a777e3' },
    'CS Lab 4':           { x: 45, y: 65, icon: '💻', color: '#f6ad55' },
    'Arts Gallery':       { x: 80, y: 60, icon: '🎨', color: '#ed64a6' },
    'Green Park':         { x: 10, y: 80, icon: '🌳', color: '#48bb78' },
  };

  return (
    <div className="glass map-container-innovative" style={{ 
      padding: '2.5rem', 
      marginBottom: '3rem', 
      position: 'relative',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.6)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '2.2rem', margin: 0, letterSpacing: '-0.5px' }}>Live Campus Pulse</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Experience the real-time energy of your campus.</p>
        </div>
        <div className="live-indicator-premium">
          <div className="pulse-core"></div>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2ecc71', letterSpacing: '1px' }}>SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="isometric-map-wrapper">
        <div className="isometric-grid">
          {buildings.map((b, i) => {
            const pos = positions[b.location] || { x: 20 + (i * 15) % 60, y: 20 + (i * 10) % 60, icon: '🏢', color: '#9370db' };
            const heat = getHeatLevel(b.count);
            const isActive = activeBuilding?.location === b.location;

            return (
              <div
                key={b.location}
                className={`map-node ${heat} ${isActive ? 'active' : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  '--node-color': pos.color
                }}
                onMouseEnter={() => setActiveBuilding(b)}
                onMouseLeave={() => setActiveBuilding(null)}
              >
                <div className="node-3d-base">
                  <div className="node-icon">{pos.icon}</div>
                  <div className="node-glow"></div>
                  {heat === 'high' && <div className="node-flame">🔥</div>}
                </div>
                
                <div className="node-label-popup">
                  <div className="popup-count">{b.count} people</div>
                  <div className="popup-name">{b.location}</div>
                  <div className="popup-events">{b.events.length} Live Events</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Stats Overlay */}
      <div className="map-footer-overlay">
        <div className="legend-pills">
          <span className="pill low"><i></i> Quiet</span>
          <span className="pill medium"><i></i> Active</span>
          <span className="pill high"><i></i> High Vibe</span>
        </div>
        <div className="total-stat-pill">
          Total Activity: <strong>{buildings.reduce((acc, b) => acc + b.count, 0)}</strong> Students
        </div>
      </div>

      <style>{`
        .map-container-innovative {
          border-radius: 32px;
          box-shadow: 0 20px 50px rgba(147, 112, 219, 0.1);
        }

        .live-indicator-premium {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(46, 204, 113, 0.1);
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        .pulse-core {
          width: 10px;
          height: 10px;
          background: #2ecc71;
          border-radius: 50%;
          position: relative;
        }

        .pulse-core::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: #2ecc71;
          border-radius: 50%;
          animation: corePulse 2s infinite;
        }

        @keyframes corePulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        .isometric-map-wrapper {
          perspective: 1500px;
          width: 100%;
          height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -20px;
        }

        .isometric-grid {
          width: 100%;
          height: 100%;
          position: relative;
          transform: rotateX(55deg) rotateZ(-35deg);
          transform-style: preserve-3d;
          background: 
            linear-gradient(rgba(147, 112, 219, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 112, 219, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          border: 2px solid rgba(147, 112, 219, 0.1);
          border-radius: 24px;
        }

        .map-node {
          position: absolute;
          transform-style: preserve-3d;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          transform: translateZ(20px);
        }

        .map-node.active {
          transform: translateZ(50px) scale(1.1);
        }

        .node-3d-base {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          border: 2px solid var(--node-color);
          position: relative;
          transition: inherit;
        }

        .node-glow {
          position: absolute;
          width: 140%;
          height: 140%;
          background: var(--node-color);
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.1;
          z-index: -1;
          transition: opacity 0.3s ease;
        }

        .map-node.medium .node-glow { opacity: 0.3; }
        .map-node.high .node-glow { 
          opacity: 0.6; 
          animation: glowPulse 2s infinite alternate;
        }

        @keyframes glowPulse {
          from { transform: scale(1); filter: blur(20px); }
          to { transform: scale(1.3); filter: blur(30px); }
        }

        .node-flame {
          position: absolute;
          top: -15px;
          right: -10px;
          font-size: 18px;
          animation: floatFlame 1.5s infinite alternate;
          transform: translateZ(10px);
        }

        @keyframes floatFlame {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }

        .node-label-popup {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) rotateZ(35deg) rotateX(-55deg) translateY(-20px);
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 8px 12px;
          border-radius: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          z-index: 100;
        }

        .map-node:hover .node-label-popup {
          opacity: 1;
          transform: translateX(-50%) rotateZ(35deg) rotateX(-55deg) translateY(-30px);
        }

        .popup-count { font-weight: 800; font-size: 0.75rem; color: #a777e3; }
        .popup-name { font-weight: 600; font-size: 0.85rem; margin: 2px 0; }
        .popup-events { font-size: 0.65rem; color: #aaa; }

        .map-footer-overlay {
          margin-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .legend-pills {
          display: flex;
          gap: 12px;
        }

        .pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 50px;
          background: white;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .pill i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .pill.low i { background: #e8e0f0; }
        .pill.medium i { background: #a777e3; }
        .pill.high i { background: #9370db; }

        .total-stat-pill {
          background: var(--primary);
          color: white;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 0.85rem;
          box-shadow: 0 10px 20px rgba(147, 112, 219, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CampusMap;
