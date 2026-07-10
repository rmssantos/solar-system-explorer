import { describe, expect, it } from 'vitest';
import {
    LEARNING_SECTIONS,
    answerLearningQuiz,
    createLearningState,
    openLearningRecord,
    retryLearningQuiz,
    selectLearningSection,
    setLearningDataEnvelope
} from '../paper-preview/src/learning/learningState.js';
import { createPreviewState, explorePlanet } from '../paper-preview/src/state.js';

const earthQuiz = Object.freeze({
    id: 'earth-0',
    question: 'Água?',
    options: Object.freeze(['30%', '50%', '70%', '90%']),
    correctIndex: 2,
    explanation: '70%.'
});

describe('Paper learning state', () => {
    it('opens on Discover and changes only to known notebook sections', () => {
        const initial = createLearningState();
        const opened = openLearningRecord(initial, 'earth');
        const measured = selectLearningSection(opened, 'measure');
        const invalid = selectLearningSection(measured, 'unknown');

        expect(LEARNING_SECTIONS).toEqual(['discover', 'measure', 'today', 'challenge']);
        expect(opened).toMatchObject({ objectKey: 'earth', section: 'discover' });
        expect(measured.section).toBe('measure');
        expect(invalid.section).toBe('measure');
        expect(initial.objectKey).toBe(null);
    });

    it('explains wrong answers, retries, then records a correct quiz', () => {
        const opened = openLearningRecord(createLearningState(), 'earth');
        const wrong = answerLearningQuiz(opened, earthQuiz, 1);
        const retried = retryLearningQuiz(wrong);
        const correct = answerLearningQuiz(retried, earthQuiz, 2);

        expect(wrong.quiz).toMatchObject({ status: 'wrong', selectedIndex: 1, attempts: 1 });
        expect(wrong.completedQuizIds).not.toContain('earth-0');
        expect(retried.quiz).toMatchObject({ status: 'idle', selectedIndex: null, attempts: 1 });
        expect(correct.quiz).toMatchObject({ status: 'correct', selectedIndex: 2, attempts: 2 });
        expect(correct.completedQuizIds).toContain('earth-0');
    });

    it('stores only normalized live, cached or fallback data envelopes', () => {
        const initial = openLearningRecord(createLearningState(), 'earth');
        const live = setLearningDataEnvelope(initial, 'earth', {
            status: 'live',
            source: { name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/' },
            updatedAt: '2026-07-11T00:00:00.000Z',
            data: { distanceKm: 149_600_000 }
        });
        const invalid = setLearningDataEnvelope(live, 'earth', { status: 'loading' });

        expect(live.dataByObject.earth.status).toBe('live');
        expect(invalid).toBe(live);
    });

    it('marks a planet discovered when the flight interaction opens it', () => {
        const explored = explorePlanet(createPreviewState(), 'earth');

        expect(explored.learning.objectKey).toBe('earth');
        expect(explored.learning.discoveredKeys).toContain('earth');
    });
});
