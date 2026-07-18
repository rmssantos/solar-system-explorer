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
        expect(ui).toContain('if (onTravelContract(contractId)) closeMissionLog()');
        expect(ui).toContain('onStartContract(contractId)');
        expect(ui).not.toContain('issContractAction');
    });

    it('connects accepted contracts to the existing paper autopilot and arrival flow', () => {
        expect(game).toContain('handleTravelContract');
        expect(game).toContain('startContractTravel');
        expect(game).toContain('flyToWorldObject(next.targetKey, { allowMissionLog: true })');
        expect(game).toContain('arriveContractTravel');
        expect(game).toContain('previewUI.openMissionLog(\'missions\')');
    });

    it('restores, saves and clears versioned attempts through the shared progress store', () => {
        expect(game).toContain('createContractAttemptState(savedProgress)');
        expect(game).toContain('getContractAttempt(contractAttemptState, contractId)');
        expect(game).toContain('onAttemptSave: handleContractAttemptSave');
        expect(game).toContain('onAttemptClear: handleContractAttemptClear');
        expect(game).toContain('contractAttempts: contractAttemptState.contractAttempts');
    });

    it('offers replayable training without completing or rewarding the contract', () => {
        expect(ui).toContain('onTrainContract(contractId)');
        expect(game).toContain('startContractTraining');
        expect(game).toContain('trainingMode: true');
        expect(game).toContain('if (activeOrbitTraining || context?.trainingMode) return false');
        expect(game).toContain('seenMissionTrainingIds: missionTrainingState.seenMissionTrainingIds');
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

    it('renders each contract unique stamp and XP instead of a shared placeholder reward', () => {
        expect(ui).toContain('getContractReward(contract.id)');
        expect(ui).toContain('reward.copy[language].title');
        expect(ui).toContain("stamp.alt = ''");
        expect(ui).not.toContain("[paperI18n.t('game.contract.reward'), '+140 XP']");
    });

    it('routes semantic minigame events into the shared audio director', () => {
        expect(game).toContain('onAudioCue: (cue) => audioDirector.play(cue)');
    });
});
