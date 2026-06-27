import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science'
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const mockAccounts = [
    { id: 101, name: 'Saranya Chowdary', email: 'saranya@nexus.edu', role: 'user', dept: 'IT Dept', avatar: 'SC' },
    { id: 102, name: 'Admin Nexus', email: 'admin@nexus.edu', role: 'admin', dept: 'Administration', avatar: 'AN' },
    { id: 103, name: 'John Doe', email: 'john.doe@nexus.edu', role: 'user', dept: 'Engineering', avatar: 'JD' }
  ];

  const handleQuickLogin = (type) => {
    const account = type === 'admin' ? mockAccounts[1] : mockAccounts[0];
    setLoading(true);
    setTimeout(() => {
      login(account, 'mock-token');
      showNotification(`Logged in as ${type.toUpperCase()}: ${account.name}`, 'success');
      navigate('/');
      setLoading(false);
    }, 800);
  };

  const handleAccountSelect = (account) => {
    setLoading(true);
    setShowAccountPicker(false);
    setTimeout(() => {
      login(account, 'mock-google-token');
      showNotification(`Signed in as ${account.name}`, 'success');
      navigate('/');
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await authService.login({ email: formData.email, password: formData.password });
        showNotification(`Welcome back, ${response.data.user.name}!`, 'success');
      } else {
        response = await authService.register(formData);
        showNotification(`Account created! Welcome to Nexus, ${response.data.user.name}.`, 'success');
      }
      
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Quick Access Buttons */}
      <div className="quick-access-buttons" style={{
        position: 'absolute',
        top: '2rem',
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 2rem'
      }}>
        <button 
          onClick={() => handleQuickLogin('user')}
          className="glass pulse"
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            border: '1px solid var(--primary)',
            background: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: 'bold',
            color: 'var(--primary)',
            boxShadow: '0 10px 20px rgba(147, 112, 219, 0.2)'
          }}
        >
          🔑 Student Quick Login
        </button>

        <button 
          onClick={() => handleQuickLogin('admin')}
          className="glass pulse"
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            border: '1px solid #ff4d4d',
            background: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: 'bold',
            color: '#ff4d4d',
            boxShadow: '0 10px 20px rgba(255, 77, 77, 0.2)'
          }}
        >
          🛡️ Admin Quick Access
        </button>
      </div>

      <div className="glass fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Join Nexus'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Access your university events portal</p>
        </div>

        <button 
          onClick={() => setShowAccountPicker(true)}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '12px',
            border: '1px solid #ddd',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '18px' }} />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#999' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>
            {isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Log In'}
          </button>
        </div>
      </div>

      {/* Account Picker Modal */}
      {showAccountPicker && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass fade-in" style={{
            background: 'white',
            width: '100%',
            maxWidth: '350px',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '30px', marginBottom: '1rem' }} />
              <h3 style={{ margin: 0 }}>Choose an account</h3>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>to continue to Nexus</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {mockAccounts.map(acc => (
                <div 
                  key={acc.id} 
                  onClick={() => handleAccountSelect(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    transition: 'background 0.3s'
                  }}
                  className="account-item"
                >
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lavender)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)'
                  }}>
                    {acc.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{acc.email}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowAccountPicker(false)}
              style={{ width: '100%', marginTop: '1.5rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .account-item:hover { background: #f9f9f9; }
        .account-item:last-child { border-bottom: none; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Login;
