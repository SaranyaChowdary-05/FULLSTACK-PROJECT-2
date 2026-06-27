import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminAnalytics from '../components/AdminAnalytics';
import { useNotification } from '../context/NotificationContext';
import { adminPredictionService, forecastService } from '../services/api';

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (activeTab === 'predictions') fetchPredictions();
    if (activeTab === 'forecast') fetchForecasts();
    if (activeTab === 'insights') fetchInsights();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportRes] = await Promise.all([
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/report').catch(() => ({ data: null })),
      ]);
      setUsers(usersRes.data);
      setReport(reportRes.data);
    } catch (err) {
      showNotification('Connection Error. Check if backend is on port 5005.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    setAiLoading(true);
    try {
      const res = await adminPredictionService.getPredictions();
      setPredictions(res.data);
    } catch (err) {
      showNotification('Failed to load AI predictions.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchForecasts = async () => {
    setAiLoading(true);
    try {
      const res = await forecastService.getForecasts();
      setForecasts(res.data);
    } catch (err) {
      showNotification('Failed to load AI forecast.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchInsights = async () => {
    setAiLoading(true);
    try {
      const res = await adminPredictionService.getInsights();
      setInsights(res.data);
    } catch (err) {
      showNotification('Failed to load Smart Event Insights.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptimizeCapacity = async (eventId, currentCapacity) => {
    const newCapacity = Math.floor(currentCapacity * 1.2);
    try {
      await adminPredictionService.updateCapacity(eventId, newCapacity);
      showNotification(`✅ Capacity increased to ${newCapacity} seats!`, 'success');
      fetchPredictions();
    } catch (err) {
      showNotification('Failed to update capacity.', 'error');
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/report');
      setReport(res.data);
      showNotification('Platform Report Generated!', 'success');
    } catch (err) {
      showNotification('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="gradient-text">Command Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time platform monitoring, AI predictions and management.</p>
        </div>
        <button onClick={handleGenerateReport} disabled={loading} className="btn btn-primary">
          {loading ? 'Generating...' : '📊 Generate Report'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'users', label: '👥 Students' },
          { key: 'bookings', label: '🎫 Bookings' },
          { key: 'predictions', label: '🤖 AI Predictions' },
          { key: 'forecast', label: '📈 Popularity Forecast' },
          { key: 'insights', label: '✨ Smart Insights' },
          { key: 'health', label: '💚 System Health' },
        ].map(tab => (
          <Tab key={tab.key} active={activeTab === tab.key} label={tab.label} onClick={() => setActiveTab(tab.key)} />
        ))}
      </div>

      {loading && <div className="loader" style={{ margin: '2rem auto' }}></div>}

      {/* Overview */}
      {activeTab === 'overview' && report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Total Users" value={report.stats.totalUsers} icon="👥" color="#4a90e2" />
          <StatCard title="Total Bookings" value={report.stats.totalBookings} icon="🎫" color="#50e3c2" />
          <StatCard title="Total Revenue" value={`₹${report.stats.revenue}`} icon="💰" color="#f5a623" />
          <StatCard title="Last Report" value={report.generatedAt?.split(',')[1] || 'Just Now'} icon="⏰" color="#9b51e0" />
        </div>
      )}
      {activeTab === 'overview' && !report && !loading && (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No data received. Try generating a report manually.</p>
          <button onClick={fetchData} className="btn btn-secondary">🔄 Retry Connection</button>
        </div>
      )}

      {/* Students */}
      {activeTab === 'users' && (
        <div className="glass" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}><span className="category-badge">{u.department}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: u.role === 'admin' ? 'var(--primary)' : '#666', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {(u.role || 'student').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No users found.</div>}
        </div>
      )}

      {/* Bookings */}
      {activeTab === 'bookings' && (
        <div className="glass" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Event</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(report?.allBookings || []).map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{b.userId}</td>
                  <td style={{ padding: '1rem' }}>{b.event?.title || 'Unknown'}</td>
                  <td style={{ padding: '1rem' }}>₹{b.event?.price || 0}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold',
                      background: b.status === 'Cancelled' ? '#fff5f5' : b.status === 'Refunded' ? '#fffaf0' : '#e6fffa',
                      color: b.status === 'Cancelled' ? '#e53e3e' : b.status === 'Refunded' ? '#dd6b20' : '#2c7a7b'
                    }}>{b.status || 'Confirmed'}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {b.status !== 'Refunded' && (
                      <button className="btn" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', background: '#6e8efb', color: 'white' }}
                        onClick={async () => { await api.post(`/bookings/${b.id}/refund`); fetchData(); }}>
                        Refund ₹
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Predictions Tab */}
      {activeTab === 'predictions' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>🤖 AI Attendance Predictions</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Predicted turnout rates and capacity optimization suggestions</p>
            </div>
            <button onClick={fetchPredictions} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>🔄 Refresh</button>
          </div>

          {aiLoading && <div className="loader" style={{ margin: '2rem auto' }}></div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {predictions.map(p => (
              <div key={p.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: `5px solid ${p.predictedTurnout >= 80 ? '#22c55e' : p.predictedTurnout >= 50 ? '#f59e0b' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>{p.title}</h3>
                      <span className="category-badge">{p.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>📅 {p.date} &nbsp; | &nbsp; Confidence: <strong>{p.confidence}</strong></p>

                    {/* Fill Rate Progress */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        <span>Current Registrations: <strong>{p.registrations}/{p.capacity}</strong></span>
                        <span>Fill Rate: <strong>{Math.floor((p.registrations / p.capacity) * 100)}%</strong></span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.floor((p.registrations / p.capacity) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 1s ease' }}></div>
                      </div>
                    </div>

                    {/* Predicted Turnout */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        <span>Predicted Turnout</span>
                        <span style={{ fontWeight: 'bold', color: p.predictedTurnout >= 80 ? '#22c55e' : p.predictedTurnout >= 50 ? '#f59e0b' : '#ef4444' }}>{p.predictedTurnout}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.predictedTurnout}%`, height: '100%', background: p.predictedTurnout >= 80 ? '#22c55e' : p.predictedTurnout >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 1s ease' }}></div>
                      </div>
                    </div>

                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                      💡 {p.suggestion}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
                    {p.actionType === 'OPTIMIZE' && (
                      <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}
                        onClick={() => handleOptimizeCapacity(p.id, p.capacity)}>
                        🚀 {p.actionLabel}
                      </button>
                    )}
                    {p.actionType === 'PROMOTE' && (
                      <button className="btn btn-secondary" style={{ fontSize: '0.8rem', background: '#f59e0b', color: 'white', border: 'none' }}>
                        📢 {p.actionLabel}
                      </button>
                    )}
                    {p.actionType === 'MONITOR' && (
                      <button className="btn btn-secondary" style={{ fontSize: '0.8rem', opacity: 0.7, cursor: 'default' }} disabled>
                        👁️ {p.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!aiLoading && predictions.length === 0 && (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No prediction data available. Check backend connection.</div>
            )}
          </div>
        </div>
      )}

      {/* AI Popularity Forecast Tab */}
      {activeTab === 'forecast' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>📈 AI Popularity Forecast</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Event success rate prediction with AI-driven marketing recommendations</p>
            </div>
            <button onClick={fetchForecasts} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>🔄 Refresh</button>
          </div>

          {aiLoading && <div className="loader" style={{ margin: '2rem auto' }}></div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {forecasts.map(f => (
              <div key={f.id} className="glass" style={{ borderRadius: '20px', overflow: 'hidden', border: `2px solid ${f.tierColor}22` }}>
                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', background: `linear-gradient(135deg, ${f.tierColor}15, transparent)`, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="category-badge">{f.category}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: f.tierColor, background: `${f.tierColor}18`, padding: '0.25rem 0.6rem', borderRadius: '20px' }}>{f.tier}</span>
                  </div>
                  <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1rem', lineHeight: 1.3 }}>{f.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {f.venue} &nbsp;|&nbsp; 📅 {f.date} &nbsp;|&nbsp; {f.daysLeft > 0 ? `${f.daysLeft}d left` : 'Past'}</p>
                </div>

                {/* Success Rate Gauge */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Success Rate</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: f.tierColor }}>{f.successRate}%</span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(0,0,0,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${f.successRate}%`, height: '100%', background: `linear-gradient(90deg, ${f.tierColor}, ${f.tierColor}aa)`, borderRadius: '5px', transition: 'width 1.2s ease' }}></div>
                  </div>

                  {/* Signal Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                    {[
                      { label: 'Fill Rate', value: `${f.fillRate}%`, icon: '🎟️' },
                      { label: 'Page Views', value: f.pageViews, icon: '👁️' },
                      { label: 'Interested', value: f.interestedUsers, icon: '❤️' },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.1rem' }}>{m.icon}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '700' }}>{m.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketing Strategies */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>AI Marketing Strategies</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {f.strategies.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {!aiLoading && forecasts.length === 0 && (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#999', gridColumn: '1/-1' }}>No forecast data. Check backend connection.</div>
            )}
          </div>
        </div>
      )}

      {/* AI Smart Event Insights Tab */}
      {activeTab === 'insights' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>✨ AI Smart Event Insights</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Student engagement metrics, conversion rates, and executive AI summaries.</p>
            </div>
            <button onClick={fetchInsights} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>🔄 Refresh</button>
          </div>

          {aiLoading && <div className="loader" style={{ margin: '2rem auto' }}></div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {insights.map(item => (
              <div key={item.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', borderLeft: `6px solid ${item.conversionRate >= 40 ? '#22c55e' : item.conversionRate >= 15 ? '#6e8efb' : '#ef4444'}` }}>
                
                {/* Event Heading */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ margin: 0 }}>{item.title}</h3>
                      <span className="category-badge">{item.category}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Event ID: {item.id}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Student Sentiment</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: item.sentiment === 'Highly Positive' ? '#22c55e' : item.sentiment === 'Favorable' ? '#6e8efb' : '#f59e0b' }}>
                        {item.sentiment} ({item.sentimentScore}%)
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  
                  {/* Left Column: AI Executive Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(110,142,251,0.05)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(110,142,251,0.15)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6e8efb' }}>
                        <span>🧠</span> AI Summary Analysis
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: '#333', fontWeight: '500' }}>
                        {item.aiSummary}
                      </p>
                    </div>
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>🤖 Generated by Nexus AI Engine</span>
                      <span style={{ fontWeight: 'bold', color: '#6e8efb' }}>Status: Live</span>
                    </div>
                  </div>

                  {/* Right Column: User Engagement Analytics */}
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0' }}>📈 User Engagement Breakdown</h4>
                    
                    {/* Metrics Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page Views</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.2rem 0' }}>👁️ {item.views}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Link Clicks</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.2rem 0' }}>🖱️ {item.clicks}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bookings</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.2rem 0' }}>🎟️ {item.bookings}</div>
                      </div>
                    </div>

                    {/* Conversion Rate Meter */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '600' }}>
                        <span>Conversion Rate (Bookings / Views)</span>
                        <span style={{ color: item.conversionRate >= 40 ? '#22c55e' : item.conversionRate >= 15 ? '#6e8efb' : '#ef4444' }}>
                          {item.conversionRate}%
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, item.conversionRate)}%`,
                          height: '100%',
                          background: item.conversionRate >= 40 ? '#22c55e' : item.conversionRate >= 15 ? '#6e8efb' : '#ef4444',
                          transition: 'width 1s ease'
                        }}></div>
                      </div>
                    </div>

                    {/* Interested Target Audience */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🎯 Interested Students (Matches Category Interest)
                      </span>
                      <strong style={{ fontSize: '1.05rem' }}>{item.interestedUsers} Students</strong>
                    </div>

                  </div>
                </div>

              </div>
            ))}

            {!aiLoading && insights.length === 0 && (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                No engagement insights available. Ensure backend is active.
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Health */}
      {activeTab === 'health' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3>Server Status</h3>
            <HealthItem label="API Server" status="Operational" color="#2ecc71" />
            <HealthItem label="Database" status="Connected" color="#2ecc71" />
            <HealthItem label="AI Engine" status="Active" color="#2ecc71" />
            <HealthItem label="Storage" status="Persistent (JSON)" color="#2ecc71" />
          </div>
          <AdminAnalytics data={report?.departmentStats} />
          <div className="glass" style={{ marginTop: '2rem', overflow: 'hidden' }}>
            <h3 style={{ padding: '1.5rem 1.5rem 0' }}>Resource Usage</h3>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              {[['Memory Usage', '42%', '42'], ['CPU Load', '12%', '12'], ['AI Queue', '0 jobs', '3']].map(([label, val, pct]) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}><span>{label}</span><span>{val}</span></div>
                  <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Tab = ({ active, label, onClick }) => (
  <button onClick={onClick} style={{
    padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', whiteSpace: 'nowrap',
    background: active ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease',
    boxShadow: active ? '0 4px 12px rgba(110,142,251,0.35)' : 'none'
  }}>
    {label}
  </button>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass" style={{ padding: '1.5rem', borderLeft: `6px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{value}</div>
      </div>
      <div style={{ fontSize: '2.5rem', opacity: 0.2 }}>{icon}</div>
    </div>
  </div>
);

const HealthItem = ({ label, status, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
    <span style={{ fontWeight: '600' }}>{label}</span>
    <span style={{ color, fontWeight: 'bold' }}>● {status}</span>
  </div>
);

export default AdminDashboard;
