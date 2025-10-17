import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendPort = Number(process.env.PORT || 3001);

export default defineConfig({
  plugins: [react()],
  base: '/jiraAiAgent/',  // 👈 important for GitHub Pages

  server: {
    port: Number(process.env.VITE_DEV_SERVER_PORT || 5173),
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
});
