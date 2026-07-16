import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../paper-preview/jogo/index.html');
const ui = read('../paper-preview/src/ui.js');
const game = read('../paper-preview/src/main.js');

describe('orbital campaign integration', () => {
    it('renders contracts from the catalog through one delegated action surface', () => {
        expect(html).toContain('id="contract-list"');
        expect(ui).toContain('CONTRACT_CATALOG');
        expect(ui).toContain('data-contract-id');
        expect(ui).toContain('onAcceptContract(contractId)');
        expect(ui).toContain('onStartContract(contractId)');
        expect(ui).not.toContain('issContractAction');
    });

    it('tracks the active orbital contract instead of hard-coding ISS completion', () => {
        expect(game).toContain('activeOrbitContractId');
        expect(game).toContain('startOrbitalContract');
        expect(game).toContain('handleOrbitalContractComplete');
        expect(game).not.toContain('handleIssDeliveryComplete');
    });
});
