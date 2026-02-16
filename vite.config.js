import { defineConfig } from 'vite';

/**
 * T114: Production-optimized Vite configuration
 * https://vitejs.dev/config/
 */
export default defineConfig({
  // Base public path when served in production
  base: './',

  build: {
    // Output directory
    outDir: 'dist',

    // Disable source maps for production (smaller builds)
    sourcemap: false,

    // Enable minification
    minify: 'esbuild',

    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Rollup options
    rollupOptions: {
      output: {
        // Asset file naming with hash for cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },

    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000
  },

  // Production optimizations
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    open: false
  }
});
