import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base: './'` keeps asset paths relative, so the build works both on
// GitHub Pages (https://<user>.github.io/<repo>/) and on any static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800, // the sample SVG is bundled as seed data
  },
  test: {
    environment: 'jsdom',
  },
});
