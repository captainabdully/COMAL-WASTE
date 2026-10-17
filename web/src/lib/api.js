// Web equivalent of mobile/constants/{api,axiosAuth,authAPI}.js.
// The auth token lives in localStorage (mobile uses SecureStore).
const BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

export const API_URL = BASE;

const KEYS = ['authToken', 'refreshToken', 'userId', 'userEmail', 'userName', 'userRoles'];

export const session = {
  get: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
  clear: () => {
    KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
  },
  roles: () => {
    try { return JSON.parse(session.get('userRoles') || '[]'); } catch { return []; }
  },
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

// One in-flight refresh is shared by all requests that hit an expired token.
let refreshing = null;
async function refreshAccessToken() {
  const refreshToken = session.get('refreshToken');
  if (!refreshToken) return false;
  refreshing ||= fetch(`${BASE}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (r) => {
      const d = r.ok ? await r.json().catch(() => null) : null;
      if (!d?.token) return false;
      session.set('authToken', d.token);
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function request(path, { method = 'GET', body, auth = true, form } = {}, retried = false) {
  const headers = { Accept: 'application/json' };
  const token = session.get('authToken');
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw Object.assign(new Error('Network error'), { status: 0 });
  }

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    if (res.status === 401 && auth && token) {
      // Renew the access token once and replay the request before giving up.
      // (A FormData body can be re-sent as-is.)
      if (!retried && await refreshAccessToken()) return request(path, { method, body, auth, form }, true);
      onUnauthorized();
    }
    throw Object.assign(new Error(data?.message || `Request failed (${res.status})`), {
      status: res.status,
      data,
    });
  }
  return data;
}

const list = (r) => (Array.isArray(r) ? r : r?.data || []);

export const imageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return image.startsWith('/') ? `${BASE}${image}` : `${BASE}/uploads/${image}`;
};

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (data) => request('/users', { method: 'POST', body: data, auth: false }),
  forgotPassword: (phone_number) => request('/auth/forgot-password', { method: 'POST', body: { phone_number }, auth: false }),
  resetPassword: (phone_number, newPassword) => request('/auth/reset-password', { method: 'POST', body: { phone_number, newPassword }, auth: false }),

  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, body) => request(`/users/${id}`, { method: 'PUT', body }),
  changePassword: (id, body) => request(`/users/${id}/change-password`, { method: 'POST', body }),

  droppingPoints: async () => list(await request('/dropping-point')),
  todayPrices: async () => list(await request('/daily-price/today', { auth: false })),

  orders: async (userId) => list(await request(`/pickup-order/${userId}`)),
  order: async (id) => {
    const r = await request(`/pickup-order/order/${id}`);
    return r?.data || r;
  },
  createOrder: (body) => request('/pickup-order', { method: 'POST', body }),
  upload: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const r = await request('/upload', { method: 'POST', form });
    return r.filename || r.imageUrl;
  },
};
