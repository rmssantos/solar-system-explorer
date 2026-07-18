import { describe, expect, it } from 'vitest';
import {
    PAPER_SHIP_STYLE,
    createPaperShip,
    setPaperShipUpgrades,
    updatePaperShipThrust
} from '../paper-preview/src/scene/createPaperShip.js';

describe('Low-poly paper courier ship', () => {
    it('uses a clean paper-courier palette without a sepia wash', () => {
        expect(Object.keys(PAPER_SHIP_STYLE.palette)).toEqual(['ivory', 'coral', 'cardboard', 'cockpit']);
        expect(Object.values(PAPER_SHIP_STYLE.palette).every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
        expect(PAPER_SHIP_STYLE.outline).toBe('#171829');
        expect(PAPER_SHIP_STYLE.palette.ivory).not.toBe('#e9c46a');
    });

    it('builds a closed, readable rear-view silhouette within budget', () => {
        const ship = createPaperShip();
        const required = [
            'courier-fuselage',
            'courier-outline',
            'courier-paper-rim',
            'courier-cockpit',
            'courier-cockpit-outline',
            'courier-canopy-frame',
            'courier-canopy-glint',
            'courier-wing-left',
            'courier-wing-left-outline',
            'courier-wing-right',
            'courier-wing-right-outline',
            'courier-envelope-fin',
            'courier-engine-left',
            'courier-engine-left-outline',
            'courier-engine-right',
            'courier-engine-right-outline',
            'courier-engine-collar-left',
            'courier-engine-collar-right',
            'courier-postal-insignia',
            'courier-panel-left',
            'courier-panel-right',
            'courier-exhaust-outer-left',
            'courier-exhaust-core-left'
        ];
        const meshes = [];
        ship.traverse((object) => {
            if (object.isMesh) meshes.push(object);
        });

        expect(ship.name).toBe('paper-courier-ship');
        required.forEach((name) => expect(ship.getObjectByName(name)).toBeTruthy());
        expect(ship.getObjectByName('courier-fuselage').userData.closedVolume).toBe(true);
        expect(ship.getObjectByName('courier-outline').material.side).toBe(1);
        expect(meshes.length).toBeLessThanOrEqual(48);
        expect(meshes.filter((mesh) => mesh.material?.roughness !== undefined)
            .every((mesh) => mesh.material.roughness >= 0.85)).toBe(true);
    });

    it('keeps exhaust hidden at rest and lengthens it with speed', () => {
        const ship = createPaperShip();
        const exhaust = ship.getObjectByName('courier-exhaust');

        updatePaperShipThrust(ship, 0, 0);
        expect(exhaust.visible).toBe(false);

        updatePaperShipThrust(ship, 8.5, 0.2);
        expect(exhaust.visible).toBe(true);
        expect(exhaust.scale.z).toBeGreaterThan(1);
        expect(ship.getObjectByName('courier-exhaust-core-left').scale.y).toBeGreaterThan(1);
    });

    it('shows only the investigation instruments earned by the explorer', () => {
        const ship = createPaperShip();
        expect(ship.getObjectByName('upgrade-ice-radar').visible).toBe(false);
        setPaperShipUpgrades(ship, ['ice-radar', 'plume-collector']);
        expect(ship.getObjectByName('upgrade-ice-radar').visible).toBe(true);
        expect(ship.getObjectByName('upgrade-plume-collector').visible).toBe(true);
        expect(ship.getObjectByName('upgrade-atmosphere-lab').visible).toBe(false);
    });

    it('adds the explorer camera and unlocks its living-sky lens separately', () => {
        const ship = createPaperShip();
        const rig = ship.getObjectByName('upgrade-sky-camera-rig');
        const lens = ship.getObjectByName('upgrade-living-sky-lens');

        expect(rig).toBeTruthy();
        expect(lens).toBeTruthy();
        expect(rig.visible).toBe(false);
        expect(lens.visible).toBe(false);

        setPaperShipUpgrades(ship, ['sky-camera-rig']);
        expect(rig.visible).toBe(true);
        expect(lens.visible).toBe(false);

        setPaperShipUpgrades(ship, ['sky-camera-rig', 'living-sky-lens']);
        expect(rig.visible).toBe(true);
        expect(lens.visible).toBe(true);
    });
});
