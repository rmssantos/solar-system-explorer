import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/jogo.html', import.meta.url), 'utf8');

describe('Lumi guide transmission', () => {
    it('has a polite, dismissible and non-modal guide surface', () => {
        expect(html).toContain('id="lumi-transmission"');
        expect(html).toContain('aria-live="polite"');
        expect(html).toContain('id="lumi-title"');
        expect(html).toContain('id="lumi-message"');
        expect(html).toContain('id="dismiss-lumi"');
        expect(html).not.toContain('<dialog id="lumi-transmission"');
    });
});
