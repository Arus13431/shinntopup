console.log('DEBUG API URL:', import.meta.env.VITE_API_URL);
import { createApp } from 'vue';

import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Bootstrap 5 & Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Global CSS
import './assets/global.css';

// Konfigurasi default Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Request Interceptor: Otomatis menyertakan Bearer Token jika ada di localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Axios response error interceptor (auto logout jika token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=strict";
      
      // Redirect ke login jika bukan di halaman auth
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');
