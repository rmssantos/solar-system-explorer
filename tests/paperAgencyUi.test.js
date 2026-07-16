import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { PAPER_TRANSLATIONS } from '../paper-preview/src/i18n/paperI18n.js';
import {
    formatAgencyDuration,
    presentAgencyState
} from '../paper-preview/src/agency/agencyPresentation.js';
import { safeAgencySourceUrl } from '../paper-preview/src/agency/agencyUi.js';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../paper-preview/src/agency/agencyUi.js', import.meta.url), 'utf8');

const requiredKeys = [
    'game.agency.open', 'game.agency.title', 'game.agency.dispatch', 'game.agency.live',
    'game.agency.probes', 'game.agency.reports', 'game.agency.prepare', 'game.agency.launch',
    'game.agency.instrument', 'game.agency.power', 'game.agency.route', 'game.agency.collect',
    'game.agency.emptyProbes', 'game.agency.emptyReports', 'game.agency.capacity',
    'game.agency.source.live', 'game.agency.source.cached', 'game.agency.source.fallback',
    'game.agency.instrument.camera', 'game.agency.instrument.magnetometer', 'game.agency.instrument.radio',
    'game.agency.power.survey', 'game.agency.power.balanced', 'game.agency.power.focused',
    'game.agency.route.fast', 'game.agency.route.stable'
];

describe('space agency UI contract', () => {
    it('only renders safe web links from persisted scientific provenance', () => {
        expect(safeAgencySourceUrl('https://api.nasa.gov/')).toBe('https://api.nasa.gov/');
        expect(safeAgencySourceUrl('http://localhost/source')).toBe('http://localhost/source');
        expect(safeAgencySourceUrl('javascript:alert(1)')).toBe('#');
        expect(safeAgencySourceUrl('data:text/html,bad')).toBe('#');
        expect(safeAgencySourceUrl('not a url')).toBe('#');
    });

    it('provides a dedicated fullscreen control desk with four accessible sections', () => {
        expect(html).toContain('id="space-agency"');
        expect(html).toContain('aria-labelledby="agency-title"');
        expect(html).toContain('id="agency-setup-sheet"');
        expect(html).toContain('id="agency-announcer"');
        expect(html).toContain('id="agency-operation-list"');
        expect(html).toContain('id="agency-live-list"');
        expect(html).toContain('id="agency-probe-list"');
        expect(html).toContain('id="agency-report-list"');
        expect([...html.matchAll(/data-agency-section="([a-z]+)"/g)].map((match) => match[1])).toEqual([
            'dispatch', 'live', 'probes', 'reports'
        ]);
        expect([...html.matchAll(/data-agency-panel="([a-z]+)"/g)].map((match) => match[1])).toEqual([
            'dispatch', 'live', 'probes', 'reports'
        ]);
        expect(html.match(/id="agency-panel-[a-z]+"[^>]*role="tabpanel"/g)).toHaveLength(4);
        expect(html.match(/aria-controls="agency-panel-[a-z]+"/g)).toHaveLength(4);
        expect(html.match(/aria-labelledby="agency-tab-[a-z]+"/g)).toHaveLength(4);
    });

    it('keeps every agency label bilingual', () => {
        for (const key of requiredKeys) {
            expect(PAPER_TRANSLATIONS.pt[key], `missing PT ${key}`).toBeTruthy();
            expect(PAPER_TRANSLATIONS.en[key], `missing EN ${key}`).toBeTruthy();
        }
    });

    it('binds explicit open, close, configure, launch, collect and campaign actions', () => {
        expect(controller).toContain("elements.trigger.addEventListener('click', open)");
        for (const action of ['close', 'configure', 'launch', 'collect', 'campaign']) {
            expect(controller).toContain(`'${action}'`);
        }
        expect(controller).toContain('data-agency-action');
        expect(controller).toContain('data-agency-choice');
        expect(controller).toContain('aria-selected');
        expect(controller).toContain("['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']");
        expect(controller).toContain('event.preventDefault()');
        expect(controller).toContain('nextTab.focus()');
    });

    it('updates probe clocks in place so actions remain stable while time advances', () => {
        expect(controller).toContain('function tick(nextNowMs)');
        expect(controller).toContain("querySelectorAll('[data-agency-mission-id]')");
        expect(controller).toContain('data-agency-countdown');
        expect(controller).toContain('data-agency-progress');
    });

    it('preserves launch choices and keyboard focus across live-data renders', () => {
        expect(controller).toContain('function renderSetup()');
        expect(controller).toContain('if (!elements.setup.hidden && selectedOperationId) renderSetup()');
        expect(controller).toContain('function updateChoiceSelection(group)');
        expect(controller).not.toContain('choices = { ...choices, [key]: choice.dataset.choiceId };\n            renderChoices();');
    });

    it('returns focus to a meaningful control when setup closes or launches', () => {
        expect(controller).toContain('function dismissSetup()');
        expect(controller).toContain('configureButton?.focus()');
        expect(controller).toContain('probeTab?.focus()');
    });
});

describe('agency presentation', () => {
    const operation = {
        id: 'solar:today', kind: 'solar-weather', targetKey: 'sun', durationMs: 1000,
        recommendedInstrumentId: 'magnetometer', recommendedPowerProfileId: 'focused',
        source: { status: 'live', name: 'NASA DONKI', url: 'https://example.test' },
        facts: { flareClass: 'M2.4' }
    };

    it('formats countdowns in both supported languages', () => {
        expect(formatAgencyDuration(125_000, 'pt')).toBe('2 min 5 s');
        expect(formatAgencyDuration(125_000, 'en')).toBe('2 min 5 s');
        expect(formatAgencyDuration(0, 'pt')).toBe('Concluída');
        expect(formatAgencyDuration(0, 'en')).toBe('Complete');
    });

    it('presents active probes and archived reports with localized operation copy', () => {
        const view = presentAgencyState({
            activeMissions: [{
                id: 'solar:today:0', operationId: operation.id, kind: operation.kind, targetKey: 'sun',
                startedAt: 0, endsAt: 100_000, instrumentId: 'magnetometer', powerProfileId: 'focused',
                routeProfileId: 'stable', facts: operation.facts, source: operation.source
            }],
            reports: [{
                id: 'report:1', operationId: operation.id, kind: operation.kind, targetKey: 'sun',
                instrumentId: 'magnetometer', quality: 100, facts: operation.facts, sourceStatus: 'live',
                sourceName: 'NASA DONKI', sourceUrl: 'https://example.test', completedAt: 100, collected: false
            }]
        }, [operation], 'en', 40_000);

        expect(view.capacity).toEqual({ used: 1, total: 3, available: 2 });
        expect(view.activeMissions[0]).toMatchObject({ title: 'M2.4 solar watch', remainingLabel: '1 min', progressPercent: 40 });
        expect(view.reports[0]).toMatchObject({ title: 'M2.4 solar watch', quality: 100, collected: false });
    });
});
