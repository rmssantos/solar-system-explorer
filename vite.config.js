import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        // Force no caching during development
        headers: {
            'Cache-Control': 'no-store',
        },
        // Enable HMR with websocket
        hmr: {
            overlay: true,
        },
    },
    // Clear cache on every build
    cacheDir: 'node_modules/.vite_nocache',
    // Optimize deps
    optimizeDeps: {
        force: true,
    },
    // Build configuration
    build: {
        // Suppress chunk size warning (educational app with many features)
        chunkSizeWarningLimit: 1000,
        // Multi-page build
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                biblioteca: resolve(__dirname, 'biblioteca.html'),
                escala: resolve(__dirname, 'escala.html'),
            },
        },
    },
    // Copy public files
    publicDir: 'public',
});
