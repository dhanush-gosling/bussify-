import React, { useEffect, useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const emptyForm = { busNumber: '', routeId: '', driverName: '', conductorId: '', capacity: 50, status: 'active' };

export default function AdminBuses() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    const [b, r, c] = await Promise.all([
      API.get('/admin/buses').catch(() => ({ data: [] })),
      API.get('/admin/routes').catch(() => ({ data: [] })),
      API.get('/admin/conductors').catch(() => ({ data: [] }))
    ]);
    setBuses(b.data); setRoutes(r.data); setConductors(c.data);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      busNumber: b.busNumber, routeId: b.routeId?._id || '', driverName: b.driverName,
      conductorId: b.conductorId?._id || '', capacity: b.capacity, status: b.status
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.put(`/admin/buses/${editing._id}`, form);
        toast.success('Bus updated');
      } else {
        await API.post('/admin/buses', form);
        toast.success('Bus added');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    await API.delete(`/admin/buses/${id}`).catch(() => {});
    toast.success('Bus deleted');
    fetchAll();
  };

  const getOccupancyColor = (occ, cap) => {
    const p = (occ / cap) * 100;
    return p < 50 ? 'var(--success)' : p < 80 ? 'var(--warning)' : 'var(--danger)';
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="flex-between mb-24">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Manage <span>Buses</span></h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Bus</button>
        </div>

        <div className="card">
          {buses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚌</div>
              <h3>No Buses</h3>
              <p>Add your first bus to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Bus No.</th>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>Conductor</th>
                    <th>Occupancy</th>
                    <th>Current Stop</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map(bus => (
                    <tr key={bus._id}>
                      <td style={{ fontWeight: '700' }}>{bus.busNumber}</td>
                      <td>{bus.routeId?.routeName || '—'}</td>
                      <td>{bus.driverName}</td>
                      <td>{bus.conductorId?.name || '—'}</td>
                      <td>
                        <div style={{ minWidth: '100px' }}>
                          <div style={{ fontSize: '12px', marginBottom: '4px', color: getOccupancyColor(bus.currentOccupancy, bus.capacity) }}>
                            {bus.currentOccupancy}/{bus.capacity}
                          </div>
                          <div className="occupancy-bar">
                            <div className="occupancy-fill" style={{
                              width: `${(bus.currentOccupancy / bus.capacity) * 100}%`,
                              background: getOccupancyColor(bus.currentOccupancy, bus.capacity)
                            }} />
                          </div>
                        </div>
                      </td>
                      <td>{bus.currentStop || '—'}</td>
                      <td>
                        <span className={`badge ${bus.status === 'active' ? 'badge-success' : bus.status === 'maintenance' ? 'badge-warning' : 'badge-muted'}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(bus)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(bus._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? 'Edit Bus' : 'Add Bus'}</h2>
            <form onSubmit={save}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Bus Number</label>
                  <input className="form-control" placeholder="e.g. TN01-1234" value={form.busNumber}
                    onChange={e => setForm({ ...form, busNumber: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-control" value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} required min="1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Route</label>
                <select className="form-control" value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required>
                  <option value="">Select route</option>
                  {routes.map(r => <option key={r._id} value={r._id}>{r.routeName} (Route {r.routeNumber})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input className="form-control" placeholder="Driver's full name" value={form.driverName}
                  onChange={e => setForm({ ...form, driverName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Conductor (optional)</label>
                <select className="form-control" value={form.conductorId} onChange={e => setForm({ ...form, conductorId: e.target.value })}>
                  <option value="">No conductor assigned</option>
                  {conductors.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
