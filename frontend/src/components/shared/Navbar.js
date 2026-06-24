import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const navLinks = {
  passenger: [
    { to: '/passenger', label: '🏠 Home' },
    { to: '/passenger/card', label: '💳 My Card' },
    { to: '/passenger/search', label: '🔍 Search Bus' },
    { to: '/passenger/tickets', label: '🎫 My Tickets' },
  ],
  conductor: [
    { to: '/conductor', label: '🚌 Dashboard' },
  ],
  admin: [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/buses', label: '🚌 Buses' },
    { to: '/admin/routes', label: '🗺️ Routes' },
    { to: '/admin/conductors', label: '👤 Conductors' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  if (!user) return null;
  const links = navLinks[user.role] || [];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🚌 BUSSI<span>FY</span>
      </Link>
      <div className="navbar-nav">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
        <div style={{ marginLeft: '8px', paddingLeft: '12px', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {user.name}
            <span className="nav-badge" style={{ marginLeft: '6px', textTransform: 'capitalize' }}>{user.role}</span>
          </span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
}
