import {
    INSTRUMENT_CATALOG,
    POWER_PROFILE_CATALOG,
    ROUTE_PROFILE_CATALOG
} from './agencyCatalog.js';
import { getLocalizedOperation } from './operationDirector.js';
import { presentAgencyState } from './agencyPresentation.js';
import { bindBackdropDismiss } from '../ui/dialogDismiss.js';

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
    onCollect = () => false,
    onOpenCampaign = () => {}
    } = options;
    /** @type {any} */
    const elements = {
        trigger: document.querySelector('#mission-center-trigger'),
        dialog: document.querySelector('#space-agency'),
        desk: document.querySelector('#space-agency > article'),
        close: document.querySelector('#agency-close'),
        tabs: [...document.querySelectorAll('[data-agency-section]')],
        panels: [...document.querySelectorAll('[data-agency-panel]')],
        operations: document.querySelector('#agency-operation-list'),
        live: document.querySelector('#agency-live-list'),
        probes: document.querySelector('#agency-probe-list'),
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
    let choices = { instrumentId: null, powerProfileId: null, routeProfileId: 'stable' };

    function selectSection(section) {
        elements.tabs.forEach((tab) => {
            const selected = tab.dataset.agencySection === section;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        elements.panels.forEach((panel) => { panel.hidden = panel.dataset.agencyPanel !== section; });
    }

    function open() {
        selectSection('dispatch');
        elements.dialog.showModal();
        elements.desk.scrollTop = 0;
        onOpen();
    }

    function close() {
        elements.setup.hidden = true;
        if (elements.dialog.open) elements.dialog.close();
        onClose();
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
        button.append(icon, element(document, 'strong', '', i18n.t(`game.agency.${group}.${item.id}`)));
        return button;
    }

    function renderChoiceGroup(container, group, catalog) {
        if (container.children.length !== catalog.length) {
            container.replaceChildren(...catalog.map((item) => choiceButton(group, item)));
        }
        for (const button of container.querySelectorAll('[data-agency-choice]')) {
            const key = group === 'instrument' ? 'instrumentId' : group === 'power' ? 'powerProfileId' : 'routeProfileId';
            button.setAttribute('aria-pressed', String(choices[key] === button.dataset.choiceId));
            const label = button.querySelector('strong');
            if (label) label.textContent = i18n.t(`game.agency.${group}.${button.dataset.choiceId}`);
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
        const operation = operations.find((candidate) => candidate.id === selectedOperationId);
        if (!operation) return;
        const localized = getLocalizedOperation(operation, i18n.language);
        elements.setupTitle.textContent = localized.title;
        elements.setupSummary.textContent = localized.objective;
        renderChoices();
    }

    function openSetup(operationId) {
        const operation = operations.find((candidate) => candidate.id === operationId);
        if (!operation) return;
        selectedOperationId = operation.id;
        choices = {
            instrumentId: operation.recommendedInstrumentId,
            powerProfileId: operation.recommendedPowerProfileId,
            routeProfileId: 'stable'
        };
        renderSetup();
        elements.setup.hidden = false;
        elements.setup.querySelector('button')?.focus();
    }

    function dismissSetup() {
        elements.setup.hidden = true;
        const configureButton = [...elements.operations.querySelectorAll('[data-agency-action="configure"]')]
            .find((button) => button.dataset.operationId === selectedOperationId);
        selectedOperationId = null;
        configureButton?.focus();
    }

    function operationCard(operation) {
        const localized = getLocalizedOperation(operation, i18n.language);
        const card = element(document, 'article', 'agency-operation-card');
        card.dataset.sourceStatus = operation.source.status;
        const source = element(document, 'span', 'agency-source-stamp', i18n.t(sourceKey(operation.source.status)));
        const heading = element(document, 'h3', '', localized.title);
        const summary = element(document, 'p', '', localized.summary);
        const objective = element(document, 'strong', 'agency-operation-objective', localized.objective);
        const action = element(document, 'button', 'agency-primary-action', localized.action);
        action.type = 'button';
        action.dataset.agencyAction = 'configure';
        action.dataset.operationId = operation.id;
        action.disabled = agencyState.activeMissions.some((mission) => mission.operationId === operation.id);
        card.append(source, heading, summary, objective, action);
        return card;
    }

    function liveCard(operation) {
        const localized = getLocalizedOperation(operation, i18n.language);
        const card = element(document, 'article', 'agency-live-card');
        const top = element(document, 'div', 'agency-live-card-heading');
        top.append(element(document, 'strong', '', localized.title), element(document, 'span', `agency-data-status is-${operation.source.status}`, i18n.t(sourceKey(operation.source.status))));
        const facts = element(document, 'dl', 'agency-live-facts');
        for (const [key, value] of Object.entries(operation.facts).filter(([, fact]) => fact !== null && fact !== undefined).slice(0, 3)) {
            const row = element(document, 'div', '');
            row.append(element(document, 'dt', '', i18n.t(`game.agency.fact.${key}`)), element(document, 'dd', '', typeof value === 'number' ? new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(value) : String(value)));
            facts.append(row);
        }
        const link = element(document, 'a', 'agency-source-link', operation.source.name);
        link.href = safeAgencySourceUrl(operation.source.url);
        link.target = '_blank';
        link.rel = 'noreferrer';
        card.append(top, facts, link);
        return card;
    }

    function probeCard(mission) {
        const card = element(document, 'article', 'agency-probe-card');
        card.dataset.agencyMissionId = mission.id;
        const heading = element(document, 'div', 'agency-probe-heading');
        const countdown = element(document, 'strong', 'agency-countdown', mission.remainingLabel);
        countdown.dataset.agencyCountdown = '';
        heading.append(element(document, 'h3', '', mission.title), countdown);
        const progress = element(document, 'progress', 'agency-probe-progress');
        progress.dataset.agencyProgress = '';
        progress.max = 100;
        progress.value = mission.progressPercent;
        progress.setAttribute('aria-label', `${mission.title}: ${mission.progressPercent}%`);
        const meta = element(document, 'p', 'agency-probe-meta', `${i18n.t(`game.agency.instrument.${mission.instrumentId}`)} · ${i18n.t(`game.agency.route.${mission.routeProfileId}`)}`);
        card.append(heading, progress, meta);
        return card;
    }

    function reportCard(report) {
        const card = element(document, 'article', `agency-report-card${report.collected ? ' is-collected' : ''}`);
        const quality = element(document, 'span', 'agency-report-quality', `${report.quality}%`);
        card.append(quality, element(document, 'h3', '', report.title), element(document, 'p', '', report.summary));
        const source = element(document, 'a', 'agency-source-link', report.sourceName || i18n.t(sourceKey(report.sourceStatus)));
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
        const view = presentAgencyState(agencyState, operations, i18n.language, nowMs);
        elements.operations.replaceChildren(...operations.map(operationCard));
        elements.live.replaceChildren(...operations.map(liveCard));
        elements.probes.replaceChildren(...(view.activeMissions.length
            ? view.activeMissions.map(probeCard)
            : [element(document, 'p', 'agency-empty-state', i18n.t('game.agency.emptyProbes'))]));
        elements.reports.replaceChildren(...(view.reports.length
            ? view.reports.map(reportCard)
            : [element(document, 'p', 'agency-empty-state', i18n.t('game.agency.emptyReports'))]));
        elements.capacity.textContent = i18n.t('game.agency.capacity', { used: view.capacity.used, total: view.capacity.total });
        if (!elements.setup.hidden && selectedOperationId) renderSetup();
    }

    function update(next) {
        operations = next.operations ?? operations;
        agencyState = next.agencyState ?? agencyState;
        nowMs = next.nowMs ?? Date.now();
        render();
    }

    function tick(nextNowMs) {
        nowMs = nextNowMs ?? Date.now();
        const view = presentAgencyState(agencyState, operations, i18n.language, nowMs);
        const missionsById = new Map(view.activeMissions.map((mission) => [mission.id, mission]));
        for (const card of elements.probes.querySelectorAll('[data-agency-mission-id]')) {
            const mission = missionsById.get(card.dataset.agencyMissionId);
            if (!mission) continue;
            const countdown = card.querySelector('[data-agency-countdown]');
            const progress = card.querySelector('[data-agency-progress]');
            if (countdown) countdown.textContent = mission.remainingLabel;
            if (progress) {
                progress.value = mission.progressPercent;
                progress.setAttribute('aria-label', `${mission.title}: ${mission.progressPercent}%`);
            }
        }
    }

    function handleAction(event) {
        const tab = event.target.closest('[data-agency-section]');
        if (tab) { selectSection(tab.dataset.agencySection); return; }
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
        else if (action.dataset.agencyAction === 'configure') openSetup(action.dataset.operationId);
        else if (action.dataset.agencyAction === 'cancel') dismissSetup();
        else if (action.dataset.agencyAction === 'launch') {
            const launched = onLaunch({ operationId: selectedOperationId, ...choices });
            if (launched) {
                elements.setup.hidden = true;
                selectedOperationId = null;
                selectSection('probes');
                const probeTab = elements.tabs.find((candidate) => candidate.dataset.agencySection === 'probes');
                probeTab?.focus();
                elements.announcer.textContent = i18n.t('game.agency.launched');
            }
        } else if (action.dataset.agencyAction === 'collect') {
            if (onCollect(action.dataset.reportId)) elements.announcer.textContent = i18n.t('game.agency.collected');
        } else if (action.dataset.agencyAction === 'campaign') {
            close();
            onOpenCampaign();
        }
    }

    function handleTabKeydown(event) {
        const currentTab = event.target.closest?.('[data-agency-section]');
        const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (!currentTab || !navigationKeys.includes(event.key)) return;
        const currentIndex = elements.tabs.indexOf(currentTab);
        const forwards = event.key === 'ArrowRight' || event.key === 'ArrowDown';
        const nextIndex = event.key === 'Home'
            ? 0
            : event.key === 'End'
                ? elements.tabs.length - 1
                : (currentIndex + (forwards ? 1 : -1) + elements.tabs.length) % elements.tabs.length;
        const nextTab = elements.tabs[nextIndex];
        event.preventDefault();
        selectSection(nextTab.dataset.agencySection);
        nextTab.focus();
    }

    function handleCancel(event) {
        event.preventDefault();
        close();
    }

    elements.trigger.addEventListener('click', open);
    elements.dialog.addEventListener('click', handleAction);
    elements.dialog.addEventListener('keydown', handleTabKeydown);
    elements.dialog.addEventListener('cancel', handleCancel);
    const unbindBackdrop = bindBackdropDismiss(elements.dialog, close);
    const unsubscribe = i18n.subscribe(render);

    return Object.freeze({
        elements,
        open,
        close,
        update,
        tick,
        selectSection,
        destroy() {
            elements.trigger.removeEventListener('click', open);
            elements.dialog.removeEventListener('click', handleAction);
            elements.dialog.removeEventListener('keydown', handleTabKeydown);
            elements.dialog.removeEventListener('cancel', handleCancel);
            unbindBackdrop();
            unsubscribe();
        }
    });
}
