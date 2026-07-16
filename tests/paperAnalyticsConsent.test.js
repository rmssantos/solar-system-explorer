import { describe, expect, it } from 'vitest';
import {
    ANALYTICS_CONSENT_KEY,
    ANALYTICS_POLICY_VERSION,
    clearAnalyticsConsent,
    readAnalyticsConsent,
    writeAnalyticsConsent
} from '../paper-preview/src/analytics/consent.js';
import { sanitizeAnalyticsEvent, sanitizePageView } from '../paper-preview/src/productVocabulary.js';

function memoryStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key)
    };
}

describe('analytics consent preference', () => {
    it('defaults to pending for absent, invalid, old-policy or expired choices', () => {
        expect(readAnalyticsConsent(memoryStorage())).toBe('pending');
        expect(readAnalyticsConsent(memoryStorage({ [ANALYTICS_CONSENT_KEY]: '{bad' }))).toBe('pending');
        const old = JSON.stringify({ version: ANALYTICS_POLICY_VERSION - 1, choice: 'granted', updatedAt: '2026-07-11T00:00:00.000Z' });
        expect(readAnalyticsConsent(memoryStorage({ [ANALYTICS_CONSENT_KEY]: old }), new Date('2026-07-12'))).toBe('pending');
        const expired = JSON.stringify({ version: ANALYTICS_POLICY_VERSION, choice: 'granted', updatedAt: '2025-01-01T00:00:00.000Z' });
        expect(readAnalyticsConsent(memoryStorage({ [ANALYTICS_CONSENT_KEY]: expired }), new Date('2026-07-11'))).toBe('pending');
    });

    it('persists only a versioned choice and can clear it', () => {
        const storage = memoryStorage();
        writeAnalyticsConsent(storage, 'granted', new Date('2026-07-11T12:00:00Z'));
        expect(readAnalyticsConsent(storage, new Date('2026-07-12'))).toBe('granted');
        const stored = JSON.parse(storage.getItem(ANALYTICS_CONSENT_KEY));
        expect(stored).toEqual({ version: ANALYTICS_POLICY_VERSION, choice: 'granted', updatedAt: '2026-07-11T12:00:00.000Z' });
        expect(Object.keys(stored)).toHaveLength(3);
        clearAnalyticsConsent(storage);
        expect(readAnalyticsConsent(storage)).toBe('pending');
    });

    it('rejects unsupported choices', () => {
        expect(() => writeAnalyticsConsent(memoryStorage(), 'maybe')).toThrow(/choice/i);
    });
});

describe('bounded analytics event vocabulary', () => {
    it('drops unknown events and properties instead of forwarding arbitrary data', () => {
        expect(sanitizeAnalyticsEvent('mouse_move', { x: 123, y: 456 })).toBeNull();
        expect(sanitizeAnalyticsEvent('object_open', {
            objectKey: 'deimos', category: 'moons', surface: 'library',
            childName: 'Ruben', query: 'private search', x: 12.345
        })).toEqual({
            name: 'object_open',
            properties: { objectKey: 'deimos', category: 'moons', surface: 'library' }
        });
    });

    it('normalizes enums, booleans and numeric buckets to safe values', () => {
        expect(sanitizeAnalyticsEvent('library_search', {
            resultBucket: '11-25', category: 'worlds', language: 'pt', query: 'Mars'
        })).toEqual({
            name: 'library_search',
            properties: { resultBucket: '11-25', category: 'worlds', language: 'pt' }
        });
        expect(sanitizeAnalyticsEvent('quiz_result', {
            quizId: 'mars-0', correct: false, attemptBucket: '2', answer: 'secret'
        })).toEqual({
            name: 'quiz_result',
            properties: { quizId: 'mars-0', correct: false, attemptBucket: '2' }
        });
        expect(sanitizeAnalyticsEvent('contract_event', {
            contractId: 'iss-delivery', state: 'complete', cargoName: 'private note'
        })).toEqual({
            name: 'contract_event',
            properties: { contractId: 'iss-delivery', state: 'complete' }
        });
    });

    it('bounds stable identifiers and rejects invalid required fields', () => {
        expect(sanitizeAnalyticsEvent('object_open', { objectKey: 'x'.repeat(100), category: 'moons', surface: 'library' })).toBeNull();
        expect(sanitizeAnalyticsEvent('object_open', { objectKey: 'earth', category: 'unknown', surface: 'library' })).toBeNull();
    });

    it('returns a mutable page-view envelope because the Azure SDK enriches it in place', () => {
        const pageView = sanitizePageView('library', 'pt');
        expect(Object.isFrozen(pageView)).toBe(false);
        pageView.uri = '/sdk-normalized';
        expect(pageView.uri).toBe('/sdk-normalized');
    });
});
