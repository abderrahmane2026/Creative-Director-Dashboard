import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getBookings, updateBookingStatus, deleteBooking } from '../services/api';

function Bookings() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      if (data.success) setBookings(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const data = await updateBookingStatus(id, status);
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => b._id === id ? { ...b, status } : b)
        );
        if (selected?._id === id) setSelected({ ...selected, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      const data = await deleteBooking(id);
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
        if (selected?._id === id) setSelected(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  if (loading) return (
    <Layout>
      <div style={styles.loading}>Loading...</div>
    </Layout>
  );

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bookings</h1>
          <p style={styles.subtitle}>{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* List */}
        <div style={styles.list}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>No bookings found</div>
          ) : (
            filtered.map((b) => (
              <div
                key={b._id}
                style={{
                  ...styles.bookingCard,
                  ...(selected?._id === b._id ? styles.bookingCardActive : {}),
                }}
                onClick={() => setSelected(b)}
              >
                {/* Left */}
                <div style={styles.cardLeft}>
                  <div style={styles.clientName}>{b.name}</div>
                  <div style={styles.clientEmail}>{b.email}</div>
                  <div style={styles.cardServices}>
                    {b.services.slice(0, 2).map((s) => (
                      <span key={s} style={styles.serviceTag}>{s}</span>
                    ))}
                    {b.services.length > 2 && (
                      <span style={styles.serviceTag}>+{b.services.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div style={styles.cardRight}>
                  <span style={{ ...styles.badge, ...getBadgeStyle(b.status) }}>
                    {b.status}
                  </span>
                  <div style={styles.cardDate}>
                    {new Date(b.date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>
                  <div style={styles.cardBudget}>{b.budget}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={styles.detail}>

            {/* Close */}
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>

            {/* Name */}
            <div style={styles.detailName}>{selected.name}</div>
            <span style={{ ...styles.badge, ...getBadgeStyle(selected.status), marginBottom: '1.5rem', display: 'inline-block' }}>
              {selected.status}
            </span>

            <div style={styles.divider} />

            {/* Info */}
            {[
              { label: 'Email',   value: selected.email },
              { label: 'Phone',   value: selected.phone || 'N/A' },
              { label: 'Budget',  value: selected.budget },
              { label: 'Date',    value: new Date(selected.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} style={styles.detailRow}>
                <span style={styles.detailLabel}>{label}</span>
                <span style={styles.detailValue}>{value}</span>
              </div>
            ))}

            {/* Services */}
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Services</span>
              <div style={styles.detailServices}>
                {selected.services.map((s) => (
                  <span key={s} style={styles.serviceTag}>{s}</span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selected.notes && (
              <div style={styles.detailNotes}>
                <div style={styles.detailLabel}>Notes</div>
                <div style={styles.notesText}>{selected.notes}</div>
              </div>
            )}

            <div style={styles.divider} />


            {/* WhatsApp */}

{selected.phone && (
  

   
   <a href={"https://wa.me/" + selected.phone.replace(/[^0-9]/g, '')}
    target="_blank"
    rel="noreferrer"
    style={styles.whatsappBtn} >
    <span>📱</span>
    <span>Open WhatsApp</span>
    </a>

    
)}

            {/* Actions */}
            <div style={styles.actions}>
              <div style={styles.actionsLabel}>Change Status</div>
              <div style={styles.actionBtns}>
                {['pending', 'confirmed', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    style={{
                      ...styles.actionBtn,
                      ...(selected.status === s ? styles.actionBtnActive : {}),
                      ...getActionStyle(s),
                    }}
                    onClick={() => handleStatus(selected._id, s)}
                    disabled={selected.status === s}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(selected._id)}
              >
                🗑 Delete Booking
              </button>
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
}

const getBadgeStyle = (status) => {
  if (status === 'confirmed') return { background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '0.5px solid rgba(76,175,80,0.3)' };
  if (status === 'cancelled') return { background: 'rgba(255,77,46,0.15)', color: '#FF4D2E', border: '0.5px solid rgba(255,77,46,0.3)' };
  return { background: 'rgba(255,152,0,0.15)', color: '#FF9800', border: '0.5px solid rgba(255,152,0,0.3)' };
};

const getActionStyle = (status) => {
  if (status === 'confirmed') return { borderColor: 'rgba(76,175,80,0.4)', color: '#4CAF50' };
  if (status === 'cancelled') return { borderColor: 'rgba(255,77,46,0.4)', color: '#FF4D2E' };
  return { borderColor: 'rgba(255,152,0,0.4)', color: '#FF9800' };
};

const styles = {
  loading: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '60vh', color: 'var(--gold)', fontSize: '1.2rem', letterSpacing: '2px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '2rem',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '2rem', fontWeight: 400,
  },
  subtitle: {
    fontSize: '0.82rem', color: 'var(--muted)',
    marginTop: '4px', letterSpacing: '1px',
  },
  filters: {
    display: 'flex', gap: '4px',
    marginBottom: '1.5rem',
  },
  filterBtn: {
    padding: '0.5rem 1.2rem',
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)',
    color: 'var(--muted)',
    fontSize: '0.72rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterActive: {
    background: 'var(--gold-dim)',
    border: '0.5px solid var(--gold)',
    color: 'var(--gold)',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: selected => selected ? '1fr 380px' : '1fr',
    gap: '1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    background: 'var(--border)',
  },
  bookingCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    background: 'var(--dark2)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderLeft: '2px solid transparent',
  },
  bookingCardActive: {
    background: 'var(--dark3)',
    borderLeft: '2px solid var(--gold)',
  },
  cardLeft: { flex: 1 },
  clientName: { fontSize: '0.92rem', marginBottom: '2px' },
  clientEmail: { fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' },
  cardServices: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  serviceTag: {
    fontSize: '0.62rem', padding: '2px 8px',
    background: 'var(--gold-dim)', color: 'var(--gold)',
    letterSpacing: '1px',
  },
  cardRight: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'flex-end', gap: '6px',
  },
  badge: {
    fontSize: '0.65rem', padding: '3px 10px',
    letterSpacing: '1px', textTransform: 'uppercase',
  },
  cardDate: { fontSize: '0.75rem', color: 'var(--muted)' },
  cardBudget: { fontSize: '0.78rem', color: 'var(--gold)' },
  detail: {
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)',
    padding: '2rem',
    position: 'relative',
    height: 'fit-content',
  },
  closeBtn: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: 'transparent', border: 'none',
    color: 'var(--muted)', fontSize: '1rem',
    cursor: 'pointer',
  },
  detailName: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.4rem', fontWeight: 400,
    marginBottom: '0.5rem',
  },
  divider: {
    height: '0.5px', background: 'var(--border)',
    margin: '1.25rem 0',
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '0.75rem',
  },
  detailLabel: {
    fontSize: '0.65rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)',
    marginTop: '2px',
  },
  detailValue: { fontSize: '0.85rem', textAlign: 'right', maxWidth: '60%' },
  detailServices: { display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  detailNotes: { marginBottom: '0.75rem' },
  notesText: {
    fontSize: '0.82rem', color: 'var(--muted)',
    lineHeight: 1.7, marginTop: '0.5rem',
    direction: 'rtl', textAlign: 'right',
  },
  actions: { marginTop: '0.5rem' },
  actionsLabel: {
    fontSize: '0.65rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)',
    marginBottom: '0.75rem',
  },
  actionBtns: { display: 'flex', gap: '8px', marginBottom: '1rem' },
  actionBtn: {
    flex: 1, padding: '0.6rem',
    background: 'transparent',
    border: '0.5px solid var(--border)',
    fontSize: '0.68rem', letterSpacing: '1px',
    textTransform: 'uppercase', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionBtnActive: { opacity: 0.4, cursor: 'not-allowed' },
  deleteBtn: {
    width: '100%', padding: '0.75rem',
    background: 'rgba(255,77,46,0.08)',
    border: '0.5px solid rgba(255,77,46,0.3)',
    color: '#FF4D2E', fontSize: '0.78rem',
    letterSpacing: '1px', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  empty: {
    padding: '3rem', textAlign: 'center',
    color: 'var(--muted)', fontSize: '0.85rem',
    letterSpacing: '2px', background: 'var(--dark2)',
  },

  whatsappBtn: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(37,211,102,0.1)',
  border: '0.5px solid rgba(37,211,102,0.3)',
  color: '#25D366',
  fontSize: '0.78rem',
  letterSpacing: '1px',
  textDecoration: 'none',
  marginBottom: '1rem',
  transition: 'all 0.2s',
},
};

export default Bookings;