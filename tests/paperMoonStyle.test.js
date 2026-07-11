import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPaperWorldObjects } from '../paper-preview/src/scene/createPaperWorldObjects.js';

describe('paper moon materials', () => {
    it('uses the dedicated fibrous moon map for every moon palette', () => {
        const moon = new THREE.Texture();
        const { root } = createPaperWorldObjects({ paperTextures: { moon } });
        const phobosBody = root.getObjectByName('moon-phobos').children[1];
        const enceladusBody = root.getObjectByName('moon-enceladus').children[1];
        expect(phobosBody.material.map).toBe(moon);
        expect(enceladusBody.material.map).toBe(moon);
        expect(phobosBody.material.flatShading).toBe(true);
    });
});
