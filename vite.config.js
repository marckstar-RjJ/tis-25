import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://tis-25-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/sanctum': {
        target: 'https://tis-25-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/login': {
        target: 'https://tis-25-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/logout': {
        target: 'https://tis-25-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/registro': {
        target: 'https://tis-25-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
