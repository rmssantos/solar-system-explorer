import { describe, expect, it } from 'vitest';

import {
    advanceScienceSimulation,
    applyScienceAction,
    createScienceSimulation,
    getScienceTarget
} from '../paper-preview/src/agency/scienceSimulation.js';

function finishLaunch(kind, seed = 'probe-01', options = {}) {
    return advanceScienceSimulation(createScienceSimulation({ kind, seed, ...options }), 1_800);
}

describe('agency scientific simulations', () => {
    it('captures three solar-signature samples and grades timing accuracy', () => {
        let state = finishLaunch('solar-weather', 'probe-01', { tutorial: false, attempt: 2 });
        expect(state.phase).toBe('science');
        for (let index = 0; index < 3; index += 1) {
            const target = getScienceTarget(state);
            state = applyScienceAction(state, { type: 'set-scan', value: target.scan });
            state = applyScienceAction(state, { type: 'capture' });
        }

        expect(state).toMatchObject({ completed: true, score: 100, samples: 3 });
    });

    it('turns the first solar attempt into a no-fail tutorial with contextual feedback', () => {
        let state = finishLaunch('solar-weather', 'solar-tutorial', { tutorial: true });
        const target = getScienceTarget(state);
        state = applyScienceAction(state, { type: 'set-scan', value: target.scan > .5 ? 0 : 1 });
        state = applyScienceAction(state, { type: 'capture' });
        expect(state).toMatchObject({ samples: 0, mistakes: 1, feedback: 'find-pulse', tutorial: true });

        for (let index = 0; index < 3; index += 1) {
            state = applyScienceAction(state, { type: 'set-scan', value: getScienceTarget(state).scan });
            state = applyScienceAction(state, { type: 'capture' });
        }
        expect(state).toMatchObject({ completed: true, samples: 3, score: 100 });
    });

    it('tracks a moving near-Earth object with pointer or keyboard aim', () => {
        let state = finishLaunch('near-earth-object', 'neo-01');
        for (let index = 0; index < 3; index += 1) {
            const target = getScienceTarget(state);
            state = applyScienceAction(state, { type: 'aim', x: target.x, y: target.y });
            state = advanceScienceSimulation(state, 700);
            const focusedTarget = getScienceTarget(state);
            state = applyScienceAction(state, { type: 'aim', x: focusedTarget.x, y: focusedTarget.y });
            state = applyScienceAction(state, { type: 'capture' });
            state = advanceScienceSimulation(state, 240);
        }

        expect(state.completed).toBe(true);
        expect(state.score).toBeGreaterThanOrEqual(98);
        expect(state.aim).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }));
    });

    it('requires the asteroid camera to focus before accepting a photograph', () => {
        let state = finishLaunch('near-earth-object', 'neo-focus', { tutorial: true });
        let target = getScienceTarget(state);
        state = applyScienceAction(state, { type: 'aim', x: target.x, y: target.y });
        state = applyScienceAction(state, { type: 'capture' });
        expect(state).toMatchObject({ samples: 0, feedback: 'hold-focus', mistakes: 1 });

        state = advanceScienceSimulation(state, 700);
        target = getScienceTarget(state);
        state = applyScienceAction(state, { type: 'aim', x: target.x, y: target.y });
        state = advanceScienceSimulation(state, 700);
        state = applyScienceAction(state, { type: 'capture' });
        expect(state.samples).toBe(1);
        expect(state).toMatchObject({ focusProgress: 0, feedback: 'photo-captured' });
    });

    it('locks the Mars radio signal by holding the correct tuning', () => {
        let state = finishLaunch('planetary-map', 'mars-01', { tutorial: true });
        const target = getScienceTarget(state);
        state = applyScienceAction(state, { type: 'tune', value: target.tuning });
        state = advanceScienceSimulation(state, 2_200);

        expect(state.completed).toBe(true);
        expect(state.score).toBe(100);
        expect(state.lockProgress).toBe(1);
    });

    it('varies replay targets and adds gentle Mars frequency drift', () => {
        const tutorial = finishLaunch('solar-weather', 'same-operation', { tutorial: true, attempt: 1 });
        const replay = finishLaunch('solar-weather', 'same-operation', { tutorial: false, attempt: 2 });
        expect(getScienceTarget(tutorial).scan).not.toBe(getScienceTarget(replay).scan);

        let mars = finishLaunch('planetary-map', 'mars-drift', { tutorial: false, attempt: 3 });
        const before = getScienceTarget(mars).tuning;
        mars = advanceScienceSimulation(mars, 900);
        expect(getScienceTarget(mars).tuning).not.toBe(before);
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

    it('counts only post-launch time when one large step crosses the launch boundary', () => {
        const initial = createScienceSimulation({ kind: 'near-earth-object', seed: 'boundary-crossing' });
        const projected = { ...initial, elapsedMs: 1_700, scienceElapsedMs: 100, phase: 'science' };
        const target = getScienceTarget(projected);
        const aimedDuringLaunch = { ...initial, aim: { x: target.x, y: target.y } };

        const next = advanceScienceSimulation(aimedDuringLaunch, 1_700);

        expect(next.phase).toBe('science');
        expect(next.scienceElapsedMs).toBe(100);
        expect(next.focusProgress).toBeCloseTo(100 / 650, 5);
    });
});
