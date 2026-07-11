import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPaperWorldObjects } from '../paper-preview/src/scene/createPaperWorldObjects.js';

describe('paper moon materials', () => {
    it('uses fibrous paper maps for rocky and icy moons', () => {
        const cardboard = new THREE.Texture();
        const cream = new THREE.Texture();
        const { root } = createPaperWorldObjects({ paperTextures: { cardboard, cream } });
        const phobosBody = root.getObjectByName('moon-phobos').children[1];
        const enceladusBody = root.getObjectByName('moon-enceladus').children[1];
        expect(phobosBody.material.map).toBe(cardboard);
        expect(enceladusBody.material.map).toBe(cream);
        expect(phobosBody.material.flatShading).toBe(true);
    });
});
