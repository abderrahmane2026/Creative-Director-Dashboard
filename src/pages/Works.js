import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getWorks, createWork, updateWork, deleteWork, getClients } from '../services/api';

const TYPES = ['photo', 'video', 'ai'];
const CATEGORIES = [
  'restaurant', 'automotive', 'events', 'podcast',
  'corporate', 'products', 'portrait', 'hospitality',
];

const EMPTY_FORM = {
  title: '', type: '', category: '',
  year: new Date().getFullYear().toString(),
  client: '', featured: false,
};

function Works() {
  const [works, setWorks]         = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [filterType, setFilterType]         = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const fileInputRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [w, c] = await Promise.all([getWorks(), getClients()]);
      if (w.success) setWorks(w.data);
      if (c.success) setClients(c.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file)           { setError('Please select a file'); return; }
    if (!form.title)     { setError('Title is required'); return; }
    if (!form.type)      { setError('Type is required'); return; }
    if (!form.category)  { setError('Category is required'); return; }

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title',    form.title);
      formData.append('type',     form.type);
      formData.append('category', form.category);
      formData.append('year',     form.year);
      formData.append('featured', form.featured);
      if (form.client) formData.append('client', form.client);

      const data = await createWork(formData);
      if (data.success) {
        setWorks((prev) => [data.data, ...prev]);
        resetForm();
      } else {
        setError(data.message || 'Error uploading');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work?')) return;
    try {
      const data = await deleteWork(id);
      if (data.success) setWorks((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeatured = async (id, featured) => {
    try {
      const data = await updateWork(id, { featured });
      if (data.success) {
        setWorks((prev) => prev.map((w) => w._id === id ? { ...w, featured } : w));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview(null);
    setError('');
  };

  const filtered = works.filter((w) => {
    const matchType     = filterType === 'all'     || w.type === filterType;
    const matchCategory = filterCategory === 'all' || w.category === filterCategory;
    return matchType && matchCategory;
  });

  if (loading) return (
    <Layout><div style={styles.loading}>Loading...</div></Layout>
  );

  return (
    <Layout>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Works</h1>
          <p style={styles.subtitle}>{works.length} works uploaded</p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => { resetForm(); setShowForm((v) => !v); }}
        >
          {showForm ? '✕ Cancel' : '+ Upload Work'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={styles.form}>
          <div style={styles.formTitle}>Upload New Work</div>

          <div style={styles.formLayout}>

            {/* File Upload */}
            <div
              style={{
                ...styles.uploadZone,
                ...(preview ? styles.uploadZoneHasFile : {}),
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
              {preview ? (
                file?.type.startsWith('video') ? (
                  <video src={preview} style={styles.previewMedia} controls />
                ) : (
                  <img src={preview} alt="preview" style={styles.previewMedia} />
                )
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <div style={styles.uploadIcon}>☁</div>
                  <div style={styles.uploadText}>Click to upload</div>
                  <div style={styles.uploadSub}>Image or Video</div>
                </div>
              )}
            </div>

            {/* Fields */}
            <div style={styles.fields}>

              <div style={styles.field}>
                <label style={styles.label}>TITLE *</label>
                <input
                  style={styles.input}
                  name="title"
                  placeholder="Work title"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>TYPE *</label>
                  <select style={styles.input} name="type" value={form.type} onChange={handleChange}>
                    <option value="">Select type</option>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>CATEGORY *</label>
                  <select style={styles.input} name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.fieldRow}>
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

                <div style={styles.field}>
                  <label style={styles.label}>CLIENT</label>
                  <select style={styles.input} name="client" value={form.client} onChange={handleChange}>
                    <option value="">No client</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <label htmlFor="featured" style={styles.checkboxLabel}>
                  Featured work ⭐
                </label>
              </div>

            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={resetForm}>Cancel</button>
            <button
              style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Uploading...' : 'Upload Work →'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>TYPE</span>
          <div style={styles.filters}>
            {['all', ...TYPES].map((t) => (
              <button
                key={t}
                style={{ ...styles.filterBtn, ...(filterType === t ? styles.filterActive : {}) }}
                onClick={() => setFilterType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>CATEGORY</span>
          <div style={styles.filters}>
            {['all', ...CATEGORIES].map((c) => (
              <button
                key={c}
                style={{ ...styles.filterBtn, ...(filterCategory === c ? styles.filterActive : {}) }}
                onClick={() => setFilterCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Works Grid */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>No works found</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((w) => (
            <div key={w._id} style={styles.card}>

              {/* Media */}
              <div style={styles.cardMedia}>
                {w.type === 'video' || w.type === 'ai' || w.type === 'animation' ? (
                  <video src={w.url} style={styles.media} />
                ) : (
                  <img src={w.url} alt={w.title} style={styles.media} />
                )}

                {/* Overlay */}
                <div style={styles.cardOverlay}>
                  <button
                    style={styles.featuredBtn}
                    onClick={() => handleFeatured(w._id, !w.featured)}
                    title={w.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {w.featured ? '⭐' : '☆'}
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(w._id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Info */}
              <div style={styles.cardInfo}>
                <div style={styles.cardTitle}>{w.title}</div>
                <div style={styles.cardMeta}>
                  <span style={styles.typeTag}>{w.type}</span>
                  <span style={styles.categoryTag}>{w.category}</span>
                </div>
                {w.client && (
                  <div style={styles.cardClient}>👤 {w.client.name}</div>
                )}
                <div style={styles.cardYear}>{w.year}</div>
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
  formLayout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '2rem',
  },
  uploadZone: {
    border: '1px dashed var(--border)',
    background: 'var(--dark3)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    minHeight: '220px', overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  uploadZoneHasFile: {
    border: '1px solid var(--gold)',
  },
  uploadPlaceholder: { textAlign: 'center' },
  uploadIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  uploadText: { fontSize: '0.85rem', marginBottom: '0.25rem' },
  uploadSub: { fontSize: '0.72rem', color: 'var(--muted)' },
  previewMedia: {
    width: '100%', height: '100%',
    objectFit: 'cover',
  },
  fields: {
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1,
  },
  fieldRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
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
  checkboxField: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginTop: '0.5rem',
  },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '0.82rem', color: 'var(--muted)', cursor: 'pointer' },
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
  filtersSection: {
    display: 'flex', flexDirection: 'column',
    gap: '0.75rem', marginBottom: '1.5rem',
  },
  filterGroup: {
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  filterLabel: {
    fontSize: '0.62rem', letterSpacing: '2px',
    color: 'var(--muted)', minWidth: '70px',
  },
  filters: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '0.4rem 0.9rem',
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)',
    color: 'var(--muted)', fontSize: '0.68rem',
    letterSpacing: '1px', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  filterActive: {
    background: 'var(--gold-dim)',
    border: '0.5px solid var(--gold)',
    color: 'var(--gold)',
  },
  empty: {
    padding: '4rem', textAlign: 'center',
    color: 'var(--muted)', fontSize: '0.85rem',
    letterSpacing: '2px',
    border: '0.5px dashed var(--border)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1px', background: 'var(--border)',
  },
  card: {
    background: 'var(--dark2)',
    overflow: 'hidden',
  },
  cardMedia: {
    height: '180px', position: 'relative',
    background: 'var(--dark3)', overflow: 'hidden',
  },
  media: {
     width: '100%', height: '100%', objectFit: 'contain',
  background: '#000',
  },
  cardOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '0.5rem',
    opacity: 0, transition: 'opacity 0.2s',
  },
  featuredBtn: {
    background: 'rgba(201,168,76,0.2)',
    border: '0.5px solid rgba(201,168,76,0.4)',
    color: 'var(--gold)', padding: '4px 8px',
    fontSize: '0.85rem', cursor: 'pointer',
  },
  deleteBtn: {
    background: 'rgba(255,77,46,0.2)',
    border: '0.5px solid rgba(255,77,46,0.4)',
    color: '#FF4D2E', padding: '4px 8px',
    fontSize: '0.85rem', cursor: 'pointer',
  },
  cardInfo: { padding: '1rem' },
  cardTitle: { fontSize: '0.9rem', marginBottom: '6px' },
  cardMeta: { display: 'flex', gap: '6px', marginBottom: '6px' },
  typeTag: {
    fontSize: '0.62rem', padding: '2px 8px',
    background: 'var(--gold-dim)', color: 'var(--gold)',
    letterSpacing: '1px',
  },
  categoryTag: {
    fontSize: '0.62rem', padding: '2px 8px',
    background: 'var(--dark3)',
    border: '0.5px solid var(--border)',
    color: 'var(--muted)', letterSpacing: '1px',
  },
  cardClient: {
    fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '3px',
  },
  cardYear: { fontSize: '0.72rem', color: 'var(--muted)' },
};

export default Works;