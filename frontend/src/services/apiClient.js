import axios from 'axios';
import { getFirebaseIdToken } from './authService';

const apiClient = axios.create({
  // In development, /api is proxied to the Express server by vite.config.js.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

apiClient.interceptors.request.use(async (request) => {
  const idToken = await getFirebaseIdToken();

  if (idToken) {
    request.headers ??= {};
    request.headers.Authorization = `Bearer ${idToken}`;
  }

  return request;
});

export default apiClient;
