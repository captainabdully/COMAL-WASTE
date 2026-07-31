import axios from 'axios';
import Swal from 'sweetalert2';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let handlingSessionExpiry = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !handlingSessionExpiry) {
      handlingSessionExpiry = true;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      await Swal.fire({
        icon: 'warning',
        title: 'Session expired',
        text: 'Please sign in again to continue.',
        confirmButtonText: 'Go to sign in',
      });

      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
