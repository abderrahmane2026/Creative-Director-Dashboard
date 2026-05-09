import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: '▦', label: 'Overview',  path: '/' },
  { icon: '📅', label: 'Bookings',  path: '/bookings' },
  { icon: '🎬', label: 'Projects',  path: '/projects' },
   { icon: '🎬', label: 'Works',     path: '/works' },
  { icon: '👥', label: 'Clients',   path: '/clients' },
];

function Sidebar() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { logout }  = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoText}>CD.</div>
        <div style={styles.logoSub}>Admin</div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              onClick={() => navigate(path)}
            >
              <span style={styles.navIcon}>{icon}</span>
              <span style={styles.navLabel}>{label}</span>
              {isActive && <div style={styles.activeBar} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.divider} />
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span>⎋</span>
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: 'var(--dark2)',
    borderRight: '0.5px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    padding: '2rem 1.5rem',
  },
  logoText: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.5rem',
    color: 'var(--gold)',
    letterSpacing: '3px',
  },
  logoSub: {
    fontSize: '0.62rem',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginTop: '4px',
  },
  divider: {
    height: '0.5px',
    background: 'var(--border)',
    margin: '0 1.5rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '1.5rem 0.75rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '0.82rem',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    textAlign: 'left',
    borderRadius: '2px',
  },
  navItemActive: {
    background: 'var(--gold-dim)',
    color: 'var(--gold)',
  },
  navIcon: {
    fontSize: '1rem',
    width: '20px',
    textAlign: 'center',
  },
  navLabel: {
    flex: 1,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: '2px',
    background: 'var(--gold)',
    borderRadius: '2px',
  },
  bottom: {
    padding: '1rem 0',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1.75rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '0.82rem',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'color 0.2s',
    width: '100%',
    marginTop: '1rem',
  },
};

export default Sidebar;