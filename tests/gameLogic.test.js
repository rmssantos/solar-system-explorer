import { describe, it, expect } from 'vitest';
import { SOLAR_SYSTEM_DATA } from '../src/data/objectsInfo.js';
import { SOLAR_SYSTEM_DATA_EN } from '../src/data/objectsInfoEN.js';
import { MISSION_DEFINITIONS } from '../src/missionSystem.js';
import { RANKS } from '../src/xpSystem.js';

describe('Game Logic', () => {
    it('achievement completionist count (39) matches actual object count', () => {
        // The completionist achievement requires visiting all objects:
        // sun(1) + planets(8) + dwarfs(5) + moons(16) + probes(8) + ufo(1) = 39
        // Count top-level objects
        const topLevelKeys = Object.keys(SOLAR_SYSTEM_DATA);

        // Count all moons (nested inside planets/dwarf planets)
        let moonCount = 0;
        for (const key of topLevelKeys) {
            const obj = SOLAR_SYSTEM_DATA[key];
            if (obj.moons && Array.isArray(obj.moons)) {
                moonCount += obj.moons.length;
            }
        }

        const totalObjects = topLevelKeys.length + moonCount;

        expect(totalObjects).toBe(39);
    });

    it('all 20 mission targets exist as keys in SOLAR_SYSTEM_DATA (or as moon ids)', () => {
        expect(MISSION_DEFINITIONS.length).toBe(20);

        // Build a set of all valid target names:
        // top-level keys + moon ids
        const validTargets = new Set(Object.keys(SOLAR_SYSTEM_DATA));
        for (const key of Object.keys(SOLAR_SYSTEM_DATA)) {
            const obj = SOLAR_SYSTEM_DATA[key];
            if (obj.moons && Array.isArray(obj.moons)) {
                for (const moon of obj.moons) {
                    if (moon.id) {
                        validTargets.add(moon.id);
                    }
                }
            }
        }

        const invalidTargets = [];
        for (const mission of MISSION_DEFINITIONS) {
            if (!validTargets.has(mission.target)) {
                invalidTargets.push(`Mission "${mission.id}" targets "${mission.target}" which is not in SOLAR_SYSTEM_DATA`);
            }
        }

        if (invalidTargets.length > 0) {
            console.log('Invalid mission targets:', invalidTargets);
        }

        expect(invalidTargets).toEqual([]);
    });

    it('XP ranks array is sorted by minXP in ascending order', () => {
        for (let i = 1; i < RANKS.length; i++) {
            expect(
                RANKS[i].minXP,
                `Rank ${RANKS[i].level} (minXP=${RANKS[i].minXP}) should be > rank ${RANKS[i - 1].level} (minXP=${RANKS[i - 1].minXP})`
            ).toBeGreaterThan(RANKS[i - 1].minXP);
        }

        // Also verify the first rank starts at 0
        expect(RANKS[0].minXP).toBe(0);

        // Verify we have 10 ranks
        expect(RANKS.length).toBe(10);
    });

    it('PT and EN have same number of moons per planet', () => {
        const mismatches = [];

        for (const key of Object.keys(SOLAR_SYSTEM_DATA)) {
            const ptObj = SOLAR_SYSTEM_DATA[key];
            const enObj = SOLAR_SYSTEM_DATA_EN[key];

            if (!enObj) continue; // Some objects may not have EN data

            const ptMoonCount = ptObj.moons ? ptObj.moons.length : 0;
            const enMoonCount = enObj.moons ? enObj.moons.length : 0;

            if (ptMoonCount !== enMoonCount) {
                mismatches.push(
                    `"${key}": PT has ${ptMoonCount} moons, EN has ${enMoonCount} moons`
                );
            }
        }

        if (mismatches.length > 0) {
            console.log('Moon count mismatches:', mismatches);
        }

        expect(mismatches).toEqual([]);
    });
});
