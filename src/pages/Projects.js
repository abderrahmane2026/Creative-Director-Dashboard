import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProjects, createProject, deleteProject } from '../services/api';

const EMPTY_FORM = {
  slug: '', title: '', tag: '', icon: '',
  bg: '', year: '', client: '', description: '',
  services: '', order: 0,
};

const BG_OPTIONS = [
  { value: 'work-bg-1', label: 'Gold Dark' },
  { value: 'work-bg-2', label: 'Blue Dark' },
  { value: 'work-bg-3', label: 'Red Dark' },
  { value: 'work-bg-4', label: 'Green Dark' },
  { value: 'work-bg-5', label: 'Purple Dark' },
];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      if (data.success) setProjects(data.data);
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
    if (!form.slug || !form.title || !form.tag) {
      setError('Slug, Title and Tag are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
        order: Number(form.order),
      };
      const data = await createProject(payload);
      if (data.success) {
        setProjects((prev) => [data.data, ...prev]);
        setShowForm(false);
        setForm(EMPTY_FORM);
      } else {
        setError(data.message || 'Error creating project');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    try {
      const data = await deleteProject(id);
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          <h1 style={styles.title}>Projects</h1>
          <p style={styles.subtitle}>{projects.length} projects</p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => { setShowForm((v) => !v); setError(''); }}
        >
          {showForm ? '✕ Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={styles.form}>
          <div style={styles.formTitle}>New Project</div>

          <div style={styles.formGrid}>
            {/* Slug */}
            <div style={styles.field}>
              <label style={styles.label}>SLUG *</label>
              <input
                style={styles.input}
                name="slug"
                placeholder="restaurant-campaign"
                value={form.slug}
                onChange={handleChange}
              />
            </div>

            {/* Title */}
            <div style={styles.field}>
              <label style={styles.label}>TITLE *</label>
              <input
                style={styles.input}
                name="title"
                placeholder="Restaurant Campaign"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* Tag */}
            <div style={styles.field}>
              <label style={styles.label}>TAG *</label>
              <input
                style={styles.input}
                name="tag"
                placeholder="Food Photography · Video"
                value={form.tag}
                onChange={handleChange}
              />
            </div>

            {/* Icon */}
            <div style={styles.field}>
              <label style={styles.label}>ICON</label>
              <input
                style={styles.input}
                name="icon"
                placeholder="🍽️"
                value={form.icon}
                onChange={handleChange}
              />
            </div>

            {/* BG */}
            <div style={styles.field}>
              <label style={styles.label}>BACKGROUND</label>
              <select
                style={styles.input}
                name="bg"
                value={form.bg}
                onChange={handleChange}
              >
                <option value="">Select background</option>
                {BG_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div style={styles.field}>
              <label style={styles.label}>YEAR</label>
              <input
                style={styles.input}
                name="year"
                placeholder="2024"
                value={form.year}
                onChange={handleChange}
              />
            </div>

            {/* Client */}
            <div style={styles.field}>
              <label style={styles.label}>CLIENT</label>
              <input
                style={styles.input}
                name="client"
                placeholder="Fine Dining Restaurant"
                value={form.client}
                onChange={handleChange}
              />
            </div>

            {/* Order */}
            <div style={styles.field}>
              <label style={styles.label}>ORDER</label>
              <input
                style={styles.input}
                name="order"
                type="number"
                placeholder="1"
                value={form.order}
                onChange={handleChange}
              />
            </div>

            {/* Services */}
            <div style={{ ...styles.field, gridColumn: 'span 2' }}>
              <label style={styles.label}>SERVICES (comma separated)</label>
              <input
                style={styles.input}
                name="services"
                placeholder="Food Photography, Video Production, Color Grading"
                value={form.services}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div style={{ ...styles.field, gridColumn: 'span 2' }}>
              <label style={styles.label}>DESCRIPTION</label>
              <textarea
                style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                name="description"
                placeholder="Project description..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Project →'}
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div style={styles.empty}>No projects yet — create your first one!</div>
      ) : (
        <div style={styles.grid}>
          {projects.map((p) => (
            <div
              key={p._id}
              style={styles.card}
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              {/* Visual */}
              <div style={styles.cardVisual}>
                {p.gallery?.[0]?.url ? (
                  <img
                    src={p.gallery[0].url}
                    alt={p.title}
                    style={styles.cardImg}
                  />
                ) : (
                  <div style={styles.cardEmoji}>{p.icon || '🎬'}</div>
                )}
                <div style={styles.cardOverlay}>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, p._id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Info */}
              <div style={styles.cardInfo}>
                <div style={styles.cardTitle}>{p.title}</div>
                <div style={styles.cardTag}>{p.tag}</div>
                <div style={styles.cardMeta}>
                  <span style={styles.cardYear}>{p.year}</span>
                  <span style={styles.cardFiles}>
                    📎 {p.gallery?.length || 0} files
                  </span>
                </div>
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
    fontSize: '1.2rem', marginBottom: '1.5rem',
    color: 'var(--gold)',
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
    fontSize: '0.62rem', letterSpacing: '2px',
    color: 'var(--muted)',
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
  submitBtn: {
    marginTop: '1.5rem',
    padding: '0.9rem 2rem',
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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1px', background: 'var(--border)',
  },
  card: {
    background: 'var(--dark2)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    overflow: 'hidden',
  },
  cardVisual: {
    height: '180px', position: 'relative',
    background: 'var(--dark3)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
  cardImg: {
    width: '100%', height: '100%',
    objectFit: 'cover',
  },
  cardEmoji: { fontSize: '3rem', opacity: 0.5 },
  cardOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0)',
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: '0.75rem',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    background: 'rgba(255,77,46,0.15)',
    border: '0.5px solid rgba(255,77,46,0.3)',
    color: '#FF4D2E', padding: '0.4rem 0.6rem',
    fontSize: '0.85rem', cursor: 'pointer',
  },
  cardInfo: { padding: '1.25rem' },
  cardTitle: {
    fontSize: '0.95rem', marginBottom: '4px',
  },
  cardTag: {
    fontSize: '0.72rem', color: 'var(--gold)',
    letterSpacing: '1px', marginBottom: '0.75rem',
  },
  cardMeta: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardYear: { fontSize: '0.72rem', color: 'var(--muted)' },
  cardFiles: { fontSize: '0.72rem', color: 'var(--muted)' },
};

export default Projects;