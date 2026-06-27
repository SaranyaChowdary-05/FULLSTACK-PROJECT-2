import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }} 
        />
      )}

      <aside className={`glass sidebar-nav ${isOpen ? 'open' : ''}`} style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRadius: '0 24px 24px 0',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        transition: 'transform 0.3s ease-in-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingLeft: '1rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.8rem' }}>Nexus</h2>
          <button className="mobile-only" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <SidebarItem to="/" icon="🏠" label="Home" onClick={onClose} />
          
          {user?.role !== 'admin' && (
            <>
              <SidebarItem to="/dashboard" icon="📋" label="My Registrations" onClick={onClose} />
              <SidebarItem to="/transactions" icon="💳" label="Transaction History" onClick={onClose} />
              <SidebarItem to="/notifications" icon="🔔" label="Notifications" onClick={onClose} />
              <SidebarItem to="/profile" icon="👤" label="My Profile" onClick={onClose} />
            </>
          )}
          
          {user?.role === 'admin' && (
            <>
              <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admin Panel</div>
              <SidebarItem to="/admin" icon="🛡️" label="Admin Stats" onClick={onClose} />
              <SidebarItem to="/admin/events" icon="🛠️" label="Manage Events" onClick={onClose} />
              <SidebarItem to="/admin/verify" icon="🔍" label="Ticket Verification" onClick={onClose} />
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>{user?.name?.[0] || 'U'}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role === 'admin' ? 'Administrator' : 'Student'}</div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="btn" 
            style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: '1px solid var(--lavender)', color: 'var(--text-muted)' }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ to, icon, label, onClick }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      borderRadius: '12px',
      textDecoration: 'none',
      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
      background: isActive ? 'rgba(147, 112, 219, 0.1)' : 'transparent',
      fontWeight: isActive ? '600' : '400',
      transition: 'all 0.3s ease'
    })}
  >
    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;
