import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// O mesmo proxy liga a interface à API no desenvolvimento e no preview local.
// A hospedagem futura precisa configurar seu próprio roteamento de /api.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const proxy = {
    '/api': {
      target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
      changeOrigin: true,
    },
  };
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy,
    },
    preview: {
      port: 5173,
      proxy,
    },
  };
});
