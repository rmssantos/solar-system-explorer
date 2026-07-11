import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const scene = read('../paper-preview/src/scene/createPaperScene.js');
const objects = read('../paper-preview/src/scene/createPaperWorldObjects.js');
const ship = read('../paper-preview/src/scene/createPaperShip.js');

describe('paper skins across the complete world', () => {
    it.each(['paper-moon-surface.webp', 'paper-rocky-surface.webp', 'paper-craft-surface.webp'])(
        'loads the %s material family',
        (name) => expect(scene).toContain(name)
    );

    it('passes generated maps to moons, small bodies, spacecraft and the player ship', () => {
        expect(scene).toContain('createPaperWorldObjects({ paperTextures: objectSurfaceTextures })');
        expect(scene).toContain('createPaperShip({ paperTexture: objectSurfaceTextures.craft })');
        expect(objects).toContain('paperTextures.moon');
        expect(objects).toContain('paperTextures.rocky');
        expect(objects).toContain('paperTextures.craft');
        expect(ship).toContain('map: paperTexture');
    });

    it('skins both the Roadster and Starman instead of leaving flat materials', () => {
        expect(objects).toMatch(/function createRoadster\(paperTexture/);
        expect(objects).toMatch(/starman[\s\S]*paperTexture/);
    });
});
