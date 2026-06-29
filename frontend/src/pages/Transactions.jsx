import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/bookings/user/${user.id}`);
        setTransactions(response.data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user.id]);

  const totalSpent = transactions.reduce((sum, t) => sum + ((t.event && (t.event.price || t.event.priceGeneral)) || t.amount || t.totalAmount || 0), 0);

  if (loading) return <div style={{ padding: '2rem' }}>Loading transaction history...</div>;

  return (
    <div className="fade-in">
      <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="gradient-text">Transaction History</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your past payments and ticket purchases.</p>
        </div>
        <div className="glass" style={{ padding: '1rem 2rem', textAlign: 'right', borderRight: '5px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TOTAL SPENT</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{totalSpent.toFixed(2)}</div>
        </div>
      </div>

      <div className="glass table-responsive" style={{ overflowX: 'auto', borderRadius: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.03)' }}>
            <tr>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Transaction ID</th>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Event Details</th>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Date & Time</th>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Method</th>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1.2rem', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id || t._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.3s' }} className="table-row">
                <td style={{ padding: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>#TRX-{t.id || t._id}</td>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: '600' }}>{t.event ? (t.event.title || t.event.eventName) : 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.event ? t.event.category : 'N/A'}</div>
                </td>
                <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>
                  {(() => {
                    const dateVal = t.timestamp || t.date || t.createdAt;
                    if (!dateVal) return 'N/A';
                    const d = new Date(dateVal);
                    if (isNaN(d.getTime())) return 'N/A';
                    return (
                      <>
                        {d.toLocaleDateString()}
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </>
                    );
                  })()}
                </td>
                <td style={{ padding: '1.2rem', fontSize: '0.85rem' }}>{t.paymentMethod || 'Nexus Pay'}</td>
                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>
                  ₹{(() => {
                    const priceVal = t.event ? (t.event.price || t.event.priceGeneral) : (t.amount || t.totalAmount || 0);
                    return typeof priceVal === 'number' ? priceVal.toFixed(2) : '0.00';
                  })()}
                </td>
                <td style={{ padding: '1.2rem' }}>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    background: t.status === 'Cancelled' ? '#fff5f5' : t.status === 'Refunded' ? '#fffaf0' : '#e6fffa',
                    color: t.status === 'Cancelled' ? '#e53e3e' : t.status === 'Refunded' ? '#dd6b20' : '#2c7a7b'
                  }}>
                    {t.status || 'PAID'}
                  </span>
                </td>
                <td style={{ padding: '1.2rem' }}>
                  {(t.status === 'Confirmed' || !t.status) && (
                    <button 
                      onClick={async () => {
                        if(window.confirm("Cancel this transaction?")) {
                          await (await import('../services/api')).bookingService.cancel(t.id);
                          window.location.reload();
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      CANCEL
                    </button>
                  )}
                  {user?.role === 'admin' && t.status === 'Cancelled' && (
                     <button 
                      onClick={async () => {
                        await (await import('../services/api')).bookingService.refund(t.id);
                        window.location.reload();
                      }}
                      style={{ background: 'none', border: 'none', color: '#dd6b20', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', marginLeft: '10px' }}
                    >
                      REFUND
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
            <h3>No transactions yet</h3>
            <p>Your purchase history will appear here once you book an event.</p>
          </div>
        )}
      </div>

      <style>{`
        .table-row:hover { background: rgba(0,0,0,0.01); }
      `}</style>
    </div>
  );
};

export default Transactions;
