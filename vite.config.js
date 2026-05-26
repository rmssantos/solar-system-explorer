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
    // Build configuration
    build: {
        // App code is ~200 KB gzip; vendor chunk handles the rest. Warn over 500 KB raw.
        chunkSizeWarningLimit: 500,
        // Multi-page build with vendor split so Three.js stays cached across app deploys.
        rollupOptions: {
            input: {
                main: 'index.html',
                biblioteca: 'biblioteca.html',
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/three')) return 'three-vendor';
                },
            },
        },
    },
    // Copy public files
    publicDir: 'public',
});
