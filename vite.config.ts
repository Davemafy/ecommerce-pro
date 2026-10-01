import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://mflix-movies.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      },
    },
  },
});
