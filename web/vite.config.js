import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api and /uploads are proxied to the backend so the browser never
// hits CORS. In production the app calls VITE_API_URL directly (that origin
// must be listed in the backend's APP_ORIGINS).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'http://54.209.99.13';
  return {
    // Served from http://<server>/web/ in production; override with VITE_BASE=/ for a root deploy.
    base: env.VITE_BASE || (mode === 'production' ? '/web/' : '/'),
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/api': { target, changeOrigin: true },
        '/uploads': { target, changeOrigin: true },
      },
    },
  };
});
