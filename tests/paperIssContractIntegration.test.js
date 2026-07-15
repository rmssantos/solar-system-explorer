import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const game = read('../paper-preview/src/main.js');
const ui = read('../paper-preview/src/ui.js');
const html = read('../paper-preview/jogo/index.html');

describe('ISS delivery integration contract', () => {
    it('presents the delivery in the captain log with one contextual action', () => {
        expect(html).toContain('id="iss-contract-card"');
        expect(html).toContain('id="iss-contract-action"');
        expect(ui).toContain('getContractStatus(');
        expect(ui).toContain('onAcceptContract');
        expect(ui).toContain('onStartContract');
    });

    it('owns contract state and the local orbit host in the main application', () => {
        expect(game).toContain('createContractState(savedProgress)');
        expect(game).toContain('createLocalOrbitHost(');
        expect(game).toContain('acceptContract(');
        expect(game).toContain('completeContract(');
        expect(game).toContain('completedContractIds');
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

