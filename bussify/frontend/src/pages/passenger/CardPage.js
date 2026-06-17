import React, { useEffect, useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function CardPage() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [form, setForm] = useState({ name: '', gender: 'male', dob: '', aadhaar: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCard = async () => {
    try {
      const res = await API.get('/passenger/card');
      setCard(res.data);
    } catch {
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCard(); }, []);

  const createCard = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/passenger/card', form);
      toast.success('Card created!');
      setShowCreate(false);
      fetchCard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    } finally {
      setSubmitting(false);
    }
  };

  const recharge = async () => {
    const amt = parseFloat(rechargeAmt);
    if (!amt || amt <= 0) return toast.error('Enter valid amount');
    setSubmitting(true);
    try {
      const res = await API.post('/passenger/card/recharge', { amount: amt });
      toast.success(res.data.message);
      setShowRecharge(false);
      setRechargeAmt('');
      fetchCard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recharge failed');
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">My <span>Virtual Card</span></h1>

        {!card || card.hasCard === false ? (
          <div>
            <div className="card" style={{ textAlign: 'center', padding: '48px', marginBottom: '24px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>💳</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>No Card Found</h3>
              <p className="text-muted" style={{ marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
                Create your Bussify virtual card to book tickets, pay fares, and track journeys
              </p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create My Card</button>
            </div>
          </div>
        ) : (
          <div>
            {/* Wallet Card Visual */}
            <div className="wallet-card mb-24" style={{ maxWidth: '420px' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Bussify Card</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>{card.cardNumber}</div>
                  </div>
                  <div style={{ fontSize: '28px' }}>🚌</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '2px' }}>WALLET BALANCE</div>
                  <div style={{ fontSize: '38px', fontFamily: 'Syne, sans-serif', fontWeight: '800' }}>₹{card.walletBalance?.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{card.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>{card.gender?.toUpperCase()} • DOB: {new Date(card.dob).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => setShowRecharge(true)} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: 'none' }}>
                    + Recharge
                  </button>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="grid-2 mb-24">
              <div className="card">
                <h4 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>Card Details</h4>
                {[
                  { label: 'Card Number', value: card.cardNumber },
                  { label: 'Full Name', value: card.name },
                  { label: 'Gender', value: card.gender },
                  { label: 'Date of Birth', value: new Date(card.dob).toLocaleDateString() },
                  { label: 'Aadhaar', value: '****' + card.aadhaar?.slice(-4) },
                  { label: 'Member Since', value: new Date(card.createdAt).toLocaleDateString() },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                    <span className="text-muted">{r.label}</span>
                    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <h4 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>Journey Stats</h4>
                {[
                  { label: 'Total Journeys', value: card.journeyHistory?.length || 0 },
                  { label: 'Completed', value: card.journeyHistory?.filter(j => j.status === 'completed').length || 0 },
                  { label: 'Active', value: card.journeyHistory?.filter(j => j.status === 'active').length || 0 },
                  { label: 'Fines Issued', value: card.journeyHistory?.filter(j => j.status === 'fined').length || 0 },
                  { label: 'Total Spent', value: '₹' + (card.journeyHistory?.reduce((s, j) => s + (j.fare || 0), 0) || 0) },
                  { label: 'Total Fines', value: '₹' + (card.journeyHistory?.reduce((s, j) => s + (j.fine || 0), 0) || 0) },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                    <span className="text-muted">{r.label}</span>
                    <span style={{ fontWeight: '600' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Card Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Virtual Card</h2>
            <form onSubmit={createCard}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="As on Aadhaar" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input className="form-control" placeholder="12-digit Aadhaar number" maxLength={12}
                  value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRecharge && (
        <div className="modal-overlay" onClick={() => setShowRecharge(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">💳 Recharge Wallet</h2>
            <p className="text-muted mb-16" style={{ fontSize: '14px' }}>Current balance: <strong style={{ color: 'var(--text)' }}>₹{card?.walletBalance?.toFixed(2)}</strong></p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {quickAmounts.map(a => (
                <button key={a} className="btn btn-secondary btn-sm" onClick={() => setRechargeAmt(a.toString())}>₹{a}</button>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" className="form-control" placeholder="Enter amount"
                value={rechargeAmt} onChange={e => setRechargeAmt(e.target.value)} min="1" />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRecharge(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={recharge} disabled={submitting}>
                {submitting ? 'Processing...' : `Add ₹${rechargeAmt || '0'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
