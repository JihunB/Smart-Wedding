import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Allow Vercel/CRA/Next.js style env vars to work
  envPrefix: ['VITE_', 'REACT_APP_', 'NEXT_PUBLIC_'], 
  build: {
    outDir: 'dist',
  },
});