import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getMissionEventCue, MISSION_EVENT_CUES } from '../paper-preview/src/audio/missionAudio.js';

describe('orbital mission audio feedback', () => {
    it('maps every meaningful simulation event to a calm semantic cue', () => {
        expect(getMissionEventCue('transmitter-collected')).toBe('cargo-capture');
        expect(getMissionEventCue('debris-hit')).toBe('shield-impact');
        expect(getMissionEventCue('unsafe-contact')).toBe('soft-impact');
        expect(getMissionEventCue('docked')).toBe('docking-clamp');
        expect(getMissionEventCue('signal-complete')).toBe('signal-lock');
        expect(getMissionEventCue('unknown')).toBeNull();
    });

    it('ships each mission cue as a compact audio asset', () => {
        for (const cue of new Set(Object.values(MISSION_EVENT_CUES))) {
            const file = new URL(`../paper-preview/public/audio/${cue}.mp3`, import.meta.url);
            expect(existsSync(file), `${cue}.mp3 is missing`).toBe(true);
            expect(statSync(file).size).toBeGreaterThan(8_000);
            expect(statSync(file).size).toBeLessThan(100_000);
        }
    });
});
