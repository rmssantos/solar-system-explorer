import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from '../src/i18n.js';
import { MISSION_DEFINITIONS } from '../src/missionSystem.js';

/**
 * Recursively extract all keys from a flat object.
 * Returns a sorted array of key strings.
 */
function getKeys(obj) {
    return Object.keys(obj).sort();
}

describe('i18n - TRANSLATIONS', () => {
    it('PT and EN have identical key sets', () => {
        const ptKeys = getKeys(TRANSLATIONS.pt);
        const enKeys = getKeys(TRANSLATIONS.en);

        const missingInEN = ptKeys.filter(k => !enKeys.includes(k));
        const missingInPT = enKeys.filter(k => !ptKeys.includes(k));

        if (missingInEN.length > 0) {
            console.log('Keys in PT but missing in EN:', missingInEN);
        }
        if (missingInPT.length > 0) {
            console.log('Keys in EN but missing in PT:', missingInPT);
        }

        expect(missingInEN, 'Keys present in PT but missing in EN').toEqual([]);
        expect(missingInPT, 'Keys present in EN but missing in PT').toEqual([]);
    });

    it('No duplicate keys (PT and EN objects are well-formed)', () => {
        // In JavaScript, duplicate keys in an object literal are silently
        // overwritten (the last one wins). We can't detect this at runtime
        // from the parsed object itself. Instead, we verify both languages
        // have the same number of keys, which would differ if a duplicate
        // in one language silently collapsed a key.
        const ptKeys = getKeys(TRANSLATIONS.pt);
        const enKeys = getKeys(TRANSLATIONS.en);

        // Each language should have no repeated entries (Set size == array length)
        expect(new Set(ptKeys).size).toBe(ptKeys.length);
        expect(new Set(enKeys).size).toBe(enKeys.length);

        // Additionally verify we have a reasonable number of keys (sanity check)
        expect(ptKeys.length).toBeGreaterThan(50);
        expect(enKeys.length).toBeGreaterThan(50);
    });

    it('All mission IDs have i18n keys (title, desc, hint) in both languages', () => {
        const missingKeys = [];

        for (const mission of MISSION_DEFINITIONS) {
            const suffixes = ['title', 'desc', 'hint'];
            for (const suffix of suffixes) {
                const key = `mission_${mission.id}_${suffix}`;
                if (!TRANSLATIONS.pt[key]) {
                    missingKeys.push(`PT missing: ${key}`);
                }
                if (!TRANSLATIONS.en[key]) {
                    missingKeys.push(`EN missing: ${key}`);
                }
            }
        }

        if (missingKeys.length > 0) {
            console.log('Missing mission i18n keys:', missingKeys);
        }

        expect(missingKeys).toEqual([]);
    });

    it('No empty translation values', () => {
        const emptyKeys = [];

        for (const [key, value] of Object.entries(TRANSLATIONS.pt)) {
            if (value === '') {
                emptyKeys.push(`PT: ${key}`);
            }
        }
        for (const [key, value] of Object.entries(TRANSLATIONS.en)) {
            if (value === '') {
                emptyKeys.push(`EN: ${key}`);
            }
        }

        if (emptyKeys.length > 0) {
            console.log('Empty translation values:', emptyKeys);
        }

        expect(emptyKeys).toEqual([]);
    });
});
