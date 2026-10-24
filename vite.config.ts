import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // the package's module build imports Node's vm; the browser build does the same job
    alias: { 'js-interpreter': 'js-interpreter/lib/js-interpreter.min.js' },
  },
  // the plugin is served from a folder on GitHub Pages, so every path is relative
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
