import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createLivingSkyEffects } from '../paper-preview/src/scene/createLivingSkyEffects.js';

describe('living-sky scene effects', () => {
    it('builds one restrained paper effect for every observation without a yellow wash', () => {
        const effects = createLivingSkyEffects();
        for (const id of ['earth-aurora', 'io-shadow-transit', 'mars-dust-front', 'halley-2061']) {
            expect(effects.root.getObjectByName(`living-sky-${id}`)).toBeTruthy();
        }
        const colors = [];
        effects.root.traverse((object) => {
            const color = object.material?.color;
            if (color) colors.push(`#${color.getHexString()}`);
        });
        expect(colors).toContain('#54be9c');
        expect(colors).toContain('#78d7d2');
        expect(colors.some((color) => ['#d9a83e', '#c79a32', '#b68b2b'].includes(color))).toBe(false);
        effects.destroy();
    });

    it('attaches effects to moving targets and only reveals active windows', () => {
        const effects = createLivingSkyEffects();
        effects.setPresentation(['earth-aurora', 'halley-2061']);
        effects.update(0.5, {
            earth: new THREE.Vector3(2, 3, 4),
            jupiter: new THREE.Vector3(8, 0, 1),
            mars: new THREE.Vector3(-3, 1, 6),
            halley: new THREE.Vector3(5, 2, -4)
        });

        expect(effects.root.getObjectByName('living-sky-earth-aurora').position.toArray()).toEqual([2, 3, 4]);
        expect(effects.root.getObjectByName('living-sky-earth-aurora').visible).toBe(true);
        expect(effects.root.getObjectByName('living-sky-mars-dust-front').visible).toBe(false);
        expect(effects.root.getObjectByName('living-sky-halley-2061').visible).toBe(true);
        effects.destroy();
    });

    it('projects a target into viewfinder telemetry', () => {
        const effects = createLivingSkyEffects();
        const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
        effects.update(0, { earth: new THREE.Vector3(0, 0, 0) });

        expect(effects.getTelemetry('earth-aurora', camera, new THREE.Vector3(0, 0, 8))).toMatchObject({
            visible: true,
            screenDistance: 0,
            worldDistance: 8
        });
        effects.destroy();
    });
});
