import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Events from './pages/Events';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminEvents from './pages/AdminEvents';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import EventDetailPage from './pages/EventDetailPage';
import Notifications from './pages/Notifications';
import AdminVerification from './pages/AdminVerification';
import Transactions from './pages/Transactions';
import LiveFeed from './components/LiveFeed';
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function AppContent() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return null;

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {user && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <main className="main-content" style={{ 
        marginLeft: (user && !isMobile) ? 'var(--sidebar-width)' : '0',
        width: (user && !isMobile) ? 'calc(100% - var(--sidebar-width))' : '100%',
        transition: 'all 0.3s ease'
      }}>
        {user && isMobile && (
          <div className="mobile-header-bar" style={{ 
            display: 'flex', 
            padding: '1rem 2rem', 
            background: 'white', 
            borderBottom: '1px solid var(--glass-border)',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
             <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>☰</button>
             <h3 className="gradient-text" style={{ margin: 0 }}>Nexus</h3>
             <div style={{ width: '24px' }}></div>
          </div>
        )}
        
        {user && <Header />}
        
        <div className="content-area">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/admin/verify" element={<ProtectedRoute adminOnly><AdminVerification /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
          <AIChatbot />
        </div>

        <LiveFeed />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
