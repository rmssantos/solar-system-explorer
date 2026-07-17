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
        expect(ui).toContain('onTravelContract(contractId)');
        expect(ui).toContain('onStartContract(contractId)');
        expect(ui).not.toContain('issContractAction');
    });

    it('connects accepted contracts to the existing paper autopilot and arrival flow', () => {
        expect(game).toContain('handleTravelContract');
        expect(game).toContain('startContractTravel');
        expect(game).toContain('arriveContractTravel');
        expect(game).toContain('previewUI.openMissionLog(\'missions\')');
    });

    it('tracks the active orbital contract instead of hard-coding ISS completion', () => {
        expect(game).toContain('activeOrbitContractId');
        expect(game).toContain('startOrbitalContract');
        expect(game).toContain('handleOrbitalContractComplete');
        expect(game).not.toContain('handleIssDeliveryComplete');
    });

    it('includes the active orbital simulation in deterministic browser state', () => {
        expect(game).toContain('orbitalMission: localOrbitHost?.getState()');
        const advanceTimeBlock = game.slice(
            game.indexOf('window.advanceTime'),
            game.indexOf('window.__paperPreview')
        );
        const branchStart = advanceTimeBlock.indexOf('if (localOrbitOpen) {');
        const branchEnd = advanceTimeBlock.indexOf('\n    const steps', branchStart);
        expect(branchStart).toBeGreaterThanOrEqual(0);
        expect(branchEnd).toBeGreaterThan(branchStart);
        expect(advanceTimeBlock.slice(branchStart, branchEnd))
            .toContain('localOrbitHost?.advanceTime(milliseconds)');
    });

    it('passes destination proximity per contract instead of one global boolean', () => {
        expect(game).toContain('nearbyContractIds: CONTRACT_CATALOG.filter');
        expect(game).toContain('objectKey: nearbyWorldObjectKey');
        expect(ui).toContain('nearbyContractIds.includes(contract.id)');
        expect(ui).not.toContain('destinationNearby, contractState');
    });

    it('renders mission artwork as accessible decorative postcards', () => {
        expect(ui).toContain("art.className = 'contract-art'");
        expect(ui).toContain('art.src = contract.art');
        expect(ui).toContain("art.alt = ''");
    });
});
