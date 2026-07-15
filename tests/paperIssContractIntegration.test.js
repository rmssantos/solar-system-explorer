import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const game = read('../paper-preview/src/main.js');
const ui = read('../paper-preview/src/ui.js');
const html = read('../paper-preview/jogo/index.html');
const i18n = read('../paper-preview/src/i18n/paperI18n.js');

describe('ISS delivery integration contract', () => {
    it('presents the delivery in the captain log with one contextual action', () => {
        expect(html).toContain('id="iss-contract-card"');
        expect(html).toContain('id="iss-contract-action"');
        expect(ui).toContain('getContractStatus(');
        expect(ui).toContain('onAcceptContract');
        expect(ui).toContain('onStartContract');
    });

    it('keeps the locked delivery visible and explains how to find the minigame', () => {
        expect(html).toMatch(/id="iss-contract-card" class="contract-card"(?![^>]*\shidden)/);
        expect(html).toMatch(/id="iss-contract-action"[^>]*data-contract-action="locked"[^>]*disabled/);
        expect(html).toContain('data-i18n="game.contract.iss.unlock"');
        expect(i18n).toContain("'game.contract.locked': 'Por descobrir'");
        expect(i18n).toContain("'game.contract.iss.unlock': 'Descobre a Terra'");
        expect(i18n).toContain("'game.contract.locked': 'Undiscovered'");
        expect(i18n).toContain("'game.contract.iss.unlock': 'Discover Earth'");
        expect(ui).toContain("status === 'locked'");
        expect(ui).not.toContain("elements.issContractCard.hidden = status === 'locked'");
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
