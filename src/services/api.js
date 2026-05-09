const API_URL = 'https://creative-director-backend.onrender.com';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
});

// ── Auth ──
export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ── Bookings ──
export const getBookings = async () => {
  const res = await fetch(`${API_URL}/bookings`, { headers: getHeaders() });
  return res.json();
};

export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};

// ── Projects ──
export const getProjects = async () => {
  const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
  return res.json();
};

export const createProject = async (data) => {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProject = async (id, data) => {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProject = async (id) => {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};

export const uploadFiles = async (id, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const res = await fetch(`${API_URL}/projects/${id}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
    body: formData,
  });
  return res.json();
};

export const deleteFile = async (projectId, publicId) => {
  const encodedId = encodeURIComponent(publicId);
  const res = await fetch(`${API_URL}/projects/${projectId}/files/${encodedId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};

// ── Clients ──
export const getClients = async () => {
  const res = await fetch(`${API_URL}/clients`, { headers: getHeaders() });
  return res.json();
};

export const createClient = async (data) => {
  const res = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateClient = async (id, data) => {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteClient = async (id) => {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};

// ── Works ──
export const getWorks = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/works${params ? '?' + params : ''}`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const createWork = async (formData) => {
  const res = await fetch(`${API_URL}/works`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
    body: formData,
  });
  return res.json();
};

export const updateWork = async (id, data) => {
  const res = await fetch(`${API_URL}/works/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteWork = async (id) => {
  const res = await fetch(`${API_URL}/works/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};