import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to Bussify.');
      navigate('/passenger');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          ← Back to Home
        </Link>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800' }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Join Bussify as a passenger</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" placeholder="Your full name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="your@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-control" placeholder="10-digit phone number"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Min 6 chars"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" placeholder="Repeat password"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Creating account...' : '🚀 Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login/passenger" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
