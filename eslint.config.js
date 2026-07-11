import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.js', 'paper-preview/src/**/*.js', 'tests/**/*.js', 'scripts/**/*.mjs', 'public/*.js', 'sw.js', '*.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.serviceworker,
                ...globals.node,
            },
        },
        rules: {
            // The audit's bug class: dead identifiers and silent drift.
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-undef': 'error',
            // Kids' app ships console diagnostics on purpose; don't fight it.
            'no-console': 'off',
            // Empty catch blocks are a deliberate pattern here (storage/audio guards).
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
    },
    {
        ignores: ['**/dist/**', 'dist-paper-preview/**', 'node_modules/**', '.local/**', 'icons/**', 'entrega-tema/**', 'audit_report.html', 'opus_validation_audit.html'],
    },
];
