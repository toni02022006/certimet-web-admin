import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // El bloque 'server' solo se ejecuta en tu máquina local (npm run dev)
  // Al hacer el 'build' para cPanel, Vite ignora esta sección por completo.
  server: {
    proxy: {
      '/api': {
        // 👇 Cambiamos el target a tu backend local
        target: 'http://localhost:3000', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});