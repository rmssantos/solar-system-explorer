import { describe, expect, it } from 'vitest';
import { PAPER_COCKPIT_STYLE } from '../paper-preview/src/scene/createPaperScene.js';

describe('paper courier cockpit visual language', () => {
    it('defines a layered, readable instrument panel rather than an empty frame', () => {
        expect(PAPER_COCKPIT_STYLE.palette).toMatchObject({
            paper: expect.any(String), ink: expect.any(String), panel: expect.any(String), glass: expect.any(String), signal: expect.any(String)
        });
        expect(PAPER_COCKPIT_STYLE.components).toEqual(expect.arrayContaining([
            'canopy-arch', 'canopy-struts', 'dashboard', 'radar', 'gauges', 'signal-lights', 'reticle'
        ]));
    });
});
