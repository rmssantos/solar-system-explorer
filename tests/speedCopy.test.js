import { describe, it, expect } from 'vitest';
import { formatSpeed, getSpeedComparison, LIGHT_SPEED_KMS } from '../src/manualNavigation/speedCopy.js';
import { WARP_SPEEDS } from '../src/manualNavigation/WarpModel.js';
import { TRANSLATIONS } from '../src/i18n.js';

// i18n defaults to pt in node — these assert against the pt strings.

describe('formatSpeed', () => {
    it('shows the light-speed label at and above 299,792 km/s', () => {
        expect(formatSpeed(LIGHT_SPEED_KMS)).toBe(TRANSLATIONS.pt.speed_light);
        expect(formatSpeed(LIGHT_SPEED_KMS + 1)).toBe(TRANSLATIONS.pt.speed_light);
        expect(formatSpeed(LIGHT_SPEED_KMS - 1)).not.toBe(TRANSLATIONS.pt.speed_light);
    });

    it('formats thousands with the i18n template', () => {
        expect(formatSpeed(50000)).toBe(TRANSLATIONS.pt.speed_thousand.replace('{n}', '50'));
    });

    it('anything at or above light speed shows the light label (the millions branch is shadowed — preserved behavior)', () => {
        // Note: the >= 1,000,000 "millions" branch can never run because the
        // light-speed check (>= 299,792) comes first. Kept as-is on purpose:
        // high warps deliberately show "Speed of Light!" in the HUD.
        expect(formatSpeed(1500000)).toBe(TRANSLATIONS.pt.speed_light);
    });

    it('formats sub-1000 speeds as plain km/s', () => {
        expect(formatSpeed(500)).toContain('km/s');
    });
});

describe('getSpeedComparison', () => {
    it('every threshold tier returns a non-empty translated line', () => {
        const tiers = [LIGHT_SPEED_KMS, 50000000, 20000000, 5000000, 1000000, 500000, 100000, 50000, 1];
        for (const t of tiers) {
            const line = getSpeedComparison(t);
            expect(line, `tier ${t}`).toBeTruthy();
            // Must be a real translation, not a raw key echoed back by i18n.t
            expect(line.startsWith('comp_'), `tier ${t} returned raw key`).toBe(false);
        }
    });

    it('the top warp level reaches the light-speed comparison', () => {
        const top = WARP_SPEEDS[WARP_SPEEDS.length - 1];
        expect(getSpeedComparison(top.realKmS)).toBe(TRANSLATIONS.pt.comp_universe);
    });
});
