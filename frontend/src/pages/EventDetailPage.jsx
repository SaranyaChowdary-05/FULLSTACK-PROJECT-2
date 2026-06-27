import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService, recommendationService } from '../services/api';
import EventDetails from '../components/EventDetails';
import BookingForm from '../components/BookingForm';
import CountdownTimer from '../components/CountdownTimer';
import EventNetworking from '../components/EventNetworking';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getAll();
        const found = res.data.find(e => (e._id || e.id).toString() === id);
        setEvent(found);
        // Track 'view' interaction for AI recommendations
        if (found && user?.id) {
          recommendationService.trackInteraction(user.id, found._id || found.id, 'view').catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div className="loader"></div>;
  if (!event) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h2>Event not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go Back Home</button>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '1rem', fontWeight: '600' }}
      >
        ← Back to Events
      </button>

      <div className="event-detail-grid">
        {/* Left: Event Details + Networking */}
        <section>
          <EventDetails event={event} />
          <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>EVENT STARTS IN</h4>
            <CountdownTimer targetDate={event.date} />
          </div>
          <EventNetworking eventId={event._id || event.id} />
        </section>

        {/* Right: Payment Gateway */}
        <section>
          {user?.role === 'admin' ? (
            <div className="glass" style={{ position: 'sticky', top: '2rem', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <h3>Admin Context</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                As an administrator, you cannot book tickets for events. You have full access to manage this inventory via the Command Center.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/events')} style={{ width: '100%' }}>
                Manage Event Capacity
              </button>
            </div>
          ) : (
            <div className="glass" style={{ position: 'sticky', top: '2rem' }}>
              <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ margin: 0 }}>Payment Gateway</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Securely book your tickets for {event.title}
                </p>
              </div>
              <BookingForm 
                event={event} 
                onCancel={() => navigate('/')} 
                onComplete={() => navigate('/dashboard')} 
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EventDetailPage;
