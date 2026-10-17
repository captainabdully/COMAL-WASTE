# Skrepa Chap — Web

React + Vite + Tailwind. Same backend, accounts and screens as the mobile app.

- `/` landing page · `/sign-in` `/sign-up` `/forgot-password` `/terms` · `/app/*` signed-in screens (phone-width layout)

```bash
cp .env.example .env
npm install
npm run dev      # http://localhost:5174, /api proxied to VITE_PROXY_TARGET
npm run build    # set VITE_API_URL to the backend origin first
```

In production the backend's `APP_ORIGINS` must include the web origin (CORS).
