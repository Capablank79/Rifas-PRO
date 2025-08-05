import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Configuración para manejar rutas de API en desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Middleware personalizado para simular serverless functions
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to:', req.url);
          });
        }
      }
    }
  }
});