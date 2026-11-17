import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to IPv4 explicitly: on some Windows setups "localhost" resolves to ::1
    // in Node, while the browser connects to 127.0.0.1 and gets refused.
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
  },
});
