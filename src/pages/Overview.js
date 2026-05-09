import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getBookings, getProjects, getWorks, getClients } from '../services/api';

function Overview() {
  const [bookings, setBookings] = useState([]);
  const [works, setWorks]       = useState([]);
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, w, c] = await Promise.all([
          getBookings(),
          getWorks(),
          getClients(),
        ]);
        if (b.success) setBookings(b.data);
        if (w.success) setWorks(w.data);
        if (c.success) setClients(c.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending   = bookings.filter((b) => b.status === 'pending').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const featured  = works.filter((w) => w.featured).length;

  const STATS = [
    { label: 'Total Bookings', value: bookings.length, icon: '📅', color: 'var(--gold)' },
    { label: 'Pending',        value: pending,          icon: '⏳', color: 'var(--warning)' },
    { label: 'Confirmed',      value: confirmed,        icon: '✅', color: 'var(--success)' },
    { label: 'Total Works',    value: works.length,     icon: '🎬', color: 'var(--gold)' },
    { label: 'Featured',       value: featured,         icon: '⭐', color: 'var(--gold)' },
    { label: 'Clients',        value: clients.length,   icon: '👥', color: 'var(--gold)' },
  ];

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
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>Welcome back to your dashboard</p>
        </div>
        <div style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {STATS.map(({ label, value, icon, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={styles.statIcon}>{icon}</span>
              <span style={{ ...styles.statValue, color }}>{value}</span>
            </div>
            <div style={styles.statLabel}>{label}</div>
            <div style={{ ...styles.statBar, background: color }} />
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Bookings</h2>
          <span style={styles.sectionCount}>{bookings.length} total</span>
        </div>

        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={styles.th}>Client</span>
            <span style={styles.th}>Services</span>
            <span style={styles.th}>Budget</span>
            <span style={styles.th}>Date</span>
            <span style={styles.th}>Status</span>
          </div>

          {bookings.slice(0, 5).map((b) => (
            <div key={b._id} style={styles.tableRow}>
              <div style={styles.td}>
                <div style={styles.clientName}>{b.name}</div>
                <div style={styles.clientEmail}>{b.email}</div>
              </div>
              <div style={styles.td}>
                <div style={styles.services}>
                  {b.services.slice(0, 2).map((s) => (
                    <span key={s} style={styles.serviceTag}>{s}</span>
                  ))}
                  {b.services.length > 2 && (
                    <span style={styles.serviceTag}>+{b.services.length - 2}</span>
                  )}
                </div>
              </div>
              <div style={{ ...styles.td, color: 'var(--gold)' }}>{b.budget}</div>
              <div style={{ ...styles.td, color: 'var(--muted)' }}>
                {new Date(b.date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </div>
              <div style={styles.td}>
                <span style={{ ...styles.badge, ...getBadgeStyle(b.status) }}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div style={styles.empty}>No bookings yet</div>
          )}
        </div>
      </div>

      {/* Recent Works */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Works</h2>
          <span style={styles.sectionCount}>{works.length} total</span>
        </div>
        <div style={styles.worksGrid}>
          {works.slice(0, 6).map((w) => (
            <div key={w._id} style={styles.workCard}>
              <div style={styles.workMedia}>
                {w.type === 'video' || w.type === 'ai' || w.type === 'animation' ? (
                  <video src={w.url} style={styles.workImg} />
                ) : (
                  <img src={w.url} alt={w.title} style={styles.workImg} />
                )}
              </div>
              <div style={styles.workInfo}>
                <div style={styles.workTitle}>{w.title}</div>
                <div style={styles.workMeta}>
                  <span style={styles.workType}>{w.type}</span>
                  {w.featured && <span style={styles.workFeatured}>⭐</span>}
                </div>
              </div>
            </div>
          ))}
          {works.length === 0 && (
            <div style={styles.empty}>No works yet</div>
          )}
        </div>
      </div>

      {/* Clients */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Clients</h2>
          <span style={styles.sectionCount}>{clients.length} total</span>
        </div>
        <div style={styles.clientsGrid}>
          {clients.map((c) => (
            <div key={c._id} style={styles.clientCard}>
              <div style={styles.clientIcon}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.clientInfo}>
                <div style={styles.clientName2}>{c.name}</div>
                {c.industry && (
                  <div style={styles.clientIndustry}>{c.industry}</div>
                )}
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <div style={styles.empty}>No clients yet</div>
          )}
        </div>
      </div>

    </Layout>
  );
}

const getBadgeStyle = (status) => {
  if (status === 'confirmed') return { background: 'rgba(76,175,80,0.15)',  color: '#4CAF50', border: '0.5px solid rgba(76,175,80,0.3)' };
  if (status === 'cancelled') return { background: 'rgba(255,77,46,0.15)',  color: '#FF4D2E', border: '0.5px solid rgba(255,77,46,0.3)' };
  return                             { background: 'rgba(255,152,0,0.15)', color: '#FF9800', border: '0.5px solid rgba(255,152,0,0.3)' };
};

const styles = {
  loading: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '60vh', color: 'var(--gold)', fontSize: '1.2rem', letterSpacing: '2px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '2.5rem',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '2rem', fontWeight: 400,
  },
  subtitle: {
    fontSize: '0.82rem', color: 'var(--muted)',
    marginTop: '4px', letterSpacing: '1px',
  },
  date: {
    fontSize: '0.75rem', color: 'var(--muted)',
    letterSpacing: '1px', marginTop: '8px',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1px', background: 'var(--border)', marginBottom: '2.5rem',
  },
  statCard: {
    background: 'var(--dark2)', padding: '1.75rem',
    position: 'relative', overflow: 'hidden',
  },
  statTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '0.75rem',
  },
  statIcon: { fontSize: '1.3rem' },
  statValue: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '2.2rem', lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.7rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)',
  },
  statBar: {
    position: 'absolute', bottom: 0, left: 0,
    right: 0, height: '2px', opacity: 0.4,
  },
  section: { marginBottom: '2.5rem' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  sectionTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.3rem', fontWeight: 400,
  },
  sectionCount: {
    fontSize: '0.72rem', letterSpacing: '2px',
    color: 'var(--muted)', textTransform: 'uppercase',
  },
  table: {
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)', overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
    padding: '1rem 1.5rem',
    borderBottom: '0.5px solid var(--border)',
    background: 'var(--dark3)',
  },
  th: {
    fontSize: '0.65rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
    padding: '1rem 1.5rem',
    borderBottom: '0.5px solid var(--border)',
    alignItems: 'center',
  },
  td: { fontSize: '0.85rem' },
  clientName: { fontSize: '0.88rem', marginBottom: '2px' },
  clientEmail: { fontSize: '0.72rem', color: 'var(--muted)' },
  services: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  serviceTag: {
    fontSize: '0.65rem', padding: '2px 8px',
    background: 'var(--gold-dim)', color: 'var(--gold)',
    letterSpacing: '1px',
  },
  badge: {
    fontSize: '0.68rem', padding: '4px 10px',
    letterSpacing: '1px', textTransform: 'uppercase',
  },
  empty: {
    padding: '3rem', textAlign: 'center',
    color: 'var(--muted)', fontSize: '0.85rem',
    letterSpacing: '2px',
  },
  worksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1px', background: 'var(--border)',
  },
  workCard: {
    background: 'var(--dark2)', overflow: 'hidden',
  },
  workMedia: {
    height: '120px', background: 'var(--dark3)',
    overflow: 'hidden',
  },
  workImg: {
    width: '100%', height: '100%',
    objectFit: 'contain', background: '#000',
  },
  workInfo: { padding: '0.75rem' },
  workTitle: {
    fontSize: '0.78rem', marginBottom: '4px',
    whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  workMeta: { display: 'flex', alignItems: 'center', gap: '6px' },
  workType: {
    fontSize: '0.62rem', padding: '2px 6px',
    background: 'var(--gold-dim)', color: 'var(--gold)',
    letterSpacing: '1px',
  },
  workFeatured: { fontSize: '0.75rem' },
  clientsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1px', background: 'var(--border)',
  },
  clientCard: {
    display: 'flex', alignItems: 'center',
    gap: '1rem', padding: '1rem 1.25rem',
    background: 'var(--dark2)',
  },
  clientIcon: {
    width: '36px', height: '36px',
    background: 'var(--gold-dim)',
    border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Playfair Display, serif',
    fontSize: '1rem', color: 'var(--gold)',
    flexShrink: 0,
  },
  clientInfo: { flex: 1 },
  clientName2: { fontSize: '0.85rem', marginBottom: '2px' },
  clientIndustry: {
    fontSize: '0.68rem', color: 'var(--gold)',
    letterSpacing: '1px', textTransform: 'uppercase',
  },
};

export default Overview;