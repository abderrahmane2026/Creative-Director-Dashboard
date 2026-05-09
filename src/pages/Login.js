import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginAdmin } from '../services/api';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginAdmin(email, password);
      if (data.success) {
        login(data.token);
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background */}
      <div style={styles.bg} />
      <div style={styles.grid} />

      {/* Card */}
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>CD.</div>
        <p style={styles.logoSub}>Admin Dashboard</p>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              style={styles.input}
              type="email"
              placeholder="admin@portfolio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

        </form>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: 'var(--dark)',
  },
  bg: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)',
    padding: '3rem',
  },
  logo: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '2rem',
    color: 'var(--gold)',
    letterSpacing: '4px',
    textAlign: 'center',
  },
  logoSub: {
    fontSize: '0.68rem',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  divider: {
    height: '0.5px',
    background: 'var(--border)',
    margin: '2rem 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.65rem',
    letterSpacing: '3px',
    color: 'var(--muted)',
  },
  input: {
    background: 'var(--dark3)',
    border: '0.5px solid var(--border)',
    color: 'var(--text)',
    padding: '0.9rem 1rem',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  error: {
    background: 'rgba(255,77,46,0.1)',
    border: '0.5px solid rgba(255,77,46,0.3)',
    color: '#FF4D2E',
    padding: '0.75rem 1rem',
    fontSize: '0.82rem',
    textAlign: 'center',
  },
  btn: {
    background: 'var(--gold)',
    color: 'var(--dark)',
    border: 'none',
    padding: '1rem',
    fontSize: '0.8rem',
    fontWeight: '500',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '0.5rem',
  },
};

export default Login;