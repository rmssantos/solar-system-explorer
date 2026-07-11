import { describe, expect, it } from 'vitest';
import { createPaperWorldObjects } from '../paper-preview/src/scene/createPaperWorldObjects.js';

describe('paper Tesla Roadster and Starman', () => {
    it('builds a recognisable open sports car with a seated astronaut', () => {
        const { root } = createPaperWorldObjects();
        const roadster = root.getObjectByName('spacecraft-tesla-roadster');

        expect(roadster.getObjectByName('roadster-body')).toBeTruthy();
        expect(roadster.getObjectByName('roadster-open-cockpit')).toBeTruthy();
        expect(roadster.getObjectByName('roadster-windscreen')).toBeTruthy();
        expect(roadster.getObjectByName('roadster-wheel-group').children).toHaveLength(4);
        expect(roadster.getObjectByName('starman')).toBeTruthy();
        expect(roadster.getObjectByName('starman-helmet-visor')).toBeTruthy();
        expect(roadster.getObjectByName('roadster-steering-wheel')).toBeTruthy();
    });
});
