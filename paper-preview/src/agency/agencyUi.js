import {
    INSTRUMENT_CATALOG,
    POWER_PROFILE_CATALOG,
    ROUTE_PROFILE_CATALOG
} from './agencyCatalog.js';
import { getLocalizedOperation } from './operationDirector.js';
import { presentAgencyState } from './agencyPresentation.js';
import { advanceAgencyJourney, createAgencyJourney, getAgencyMastery, getOperationHistory } from './agencyJourney.js';
import { bindBackdropDismiss } from '../ui/dialogDismiss.js';
import { createScienceConsole } from './scienceConsole.js';

function element(document, tag, className, text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function sourceKey(status) {
    return `game.agency.source.${['live', 'cached'].includes(status) ? status : 'fallback'}`;
}

export function safeAgencySourceUrl(value) {
    try {
        const url = new URL(String(value));
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '#';
    } catch {
        return '#';
    }
}

/** @param {any} options */
export function createAgencyUi(options) {
    const {
        document = globalThis.document,
        i18n,
        onOpen = () => {},
        onClose = () => {},
        onLaunch = () => false,
        onScienceComplete = () => false,
        onCollect = () => false,
        onOpenCampaign = () => {}
    } = options;
    /** @type {any} */
    const elements = {
        trigger: document.querySelector('#space-agency-trigger'),
        dialog: document.querySelector('#space-agency'),
        desk: document.querySelector('#space-agency > article'),
        close: document.querySelector('#agency-close'),
        routeStages: [...document.querySelectorAll('[data-agency-stage]')],
        board: document.querySelector('#agency-mission-board'),
        briefing: document.querySelector('#agency-briefing'),
        briefingTitle: document.querySelector('#agency-briefing-title'),
        briefingSummary: document.querySelector('#agency-briefing-summary'),
        briefingObjective: document.querySelector('#agency-briefing-objective'),
        tutorialNote: document.querySelector('#agency-tutorial-note'),
        liveFacts: document.querySelector('#agency-live-facts'),
        sourceLink: document.querySelector('#agency-source-link'),
        equipStart: document.querySelector('#agency-equip-start'),
        album: document.querySelector('#agency-album'),
        operations: document.querySelector('#agency-operation-list'),
        reports: document.querySelector('#agency-report-list'),
        capacity: document.querySelector('#agency-capacity'),
        setup: document.querySelector('#agency-setup-sheet'),
        setupTitle: document.querySelector('#agency-setup-title'),
        setupSummary: document.querySelector('#agency-setup-summary'),
        instrumentChoices: document.querySelector('#agency-instrument-choices'),
        powerChoices: document.querySelector('#agency-power-choices'),
        routeChoices: document.querySelector('#agency-route-choices'),
        announcer: document.querySelector('#agency-announcer')
    };
    let operations = [];
    let agencyState = { activeMissions: [], reports: [] };
    let nowMs = Date.now();
    let selectedOperationId = null;
    let currentJourney = null;
    let choices = { instrumentId: null, powerProfileId: null, routeProfileId: 'stable' };

    const scienceConsole = createScienceConsole({
        document,
        i18n,
        onComplete: (result) => {
            const completed = onScienceComplete(result);
            if (completed) {
                currentJourney = advanceAgencyJourney(advanceAgencyJourney(currentJourney, 'investigate'), 'discovery');
                renderRoute();
                elements.announcer.textContent = i18n.t('game.agency.science.complete', { score: result.score });
            }
            return completed;
        },
        onClose: () => elements.equipStart?.focus({ preventScroll: true })
    });

    function renderRoute() {
        const stageIndex = currentJourney?.stageIndex ?? 0;
        elements.routeStages.forEach((stage, index) => {
            stage.classList.toggle('is-complete', index < stageIndex);
            stage.classList.toggle('is-current', index === stageIndex);
            if (index === stageIndex) stage.setAttribute('aria-current', 'step');
            else stage.removeAttribute('aria-current');
        });
    }

    function showScreen(name) {
        elements.board.hidden = name !== 'board';
        elements.briefing.hidden = name !== 'briefing';
        elements.album.hidden = name !== 'album';
        if (name !== 'equip') elements.setup.hidden = true;
    }

    function open() {
        currentJourney = null;
        selectedOperationId = null;
        showScreen('board');
        renderRoute();
        elements.dialog.showModal();
        elements.desk.scrollTop = 0;
        onOpen();
    }

    function close() {
        scienceConsole.close();
        elements.setup.hidden = true;
        if (elements.dialog.open) elements.dialog.close();
        onClose();
    }

    function selectedOperation() {
        return operations.find((candidate) => candidate.id === selectedOperationId) ?? null;
    }

    function isRecommendedChoice(group, item) {
        const operation = selectedOperation();
        if (!operation) return false;
        if (group === 'instrument') return item.id === operation.recommendedInstrumentId;
        if (group === 'power') return item.id === operation.recommendedPowerProfileId;
        return item.id === 'stable';
    }

    function choiceButton(group, item) {
        const key = group === 'instrument' ? 'instrumentId' : group === 'power' ? 'powerProfileId' : 'routeProfileId';
        const button = element(document, 'button', 'agency-choice');
        button.type = 'button';
        button.dataset.agencyChoice = group;
        button.dataset.choiceId = item.id;
        button.setAttribute('aria-pressed', String(choices[key] === item.id));
        const icon = element(document, 'span', 'agency-choice-icon', item.icon ?? (item.id === 'fast' ? '➜' : '◎'));
        icon.setAttribute('aria-hidden', 'true');
        const copy = element(document, 'span', 'agency-choice-copy');
        copy.append(
            element(document, 'strong', '', i18n.t(`game.agency.${group}.${item.id}`)),
            element(document, 'small', '', i18n.t(item.purposeKey)),
            element(document, 'em', 'agency-choice-consequence', i18n.t(item.consequenceKey))
        );
        button.append(icon, copy);
        if (isRecommendedChoice(group, item)) {
            button.classList.add('is-recommended');
            button.append(element(document, 'b', 'agency-choice-recommended', i18n.t('game.agency.choice.recommended')));
        }
        return button;
    }

    function renderChoiceGroup(container, group, catalog) {
        if (container.children.length !== catalog.length) {
            container.replaceChildren(...catalog.map((item) => choiceButton(group, item)));
        }
        const key = group === 'instrument' ? 'instrumentId' : group === 'power' ? 'powerProfileId' : 'routeProfileId';
        for (const button of container.querySelectorAll('[data-agency-choice]')) {
            button.setAttribute('aria-pressed', String(choices[key] === button.dataset.choiceId));
            const label = button.querySelector('strong');
            if (label) label.textContent = i18n.t(`game.agency.${group}.${button.dataset.choiceId}`);
            const item = catalog.find((candidate) => candidate.id === button.dataset.choiceId);
            const purpose = button.querySelector('.agency-choice-copy small');
            const consequence = button.querySelector('.agency-choice-consequence');
            if (purpose && item) purpose.textContent = i18n.t(item.purposeKey);
            if (consequence && item) consequence.textContent = i18n.t(item.consequenceKey);
        }
    }

    function renderChoices() {
        renderChoiceGroup(elements.instrumentChoices, 'instrument', INSTRUMENT_CATALOG);
        renderChoiceGroup(elements.powerChoices, 'power', POWER_PROFILE_CATALOG);
        renderChoiceGroup(elements.routeChoices, 'route', ROUTE_PROFILE_CATALOG);
    }

    function updateChoiceSelection(group) {
        const container = group === 'instrument'
            ? elements.instrumentChoices
            : group === 'power' ? elements.powerChoices : elements.routeChoices;
        const key = group === 'instrument' ? 'instrumentId' : group === 'power' ? 'powerProfileId' : 'routeProfileId';
        for (const button of container.querySelectorAll('[data-agency-choice]')) {
            button.setAttribute('aria-pressed', String(choices[key] === button.dataset.choiceId));
        }
    }

    function renderSetup() {
        const operation = selectedOperation();
        if (!operation) return;
        const localized = getLocalizedOperation(operation, i18n.language);
        elements.setupTitle.textContent = localized.title;
        elements.setupSummary.textContent = localized.objective;
        renderChoices();
    }

    function openEquipment() {
        const operation = selectedOperation();
        if (!operation) return;
        currentJourney = advanceAgencyJourney(currentJourney, 'equip');
        choices = {
            instrumentId: operation.recommendedInstrumentId,
            powerProfileId: operation.recommendedPowerProfileId,
            routeProfileId: 'stable'
        };
        renderSetup();
        renderRoute();
        showScreen('equip');
        elements.setup.hidden = false;
        elements.setup.querySelector('button')?.focus();
    }

    function dismissSetup() {
        elements.setup.hidden = true;
        currentJourney = createAgencyJourney({ operationId: selectedOperationId, reports: agencyState.reports });
        renderRoute();
        showScreen('briefing');
        elements.equipStart?.focus();
    }

    function operationCard(operation) {
        const localized = getLocalizedOperation(operation, i18n.language);
        const history = getOperationHistory(agencyState.reports, operation.id);
        const mastery = getAgencyMastery(history);
        const card = element(document, 'article', `agency-operation-card agency-operation-${operation.kind}`);
        card.dataset.sourceStatus = operation.source.status;
        card.append(
            element(document, 'span', 'agency-source-stamp', i18n.t(sourceKey(operation.source.status))),
            element(document, 'span', `agency-mastery agency-mastery-${mastery.id}`, i18n.t(`game.agency.mastery.${mastery.id}`)),
            element(document, 'h3', '', localized.title),
            element(document, 'p', '', localized.summary),
            element(document, 'strong', 'agency-operation-objective', localized.objective)
        );
        const action = element(document, 'button', 'agency-primary-action', i18n.t('game.agency.adventure.open'));
        action.type = 'button';
        action.dataset.agencyAction = 'briefing';
        action.dataset.operationId = operation.id;
        action.disabled = agencyState.activeMissions.some((mission) => mission.operationId === operation.id);
        card.append(action);
        return card;
    }

    function renderBriefing() {
        const operation = selectedOperation();
        if (!operation) return;
        const localized = getLocalizedOperation(operation, i18n.language);
        elements.briefingTitle.textContent = localized.title;
        elements.briefingSummary.textContent = localized.summary;
        elements.briefingObjective.textContent = localized.objective;
        elements.tutorialNote.textContent = currentJourney?.tutorial
            ? i18n.t('game.agency.briefing.tutorial')
            : i18n.t('game.agency.briefing.replay', { attempt: currentJourney?.attempt ?? 2 });
        elements.liveFacts.replaceChildren();
        for (const [key, value] of Object.entries(operation.facts).filter(([, fact]) => fact !== null && fact !== undefined).slice(0, 3)) {
            const row = element(document, 'div', '');
            const formatted = typeof value === 'number'
                ? new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(value)
                : String(value);
            row.append(element(document, 'dt', '', i18n.t(`game.agency.fact.${key}`)), element(document, 'dd', '', formatted));
            elements.liveFacts.append(row);
        }
        elements.sourceLink.textContent = i18n.t('game.agency.source.more', { source: operation.source.name });
        elements.sourceLink.href = safeAgencySourceUrl(operation.source.url);
    }

    function openBriefing(operationId) {
        const operation = operations.find((candidate) => candidate.id === operationId);
        if (!operation) return;
        selectedOperationId = operation.id;
        currentJourney = createAgencyJourney({ operationId: operation.id, reports: agencyState.reports });
        renderBriefing();
        renderRoute();
        showScreen('briefing');
        elements.equipStart?.focus();
    }

    function openBoard() {
        const operationId = selectedOperationId;
        currentJourney = null;
        selectedOperationId = null;
        renderRoute();
        showScreen('board');
        const briefingButton = operationId
            ? elements.operations.querySelector(`[data-operation-id="${operationId}"]`)
            : elements.operations.querySelector('[data-agency-action="briefing"]');
        briefingButton?.focus();
    }

    function reportCard(report) {
        const card = element(document, 'article', `agency-report-card${report.collected ? ' is-collected' : ''}`);
        const quality = element(document, 'span', 'agency-report-quality', `${report.quality}%`);
        card.append(quality, element(document, 'h3', '', report.title), element(document, 'p', '', report.summary));
        if (Number.isFinite(report.scienceScore)) {
            card.append(element(document, 'small', 'agency-report-performance', i18n.t('game.agency.science.reportScore', { score: report.scienceScore })));
        }
        const source = element(document, 'a', 'agency-source-link', i18n.t('game.agency.source.more', { source: report.sourceName || i18n.t(sourceKey(report.sourceStatus)) }));
        source.href = safeAgencySourceUrl(report.sourceUrl);
        source.target = '_blank';
        source.rel = 'noreferrer';
        card.append(source);
        if (!report.collected) {
            const collect = element(document, 'button', 'agency-primary-action', i18n.t('game.agency.collect'));
            collect.type = 'button';
            collect.dataset.agencyAction = 'collect';
            collect.dataset.reportId = report.id;
            card.append(collect);
        } else card.append(element(document, 'strong', 'agency-collected-stamp', i18n.t('game.agency.collected')));
        return card;
    }

    function render() {
        elements.announcer.textContent = '';
        const view = presentAgencyState(agencyState, operations, i18n.language, nowMs);
        elements.operations.replaceChildren(...operations.map(operationCard));
        elements.reports.replaceChildren(...(view.reports.length
            ? view.reports.map(reportCard)
            : [element(document, 'p', 'agency-empty-state', i18n.t('game.agency.emptyReports'))]));
        elements.capacity.textContent = i18n.t('game.agency.capacity', { used: view.capacity.used, total: view.capacity.total });
        if (!elements.setup.hidden && selectedOperationId) renderSetup();
        if (!elements.briefing.hidden && selectedOperationId) renderBriefing();
        renderRoute();
    }

    function update(next) {
        operations = next.operations ?? operations;
        agencyState = next.agencyState ?? agencyState;
        nowMs = next.nowMs ?? Date.now();
        render();
    }

    function tick(nextNowMs) {
        nowMs = nextNowMs ?? Date.now();
        renderRoute();
    }

    function openScienceConsole(mission) {
        const operation = operations.find((candidate) => candidate.id === mission.operationId);
        const localized = operation ? getLocalizedOperation(operation, i18n.language) : null;
        scienceConsole.open(mission, localized);
    }

    function handleAction(event) {
        const choice = event.target.closest('[data-agency-choice]');
        if (choice) {
            const key = choice.dataset.agencyChoice === 'instrument' ? 'instrumentId' : choice.dataset.agencyChoice === 'power' ? 'powerProfileId' : 'routeProfileId';
            choices = { ...choices, [key]: choice.dataset.choiceId };
            updateChoiceSelection(choice.dataset.agencyChoice);
            return;
        }
        const action = event.target.closest('[data-agency-action]');
        if (!action) return;
        if (action.dataset.agencyAction === 'close') close();
        else if (action.dataset.agencyAction === 'briefing') openBriefing(action.dataset.operationId);
        else if (action.dataset.agencyAction === 'board') openBoard();
        else if (action.dataset.agencyAction === 'equip') openEquipment();
        else if (action.dataset.agencyAction === 'cancel') dismissSetup();
        else if (action.dataset.agencyAction === 'launch') {
            const launched = onLaunch({ operationId: selectedOperationId, ...choices });
            if (launched) {
                const launchedMission = launched.mission ?? launched;
                currentJourney = advanceAgencyJourney(currentJourney, 'travel');
                elements.setup.hidden = true;
                renderRoute();
                elements.announcer.textContent = i18n.t('game.agency.launched');
                openScienceConsole(launchedMission);
            }
        } else if (action.dataset.agencyAction === 'album') {
            currentJourney = null;
            renderRoute();
            showScreen('album');
        } else if (action.dataset.agencyAction === 'collect') {
            if (onCollect(action.dataset.reportId)) elements.announcer.textContent = i18n.t('game.agency.collected');
        } else if (action.dataset.agencyAction === 'campaign') {
            close();
            onOpenCampaign();
        }
    }

    function handleCancel(event) {
        event.preventDefault();
        close();
    }

    elements.trigger.addEventListener('click', open);
    elements.dialog.addEventListener('click', handleAction);
    elements.dialog.addEventListener('cancel', handleCancel);
    const unbindBackdrop = bindBackdropDismiss(elements.dialog, close);
    const unsubscribe = i18n.subscribe(render);

    return Object.freeze({
        elements,
        open,
        close,
        update,
        tick,
        advanceTime: scienceConsole.advanceTime,
        getScienceState: scienceConsole.getState,
        destroy() {
            scienceConsole.destroy();
            elements.trigger.removeEventListener('click', open);
            elements.dialog.removeEventListener('click', handleAction);
            elements.dialog.removeEventListener('cancel', handleCancel);
            unbindBackdrop();
            unsubscribe();
        }
    });
}
