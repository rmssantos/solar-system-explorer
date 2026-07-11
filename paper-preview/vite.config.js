import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

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
    build: {
        chunkSizeWarningLimit: 750,
        rollupOptions: {
            input: {
                landing: fileURLToPath(new URL('./index.html', import.meta.url)),
                game: fileURLToPath(new URL('./jogo/index.html', import.meta.url)),
                library: fileURLToPath(new URL('./biblioteca/index.html', import.meta.url))
            }
        }
    }
});
