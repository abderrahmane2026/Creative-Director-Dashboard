import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProjects, updateProject, uploadFiles, deleteFile } from '../services/api';

function ProjectDetail() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const fileInputRef              = useRef();
  const [project, setProject]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({});
  const [dragOver, setDragOver]   = useState(false);
  const [progress, setProgress]   = useState(0);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await getProjects();
      if (data.success) {
        const found = data.data.find((p) => p._id === id);
        if (found) {
          setProject(found);
          setForm({
            title:       found.title,
            tag:         found.tag,
            icon:        found.icon,
            bg:          found.bg,
            year:        found.year,
            client:      found.client,
            description: found.description,
            services:    found.services?.join(', '),
            order:       found.order,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
        order: Number(form.order),
      };
      const data = await updateProject(id, payload);
      if (data.success) {
        setProject(data.data);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 200);
      const data = await uploadFiles(id, Array.from(files));
      clearInterval(interval);
      setProgress(100);
      if (data.success) {
        setProject(data.data);
      }
      setTimeout(() => setProgress(0), 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (publicId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      const data = await deleteFile(id, publicId);
      if (data.success) setProject(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleUpload(files);
  };

  if (loading) return (
    <Layout>
      <div style={styles.loading}>Loading...</div>
    </Layout>
  );

  if (!project) return (
    <Layout>
      <div style={styles.loading}>Project not found</div>
    </Layout>
  );

  return (
    <Layout>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/projects')}>
            ← Projects
          </button>
          <div>
            <h1 style={styles.title}>{project.title}</h1>
            <p style={styles.subtitle}>{project.tag}</p>
          </div>
        </div>
        <button
          style={{ ...styles.editBtn, ...(editing ? styles.editBtnActive : {}) }}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? '✕ Cancel' : '✎ Edit'}
        </button>
      </div>

      <div style={styles.content}>

        {/* LEFT — Edit Form or Info */}
        <div style={styles.left}>

          {editing ? (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Edit Project</div>

              {[
                { name: 'title',       label: 'TITLE',       placeholder: 'Restaurant Campaign' },
                { name: 'tag',         label: 'TAG',         placeholder: 'Food Photography · Video' },
                { name: 'icon',        label: 'ICON',        placeholder: '🍽️' },
                { name: 'year',        label: 'YEAR',        placeholder: '2024' },
                { name: 'client',      label: 'CLIENT',      placeholder: 'Fine Dining Restaurant' },
                { name: 'order',       label: 'ORDER',       placeholder: '1' },
              ].map(({ name, label, placeholder }) => (
                <div key={name} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input
                    style={styles.input}
                    name={name}
                    placeholder={placeholder}
                    value={form[name] || ''}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div style={styles.field}>
                <label style={styles.label}>BACKGROUND</label>
                <select style={styles.input} name="bg" value={form.bg} onChange={handleChange}>
                  {['work-bg-1','work-bg-2','work-bg-3','work-bg-4','work-bg-5'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>SERVICES (comma separated)</label>
                <input
                  style={styles.input}
                  name="services"
                  placeholder="Food Photography, Video Production"
                  value={form.services || ''}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>DESCRIPTION</label>
                <textarea
                  style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                  name="description"
                  value={form.description || ''}
                  onChange={handleChange}
                />
              </div>

              <button
                style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          ) : (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Project Info</div>
              {[
                { label: 'Client',      value: project.client },
                { label: 'Year',        value: project.year },
                { label: 'Tag',         value: project.tag },
                { label: 'Order',       value: project.order },
                { label: 'Published',   value: project.isPublished ? 'Yes' : 'No' },
                { label: 'Total Files', value: project.gallery?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={styles.infoRow}>
                  <span style={styles.infoLabel}>{label}</span>
                  <span style={styles.infoValue}>{value}</span>
                </div>
              ))}

              <div style={styles.divider} />

              <div style={styles.infoLabel}>Services</div>
              <div style={styles.services}>
                {project.services?.map((s) => (
                  <span key={s} style={styles.serviceTag}>{s}</span>
                ))}
              </div>

              {project.description && (
                <>
                  <div style={styles.divider} />
                  <div style={styles.infoLabel}>Description</div>
                  <p style={styles.description}>{project.description}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Upload + Gallery */}
        <div style={styles.right}>

          {/* Upload Zone */}
          <div
            style={{
              ...styles.uploadZone,
              ...(dragOver ? styles.uploadZoneActive : {}),
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={(e) => handleUpload(e.target.files)}
            />
            <div style={styles.uploadIcon}>
              {uploading ? '⏳' : '☁'}
            </div>
            <div style={styles.uploadText}>
              {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </div>
            <div style={styles.uploadSub}>
              Images & Videos supported
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
            )}
          </div>

          {/* Gallery */}
          <div style={styles.galleryHeader}>
            <div style={styles.cardTitle}>
              Gallery ({project.gallery?.length || 0} files)
            </div>
          </div>

          {project.gallery?.length === 0 || !project.gallery ? (
            <div style={styles.emptyGallery}>No files uploaded yet</div>
          ) : (
            <div style={styles.gallery}>
              {project.gallery.map((item, i) => (
                <div key={item._id || i} style={styles.galleryItem}>

                  {/* Media */}
                  {item.resource_type === 'video' ? (
                    <video src={item.url} style={styles.media} controls />
                  ) : (
                    <img src={item.url} alt={`file-${i}`} style={styles.media} />
                  )}

                  {/* Overlay */}
                  <div style={styles.galleryOverlay}>
                    <span style={styles.fileType}>
                      {item.resource_type === 'video' ? '🎬' : '📸'}
                    </span>
                    <button
                      style={styles.galleryDelete}
                      onClick={() => handleDeleteFile(item.public_id)}
                    >
                      🗑
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
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
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  backBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--muted)', fontSize: '0.78rem',
    letterSpacing: '2px', cursor: 'pointer',
    textTransform: 'uppercase', padding: 0,
    textAlign: 'left',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '2rem', fontWeight: 400,
  },
  subtitle: {
    fontSize: '0.82rem', color: 'var(--gold)',
    marginTop: '4px', letterSpacing: '1px',
  },
  editBtn: {
    padding: '0.65rem 1.5rem',
    background: 'transparent',
    border: '0.5px solid var(--border)',
    color: 'var(--muted)', fontSize: '0.78rem',
    letterSpacing: '2px', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  editBtnActive: {
    borderColor: 'rgba(255,77,46,0.4)',
    color: '#FF4D2E',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  left: {},
  right: {},
  card: {
    background: 'var(--dark2)',
    border: '0.5px solid var(--border)',
    padding: '1.75rem',
  },
  cardTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.1rem', fontWeight: 400,
    color: 'var(--gold)', marginBottom: '1.5rem',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '0.6rem 0',
    borderBottom: '0.5px solid var(--border)',
  },
  infoLabel: {
    fontSize: '0.65rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)',
  },
  infoValue: { fontSize: '0.85rem' },
  divider: {
    height: '0.5px', background: 'var(--border)',
    margin: '1rem 0',
  },
  services: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.5rem' },
  serviceTag: {
    fontSize: '0.65rem', padding: '3px 10px',
    background: 'var(--gold-dim)', color: 'var(--gold)',
    letterSpacing: '1px',
  },
  description: {
    fontSize: '0.82rem', color: 'var(--muted)',
    lineHeight: 1.7, marginTop: '0.5rem',
  },
  field: {
    display: 'flex', flexDirection: 'column',
    gap: '0.4rem', marginBottom: '1rem',
  },
  label: {
    fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--muted)',
  },
  input: {
    background: 'var(--dark3)',
    border: '0.5px solid var(--border)',
    color: 'var(--text)', padding: '0.7rem 1rem',
    fontSize: '0.85rem', outline: 'none',
  },
  saveBtn: {
    width: '100%', marginTop: '0.5rem',
    padding: '0.9rem',
    background: 'var(--gold)', color: 'var(--dark)',
    border: 'none', fontSize: '0.78rem',
    fontWeight: 500, letterSpacing: '2px',
    textTransform: 'uppercase', cursor: 'pointer',
  },
  uploadZone: {
    border: '1px dashed var(--border)',
    padding: '2.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '1.5rem',
    background: 'var(--dark2)',
  },
  uploadZoneActive: {
    borderColor: 'var(--gold)',
    background: 'var(--gold-dim)',
  },
  uploadIcon: {
    fontSize: '2rem', marginBottom: '0.75rem',
  },
  uploadText: {
    fontSize: '0.85rem', color: 'var(--text)',
    marginBottom: '0.4rem',
  },
  uploadSub: {
    fontSize: '0.72rem', color: 'var(--muted)',
    letterSpacing: '1px',
  },
  progressBar: {
    height: '2px', background: 'var(--dark3)',
    marginTop: '1.5rem', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'var(--gold)',
    transition: 'width 0.2s',
  },
  galleryHeader: { marginBottom: '1rem' },
  emptyGallery: {
    padding: '2rem', textAlign: 'center',
    color: 'var(--muted)', fontSize: '0.82rem',
    letterSpacing: '2px',
    border: '0.5px dashed var(--border)',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1px', background: 'var(--border)',
  },
  galleryItem: {
    position: 'relative', aspectRatio: '1',
    overflow: 'hidden', background: 'var(--dark3)',
  },
  media: {
    width: '100%', height: '100%',
    objectFit: 'cover',
  },
  galleryOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '0.5rem',
    opacity: 0, transition: 'opacity 0.2s',
  },
  fileType: { fontSize: '1rem' },
  galleryDelete: {
    background: 'rgba(255,77,46,0.2)',
    border: '0.5px solid rgba(255,77,46,0.4)',
    color: '#FF4D2E', padding: '3px 6px',
    fontSize: '0.75rem', cursor: 'pointer',
  },
};

export default ProjectDetail;