import { defineConfig } from 'vite';

// base: './' keeps the build portable: it works on GitHub Pages project URLs
// (https://user.github.io/HumanBody/) as well as on a bare domain or in a subfolder.
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1500,
  },
});
