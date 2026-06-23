import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function SearchBus() {
  const [stops, setStops] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [buses, setBuses] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);

  useEffect(() => {
    API.get('/passenger/stops').then(r => setStops(r.data)).catch(() => {});
  }, []);

  const search = async () => {
    if (!source || !destination) return toast.error('Select source and destination');
    if (source === destination) return toast.error('Source and destination cannot be same');
    setSearching(true); setSearched(true); setBuses([]);
    try {
      const res = await API.get(`/passenger/search-buses?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
      setBuses(res.data);
      if (res.data.length === 0) toast.info('No buses found for this route');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const bookTicket = async () => {
    if (!selectedBus) return;
    setBooking(true);
    try {
      const res = await API.post('/ticket/book', {
        busId: selectedBus.busId,
        source: selectedBus.source,
        sourceIndex: selectedBus.sourceIndex,
        destination: selectedBus.destination,
        destinationIndex: selectedBus.destinationIndex,
        fare: selectedBus.fare,
        distance: parseFloat(selectedBus.distance),
        routeId: selectedBus.routeId
      });
      setBookedTicket(res.data.ticket);
      toast.success('Ticket booked! ₹' + selectedBus.fare + ' deducted');
      setSelectedBus(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const getOccupancyColor = (occ, cap) => {
    const pct = (occ / cap) * 100;
    if (pct < 50) return 'var(--success)';
    if (pct < 80) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Search <span>Buses</span></h1>

        {/* Search Form */}
        <div className="card mb-24">
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">📍 From (Source)</label>
              <select className="form-control" value={source} onChange={e => setSource(e.target.value)}>
                <option value="">Select source stop</option>
                {stops.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">🏁 To (Destination)</label>
              <select className="form-control" value={destination} onChange={e => setDestination(e.target.value)}>
                <option value="">Select destination stop</option>
                {stops.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={search} disabled={searching}>
            {searching ? '🔍 Searching...' : '🔍 Search Buses'}
          </button>
          {source && destination && (
            <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Fare: ₹10/km
            </span>
          )}
        </div>

        {/* Search Results */}
        {searched && !searching && (
          buses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚌</div>
              <h3>No Buses Found</h3>
              <p>No active buses found for {source} → {destination}</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {buses.length} bus{buses.length > 1 ? 'es' : ''} found
              </p>
              {buses.map(bus => (
                <div
                  key={bus.busId}
                  className={`bus-card mb-16 ${selectedBus?.busId === bus.busId ? 'selected' : ''}`}
                  onClick={() => setSelectedBus(selectedBus?.busId === bus.busId ? null : bus)}
                >
                  <div className="flex-between mb-16">
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700' }}>Bus {bus.busNumber}</div>
                      <div className="text-muted text-sm">{bus.routeName} • Route {bus.routeNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontFamily: 'Syne, sans-serif', fontWeight: '800', color: 'var(--primary)' }}>₹{bus.fare}</div>
                      <div className="text-muted text-sm">{bus.distance} km</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{bus.source}</div>
                      <div className="text-muted text-sm">Boarding</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', fontSize: '20px' }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{bus.destination}</div>
                      <div className="text-muted text-sm">Alighting</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span className="text-muted">📍 Currently at: <strong style={{ color: 'var(--text)' }}>{bus.currentStop || 'Starting'}</strong></span>
                    <span style={{ color: getOccupancyColor(bus.occupancy, bus.capacity) }}>
                      👥 {bus.occupancy}/{bus.capacity} seats
                    </span>
                  </div>
                  <div className="occupancy-bar">
                    <div className="occupancy-fill" style={{
                      width: `${(bus.occupancy / bus.capacity) * 100}%`,
                      background: getOccupancyColor(bus.occupancy, bus.capacity)
                    }} />
                  </div>

                  {bus.availableSeats === 0 && (
                    <div className="alert alert-error" style={{ marginTop: '12px', marginBottom: 0 }}>⚠️ Bus is full</div>
                  )}

                  {selectedBus?.busId === bus.busId && bus.availableSeats > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px', fontSize: '13px' }}>
                        <strong>Booking Summary:</strong> {bus.source} → {bus.destination} • {bus.distance} km • <strong style={{ color: 'var(--primary)' }}>₹{bus.fare}</strong> will be deducted
                      </div>
                      <button className="btn btn-primary btn-full" onClick={bookTicket} disabled={booking}>
                        {booking ? '⏳ Booking...' : `🎫 Book Ticket — ₹${bus.fare}`}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Ticket Modal */}
      {bookedTicket && (
        <div className="modal-overlay" onClick={() => setBookedTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: '800', marginBottom: '4px' }}>Ticket Booked!</h2>
              <p className="text-muted text-sm mb-16">Show this QR code to the conductor</p>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {bookedTicket.qrCode
                ? <img src={bookedTicket.qrCode} alt="QR" style={{ width: '180px', height: '180px' }} />
                : <QRCodeSVG value={bookedTicket.ticketId} size={180} />
              }
            </div>

            <div style={{ background: 'var(--bg-card2)', borderRadius: '10px', padding: '14px' }}>
              {[
                ['Ticket ID', bookedTicket.ticketId],
                ['Route', `${bookedTicket.source} → ${bookedTicket.destination}`],
                ['Bus', bookedTicket.busNumber],
                ['Fare', `₹${bookedTicket.fare}`],
                ['Distance', `${bookedTicket.distance} km`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">{k}</span>
                  <span style={{ fontWeight: '600' }}>{v}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-full" style={{ marginTop: '16px' }} onClick={() => setBookedTicket(null)}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
