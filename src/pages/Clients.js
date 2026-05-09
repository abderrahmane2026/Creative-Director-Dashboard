import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getClients, createClient, updateClient, deleteClient } from '../services/api';

const INDUSTRIES = [
  'restaurant', 'automotive', 'events', 'podcast',
  'corporate', 'products', 'portrait', 'hospitality',
];

function Clients() {
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ name: '', industry: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      if (data.success) setClients(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const data = await updateClient(editing._id, form);
        if (data.success) {
          setClients((prev) => prev.map((c) => c._id === editing._id ? data.data : c));
          resetForm();
        }
      } else {
        const data = await createClient(form);
        if (data.success) {
          setClients((prev) => [data.data, ...prev]);
          resetForm();
        }
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client) => {
    setEditing(client);
    setForm({ name: client.name, industry: client.industry });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      const data = await deleteClient(id);
      if (data.success) setClients((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', industry: '' });
    setError('');
  };

  if (loading) return (
    <Layout><div style={styles.loading}>Loading...</div></Layout>
  );

  return (
    <Layout>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clients</h1>
          <p style={styles.subtitle}>{clients.length} clients</p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => { resetForm(); setShowForm((v) => !v); }}
        >
          {showForm && !editing ? '✕ Cancel' : '+ New Client'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={styles.form}>
          <div style={styles.formTitle}>
            {editing ? 'Edit Client' : 'New Client'}
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>NAME *</label>
              <input
                style={styles.input}
                name="name"
                placeholder="Client name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>INDUSTRY</label>
              <select
                style={styles.input}
                name="industry"
                value={form.industry}
                onChange={handleChange}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i.charAt(0).toUpperCase() + i.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={resetForm}>
              Cancel
            </button>
            <button
              style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : editing ? 'Save Changes →' : 'Create Client →'}
            </button>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <div style={styles.empty}>No clients yet — add your first one!</div>
      ) : (
        <div style={styles.grid}>
          {clients.map((c) => (
            <div key={c._id} style={styles.card}>

              {/* Icon */}
              <div style={styles.cardIcon}>
                {c.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>{c.name}</div>
                {c.industry && (
                  <div style={styles.cardIndustry}>{c.industry}</div>
                )}
                <div style={styles.cardDate}>
                  Added {new Date(c.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={styles.cardActions}>
                <button
                  style={styles.editBtn}
                  onClick={() => handleEdit(c)}
                >
                  ✎
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(c._id)}
                >
                  🗑
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </Layout>
  );
}

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
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: 'var(--gold)', color: 'var(--dark)',
    border: 'none', fontSize: '0.78rem',
    fontWeight: 500, letterSpacing: '2px',
    textTransform: 'uppercase', cursor: 'pointer',
  },
  form: {
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)',
    padding: '2rem', marginBottom: '2rem',
  },
  formTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.2rem', color: 'var(--gold)',
    marginBottom: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  label: {
    fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--muted)',
  },
  input: {
    background: 'var(--dark3)',
    border: '0.5px solid var(--border)',
    color: 'var(--text)', padding: '0.75rem 1rem',
    fontSize: '0.85rem', outline: 'none',
  },
  error: {
    background: 'rgba(255,77,46,0.1)',
    border: '0.5px solid rgba(255,77,46,0.3)',
    color: '#FF4D2E', padding: '0.75rem 1rem',
    fontSize: '0.82rem', marginTop: '1rem',
  },
  formActions: {
    display: 'flex', gap: '1rem',
    justifyContent: 'flex-end', marginTop: '1.5rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '0.5px solid var(--border)',
    color: 'var(--muted)', fontSize: '0.78rem',
    letterSpacing: '2px', cursor: 'pointer',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    background: 'var(--gold)', color: 'var(--dark)',
    border: 'none', fontSize: '0.78rem',
    fontWeight: 500, letterSpacing: '2px',
    textTransform: 'uppercase', cursor: 'pointer',
  },
  empty: {
    padding: '4rem', textAlign: 'center',
    color: 'var(--muted)', fontSize: '0.85rem',
    letterSpacing: '2px',
    border: '0.5px dashed var(--border)',
  },
  grid: {
    display: 'flex', flexDirection: 'column',
    gap: '1px', background: 'var(--border)',
  },
  card: {
    display: 'flex', alignItems: 'center',
    gap: '1.5rem', padding: '1.25rem 1.5rem',
    background: 'var(--dark2)',
    transition: 'background 0.2s',
  },
  cardIcon: {
    width: '48px', height: '48px',
    background: 'var(--gold-dim)',
    border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.3rem', color: 'var(--gold)',
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: '0.95rem', marginBottom: '3px' },
  cardIndustry: {
    fontSize: '0.72rem', color: 'var(--gold)',
    letterSpacing: '1px', textTransform: 'uppercase',
    marginBottom: '3px',
  },
  cardDate: { fontSize: '0.72rem', color: 'var(--muted)' },
  cardActions: { display: 'flex', gap: '8px' },
  editBtn: {
    padding: '0.5rem 0.75rem',
    background: 'var(--gold-dim)',
    border: '0.5px solid var(--border)',
    color: 'var(--gold)', fontSize: '0.9rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,77,46,0.08)',
    border: '0.5px solid rgba(255,77,46,0.3)',
    color: '#FF4D2E', fontSize: '0.9rem',
    cursor: 'pointer',
  },
};

export default Clients;