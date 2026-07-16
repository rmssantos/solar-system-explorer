import { describe, expect, it } from 'vitest';

import {
    advanceScienceSimulation,
    applyScienceAction,
    createScienceSimulation,
    getScienceTarget
} from '../paper-preview/src/agency/scienceSimulation.js';

function finishLaunch(kind, seed = 'probe-01') {
    return advanceScienceSimulation(createScienceSimulation({ kind, seed }), 1_800);
}

describe('agency scientific simulations', () => {
    it('captures three solar-signature samples and grades timing accuracy', () => {
        let state = finishLaunch('solar-weather');
        expect(state.phase).toBe('science');
        for (let index = 0; index < 3; index += 1) {
            const target = getScienceTarget(state);
            state = applyScienceAction(state, { type: 'set-scan', value: target.scan });
            state = applyScienceAction(state, { type: 'capture' });
        }

        expect(state).toMatchObject({ completed: true, score: 100, samples: 3 });
    });

    it('tracks a moving near-Earth object with pointer or keyboard aim', () => {
        let state = finishLaunch('near-earth-object', 'neo-01');
        for (let index = 0; index < 3; index += 1) {
            const target = getScienceTarget(state);
            state = applyScienceAction(state, { type: 'aim', x: target.x, y: target.y });
            state = applyScienceAction(state, { type: 'capture' });
            state = advanceScienceSimulation(state, 240);
        }

        expect(state.completed).toBe(true);
        expect(state.score).toBeGreaterThanOrEqual(98);
        expect(state.aim).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }));
    });

    it('locks the Mars radio signal by holding the correct tuning', () => {
        let state = finishLaunch('planetary-map', 'mars-01');
        const target = getScienceTarget(state);
        state = applyScienceAction(state, { type: 'tune', value: target.tuning });
        state = advanceScienceSimulation(state, 2_200);

        expect(state.completed).toBe(true);
        expect(state.score).toBe(100);
        expect(state.lockProgress).toBe(1);
    });

    it('is deterministic, clamps unsafe inputs and does not progress science during launch', () => {
        const first = createScienceSimulation({ kind: 'near-earth-object', seed: 'same' });
        const second = createScienceSimulation({ kind: 'near-earth-object', seed: 'same' });
        expect(first).toEqual(second);
        expect(applyScienceAction(first, { type: 'capture' })).toEqual(first);

        const launched = finishLaunch('planetary-map');
        const tuned = applyScienceAction(launched, { type: 'tune', value: 99 });
        expect(tuned.tuning).toBe(1);
        expect(advanceScienceSimulation(tuned, -10)).toEqual(tuned);
    });
});
