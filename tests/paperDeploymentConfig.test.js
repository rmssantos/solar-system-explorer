import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const workflow = read('../.github/workflows/azure-static-web-apps-green-smoke-09dea4a03.yml');
const config = JSON.parse(read('../paper-preview/public/staticwebapp.config.json'));
const setup = read('../docs/analytics/application-insights-setup.md');
const queries = read('../docs/analytics/product-queries.kql');

describe('production paper experience deployment', () => {
    it('builds and publishes telemetry-free PR previews through the pinned SWA CLI', () => {
        expect(workflow).toContain('name: Build preview');
        expect(workflow).toContain('run: npm run build:paper');
        expect(workflow).toContain('@azure/static-web-apps-cli@2.0.9');
        expect(workflow).toContain('deploy dist-paper-preview');
        expect(workflow).toContain('--env "${{ github.event.pull_request.number }}"');
        expect(workflow).toContain("VITE_APPLICATIONINSIGHTS_CONNECTION_STRING: ''");
        expect(workflow).not.toContain('github_id_token:');
        expect(workflow).not.toContain('app_build_command:');
    });

    it('ships clean routes, privacy headers and bounded external origins', () => {
        expect(config.navigationFallback.rewrite).toBe('/index.html');
        expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
        expect(config.globalHeaders['Content-Security-Policy']).toContain("script-src 'self'");
        expect(config.globalHeaders['Content-Security-Policy']).toContain('applicationinsights.azure.com');
        expect(config.globalHeaders['Content-Security-Policy']).toContain('images-api.nasa.gov');
        expect(config.globalHeaders['Permissions-Policy']).toContain('geolocation=()');
    });

    it('documents the exact West Europe resource, opt-in validation and actionable product queries', () => {
        expect(setup).toContain('solar-system-explorer-insights');
        expect(setup).toContain('West Europe');
        expect(setup).toContain('30 days');
        expect(setup).toContain('VITE_APPLICATIONINSIGHTS_CONNECTION_STRING');
        expect(setup).toContain('Decline');
        expect(queries).toContain('pageViews');
        expect(queries).toContain('customEvents');
        expect(queries).toContain("name == 'object_open'");
        expect(queries).toContain("name == 'autopilot_event'");
    });
});

