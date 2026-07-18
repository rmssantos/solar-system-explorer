import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';

const packageMetadata = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));
const appVersion = globalThis.process?.env.VITE_APP_VERSION || packageMetadata.version;
const gitSha = globalThis.process?.env.VITE_GIT_SHA || 'local';

export default defineConfig({
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
        'import.meta.env.VITE_GIT_SHA': JSON.stringify(gitSha)
    },
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
        manifest: true,
        chunkSizeWarningLimit: 750,
        rollupOptions: {
            input: {
                landing: fileURLToPath(new URL('./index.html', import.meta.url)),
                game: fileURLToPath(new URL('./jogo/index.html', import.meta.url)),
                library: fileURLToPath(new URL('./biblioteca/index.html', import.meta.url)),
                privacy: fileURLToPath(new URL('./privacidade/index.html', import.meta.url))
            }
        }
    }
});
