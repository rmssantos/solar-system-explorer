import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const scene = readFileSync(new URL('../paper-preview/src/scene/createPaperScene.js', import.meta.url), 'utf8');

describe('live Solar System Three.js bridge', () => {
    it('uses the orbital clock as simulation truth instead of a fixed days-per-second constant', () => {
        expect(scene).toContain("from '../world/orbitalClock.js'");
        expect(scene).toContain('createOrbitalClock(');
        expect(scene).toContain('stepOrbitalClock(runtime.orbitalClock, delta)');
        expect(scene).not.toContain('ORBIT_DAYS_PER_SECOND');
    });

    it('scales satellite circulation and planet rotation without scaling ship elapsed time', () => {
        expect(scene).toContain('runtime.orbitalObjectElapsed += delta * orbitalTime.satelliteFactor');
        expect(scene).toContain('worldObjects.update(runtime.orbitalObjectElapsed, runtime.primarySnapshot)');
        expect(scene).toContain('orbitalTime.rotationFactor');
        expect(scene).toContain('runtime.elapsed += delta');
    });

    it('exposes a settable observable clock in the scene state', () => {
        expect(scene).toContain('function setOrbitalTimeScale(timeScale)');
        expect(scene).toContain('runtime.orbitalClock = setOrbitalTimeScaleState(');
        expect(scene).toContain('orbitalClock: presentOrbitalClock(runtime.orbitalClock)');
        expect(scene).toMatch(/return\s*\{[\s\S]*setOrbitalTimeScale,/);
    });
});
