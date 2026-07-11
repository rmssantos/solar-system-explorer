import { describe, expect, it } from 'vitest';
import {
    PAPER_SHIP_STYLE,
    createPaperShip,
    updatePaperShipThrust
} from '../paper-preview/src/scene/createPaperShip.js';

describe('Low-poly paper courier ship', () => {
    it('uses a restrained four-color courier palette', () => {
        expect(Object.keys(PAPER_SHIP_STYLE.palette)).toEqual(['ivory', 'coral', 'cardboard', 'cockpit']);
        expect(Object.values(PAPER_SHIP_STYLE.palette).every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
    });

    it('builds a closed, readable rear-view silhouette within budget', () => {
        const ship = createPaperShip();
        const required = [
            'courier-fuselage',
            'courier-outline',
            'courier-paper-rim',
            'courier-cockpit',
            'courier-wing-left',
            'courier-wing-right',
            'courier-envelope-fin',
            'courier-engine-left',
            'courier-engine-right'
        ];
        const meshes = [];
        ship.traverse((object) => {
            if (object.isMesh) meshes.push(object);
        });

        expect(ship.name).toBe('paper-courier-ship');
        required.forEach((name) => expect(ship.getObjectByName(name)).toBeTruthy());
        expect(ship.getObjectByName('courier-fuselage').userData.closedVolume).toBe(true);
        expect(ship.getObjectByName('courier-outline').material.side).toBe(1);
        expect(meshes.length).toBeLessThanOrEqual(14);
    });

    it('keeps exhaust hidden at rest and lengthens it with speed', () => {
        const ship = createPaperShip();
        const exhaust = ship.getObjectByName('courier-exhaust');

        updatePaperShipThrust(ship, 0, 0);
        expect(exhaust.visible).toBe(false);

        updatePaperShipThrust(ship, 8.5, 0.2);
        expect(exhaust.visible).toBe(true);
        expect(exhaust.scale.z).toBeGreaterThan(1);
    });
});
