import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const roleInfo = {
  passenger: { icon: '👤', color: 'var(--primary)', title: 'Passenger Login' },
  conductor: { icon: '🧑‍✈️', color: '#3b82f6', title: 'Conductor Login' },
  admin: { icon: '🛠️', color: '#8b5cf6', title: 'Admin Login' },
};

export default function LoginPage() {
  const { role } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const info = roleInfo[role] || roleInfo.passenger;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password, role);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          ← Back to Home
        </Link>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{info.icon}</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800' }}>{info.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
              {role === 'admin' ? 'Use admin credentials to continue' : 'Sign in to your account'}
            </p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-full"
              style={{ background: info.color, color: 'white', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          {role === 'passenger' && (
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
            </p>
          )}

          {role === 'admin' && (
            <div className="alert alert-info" style={{ marginTop: '16px' }}>
              💡 Default: admin@bussify.com / Admin@123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
