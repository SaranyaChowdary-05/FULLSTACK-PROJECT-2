import React, { useState, useEffect } from 'react';
import { eventService, recommendationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import CampusMap from '../components/CampusMap';

const CATEGORIES = ['All', 'Computer Science', 'Engineering', 'Fine Arts', 'Physics', 'Commerce', 'Biology', 'Sports', 'Music', 'Gaming', 'Environment', 'Fashion', 'Math'];

const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventService.getAll();
        setEvents(res.data);
        setFilteredEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        const res = await recommendationService.getRecommendations(user.id);
        setRecommendations(res.data || []);
      } catch (err) {
        console.error('Recommendations unavailable:', err);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
  }, [user]);

  useEffect(() => {
    let result = events;
    if (activeCategory !== 'All') result = result.filter(e => e.category === activeCategory);
    if (searchQuery) {
      result = result.filter(e =>
        (e.title || e.eventName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(result);
  }, [searchQuery, activeCategory, events]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section" style={{
        padding: '4rem 2rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(147,112,219,0.1), rgba(255,182,193,0.1))',
        borderRadius: '32px', marginBottom: '3rem'
      }}>
        <h1 className="gradient-text hero-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Discover Your Next Event</h1>
        <p className="hero-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Explore 25+ departmental workshops, competitions, and exhibitions happening across the campus.
        </p>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by event name or keyword..."
            className="input-field"
            style={{ padding: '1.2rem 1.5rem', borderRadius: '50px', fontSize: '1rem', boxShadow: 'var(--glass-shadow)' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div style={{ position: 'absolute', right: '20px', top: '15px', fontSize: '1.5rem' }}>🔍</div>
        </div>
      </section>

      <CampusMap />

      {/* ✨ AI Recommendations Section */}
      {user && !user.is_admin && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>✨ AI Recommended for You</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                Personalized picks based on your interests and activity
              </p>
            </div>
            <span style={{
              fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.8rem', borderRadius: '20px',
              background: 'linear-gradient(135deg, #6e8efb22, #a777e322)',
              color: '#6e8efb', border: '1px solid #6e8efb33'
            }}>🤖 Powered by Nexus AI</span>
          </div>

          {recLoading && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: '0 0 280px', height: '320px', borderRadius: '20px', background: 'rgba(0,0,0,0.04)', animation: 'pulse 1.5s infinite' }}></div>
              ))}
            </div>
          )}

          {!recLoading && recommendations.length > 0 && (
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
              {recommendations.map(rec => (
                <div key={rec.id} style={{ flex: '0 0 300px', position: 'relative' }}>
                  {/* Match Badge */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px', zIndex: 2,
                    background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
                    color: 'white', borderRadius: '20px', padding: '0.25rem 0.7rem',
                    fontSize: '0.75rem', fontWeight: '800',
                    boxShadow: '0 4px 12px rgba(110,142,251,0.4)'
                  }}>
                    ⚡ {rec.matchPercentage}% Match
                  </div>
                  <EventCard event={rec} compact />
                  {/* Match Reason */}
                  <div style={{
                    marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px',
                    background: 'rgba(110,142,251,0.07)', border: '1px solid rgba(110,142,251,0.15)',
                    fontSize: '0.78rem', color: '#6e8efb', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                  }}>
                    <span>🎯</span> {rec.matchReason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!recLoading && recommendations.length === 0 && (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Set your interests in your <strong>Profile</strong> to get personalized event recommendations!
              </p>
            </div>
          )}
        </section>
      )}

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`btn ${activeCategory === cat ? 'btn-primary' : ''}`}
            style={{
              whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--primary)' : 'white',
              color: activeCategory === cat ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--glass-border)',
              boxShadow: activeCategory === cat ? '0 4px 12px rgba(110,142,251,0.3)' : 'none'
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p style={{ marginBottom: '1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
        Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' && ` in ${activeCategory}`}
      </p>

      {/* Event Grid */}
      <div className="event-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event._id || event.id} event={event} />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔦</div>
            <h3>No events found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Home;
