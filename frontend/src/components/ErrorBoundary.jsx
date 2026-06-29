import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'var(--bg-main)',
          padding: '2rem',
          fontFamily: "'Outfit', sans-serif"
        }}>
          <div className="glass" style={{
            padding: '3rem',
            maxWidth: '550px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            background: 'white'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔌</div>
            <h2 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              An unexpected runtime error occurred. We have intercepted this crash to protect your session.
            </p>
            
            {this.state.error && (
              <div style={{
                background: 'rgba(255, 77, 77, 0.05)',
                border: '1px solid rgba(255, 77, 77, 0.15)',
                color: '#e53e3e',
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'left',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                marginBottom: '2rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', cursor: 'pointer' }} 
                onClick={() => window.location.reload()}
              >
                🔄 Reload Page
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', cursor: 'pointer' }} 
                onClick={this.handleReset}
              >
                🏠 Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
