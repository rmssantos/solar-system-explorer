import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createMediaViewer } from '../paper-preview/src/ui/mediaViewer.js';

function target() {
    const listeners = new Map();
    return {
        hidden: false,
        textContent: '',
        href: '',
        src: '',
        alt: '',
        addEventListener: (name, handler) => listeners.set(name, handler),
        removeEventListener: vi.fn(),
        emit(name, event = {}) { listeners.get(name)?.({ preventDefault: vi.fn(), target: this, ...event }); }
    };
}

function harness() {
    const image = target();
    const caption = target();
    const source = target();
    const closeButton = target();
    const dialog = target();
    dialog.open = false;
    dialog.showModal = vi.fn(() => { dialog.open = true; });
    dialog.close = vi.fn(() => { dialog.open = false; });
    dialog.querySelector = (selector) => ({
        '[data-media-image]': image,
        '[data-media-caption]': caption,
        '[data-media-source]': source,
        '[data-media-close]': closeButton
    })[selector];
    return { dialog, image, caption, source, closeButton };
}

describe('accessible in-page media viewer', () => {
    it('opens the selected image with caption and source without navigating away', () => {
        const ui = harness();
        const trigger = { focus: vi.fn() };
        const onImageOpen = vi.fn();
        const viewer = createMediaViewer(ui.dialog, { onImageOpen });
        viewer.open({
            src: '/learning/deimos.jpg', alt: 'Deimos', caption: 'Deimos by Mars Express',
            source: { name: 'NASA/JPL', url: 'https://images.nasa.gov/details/PIA08667' }, trigger
        });
        expect(ui.dialog.showModal).toHaveBeenCalledOnce();
        expect(ui.image).toMatchObject({ src: '/learning/deimos.jpg', alt: 'Deimos' });
        expect(ui.caption.textContent).toBe('Deimos by Mars Express');
        expect(ui.source).toMatchObject({ href: 'https://images.nasa.gov/details/PIA08667', textContent: 'NASA/JPL' });
        expect(onImageOpen).toHaveBeenCalledOnce();
    });

    it('closes by button, Escape/cancel or backdrop and restores trigger focus', () => {
        for (const closeAction of ['button', 'cancel', 'backdrop']) {
            const ui = harness();
            const trigger = { focus: vi.fn() };
            const viewer = createMediaViewer(ui.dialog);
            viewer.open({ src: '/earth.jpg', alt: 'Earth', caption: 'Earth', source: null, trigger });
            if (closeAction === 'button') ui.closeButton.emit('click');
            if (closeAction === 'cancel') ui.dialog.emit('cancel');
            if (closeAction === 'backdrop') ui.dialog.emit('click', { target: ui.dialog });
            expect(ui.dialog.close, closeAction).toHaveBeenCalledOnce();
            expect(trigger.focus, closeAction).toHaveBeenCalledOnce();
        }
    });

    it('does not close when the photograph content is clicked', () => {
        const ui = harness();
        const viewer = createMediaViewer(ui.dialog);
        viewer.open({ src: '/earth.jpg', alt: 'Earth', caption: 'Earth', source: null });
        ui.dialog.emit('click', { target: ui.image });
        expect(ui.dialog.close).not.toHaveBeenCalled();
    });
});

describe('media viewer integration', () => {
    const libraryHtml = readFileSync(new URL('../paper-preview/biblioteca/index.html', import.meta.url), 'utf8');
    const gameHtml = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
    const libraryJs = readFileSync(new URL('../paper-preview/src/library.js', import.meta.url), 'utf8');
    const gameUi = readFileSync(new URL('../paper-preview/src/ui.js', import.meta.url), 'utf8');
    const sharedCss = readFileSync(new URL('../paper-preview/privacy.css', import.meta.url), 'utf8');

    it.each([['library', libraryHtml], ['game', gameHtml]])('%s makes the real photo an explicit zoom control', (_name, html) => {
        expect(html).toContain('class="photo-open"');
        expect(html).toContain('id="media-viewer"');
        expect(html).toContain('data-media-image');
        expect(html).toContain('data-media-source');
    });

    it('connects both learning surfaces to the reusable viewer and safe analytics', () => {
        expect(libraryJs).toContain('createMediaViewer');
        expect(libraryJs).toContain("siteAnalytics.track('image_open'");
        expect(libraryJs).toContain("siteAnalytics.track('source_open'");
        expect(gameUi).toContain('createMediaViewer');
        expect(gameUi).toContain("siteAnalytics.track('image_open'");
        expect(gameUi).toContain("siteAnalytics.track('source_open'");
    });

    it('isolates the viewer caption from page-level footer styles', () => {
        expect(sharedCss).toMatch(/\.media-viewer footer\{[^}]*min-height:0/);
        expect(sharedCss).toMatch(/\.media-viewer footer\{[^}]*color:#272c3a/);
    });
});
