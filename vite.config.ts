import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ran_san_moi_01/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
