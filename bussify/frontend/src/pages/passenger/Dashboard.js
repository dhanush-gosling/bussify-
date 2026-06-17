import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinationAlert, setDestinationAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cardRes, notifRes] = await Promise.all([
        API.get('/passenger/card').catch(() => null),
        API.get('/passenger/notifications').catch(() => ({ data: [] }))
      ]);
      if (cardRes) setCard(cardRes.data);

      const notifs = notifRes.data || [];
      const actionable = notifs.find(n => n.actionable);
      const passive = notifs.filter(n => !n.actionable);
      setNotifications(passive);

      if (actionable) {
        setDestinationAlert(prev =>
          prev && prev.ticketId === actionable.ticketId ? prev : actionable
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDeboard = async () => {
    if (!destinationAlert) return;
    setActionLoading(true);
    try {
      const res = await API.post('/passenger/deboard', {
        busId: destinationAlert.busId,
        ticketId: destinationAlert.ticketId
      });
      toast.success(res.data.message);
      setDestinationAlert(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deboard');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStayOnBus = async () => {
    if (!destinationAlert) return;
    setActionLoading(true);
    try {
      const res = await API.post('/passenger/stay-on-bus', {
        busId: destinationAlert.busId,
        ticketId: destinationAlert.ticketId
      });
      toast.warning(`Fine of ₹${res.data.fine} applied. New balance: ₹${res.data.newBalance}`);
      setDestinationAlert(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const recentJourneys = card?.journeyHistory?.slice(-3).reverse() || [];
  const alertStyle = { warning: 'alert-warning', success: 'alert-success', error: 'alert-error' };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="flex-between mb-24">
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              Welcome back, <span>{user?.name}</span> 👋
            </h1>
            <p className="text-muted text-sm">Manage your travel with Bussify</p>
          </div>
        </div>

        {/* Passive notifications */}
        {notifications.map((n, i) => (
          <div key={i} className={`alert ${alertStyle[n.type] || 'alert-info'}`}>
            {n.type === 'warning' ? '⚠️' : n.type === 'error' ? '🔴' : '🔔'}{' '}
            <strong>[Bus {n.busNumber}]</strong> {n.message}
          </div>
        ))}

        {loading ? <div className="loading-spinner" /> : (
          <>
            {!card || card.hasCard === false ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No Virtual Card</h3>
                <p className="text-muted" style={{ marginBottom: '20px' }}>Create your Bussify card to start booking tickets</p>
                <Link to="/passenger/card" className="btn btn-primary">Create My Card</Link>
              </div>
            ) : (
              <div className="wallet-card mb-24">
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Wallet Balance</div>
                  <div style={{ fontSize: '42px', fontFamily: 'Syne, sans-serif', fontWeight: '800', marginBottom: '16px' }}>
                    ₹{card.walletBalance?.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700' }}>{card.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>{card.cardNumber}</div>
                    </div>
                    <Link to="/passenger/card" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)' }}>
                      + Recharge
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="grid-3 mb-24">
              {[
                { icon: '🔍', label: 'Search Buses', sub: 'Find available buses', to: '/passenger/search', color: '#FF6B35' },
                { icon: '🎫', label: 'My Tickets', sub: 'View booked tickets', to: '/passenger/tickets', color: '#3b82f6' },
                { icon: '💳', label: 'Manage Card', sub: 'Card & wallet settings', to: '/passenger/card', color: '#8b5cf6' },
              ].map(a => (
                <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ textAlign: 'center', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = a.color; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{a.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{a.label}</div>
                    <div className="text-muted text-sm">{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>

            {recentJourneys.length > 0 && (
              <div className="card">
                <div className="flex-between mb-16">
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700' }}>Recent Journeys</h3>
                  <Link to="/passenger/tickets" style={{ color: 'var(--primary)', fontSize: '13px', textDecoration: 'none' }}>View all →</Link>
                </div>
                {recentJourneys.map((j, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < recentJourneys.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: 'rgba(255,107,53,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🚌</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{j.source} → {j.destination}</div>
                        <div className="text-muted text-sm">{j.busNumber} • {new Date(j.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: 'var(--danger)' }}>-₹{j.fare}</div>
                      <span className={`badge badge-${j.status === 'completed' ? 'success' : j.status === 'active' ? 'warning' : j.status === 'fined' ? 'danger' : 'info'}`}>
                        {j.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== DESTINATION REACHED POPUP ===== */}
      {destinationAlert && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--success)',
            borderRadius: '20px',
            padding: '36px 32px',
            width: '100%', maxWidth: '420px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(34,197,94,0.25)',
            animation: 'popIn 0.3s ease'
          }}>
            <div style={{
              width: '72px', height: '72px',
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid var(--success)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', margin: '0 auto 20px',
              animation: 'pulse 1.5s infinite'
            }}>📍</div>

            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800', marginBottom: '10px', color: 'var(--success)' }}>
              Destination Reached!
            </h2>
            <p style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
              {destinationAlert.destinationStop}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              Bus <strong style={{ color: 'var(--text)' }}>{destinationAlert.busNumber}</strong> has arrived at your stop.
              Are you getting off?
            </p>

            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '12px', marginBottom: '24px', fontSize: '13px', color: '#fcd34d' }}>
              ⚠️ Clicking <strong>Next</strong> means you're staying on. A <strong>fine will be charged</strong> for the extra distance.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleStayOnBus}
                disabled={actionLoading}
                style={{
                  flex: 1, padding: '14px 8px',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.4)',
                  borderRadius: '12px',
                  color: '#fbbf24', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px', fontWeight: '700', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.5 : 1, lineHeight: 1.4
                }}
              >
                🚌 Next Stop<br />
                <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.8 }}>Stay on (fine applies)</span>
              </button>

              <button
                onClick={handleDeboard}
                disabled={actionLoading}
                style={{
                  flex: 1, padding: '14px 8px',
                  background: 'var(--success)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px', fontWeight: '700', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.5 : 1, lineHeight: 1.4
                }}
              >
                ✅ OK, Getting Off<br />
                <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.9 }}>Deboard here</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
        }
      `}</style>
    </>
  );
}
