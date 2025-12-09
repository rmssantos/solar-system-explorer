import { defineConfig } from 'vite';

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
                main: 'index.html',
                biblioteca: 'biblioteca.html',
            },
        },
    },
    // Copy public files
    publicDir: 'public',
});
