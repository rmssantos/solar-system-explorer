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
            'Pinch — zoom'
        ]) expect(readme).toContain(expected);

        for (const legacyClaim of [
            '**Cinematic intro**',
            '**Daily Challenge**',
            '**Photo Mode**',
            '**Mini-Map**',
            '**Text-to-Speech**',
            '**PWA support**'
        ]) expect(readme).not.toContain(legacyClaim);
    });

    it('documents the current deployment-token SWA CLI release path in English', () => {
        const releases = read('docs/releases.md');

        expect(releases).toContain('# Releases and production');
        expect(releases).toContain('Azure Static Web Apps CLI');
        expect(releases).toContain('deployment token');
        expect(releases).not.toContain('OIDC');
        expect(releases).not.toContain('# Releases e produção');
    });

    it('does not publish internal audio-generation notes as a static asset', () => {
        expect(existsSync(new URL('../paper-preview/public/audio/README.md', import.meta.url))).toBe(false);
        expect(read('.gitignore')).toContain('/paper-preview/public/audio/README.md');
    });
});
