import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, recsRes] = await Promise.all([
          api.get('/events'),
          user ? api.get(`/recommendations/${user.id}`) : Promise.resolve({ data: [] })
        ]);
        setEvents(eventsRes.data);
        setRecommendations(recsRes.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const categories = ['All', ...new Set(events.map(e => e.category))];
  const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);

  if (loading) return <div style={{ padding: '2rem' }}>Loading events...</div>;

  return (
    <div className="fade-in">
      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="gradient-text" style={{ margin: 0 }}>Recommended for You</h2>
            <span style={{ 
              background: 'linear-gradient(90deg, #6e8efb, #a777e3)', 
              color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', 
              fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              ✨ AI POWERED
            </span>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem',
            padding: '1rem',
            background: 'rgba(147, 112, 219, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(147, 112, 219, 0.1)'
          }}>
            {recommendations.map(event => (
              <div key={`rec-${event.id}`} className="ai-card">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Events Feed */}
      <div className="section-header-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Explore All Events</h2>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="event-grid">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <style>{`
        .ai-card {
          position: relative;
          transition: transform 0.3s ease;
        }
        .ai-card:hover {
          transform: scale(1.02);
        }
        .ai-card::after {
          content: 'TOP PICK';
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f5a623;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.6rem;
          font-weight: bold;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Events;
