import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const SEMVER_PATTERN = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function read(path) {
    const url = new URL(path, root);
    return existsSync(url) ? readFileSync(url, 'utf8') : '';
}

function json(path) {
    const source = read(path);
    return source ? JSON.parse(source) : {};
}

describe('Release governance', () => {
    it('keeps release metadata consistent after the 1.0.0 bootstrap', () => {
        const config = json('release-please-config.json');
        const manifest = json('.release-please-manifest.json');
        const packageJson = json('package.json');
        const releaseVersion = manifest['.'];

        expect(config['release-type']).toBe('node');
        expect(config['include-component-in-tag']).toBe(false);
        expect(config['bootstrap-sha']).toBe('1fb471d0c270d4b5686da424eb9c34bf522609da');
        expect(config.packages?.['.']?.['package-name']).toBe('solar-system-explorer');
        expect(releaseVersion).toMatch(SEMVER_PATTERN);
        expect('1.2.3-alpha.1+build.5').toMatch(SEMVER_PATTERN);
        expect('01.2.3').not.toMatch(SEMVER_PATTERN);
        expect(packageJson.version).toBe(releaseVersion);
        expect(read('CHANGELOG.md')).toContain('# Changelog');
    });

    it('keeps Azure previews on pull requests and production out of main pushes', () => {
        const preview = read('.github/workflows/azure-static-web-apps-green-smoke-09dea4a03.yml');

        expect(preview).not.toMatch(/^\s{2}push:/m);
        expect(preview).toMatch(/^\s{2}pull_request:/m);
        expect(preview).toContain('group: ${{ github.workflow }}-${{ github.event.pull_request.number }}');
        expect(preview).toContain('cancel-in-progress: true');
        expect(preview).toContain("VITE_APPLICATIONINSIGHTS_CONNECTION_STRING: ''");
        expect(preview).toContain('npm run build:paper');
    });

    it('creates releases with Release Please v5 and deploys only a release or manual ref', () => {
        const workflow = read('.github/workflows/release.yml');

        expect(workflow).toContain('googleapis/release-please-action@v5');
        expect(workflow).toContain('token: ${{ secrets.RELEASE_PLEASE_TOKEN }}');
        expect(workflow).toContain('config-file: release-please-config.json');
        expect(workflow).toContain('manifest-file: .release-please-manifest.json');
        expect(workflow).toContain('release_created: ${{ steps.release.outputs.release_created }}');
        expect(workflow).toContain('tag_name: ${{ steps.release.outputs.tag_name }}');
        expect(workflow).toContain('workflow_dispatch:');
        expect(workflow).toContain('group: ${{ github.workflow }}');
        expect(workflow).toContain('cancel-in-progress: false');
        expect(workflow).toMatch(/ref:\s*\r?\n\s+description:[^\r\n]*\r?\n\s+required: true/);
        expect(workflow).toContain("name: production");
        expect(workflow).toContain("needs.release-please.outputs.release_created == 'true'");
        expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
        expect(workflow).toContain('ref: ${{');
        expect(workflow).toContain('persist-credentials: false');
        expect(workflow).toContain('VERSION=$(node -p "require(\'./package.json\').version")');
        expect(workflow).toContain('VITE_APP_VERSION: ${{ steps.build.outputs.version }}');
        expect(workflow).toContain('VITE_GIT_SHA: ${{ steps.build.outputs.sha }}');
        expect(workflow).not.toContain('azure_static_web_apps_api_token:');
        expect(workflow).not.toContain('id-token: write');
        expect(workflow).not.toContain('Install OIDC client');
        expect(workflow).not.toContain('Get Azure ID token');
        expect(workflow).not.toContain('github_id_token:');
        expect(workflow).toContain('npm run build:paper');
        expect(workflow).toContain('@azure/static-web-apps-cli@2.0.9');
        expect(workflow).toContain('deploy dist-paper-preview');
        expect(workflow).toContain('--env production');
        expect(workflow).toContain('SWA_CLI_DEPLOYMENT_TOKEN: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_GREEN_SMOKE_09DEA4A03 }}');
        expect(workflow).not.toContain('uses: Azure/static-web-apps-deploy@v1');
    });

    it('formats and mounts visible build identity on editorial surfaces', async () => {
        const { formatBuildLabel } = await import('../paper-preview/src/buildInfo.js');

        expect(formatBuildLabel('1.2.3', 'abcdef0123456789')).toBe('v1.2.3 · abcdef0');
        expect(formatBuildLabel('', '')).toBe('v0.0.0-dev · local');
        const viteConfig = read('paper-preview/vite.config.js');
        expect(viteConfig).toContain("'import.meta.env.VITE_APP_VERSION'");
        expect(viteConfig).toContain("'import.meta.env.VITE_GIT_SHA'");
        expect(viteConfig).toContain('globalThis.process?.env.VITE_APP_VERSION');
        expect(viteConfig).not.toMatch(/\bprocess\.env/);
        expect(read('src/types.d.ts')).toContain('VITE_APP_VERSION?: string');
        expect(read('src/types.d.ts')).toContain('VITE_GIT_SHA?: string');
        for (const page of [
            'paper-preview/index.html',
            'paper-preview/biblioteca/index.html',
            'paper-preview/privacidade/index.html'
        ]) expect(read(page)).toContain('data-build-version');
        for (const entry of [
            'paper-preview/src/landing.js',
            'paper-preview/src/library.js',
            'paper-preview/src/privacy.js'
        ]) expect(read(entry)).toContain('mountBuildInfo');
    });

    it('documents SemVer, required credentials, release approval, and immutable-tag rollback', () => {
        const guide = read('docs/releases.md');

        expect(guide).toContain('fix:');
        expect(guide).toContain('feat:');
        expect(guide).toContain('BREAKING CHANGE');
        expect(guide).toContain('RELEASE_PLEASE_TOKEN');
        expect(guide).toContain('CodeRabbit');
        expect(guide).toContain('gh workflow run release.yml');
        expect(guide).toContain('Nunca apagues nem movas uma tag');
    });
});
