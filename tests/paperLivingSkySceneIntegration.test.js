import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const scene = readFileSync(new URL('../paper-preview/src/scene/createPaperScene.js', import.meta.url), 'utf8');

describe('living-sky scene integration', () => {
    it('updates effects in the existing diorama and exposes capture telemetry', () => {
        expect(scene).toContain("import { createLivingSkyEffects } from './createLivingSkyEffects.js'");
        expect(scene).toContain('livingSkyEffects.update');
        expect(scene).toContain('setLivingSkyPresentation');
        expect(scene).toContain('getLivingSkyTelemetry');
        expect(scene).toContain('getCaptureCanvas');
        expect(scene).toContain('preserveDrawingBuffer: true');
    });
});
