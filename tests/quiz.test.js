import { describe, it, expect } from 'vitest';
import { QuizSystem } from '../src/quizSystem.js';

// ~400 lines of hand-edited parallel PT/EN quiz banks: these invariants make
// a typo'd `correct` index or a missing EN bank fail the build instead of
// teaching a kid the wrong answer on the live site.

const qs = new QuizSystem(null, null);
const banks = qs.quizzes;

describe('Quiz data invariants', () => {
    it('PT and EN banks cover the same planets', () => {
        expect(Object.keys(banks.en).sort()).toEqual(Object.keys(banks.pt).sort());
    });

    it('PT and EN have the same number of questions per planet', () => {
        for (const planet of Object.keys(banks.pt)) {
            expect(banks.en[planet].length, `planet "${planet}"`).toBe(banks.pt[planet].length);
        }
    });

    it('every question has 2+ options, an in-bounds correct index, and an explanation', () => {
        for (const lang of ['pt', 'en']) {
            for (const [planet, questions] of Object.entries(banks[lang])) {
                for (const q of questions) {
                    const label = `${lang}/${planet}: "${q.question}"`;
                    expect(q.options.length, label).toBeGreaterThanOrEqual(2);
                    expect(Number.isInteger(q.correct), label).toBe(true);
                    expect(q.correct, label).toBeGreaterThanOrEqual(0);
                    expect(q.correct, label).toBeLessThan(q.options.length);
                    expect(q.explanation, label).toBeTruthy();
                }
            }
        }
    });

    it('no question has duplicate option text', () => {
        for (const lang of ['pt', 'en']) {
            for (const [planet, questions] of Object.entries(banks[lang])) {
                for (const q of questions) {
                    expect(new Set(q.options).size, `${lang}/${planet}: "${q.question}"`).toBe(q.options.length);
                }
            }
        }
    });
});

describe('shuffleWithCorrect', () => {
    it('always keeps the correct answer at the reported index', () => {
        const options = ['a', 'b', 'c', 'd'];
        for (let run = 0; run < 50; run++) {
            const { options: shuffled, correctIndex } = qs.shuffleWithCorrect(options, 2);
            expect(shuffled[correctIndex]).toBe('c');
            expect([...shuffled].sort()).toEqual([...options].sort());
        }
    });

    it('tracks by position, so duplicate option text cannot poison the answer', () => {
        // 'dup' appears twice; the correct one is index 2. indexOf-based
        // tracking would sometimes report the wrong duplicate as correct.
        const options = ['dup', 'x', 'dup', 'y'];
        for (let run = 0; run < 50; run++) {
            const { options: shuffled, correctIndex } = qs.shuffleWithCorrect(options, 1);
            expect(shuffled[correctIndex]).toBe('x');
        }
    });
});

describe('Streak behavior', () => {
    it('increments on correct, resets on wrong', () => {
        const s = new QuizSystem({ addXP: () => ({ leveledUp: false }) }, null);
        expect(s.streak).toBe(0);
        s.recordCorrectAnswer('q1');
        s.recordCorrectAnswer('q2');
        expect(s.streak).toBe(2);
        s.recordWrongAnswer();
        expect(s.streak).toBe(0);
    });

    it('records answered quizzes so replays cannot re-award XP', () => {
        let awards = 0;
        const s = new QuizSystem({ addXP: () => { awards++; return { leveledUp: false }; } }, null);
        s.recordCorrectAnswer('sun-0');
        expect(s.answeredQuizzes.has('sun-0')).toBe(true);
        expect(awards).toBe(1);
    });
});
