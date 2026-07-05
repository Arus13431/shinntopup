import axios from 'axios';

// Membuat central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Otomatis menyertakan Bearer Token jika ada di localStorage
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Otomatis logout dan redirect jika menerima response 401 dari server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesi habis atau tidak valid (401). Mengalihkan ke halaman login.');
      
      // Hapus data autentikasi dari localStorage agar tidak terjadi loop redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=strict";
      }

      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    return Promise.reject(error);
  }
);

// Central Auth Service handlers
export const authService = {
  async register(username, email, password) {
    const response = await api.post('/api/auth/register', { username, email, password });
    return response.data;
  },
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  async logout() {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },
  async updateProfile(profileData) {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },
  async uploadAvatar(formData) {
    const response = await api.post('/api/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  async checkIn() {
    const response = await api.post('/api/auth/checkin');
    return response.data;
  }
};

export default api;
