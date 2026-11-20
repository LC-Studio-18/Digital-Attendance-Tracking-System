import process from 'node:process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Open the app straight on the sign-in screen instead of the root/Vite page.
    open: '/login',
    // Proxy API calls to Express so the browser only talks to the Vite origin.
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
  preview: {
    open: '/login',
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
