import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, '../dist/nui'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
