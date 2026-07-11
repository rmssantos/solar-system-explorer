import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        headers: { 'Cache-Control': 'no-store' },
        proxy: {
            '/api/jpl-horizons': {
                target: 'https://ssd.jpl.nasa.gov',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/jpl-horizons/, '/api/horizons.api')
            }
        }
    },
    build: { chunkSizeWarningLimit: 750 }
});
