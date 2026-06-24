import React, { useEffect, useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const emptyForm = { name: '', email: '', password: '', phone: '' };

export default function AdminConductors() {
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    const res = await API.get('/admin/conductors').catch(() => ({ data: [] }));
    setConductors(res.data);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone || '', password: '' }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.put(`/admin/conductors/${editing._id}`, form);
        toast.success('Conductor updated');
      } else {
        await API.post('/admin/conductors', form);
        toast.success('Conductor added');
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete conductor ${name}?`)) return;
    await API.delete(`/admin/conductors/${id}`).catch(() => {});
    toast.success('Conductor deleted');
    fetch();
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="flex-between mb-24">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Manage <span>Conductors</span></h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Conductor</button>
        </div>

        <div className="card">
          {conductors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧑‍✈️</div>
              <h3>No Conductors</h3>
              <p>Add conductors to assign them to buses</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conductors.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: '600' }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(c._id, c.name)}>Delete</button>
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
            <h2 className="modal-title">{editing ? 'Edit Conductor' : 'Add Conductor'}</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="Full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="Email address" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" placeholder="Phone number" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" className="form-control" placeholder="Password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required={!editing} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
