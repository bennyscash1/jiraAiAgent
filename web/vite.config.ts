import { defineConfig } from 'vite';

const backendPort = Number(process.env.PORT || 3001);

export default defineConfig({
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


