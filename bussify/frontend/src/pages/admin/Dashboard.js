import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, busesRes] = await Promise.all([
        API.get('/admin/stats').catch(() => ({ data: {} })),
        API.get('/admin/buses').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setBuses(busesRes.data);
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getOccupancyColor = (occ, cap) => {
    const p = (occ / cap) * 100;
    return p < 50 ? 'var(--success)' : p < 80 ? 'var(--warning)' : 'var(--danger)';
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Admin <span>Dashboard</span></h1>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '🚌', label: 'Total Buses', value: stats?.totalBuses || 0 },
            { icon: '✅', label: 'Active Buses', value: stats?.activeBuses || 0 },
            { icon: '🗺️', label: 'Routes', value: stats?.totalRoutes || 0 },
            { icon: '🧑‍✈️', label: 'Conductors', value: stats?.totalConductors || 0 },
            { icon: '👥', label: 'Live Passengers', value: stats?.totalPassengers || 0 },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid-3 mb-24">
          {[
            { to: '/admin/buses', icon: '🚌', label: 'Manage Buses', desc: 'Add, edit, assign conductors' },
            { to: '/admin/routes', icon: '🗺️', label: 'Manage Routes', desc: 'Configure routes and stops' },
            { to: '/admin/conductors', icon: '🧑‍✈️', label: 'Manage Conductors', desc: 'Add and edit conductor accounts' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{l.icon}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '4px' }}>{l.label}</div>
                <div className="text-muted text-sm">{l.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Live Bus Overview */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>🚦 Live Bus Overview</h3>
          {buses.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">🚌</div>
              <h3>No Buses</h3>
              <p>Add buses to see live overview</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Bus</th>
                    <th>Route</th>
                    <th>Conductor</th>
                    <th>Current Stop</th>
                    <th>Occupancy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map(bus => (
                    <tr key={bus._id}>
                      <td style={{ fontWeight: '700' }}>{bus.busNumber}</td>
                      <td>{bus.routeId?.routeName || '—'}</td>
                      <td>{bus.conductorId?.name || '—'}</td>
                      <td>{bus.currentStop || 'Not started'}</td>
                      <td>
                        <div style={{ minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span>{bus.currentOccupancy}/{bus.capacity}</span>
                            <span style={{ color: getOccupancyColor(bus.currentOccupancy, bus.capacity) }}>
                              {Math.round((bus.currentOccupancy / bus.capacity) * 100)}%
                            </span>
                          </div>
                          <div className="occupancy-bar">
                            <div className="occupancy-fill" style={{
                              width: `${(bus.currentOccupancy / bus.capacity) * 100}%`,
                              background: getOccupancyColor(bus.currentOccupancy, bus.capacity)
                            }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${bus.status === 'active' ? 'badge-success' : bus.status === 'maintenance' ? 'badge-warning' : 'badge-muted'}`}>
                          {bus.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
