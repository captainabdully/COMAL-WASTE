# COMAL WASTE Project

This repository contains the source code for the COMAL WASTE application, consisting of a Node.js/Express backend and a React Native (Expo) mobile application.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Expo Go](https://expo.dev/client) app on your Android or iOS device (for testing the mobile app)

## Project Structure

- `backend/`: Node.js Express server with PostgreSQL integration.
- `mobile/`: React Native Expo application.

---

## 1. Backend Setup

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5001
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

> **Note**: Replace the placeholders with your actual database credentials and secret keys. The project uses `@neondatabase/serverless` so ensure your connection string is compatible.

### Running the Server

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5001` (or the PORT you specified).
It handles API requests and file uploads.

---

## 2. Mobile App Setup

### Installation

1. Open a new terminal and navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

By default, the app tries to connect to `http://localhost:5001`.
If you are running on a physical device, you may need to update the `API_URL` to your computer's local IP address.

You can check `mobile/constants/index.js` or `mobile/app.json` (if configured) to update the API URL.

### Running the App

Start the Expo development server:
```bash
npx expo start -c
```
(The `-c` flag clears the cache, which is recommended).

- **Scan the QR code** with the Expo Go app (Android) or Camera app (iOS).
- Press `a` to open in Android Emulator (if installed).
- Press `i` to open in iOS Simulator (if installed).

## Troubleshooting

- **Connection Refused**: If the mobile app cannot connect to the backend, ensure both are on the same network. If using a physical device, change `localhost` in the mobile app's API configuration to your machine's `LAN IP address` (e.g., `192.168.1.x`).
- **Database Errors**: Ensure your `DATABASE_URL` is correct and the Neon database is accessible.
