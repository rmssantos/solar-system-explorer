import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { analyzePaperManifest } from '../scripts/lib/paper-build-performance.mjs';

const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');
const prefetchSource = readFileSync(new URL('../paper-preview/src/minigames/missionPrefetch.js', import.meta.url), 'utf8');

describe('paper game loading performance', () => {
    it('proves dynamic Phaser chunks stay outside the initial game graph', () => {
        const result = analyzePaperManifest({
            'jogo/index.html': { file: 'assets/game.js', isEntry: true, imports: ['main.js'], dynamicImports: ['router.js'] },
            'main.js': { file: 'assets/main.js', imports: ['three.js'] },
            'three.js': { file: 'assets/three.js' },
            'router.js': { file: 'assets/router.js', dynamicImports: ['phaser.js'] },
            'phaser.js': { file: 'assets/phaser-vendor.js' }
        });
        expect(result.initialFiles).toEqual(['assets/game.js', 'assets/main.js', 'assets/three.js']);
        expect(result.dynamicFiles).toContain('assets/phaser-vendor.js');
        expect(result.phaserInInitial).toBe(false);
    });

    it('connects accept/travel to guarded mission prefetch without a static Phaser import', () => {
        expect(main).toContain('createMissionPrefetch()');
        expect(main).toContain('missionPrefetch.prefetch(getOrbitalGameplay(contract.activity))');
        expect(main).not.toMatch(/from ['"]phaser['"]/);
        expect(prefetchSource).not.toContain("from './createOrbitalMissionGame.js'");
    });
});
