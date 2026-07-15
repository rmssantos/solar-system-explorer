import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('Paper autopilot presentation', () => {
    it('navigates without spawning the comet-like shard trail on every selection', () => {
        const scene = read('../paper-preview/src/scene/createPaperScene.js');
        const main = read('../paper-preview/src/main.js');

        expect(scene).not.toContain('createAutopilotTrail');
        expect(scene).not.toContain('paper-autopilot-trail');
        expect(scene).not.toContain('setAutopilotActive');
        expect(main).not.toContain('setAutopilotActive');
        expect(main).toContain('createAutopilot(');
        expect(main).toContain('stepAutopilot(');
    });
});
