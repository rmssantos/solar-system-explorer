import { describe, expect, it } from 'vitest';
import {
    LIVING_SKY_EVENTS,
    OBSERVATION_FILTERS,
    getLivingSkyEvent
} from '../paper-preview/src/living-sky/livingSkyCatalog.js';

describe('Living Sky catalog', () => {
    it('defines four immutable bilingual phenomena connected to existing worlds', () => {
        expect(LIVING_SKY_EVENTS.map((event) => event.id)).toEqual([
            'earth-aurora', 'io-shadow-transit', 'mars-dust-front', 'halley-2061'
        ]);
        expect(OBSERVATION_FILTERS).toEqual(['visible', 'infrared', 'magnetic']);
        for (const event of LIVING_SKY_EVENTS) {
            expect(event.targetKey).toMatch(/earth|jupiter|mars|halley/);
            expect(OBSERVATION_FILTERS).toContain(event.preferredFilter);
            expect(event.art).toBe(`/art/living-sky/${event.id}.webp`);
            expect(event.copy.pt.title).toBeTruthy();
            expect(event.copy.en.title).toBeTruthy();
            expect(event.copy.pt.simulationNote).toMatch(/simula/i);
            expect(event.copy.en.simulationNote).toMatch(/simulat/i);
            expect(event.source.url).toMatch(/^https:\/\/science\.nasa\.gov\//);
            expect(event.rewardXp).toBeGreaterThan(0);
            expect(Object.isFrozen(event)).toBe(true);
            expect(Object.isFrozen(event.copy.pt)).toBe(true);
            expect(Object.isFrozen(event.schedule)).toBe(true);
        }
    });

    it('returns a stable event or null without exposing mutable configuration', () => {
        expect(getLivingSkyEvent('earth-aurora')).toBe(LIVING_SKY_EVENTS[0]);
        expect(getLivingSkyEvent('unknown')).toBeNull();
    });
});

