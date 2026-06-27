import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Header = () => {
  const { user, logout, login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    showNotification('Logged out successfully', 'info');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="glass main-header" style={{
      padding: '0.8rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      position: 'sticky',
      top: '1rem',
      zIndex: 900
    }}>
      {/* Left: Branding & Greeting */}
      <div className="header-left" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.5rem' }}>Nexus</h2>
        <div style={{ marginLeft: '0.5rem', borderLeft: '1px solid #eee', paddingLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{getGreeting()}, {user?.name.split(' ')[0]}!</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {user?.role === 'admin' ? '🛡️ Administrator' : '🎓 Student'}
            </p>
          </div>
          {user?.role !== 'admin' && (
            <div style={{ 
              background: 'linear-gradient(135deg, #f5a623, #f8e71c)', 
              color: 'white', padding: '0.3rem 0.7rem', borderRadius: '10px', 
              fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(245, 166, 35, 0.3)'
            }}>
              LVL {user?.level || 1}
            </div>
          )}
        </div>
      </div>

      {/* Right: Date & Logout */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="mobile-hide" style={{ 
          padding: '0.4rem 0.8rem', 
          background: 'var(--lavender)', 
          borderRadius: '10px', 
          fontSize: '0.75rem', 
          fontWeight: '700',
          color: 'var(--primary)'
        }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            background: '#fff5f5',
            color: '#e53e3e',
            border: '1px solid #fed7d7',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#feb2b2'}
          onMouseOut={(e) => e.target.style.background = '#fff5f5'}
        >
          LOGOUT 🚪
        </button>
      </div>
    </header>
  );
};

export default Header;
