import axios from 'axios';
import { getFirebaseIdToken } from './authService';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
