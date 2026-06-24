import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(`/${user.role}`);
  }, [user, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-120px', left: '-80px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ fontSize: '72px', marginBottom: '12px' }}>🚌</div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '64px',
          fontWeight: '800',
          letterSpacing: '-2px',
          lineHeight: 1
        }}>
          <span style={{ color: 'var(--primary)' }}>BUSSI</span>
          <span style={{ color: 'var(--text)' }}>FY</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Smart Bus Management System
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          {['🛡️ Digital Payments', '📍 Live Tracking', '🎫 QR Tickets'].map(f => (
            <span key={f} style={{
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.2)',
              color: 'var(--primary)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Login cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%', maxWidth: '780px' }}>
        {[
          {
            icon: '👤',
            title: 'Passenger',
            desc: 'Book tickets, manage wallet, track your journey',
            color: 'var(--primary)',
            actions: [
              { label: 'Login as Passenger', to: '/login/passenger', primary: true },
              { label: 'Sign Up', to: '/register', primary: false }
            ]
          },
          {
            icon: '🧑‍✈️',
            title: 'Conductor',
            desc: 'Manage bus operations and scan passenger tickets',
            color: '#3b82f6',
            actions: [
              { label: 'Login as Conductor', to: '/login/conductor', primary: true }
            ]
          },
          {
            icon: '🛠️',
            title: 'Admin',
            desc: 'Full system management and real-time monitoring',
            color: '#8b5cf6',
            actions: [
              { label: 'Login as Admin', to: '/login/admin', primary: true }
            ]
          }
        ].map(card => (
          <div key={card.title} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '28px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4)`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: card.color
            }} />
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>{card.icon}</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{card.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>{card.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {card.actions.map(a => (
                <Link key={a.label} to={a.to} style={{
                  display: 'block',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: a.primary ? card.color : 'transparent',
                  color: a.primary ? 'white' : card.color,
                  border: a.primary ? 'none' : `1px solid ${card.color}`,
                }}>{a.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '36px' }}>
        Reducing overcrowding • Improving safety • Enabling digital payments
      </p>
    </div>
  );
}
