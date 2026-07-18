import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');

describe('living-sky observatory and explorer camera UI', () => {
    it('adds the observatory without replacing missions, agency or notebook', () => {
        for (const id of ['mission-center-trigger', 'space-agency-trigger', 'notebook-trigger', 'living-sky-trigger']) {
            expect(html).toContain(`id="${id}"`);
        }
        for (const id of ['living-sky-observatory', 'living-sky-event-list', 'explorer-camera', 'sky-photo-grid']) {
            expect(html).toContain(`id="${id}"`);
        }
    });

    it('provides explicit touch controls, keyboard hints and an accessible shutter', () => {
        expect(html).toMatch(/id="explorer-camera"[^>]*role="dialog"[^>]*aria-modal="false"[^>]*aria-labelledby="explorer-camera-title"/);
        expect(html).toContain('id="explorer-camera-title"');
        expect(html).toContain('aria-describedby="explorer-camera-coach"');
        expect(html).toContain('id="explorer-camera-shutter"');
        expect(html).toContain('data-camera-filter="visible"');
        expect(html).toContain('data-camera-filter="infrared"');
        expect(html).toContain('data-camera-filter="magnetic"');
        expect(html).toContain('<kbd>K</kbd> ·');
        expect(html).toContain('Espaço');
        expect(html).toContain('data-living-sky-copy="spaceKey"');
        expect(css).toMatch(/\.explorer-camera-shutter[\s\S]*min-width:\s*56px/);
        expect(css).toContain('@media (max-width: 720px)');
        expect(css).toContain('env(safe-area-inset-bottom)');
    });

    it('connects observations, saves, photos and the existing flight runtime', () => {
        expect(main).toContain('createLivingSkyUi');
        expect(main).toContain('createLivingSkyState');
        expect(main).toContain('captureSkyPhoto');
        expect(main).toContain('completedSkyEventIds: livingSkyState.completedEventIds');
        expect(main).toContain('paperScene.setLivingSkyPresentation');
        expect(main).toContain("event.code === 'KeyK'");
        expect(main).toContain("event.code === 'Space'");
        expect(main).toContain('skyPhotoStore.revokeObjectUrl');
        expect(main).toContain('if (!persistent)');
        expect(main).toContain('livingSkyUi.setOpen(false)');
    });
});
