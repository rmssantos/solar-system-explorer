import { describe, expect, it } from 'vitest';
import { createPaperWorldObjects } from '../paper-preview/src/scene/createPaperWorldObjects.js';
import { createPrimarySnapshot } from '../paper-preview/src/world/orbitalSystem.js';
import { getWorldObject } from '../paper-preview/src/world/worldCatalog.js';

function relativeTo(position, parent) {
    return {
        x: position.x - parent.x,
        y: position.y - parent.y,
        z: position.z - parent.z
    };
}

describe('Moon orbital motion', () => {
    it('uses the 27.3-day lunar period so time-lapse motion is clearly visible', () => {
        const moon = getWorldObject('moon');
        const snapshot = createPrimarySnapshot(new Date('2026-07-18T00:00:00Z'));
        const earth = snapshot.earth.position;
        const objects = createPaperWorldObjects();

        objects.update(0, snapshot);
        const start = relativeTo(objects.getPosition('moon'), earth);
        objects.update(moon.orbitPeriodDays / 4, snapshot);
        const quarter = relativeTo(objects.getPosition('moon'), earth);
        objects.update(moon.orbitPeriodDays, snapshot);
        const complete = relativeTo(objects.getPosition('moon'), earth);

        const planarDot = (start.x * quarter.x + start.z * quarter.z)
            / (Math.hypot(start.x, start.z) * Math.hypot(quarter.x, quarter.z));
        expect(moon.orbitPeriodDays).toBeCloseTo(27.322, 3);
        expect(Math.abs(planarDot)).toBeLessThan(0.02);
        expect(Math.hypot(complete.x - start.x, complete.z - start.z)).toBeLessThan(0.02);
    });
});
