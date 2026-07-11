import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');

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
});
