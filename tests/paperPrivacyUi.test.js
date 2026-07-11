import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const home = read('../paper-preview/index.html');
const game = read('../paper-preview/jogo/index.html');
const library = read('../paper-preview/biblioteca/index.html');
const privacy = read('../paper-preview/privacidade/index.html');
const vite = read('../paper-preview/vite.config.js');
const translations = read('../paper-preview/src/i18n/paperI18n.js');
const privacyCss = read('../paper-preview/privacy.css');

describe('privacy controls across the paper experience', () => {
    it.each([['home', home], ['library', library], ['privacy', privacy]])('%s exposes privacy settings and shared styling', (_name, html) => {
        expect(html).toContain('href="/privacy.css"');
        expect(html).toContain('data-privacy-settings');
        expect(html).toContain('href="/privacidade/"');
    });

    it('keeps privacy links completely outside the game interface', () => {
        expect(game).toContain('href="/privacy.css"');
        expect(game).not.toContain('data-privacy-settings');
        expect(game).not.toContain('href="/privacidade/"');
    });

    it('offers a dedicated bilingual, child-readable policy route', () => {
        expect(privacy).toContain('rel="icon"');
        expect(privacy).toContain('src="/src/privacy.js"');
        expect(privacy).toContain('data-i18n="privacy.title"');
        expect(privacy).toContain('data-i18n="privacy.children.title"');
        expect(privacy).toContain('data-i18n="privacy.rights.title"');
        expect(translations).toContain("'privacy.consent.allow'");
        expect(translations).toContain("'privacy.consent.decline'");
        expect(translations).toContain("'privacy.settings'");
    });

    it('includes privacy as a clean Vite production route', () => {
        expect(vite).toContain("privacy: fileURLToPath(new URL('./privacidade/index.html'");
        expect(privacy).not.toMatch(/href="[^"]+\.html/);
    });

    it('does not place privacy controls in the passport or over the playfield', () => {
        expect(game).not.toContain('class="privacy-settings-link game-privacy-settings"');
        expect(game).not.toMatch(/id="mission-log"[\s\S]*data-privacy-settings/);
        expect(privacyCss).not.toContain('.game-privacy-settings');
    });
});
