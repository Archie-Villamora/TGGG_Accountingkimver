import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getPendingUsers() {
  // Backend route: GET /api/accounts/pending/
  const res = await api.get('/accounts/pending/');
  return res.data;
}

export async function approvePendingUser({ userId, role }) {
  // Backend route: POST /api/accounts/approve/
  const res = await api.post('/accounts/approve/', { user_id: userId, role });
  return res.data;
}

export async function getAllUsers() {
  // Backend route: GET /api/accounts/users/
  const res = await api.get('/accounts/users/');
  return res.data;
}

export async function updateUserAccount(userId, payload) {
  const res = await api.patch(`/accounts/users/${userId}/`, payload);
  return res.data;
}

export async function deleteUserAccount(userId) {
  const res = await api.delete(`/accounts/users/${userId}/`);
  return res.data;
}
