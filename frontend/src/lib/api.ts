import axios from 'axios';
import Swal from 'sweetalert2';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export const getAssetUrl = (value?: string | null) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith('/') ? value : `/uploads/${value}`}`;
};

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
      const swahili = localStorage.getItem('language') === 'sw';

      await Swal.fire({
        icon: 'warning',
        title: swahili ? 'Muda wa kikao umeisha' : 'Session expired',
        text: swahili ? 'Tafadhali ingia tena ili kuendelea.' : 'Please sign in again to continue.',
        confirmButtonText: swahili ? 'Nenda kuingia' : 'Go to sign in',
      });

      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
