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
const scienceController = readFileSync(new URL('../paper-preview/src/agency/scienceConsole.js', import.meta.url), 'utf8');

const requiredKeys = [
    'game.agency.open', 'game.agency.title', 'game.agency.prepare', 'game.agency.launch',
    'game.agency.route.mission', 'game.agency.route.equip', 'game.agency.route.travel',
    'game.agency.route.investigate', 'game.agency.route.discovery',
    'game.agency.adventure.open', 'game.agency.briefing.start', 'game.agency.album.open',
    'game.agency.instrument', 'game.agency.power', 'game.agency.route', 'game.agency.collect',
    'game.agency.emptyProbes', 'game.agency.emptyReports', 'game.agency.capacity',
    'game.agency.source.live', 'game.agency.source.cached', 'game.agency.source.fallback',
    'game.agency.instrument.camera', 'game.agency.instrument.magnetometer', 'game.agency.instrument.radio',
    'game.agency.power.survey', 'game.agency.power.balanced', 'game.agency.power.focused',
    'game.agency.route.fast', 'game.agency.route.stable',
    'game.agency.science.open', 'game.agency.science.close', 'game.agency.science.capture',
    'game.agency.science.launching', 'game.agency.science.solar.instructions',
    'game.agency.science.neo.instructions', 'game.agency.science.mars.instructions',
    'game.agency.science.tuning', 'game.agency.science.lock', 'game.agency.science.complete',
    'game.agency.science.reportScore'
];

describe('space agency UI contract', () => {
    it('only renders safe web links from persisted scientific provenance', () => {
        expect(safeAgencySourceUrl('https://api.nasa.gov/')).toBe('https://api.nasa.gov/');
        expect(safeAgencySourceUrl('http://localhost/source')).toBe('http://localhost/source');
        expect(safeAgencySourceUrl('javascript:alert(1)')).toBe('#');
        expect(safeAgencySourceUrl('data:text/html,bad')).toBe('#');
        expect(safeAgencySourceUrl('not a url')).toBe('#');
    });

    it('provides one guided five-step journey instead of four disconnected dashboard tabs', () => {
        expect(html).toContain('id="space-agency"');
        expect(html).toContain('aria-labelledby="agency-title"');
        expect(html).toContain('class="agency-route"');
        expect(html.match(/data-agency-stage="[a-z]+"/g)).toHaveLength(5);
        expect(html).toContain('id="agency-mission-board"');
        expect(html).toContain('id="agency-briefing"');
        expect(html).toContain('id="agency-setup-sheet"');
        expect(html).toContain('id="agency-album"');
        expect(html).toContain('id="agency-announcer"');
        expect(html).toContain('id="agency-operation-list"');
        expect(html).toContain('id="agency-report-list"');
        expect(html).not.toContain('data-agency-section=');
        expect(html).not.toContain('class="agency-tabs"');
    });

    it('provides an animated, accessible probe console that works without pointer input', () => {
        expect(html).toContain('id="agency-science-console"');
        expect(html).toContain('id="agency-science-canvas"');
        expect(html).toContain('id="agency-science-capture"');
        expect(html).toContain('id="agency-science-tuning"');
        expect(html).toContain('aria-describedby="agency-science-instructions"');
        expect(scienceController).toContain("addEventListener('keydown'");
        expect(scienceController).toContain("addEventListener('pointermove'");
        expect(scienceController).toContain('advanceScienceSimulation');
        expect(scienceController).toContain('requestAnimationFrame');
        expect(scienceController).toContain('function drawLaunch');
        expect(scienceController).toContain('function drawSolar');
        expect(scienceController).toContain('function drawNeo');
        expect(scienceController).toContain('function drawMars');
    });

    it('keeps every agency label bilingual', () => {
        for (const key of requiredKeys) {
            expect(PAPER_TRANSLATIONS.pt[key], `missing PT ${key}`).toBeTruthy();
            expect(PAPER_TRANSLATIONS.en[key], `missing EN ${key}`).toBeTruthy();
        }
    });

    it('binds explicit open, close, briefing, equipment, launch, album and campaign actions', () => {
        expect(controller).toContain("elements.trigger.addEventListener('click', open)");
        for (const action of ['close', 'briefing', 'equip', 'launch', 'album', 'campaign']) {
            expect(controller).toContain(`'${action}'`);
        }
        expect(controller).toContain('data-agency-action');
        expect(controller).toContain('data-agency-choice');
        expect(controller).toContain('createAgencyJourney');
        expect(controller).toContain('advanceAgencyJourney');
    });

    it('updates the active journey route without rebuilding controls while time advances', () => {
        expect(controller).toContain('function tick(nextNowMs)');
        expect(controller).toContain('function renderRoute()');
        expect(controller).toContain('data-agency-stage');
    });

    it('preserves launch choices and keyboard focus across live-data renders', () => {
        expect(controller).toContain('function renderSetup()');
        expect(controller).toContain('if (!elements.setup.hidden && selectedOperationId) renderSetup()');
        expect(controller).toContain('function updateChoiceSelection(group)');
        expect(controller).not.toContain('choices = { ...choices, [key]: choice.dataset.choiceId };\n            renderChoices();');
        expect(controller).toContain('agency-choice-copy');
        expect(controller).toContain('agency-choice-consequence');
        expect(controller).toContain('agency-choice-recommended');
        expect(controller).toContain('isRecommendedChoice');
    });

    it('returns focus to a meaningful control when setup closes or launches', () => {
        expect(controller).toContain('function dismissSetup()');
        expect(controller).toContain('briefingButton?.focus()');
        expect(controller).toContain('elements.equipStart?.focus()');
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
