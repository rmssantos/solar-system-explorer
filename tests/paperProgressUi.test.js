import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../paper-preview/src/ui.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');

describe('paper expedition passport UI', () => {
    it('provides missions, collection and awards without covering the flight view', () => {
        expect(html).toContain('id="passport-level"');
        expect(html).toContain('id="passport-xp"');
        expect(html).toContain('data-passport-section="missions"');
        expect(html).toContain('data-passport-section="collection"');
        expect(html).toContain('data-passport-section="awards"');
        expect(html).toContain('id="collection-grid"');
        expect(html).toContain('id="awards-grid"');
    });

    it('keeps rank and reward feedback visible outside the passport dialog', () => {
        expect(html).toContain('id="rank-chip"');
        expect(html).toContain('id="rank-title"');
        expect(html).toContain('id="rank-xp"');
        expect(html).toContain('id="rank-progress"');
        expect(html).toContain('id="reward-toast"');
        expect(html).toContain('role="status"');
        expect(html).toContain('aria-live="polite"');
    });

    it('places reward feedback in the browser top layer above notebook dialogs', () => {
        expect(html).toContain('id="reward-toast" class="reward-toast" popover="manual"');
    });

    it('resets the passport scroll position whenever a HUD chip opens it', () => {
        expect(ui).toContain("missionLogBody: document.querySelector('#mission-log > article')");
        expect(ui).toContain('elements.missionLogBody.scrollTop = 0');
    });

    it('keeps mission cards inside the outer passport scroll container', () => {
        expect(css).toMatch(/\.mission-log\s*>\s*article\s*\{[^}]*overflow:\s*auto/s);
        expect(css).not.toMatch(/\.mission-log\s+article\s*\{[^}]*overflow:\s*auto/s);
    });
});
