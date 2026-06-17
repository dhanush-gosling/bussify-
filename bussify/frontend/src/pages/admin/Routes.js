import React, { useEffect, useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const emptyForm = { routeName: '', routeNumber: '', stops: [{ name: '', distanceFromStart: '' }] };

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    const res = await API.get('/admin/routes').catch(() => ({ data: [] }));
    setRoutes(res.data);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ routeName: r.routeName, routeNumber: r.routeNumber, stops: r.stops.map(s => ({ name: s.name, distanceFromStart: s.distanceFromStart })) });
    setShowModal(true);
  };

  const updateStop = (i, field, val) => {
    const stops = [...form.stops];
    stops[i] = { ...stops[i], [field]: val };
    setForm({ ...form, stops });
  };
  const addStop = () => setForm({ ...form, stops: [...form.stops, { name: '', distanceFromStart: '' }] });
  const removeStop = (i) => setForm({ ...form, stops: form.stops.filter((_, idx) => idx !== i) });

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, stops: form.stops.map(s => ({ ...s, distanceFromStart: parseFloat(s.distanceFromStart) })) };
    try {
      if (editing) {
        await API.put(`/admin/routes/${editing._id}`, payload);
        toast.success('Route updated');
      } else {
        await API.post('/admin/routes', payload);
        toast.success('Route added');
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    await API.delete(`/admin/routes/${id}`).catch(() => {});
    toast.success('Route deleted');
    fetch();
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="flex-between mb-24">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Manage <span>Routes</span></h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Route</button>
        </div>

        <div className="card">
          {routes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗺️</div>
              <h3>No Routes</h3>
              <p>Add bus routes with stops</p>
            </div>
          ) : (
            routes.map(r => (
              <div key={r._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-between mb-8">
                  <div>
                    <span style={{ fontFamily: 'Syne', fontWeight: '700', fontSize: '16px' }}>{r.routeName}</span>
                    <span className="badge badge-info" style={{ marginLeft: '8px' }}>Route {r.routeNumber}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}>Delete</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {r.stops.map((s, i) => (
                    <React.Fragment key={i}>
                      <span style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px' }}>
                        {s.name} <span className="text-muted">({s.distanceFromStart}km)</span>
                      </span>
                      {i < r.stops.length - 1 && <span className="text-muted" style={{ fontSize: '11px' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? 'Edit Route' : 'Add Route'}</h2>
            <form onSubmit={save}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Route Name</label>
                  <input className="form-control" placeholder="e.g. City Center Express" value={form.routeName}
                    onChange={e => setForm({ ...form, routeName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Route Number</label>
                  <input className="form-control" placeholder="e.g. R-101" value={form.routeNumber}
                    onChange={e => setForm({ ...form, routeNumber: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div className="flex-between mb-8">
                  <label className="form-label" style={{ margin: 0 }}>Stops (in order)</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addStop}>+ Add Stop</button>
                </div>
                {form.stops.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px', minWidth: '20px' }}>{i + 1}.</span>
                    <input className="form-control" placeholder="Stop name" value={s.name}
                      onChange={e => updateStop(i, 'name', e.target.value)} required style={{ flex: 2 }} />
                    <input type="number" className="form-control" placeholder="km from start" value={s.distanceFromStart}
                      onChange={e => updateStop(i, 'distanceFromStart', e.target.value)} required style={{ flex: 1 }} min="0" step="0.1" />
                    {form.stops.length > 1 && (
                      <button type="button" onClick={() => removeStop(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '18px' }}>×</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
