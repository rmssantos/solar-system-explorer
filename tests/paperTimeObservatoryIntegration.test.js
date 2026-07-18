import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');

describe('time observatory game integration', () => {
    it('starts at real-time speed for every visitor', () => {
        expect(main).toMatch(/createPaperScene\(stage,\s*\{\s*timeScale:\s*1\s*\}\)/s);
    });

    it('connects the HUD to the scene and refreshes the clock without coupling flight time', () => {
        expect(main).toContain('onOrbitalTimeScale: (timeScale) => paperScene.setOrbitalTimeScale(timeScale)');
        expect(main).toContain('onOrbitalTimeToday: () => paperScene.resetOrbitalTimeToToday(Date.now())');
        expect(main).toContain('previewUI.updateOrbitalClock(paperScene.getState().orbitalClock)');
        expect(main).toContain('orbitalClockUiElapsed += seconds');
        expect(main).not.toContain('stepFlight(flightState, lastInput, seconds *');
    });

    it('exposes the clock to text-mode and deterministic QA controls', () => {
        expect(main).toContain('orbitalClock: paperScene.getState().orbitalClock');
        expect(main).toContain('setOrbitalTimeScale: (timeScale) =>');
        expect(main).toContain('resetOrbitalTimeToToday: () =>');
    });
});
