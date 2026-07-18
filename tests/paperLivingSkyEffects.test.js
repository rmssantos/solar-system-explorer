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

    it('keeps every phenomenon outside its planet and facing the explorer camera', () => {
        const effects = createLivingSkyEffects();
        const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
        camera.position.set(9, 5, 11);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
        effects.setPresentation(['earth-aurora', 'io-shadow-transit', 'mars-dust-front', 'halley-2061']);
        effects.update(0.75, {
            earth: new THREE.Vector3(),
            jupiter: new THREE.Vector3(),
            mars: new THREE.Vector3(),
            halley: new THREE.Vector3()
        }, camera);

        const earthSize = new THREE.Box3().setFromObject(
            effects.root.getObjectByName('living-sky-earth-aurora')
        ).getSize(new THREE.Vector3());
        const marsSize = new THREE.Box3().setFromObject(
            effects.root.getObjectByName('living-sky-mars-dust-front')
        ).getSize(new THREE.Vector3());
        const halleySize = new THREE.Box3().setFromObject(
            effects.root.getObjectByName('living-sky-halley-2061')
        ).getSize(new THREE.Vector3());
        const ioShadow = effects.root.getObjectByName('living-sky-io-shadow');

        expect(Math.max(earthSize.x, earthSize.y)).toBeGreaterThan(4.2);
        expect(Math.max(marsSize.x, marsSize.y)).toBeGreaterThan(2.5);
        expect(Math.max(halleySize.x, halleySize.y)).toBeGreaterThan(5.5);
        expect(ioShadow.position.length()).toBeGreaterThan(2.95);

        const cameraDirection = camera.position.clone().normalize();
        for (const id of ['earth-aurora', 'io-shadow-transit', 'mars-dust-front', 'halley-2061']) {
            const effect = effects.root.getObjectByName(`living-sky-${id}`);
            const effectDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(effect.quaternion);
            expect(effectDirection.dot(cameraDirection)).toBeGreaterThan(0.98);
        }
        effects.destroy();
    });

    it('keeps the bold phenomenon silhouettes visible with reduced motion', () => {
        const effects = createLivingSkyEffects({ reducedMotion: true });
        const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
        camera.position.set(0, 0, 10);
        camera.updateMatrixWorld();
        effects.setPresentation(['earth-aurora', 'mars-dust-front']);
        effects.update(12, { earth: new THREE.Vector3(), mars: new THREE.Vector3() }, camera);

        expect(effects.root.getObjectByName('living-sky-earth-aurora').visible).toBe(true);
        expect(effects.root.getObjectByName('living-sky-mars-dust-front').visible).toBe(true);
        expect(effects.root.getObjectByName('living-sky-aurora-particles')).toBeTruthy();
        expect(effects.root.getObjectByName('living-sky-dust-particles')).toBeTruthy();
        effects.destroy();
    });

    it('ignores late presentation updates after teardown', () => {
        const effects = createLivingSkyEffects();
        effects.destroy();
        expect(() => effects.setPresentation(['earth-aurora'])).not.toThrow();
        expect(() => effects.update(1, { earth: new THREE.Vector3() })).not.toThrow();
    });
});
