import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendationService } from '../services/api';

const ALL_INTERESTS = [
  { label: 'Computer Science', icon: '💻' },
  { label: 'Engineering', icon: '⚙️' },
  { label: 'Fine Arts', icon: '🎨' },
  { label: 'Physics', icon: '⚛️' },
  { label: 'Commerce', icon: '📊' },
  { label: 'Biology', icon: '🧬' },
  { label: 'Music', icon: '🎵' },
  { label: 'Sports', icon: '⚽' },
  { label: 'Gaming', icon: '🎮' },
  { label: 'Environment', icon: '🌿' },
  { label: 'Fashion', icon: '👗' },
  { label: 'Math', icon: '📐' },
  { label: 'Technology', icon: '🚀' },
  { label: 'Education', icon: '📚' },
  { label: 'Business', icon: '💼' },
  { label: 'Health', icon: '🏃' },
  { label: 'Entertainment', icon: '🎭' },
  { label: 'Culture', icon: '🏛️' },
];

const Profile = () => {
  const { user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const userLevel = user?.level || 1;
  const userXP = user?.xp || 0;
  const nextLevelThreshold = 500;
  const xpProgress = ((userXP % nextLevelThreshold) / nextLevelThreshold) * 100;

  useEffect(() => {
    if (!user?.id) return;
    recommendationService.getInterests(user.id)
      .then(res => setInterests(res.data || []))
      .catch(() => {});
  }, [user]);

  const toggleInterest = (label) => {
    setInterests(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
    setSaved(false);
  };

  const handleSaveInterests = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await recommendationService.saveInterests(user.id, interests);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save interests:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex-col-mobile" style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Profile Card */}
        <div className="glass profile-card" style={{ flex: 1, padding: '2.5rem', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 'bold', color: 'white',
            border: '4px solid white', boxShadow: '0 10px 30px rgba(110,142,251,0.3)'
          }}>
            {user?.name?.charAt(0) || '?'}
          </div>
          <h2 style={{ margin: '0 0 0.4rem 0' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{user?.email}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="category-badge">{(user?.role || 'student').toUpperCase()}</span>
            <span className="category-badge" style={{ background: 'linear-gradient(135deg, #6e8efb, #a777e3)', color: 'white', border: 'none' }}>
              LEVEL {userLevel}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="glass level-progress-card" style={{ flex: 1.5, padding: '2.5rem', borderRadius: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Level Progress</h3>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <span>{userXP} XP Total</span>
            <span>Next Level: {nextLevelThreshold - (userXP % nextLevelThreshold)} XP to go</span>
          </div>
          <div style={{ height: '16px', background: 'rgba(0,0,0,0.07)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{
              width: `${xpProgress}%`, height: '100%',
              background: 'linear-gradient(90deg, #6e8efb, #a777e3)',
              transition: 'width 1.2s ease-out', borderRadius: '8px'
            }}></div>
          </div>

          <h3>Nexus Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Events Attended', value: Math.floor(userXP / 100), icon: '🎫' },
              { label: 'Badges Unlocked', value: user?.badges?.length || 0, icon: '🏆' },
              { label: 'Interests Set', value: interests.length, icon: '❤️' },
              { label: 'Current Level', value: `Lvl ${userLevel}`, icon: '⭐' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interests Selection */}
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>🎯 My Interests</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
              Select topics you enjoy — our AI uses these to personalise your event recommendations.
            </p>
          </div>
          <button
            onClick={handleSaveInterests}
            disabled={saving}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              background: saved ? '#22c55e' : 'linear-gradient(135deg, #6e8efb, #a777e3)',
              color: 'white', transition: 'all 0.3s ease',
              boxShadow: saved ? '0 4px 12px rgba(34,197,94,0.35)' : '0 4px 12px rgba(110,142,251,0.35)',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Interests'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {ALL_INTERESTS.map(({ label, icon }) => {
            const isSelected = interests.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleInterest(label)}
                style={{
                  padding: '0.55rem 1.1rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '600', fontSize: '0.87rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  border: isSelected ? '2px solid transparent' : '2px solid rgba(0,0,0,0.1)',
                  background: isSelected
                    ? 'linear-gradient(135deg, #6e8efb, #a777e3)'
                    : 'rgba(0,0,0,0.03)',
                  color: isSelected ? 'white' : 'var(--text-muted)',
                  boxShadow: isSelected ? '0 4px 14px rgba(110,142,251,0.35)' : 'none',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {isSelected && <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>✓</span>}
              </button>
            );
          })}
        </div>

        {interests.length > 0 && (
          <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ✨ <strong>{interests.length} interest{interests.length !== 1 ? 's' : ''}</strong> selected. Save to update your AI recommendations on the home page.
          </p>
        )}
      </div>

      {/* Achievement Showcase */}
      <h2 className="gradient-text" style={{ marginBottom: '1.5rem' }}>🏆 Achievement Showcase</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {user?.badges?.length > 0 ? (
          user.badges.map(badge => (
            <div key={badge.id} className="glass badge-card" style={{ padding: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{badge.icon}</div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{badge.name}</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Unlocked on {badge.date}</p>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, #f5a623, #f8e71c)' }}></div>
            </div>
          ))
        ) : (
          <div className="glass" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#999', borderRadius: '20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎖️</div>
            <p style={{ margin: 0 }}>Attend your first event to unlock your first achievement!</p>
          </div>
        )}
      </div>

      <style>{`
        .badge-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .badge-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(245,166,35,0.2);
        }
      `}</style>
    </div>
  );
};

export default Profile;
