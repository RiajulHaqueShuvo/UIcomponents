import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = `http://localhost:${process.env.API_PORT ?? 5621}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5620,
    strictPort: true,
    // In dev the API runs separately (npm run dev:all); in production the
    // server serves both the site and the API on one port.
    proxy: {
      '/api': API,
      '/uploads': API,
      '/sitemap.xml': API,
      '/robots.txt': API,
    },
  },
});
