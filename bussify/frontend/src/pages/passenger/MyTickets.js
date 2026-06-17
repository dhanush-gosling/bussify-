import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../../components/shared/Navbar';
import API from '../../utils/api';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/ticket/my').then(r => setTickets(r.data)).finally(() => setLoading(false));
  }, []);

  const statusBadge = { valid: 'badge-success', used: 'badge-muted', expired: 'badge-danger', fined: 'badge-danger' };

  if (loading) return <><Navbar /><div className="loading-page"><div className="loading-spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">My <span>Tickets</span></h1>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎫</div>
            <h3>No Tickets Yet</h3>
            <p>Book a bus ticket to see it here</p>
          </div>
        ) : (
          <div>
            {tickets.map(ticket => (
              <div key={ticket._id} className="card mb-16" style={{ cursor: 'pointer' }} onClick={() => setSelected(ticket)}>
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,107,53,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🎫</div>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: '700', fontSize: '16px' }}>
                        {ticket.source} → {ticket.destination}
                      </div>
                      <div className="text-muted text-sm">Bus {ticket.busNumber} • {ticket.ticketId}</div>
                      <div className="text-muted text-sm">{new Date(ticket.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Syne', color: 'var(--primary)', marginBottom: '6px' }}>₹{ticket.fare}</div>
                    <span className={`badge ${statusBadge[ticket.status] || 'badge-info'}`}>{ticket.status}</span>
                    {ticket.fine > 0 && <div className="text-sm" style={{ color: 'var(--danger)', marginTop: '4px' }}>Fine: ₹{ticket.fine}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="flex-between mb-16">
              <h2 style={{ fontFamily: 'Syne', fontWeight: '800' }}>Ticket Details</h2>
              <span className={`badge ${statusBadge[selected.status] || 'badge-info'}`}>{selected.status}</span>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {selected.qrCode
                ? <img src={selected.qrCode} alt="QR" style={{ width: '160px', height: '160px' }} />
                : <QRCodeSVG value={selected.ticketId} size={160} />
              }
            </div>

            <div style={{ background: 'var(--bg-card2)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              {[
                ['Ticket ID', selected.ticketId],
                ['From', selected.source],
                ['To', selected.destination],
                ['Bus', selected.busNumber],
                ['Distance', `${selected.distance} km`],
                ['Fare', `₹${selected.fare}`],
                ...(selected.fine > 0 ? [['Fine', `₹${selected.fine}`]] : []),
                ['Booked At', new Date(selected.createdAt).toLocaleString()],
                ...(selected.boardedAt ? [['Boarded At', new Date(selected.boardedAt).toLocaleString()]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">{k}</span>
                  <span style={{ fontWeight: '600', color: k === 'Fine' ? 'var(--danger)' : '' }}>{v}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary btn-full" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
