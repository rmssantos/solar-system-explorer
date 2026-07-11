import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getWorldObject } from '../paper-preview/src/world/worldCatalog.js';

const scene = readFileSync(new URL('../paper-preview/src/scene/createPaperScene.js', import.meta.url), 'utf8');

describe('stable moon orbits', () => {
    it('never moves a moon in response to camera position', () => {
        expect(scene).not.toContain('keepMoonsLegible');
        expect(scene).not.toContain('separateMoonSilhouette');
    });

    it('leaves visible space between Earth, the Moon and nearby spacecraft', () => {
        expect(getWorldObject('moon').orbitRadius).toBeGreaterThanOrEqual(5.2);
        expect(getWorldObject('iss').orbitRadius).toBeGreaterThanOrEqual(4.2);
        expect(getWorldObject('hubble').orbitRadius).toBeGreaterThan(getWorldObject('iss').orbitRadius);
    });
});
