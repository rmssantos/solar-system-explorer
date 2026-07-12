import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('public repository documentation', () => {
    it('describes the deployed Paper Solar Explorer and its real touch controls', () => {
        const readme = read('README.md');

        for (const expected of [
            'paper-preview/jogo/index.html',
            'paper-preview/src/main.js',
            'drag anywhere on the scene to look',
            'movement joystick',
            'Pinch: zoom'
        ]) expect(readme).toContain(expected);

        expect(readme).not.toContain('—');
        expect(readme).not.toMatch(/\bdump\b/i);

        for (const legacyClaim of [
            '**Cinematic intro**',
            '**Daily Challenge**',
            '**Photo Mode**',
            '**Mini-Map**',
            '**Text-to-Speech**',
            '**PWA support**'
        ]) expect(readme).not.toContain(legacyClaim);
    });

    it('provides a working preview command for the Paper build output', () => {
        const packageMetadata = JSON.parse(read('package.json'));

        expect(packageMetadata.scripts['preview:paper'])
            .toBe('vite preview paper-preview --outDir ../dist-paper-preview');
        expect(read('README.md')).toContain('npm run preview:paper');
    });

    it('documents the current deployment-token SWA CLI release path in English', () => {
        const releases = read('docs/releases.md');

        expect(releases).toContain('# Releases and production');
        expect(releases).toContain('Azure Static Web Apps CLI');
        expect(releases).toContain('deployment token');
        expect(releases).not.toContain('OIDC');
        expect(releases).not.toContain('# Releases e produção');
    });

    it('keeps public operational docs in English without account-specific Azure names', () => {
        const changelog = read('CHANGELOG.md');
        const applicationInsights = read('docs/analytics/application-insights-setup.md');

        expect(changelog).toContain('Public changes to the Paper Solar Explorer');
        expect(changelog).not.toContain('As alterações públicas');
        expect(changelog).not.toContain('Primeira baseline');
        expect(applicationInsights).toContain('$resourceGroup');
        expect(applicationInsights).toContain('$workspaceName');
        expect(applicationInsights).toContain('$appInsightsName');
        expect(applicationInsights).not.toContain('Visual Studio Enterprise Subscription');
        expect(applicationInsights).not.toMatch(/--resource-group\s+solarsystem/);
    });

    it('does not publish internal audio-generation notes as a static asset', () => {
        expect(existsSync(new URL('../paper-preview/public/audio/README.md', import.meta.url))).toBe(false);
        expect(read('.gitignore')).toContain('/paper-preview/public/audio/README.md');
    });
});
