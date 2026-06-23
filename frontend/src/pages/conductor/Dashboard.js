import React, { useEffect, useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function ConductorDashboard() {
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketInput, setTicketInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [updatingStop, setUpdatingStop] = useState(false);
  const [selectedStopIdx, setSelectedStopIdx] = useState('');

  const fetchBus = async () => {
    try {
      const res = await API.get('/conductor/my-bus');
      setBus(res.data);
    } catch {
      setBus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBus();
    const interval = setInterval(fetchBus, 10000);
    return () => clearInterval(interval);
  }, []);

  const scanTicket = async () => {
    if (!ticketInput.trim()) return toast.error('Enter a ticket ID');
    setScanning(true); setScanResult(null);
    try {
      const res = await API.post('/conductor/scan', { ticketId: ticketInput.trim() });
      setScanResult({ success: true, ...res.data });
      toast.success(res.data.message);
      setTicketInput('');
      fetchBus();
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data?.message || 'Scan failed' });
      toast.error(err.response?.data?.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const updateStop = async () => {
    if (selectedStopIdx === '') return toast.error('Select a stop');
    setUpdatingStop(true);
    const route = bus?.routeId;
    const stop = route?.stops?.[parseInt(selectedStopIdx)];
    if (!stop) return;
    try {
      const res = await API.put('/conductor/update-stop', { stopName: stop.name, stopIndex: parseInt(selectedStopIdx) });
      toast.success(`Updated to: ${stop.name}`);
      if (res.data.fines?.length > 0) {
        res.data.fines.forEach(f => toast.warning(`Fine ₹${f.fine} applied to ${f.passengerName}`));
      }
      fetchBus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stop');
    } finally {
      setUpdatingStop(false);
    }
  };

  const getOccupancyPct = () => bus ? Math.round((bus.currentOccupancy / bus.capacity) * 100) : 0;
  const getOccupancyColor = () => {
    const p = getOccupancyPct();
    return p < 50 ? 'var(--success)' : p < 80 ? 'var(--warning)' : 'var(--danger)';
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Conductor <span>Dashboard</span></h1>

        {!bus ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚌</div>
            <h3>No Bus Assigned</h3>
            <p>Contact the admin to get a bus assigned to you</p>
          </div>
        ) : (
          <>
            {/* Bus Info */}
            <div className="grid-2 mb-24">
              <div className="card">
                <h3 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>🚌 Bus Details</h3>
                {[
                  ['Bus Number', bus.busNumber],
                  ['Route', bus.routeId?.routeName || 'N/A'],
                  ['Route No.', bus.routeId?.routeNumber || 'N/A'],
                  ['Driver', bus.driverName],
                  ['Conductor', bus.conductorName],
                  ['Status', bus.status],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                    <span className="text-muted">{k}</span>
                    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>👥 Occupancy</h3>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '52px', fontFamily: 'Syne', fontWeight: '800', color: getOccupancyColor() }}>
                    {bus.currentOccupancy}
                  </div>
                  <div className="text-muted">of {bus.capacity} passengers</div>
                </div>
                <div className="occupancy-bar" style={{ height: '12px', marginBottom: '12px' }}>
                  <div className="occupancy-fill" style={{ width: `${getOccupancyPct()}%`, background: getOccupancyColor() }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {bus.capacity - bus.currentOccupancy} seats available
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Stop</div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>{bus.currentStop || 'Not Started'}</div>
                </div>
              </div>
            </div>

            {/* Update Stop */}
            <div className="card mb-24">
              <h3 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>📍 Update Current Stop</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select className="form-control" style={{ flex: 1, maxWidth: '300px' }}
                  value={selectedStopIdx} onChange={e => setSelectedStopIdx(e.target.value)}>
                  <option value="">Select next stop</option>
                  {bus.routeId?.stops?.map((s, i) => (
                    <option key={i} value={i}>{s.name} ({s.distanceFromStart} km)</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={updateStop} disabled={updatingStop}>
                  {updatingStop ? 'Updating...' : '📍 Update Stop'}
                </button>
              </div>

              {/* Route stops visual */}
              {bus.routeId?.stops?.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {bus.routeId.stops.map((s, i) => (
                    <React.Fragment key={i}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: i === bus.currentStopIndex ? 'var(--primary)' : 'var(--bg-card2)',
                        color: i === bus.currentStopIndex ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${i === bus.currentStopIndex ? 'var(--primary)' : 'var(--border)'}`,
                      }}>{s.name}</div>
                      {i < bus.routeId.stops.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* QR Scan */}
            <div className="card mb-24">
              <h3 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>🎫 Scan Passenger Ticket</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  className="form-control" style={{ flex: 1 }}
                  placeholder="Enter ticket ID (e.g. TKT1234567890)"
                  value={ticketInput}
                  onChange={e => setTicketInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && scanTicket()}
                />
                <button className="btn btn-primary" onClick={scanTicket} disabled={scanning}>
                  {scanning ? '⏳ Scanning...' : '✅ Verify & Board'}
                </button>
              </div>

              {scanResult && (
                <div className={`alert ${scanResult.success ? 'alert-success' : 'alert-error'}`}>
                  {scanResult.success ? '✅' : '❌'} {scanResult.message}
                  {scanResult.success && (
                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      Passenger: <strong>{scanResult.passengerName}</strong> → Destination: <strong>{scanResult.destination}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Current Passengers */}
            <div className="card">
              <h3 style={{ fontFamily: 'Syne', fontWeight: '700', marginBottom: '16px' }}>
                👥 Onboard Passengers ({bus.passengers?.length || 0})
              </h3>
              {!bus.passengers?.length ? (
                <div className="text-muted text-sm">No passengers currently onboard</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Boarded At</th>
                        <th>Destination</th>
                        <th>Ticket ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bus.passengers.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600' }}>{p.passengerName}</td>
                          <td>{p.boardingStop}</td>
                          <td>
                            <span style={{ color: p.destinationStopIndex <= bus.currentStopIndex ? 'var(--danger)' : 'var(--text)' }}>
                              {p.destinationStop}
                              {p.destinationStopIndex === bus.currentStopIndex + 1 && ' ⚠️ next stop'}
                              {p.destinationStopIndex <= bus.currentStopIndex && ' 🔴 missed'}
                            </span>
                          </td>
                          <td className="text-muted text-sm">{p.ticketId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
