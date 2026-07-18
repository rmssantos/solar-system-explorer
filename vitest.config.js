import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        exclude: [...configDefaults.exclude, 'tests/e2e/**'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js', 'paper-preview/src/**/*.js']
        }
    }
});
