const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!configuredUrl && !__DEV__) {
  console.warn('EXPO_PUBLIC_API_URL is not configured; network requests will fail.');
}

export const API_URL = (configuredUrl || 'http://54.209.99.13').replace(/\/$/, '');
export const API_BASE_URL = `${API_URL}/api`;
