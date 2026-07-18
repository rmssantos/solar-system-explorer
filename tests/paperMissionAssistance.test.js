import { describe, expect, it } from 'vitest';
import { createMissionAssistance, loadMissionAssistance, saveMissionAssistance, toggleMissionAssistance } from '../paper-preview/src/minigames/missionAssistance.js';

describe('no-penalty mission assistance', () => {
    it('keeps guide, calm pace and large controls independent', () => {
        let state = createMissionAssistance();
        state = toggleMissionAssistance(state, 'guide'); state = toggleMissionAssistance(state, 'calmPace');
        expect(state).toEqual({ guide: true, calmPace: true, largeControls: false });
        expect(toggleMissionAssistance(state, 'unknown')).toBe(state);
    });
    it('persists only safe boolean preferences', () => {
        let value = null; const storage = { setItem: (_key, next) => { value = next; }, getItem: () => value };
        saveMissionAssistance({ guide: true, calmPace: false, largeControls: true, xpPenalty: 4 }, storage);
        expect(loadMissionAssistance(storage)).toEqual({ guide: true, calmPace: false, largeControls: true });
    });
});
