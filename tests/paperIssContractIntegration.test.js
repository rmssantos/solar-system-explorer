import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const game = read('../paper-preview/src/main.js');
const ui = read('../paper-preview/src/ui.js');
const html = read('../paper-preview/jogo/index.html');
const i18n = read('../paper-preview/src/i18n/paperI18n.js');
const catalog = read('../paper-preview/src/contracts/contractCatalog.js');

describe('ISS delivery integration contract', () => {
    it('presents the delivery in the captain log with one contextual action', () => {
        expect(html).toContain('id="contract-list"');
        expect(ui).toContain('CONTRACT_CATALOG.map');
        expect(ui).toContain('getContractStatus(');
        expect(ui).toContain('onAcceptContract');
        expect(ui).toContain('onStartContract');
    });

    it('keeps the locked delivery visible and explains how to find the minigame', () => {
        expect(ui).toContain("card.className = 'contract-card'");
        expect(ui).toContain('getContractJourneyAction');
        expect(ui).toContain('action.dataset.contractAction = journeyAction.action');
        expect(ui).toContain('action.disabled = journeyAction.disabled');
        expect(ui).toContain("journeyAction.action === 'locked'");
        expect(catalog).toContain("unlock: 'Descobre a Terra'");
        expect(catalog).toContain("unlock: 'Discover Earth'");
        expect(i18n).toContain("'game.contract.locked': 'Por descobrir'");
        expect(i18n).toContain("'game.contract.locked': 'Undiscovered'");
        expect(ui).toContain('card.dataset.status = status');
        expect(ui).not.toContain('issContractCard');
    });

    it('owns contract state and the local orbit host in the main application', () => {
        expect(game).toContain('createContractState(savedProgress)');
        expect(game).toContain('createLocalOrbitHost(');
        expect(game).toContain('acceptContract(');
        expect(game).toContain('completeContract(');
        expect(game).toContain('completedContractIds');
        expect(game).toContain('isContractDestinationNearby(');
    });

    it('treats the local orbit as a modal input boundary', () => {
        expect(game).toMatch(/dialogOpen\s*=\s*[\s\S]{0,160}localOrbitOpen/);
        expect(game).toContain('flightInput.setEnabled(false)');
        expect(game).toContain('flightInput.setEnabled(true)');
        expect(game).toMatch(/if \(localOrbitOpen\) return/);
    });

    it('exposes contract state to deterministic browser QA', () => {
        expect(game).toMatch(/contract:\s*\{[\s\S]{0,100}contractState/);
        expect(game).toContain('startIssDelivery');
    });
});
