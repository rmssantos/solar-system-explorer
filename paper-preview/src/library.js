import { paperI18n } from './i18n/paperI18n.js';
import { createLibraryCatalog, filterLibraryCatalog, summarizeLibrary } from './library/libraryCatalog.js';
import { evaluateMissions } from './missions/missionSystem.js';
import { loadProgress, saveProgress } from './missions/progressStore.js';
import {
    AWARD_CATALOG,
    createExpeditionProgress,
    evaluateAwards,
    reconcileExpeditionProgress
} from './progression/expeditionProgress.js';
import { presentProgress } from './progression/progressPresentation.js';
import { getAwardArt } from './progression/awardArt.js';
import { bindBackdropDismiss } from './ui/dialogDismiss.js';
import { siteAnalytics } from './analytics/siteAnalytics.js';
import { providerFamily, resultCountBucket } from './analytics/eventCatalog.js';
import { mountBuildInfo } from './buildInfo.js';
import { createMediaViewer } from './ui/mediaViewer.js';

/** DOM selectors are runtime-validated by the page structure tests. @type {any} */
const document = globalThis.document;

const elements = {
    languageToggle: document.querySelector('[data-language-toggle]'),
    search: document.querySelector('#library-search'),
    categoryButtons: [...document.querySelectorAll('[data-library-category]')],
    discoveryFilter: document.querySelector('#library-discovery-filter'),
    grid: document.querySelector('#library-grid'),
    empty: document.querySelector('#library-empty'),
    resultsStatus: document.querySelector('#library-results-status'),
    rank: document.querySelector('#library-rank'),
    xp: document.querySelector('#library-xp'),
    progress: document.querySelector('#library-progress'),
    discovered: document.querySelector('#library-discovered'),
    quizzes: document.querySelector('#library-quizzes'),
    awardCount: document.querySelector('#library-award-count'),
    awards: document.querySelector('#library-awards'),
    detail: document.querySelector('#library-detail'),
    detailClose: document.querySelector('#detail-close'),
    detailType: document.querySelector('#detail-type'),
    detailTitle: document.querySelector('#detail-title'),
    detailStamp: document.querySelector('#detail-discovery-stamp'),
    detailPhoto: document.querySelector('#detail-photo'),
    detailPhotoOpen: document.querySelector('#detail-photo-open'),
    detailPhotoCaption: document.querySelector('#detail-photo-caption'),
    detailSource: document.querySelector('#detail-source'),
    detailFact: document.querySelector('#detail-fact'),
    detailComparison: document.querySelector('#detail-comparison'),
    detailWow: document.querySelector('#detail-wow'),
    detailMeasurements: document.querySelector('#detail-measurements'),
    quiz: document.querySelector('#library-quiz'),
    quizQuestion: document.querySelector('#library-quiz-question'),
    quizOptions: document.querySelector('#library-quiz-options'),
    quizFeedback: document.querySelector('#library-quiz-feedback'),
    mediaViewer: document.querySelector('#media-viewer')
};

let progress = loadProgress();
/** @type {ReadonlyArray<any>} */
let catalog = [];
let activeCategory = 'all';
let activeKey = null;
let wrongQuizIndex = null;
let quizAttempts = 0;
let visibleResultCount = 0;
let searchTimer = null;

const mediaViewer = createMediaViewer(elements.mediaViewer, {
    onImageOpen: (media) => siteAnalytics.track('image_open', { objectKey: media.objectKey, surface: 'library' }),
    onSourceOpen: (media) => siteAnalytics.track('source_open', {
        objectKey: media.objectKey,
        provider: providerFamily(media.source?.name),
        surface: 'library'
    })
});

function progressSnapshot() {
    const missions = evaluateMissions(progress, paperI18n.language);
    return {
        discoveredKeys: progress.discoveredKeys,
        completedQuizIds: progress.completedQuizIds,
        completedMissionIds: [...missions.completedIds],
        seenSurpriseIds: progress.seenSurpriseIds
    };
}

function reconcileProgress() {
    const expedition = reconcileExpeditionProgress(createExpeditionProgress(progress), progressSnapshot());
    progress = { ...progress, ...expedition };
    saveProgress(progress);
}

function localizedAward(award) {
    return paperI18n.language === 'en'
        ? { ...award, title: award.titleEn, description: award.descriptionEn }
        : award;
}

function renderLanguage() {
    paperI18n.apply();
    elements.languageToggle.textContent = paperI18n.language === 'pt' ? 'EN' : 'PT';
    elements.languageToggle.setAttribute('aria-label', paperI18n.t('shared.switchTo'));
    elements.search.placeholder = paperI18n.t('library.search.placeholder');
}

function renderProgress() {
    const snapshot = progressSnapshot();
    const view = presentProgress(progress, snapshot, paperI18n.language);
    const summary = summarizeLibrary(catalog);
    const awards = evaluateAwards(snapshot, paperI18n.language);
    elements.rank.textContent = paperI18n.t('game.level', { level: view.level, title: view.title });
    elements.xp.textContent = `${view.xp} XP`;
    elements.progress.value = view.progressPercent;
    elements.discovered.textContent = `${summary.discovered} / ${summary.total}`;
    elements.quizzes.textContent = String(summary.quizzesCompleted);
    elements.awardCount.textContent = `${awards.length} / ${AWARD_CATALOG.length}`;
}

function makeCard(record) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `library-card${record.discovered ? ' is-discovered' : ''}`;
    card.dataset.libraryKey = record.key;
    card.setAttribute('aria-label', `${paperI18n.t('library.card.open')} ${record.name}`);
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = record.photo;
    image.alt = '';
    image.width = 720;
    image.height = 480;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
        if (!image.src.endsWith('/art/step-discover.webp')) image.src = '/art/step-discover.webp';
    }, { once: true });
    const stamp = document.createElement('span');
    stamp.className = 'library-card-status';
    stamp.textContent = paperI18n.t(record.discovered ? 'library.card.discovered' : 'library.card.undiscovered');
    figure.append(image, stamp);
    const copy = document.createElement('span');
    copy.className = 'library-card-copy';
    const type = document.createElement('small');
    type.textContent = record.type;
    const title = document.createElement('strong');
    title.textContent = record.name;
    const fact = document.createElement('p');
    fact.textContent = record.fact;
    const open = document.createElement('span');
    open.textContent = paperI18n.t('library.card.open');
    copy.append(type, title, fact, open);
    card.append(figure, copy);
    return card;
}

function renderCatalog() {
    const visible = filterLibraryCatalog(catalog, {
        query: elements.search.value,
        category: activeCategory,
        discovery: elements.discoveryFilter.value
    });
    visibleResultCount = visible.length;
    elements.grid.replaceChildren(...visible.map(makeCard));
    elements.empty.hidden = visible.length !== 0;
    elements.resultsStatus.textContent = visible.length === 1
        ? paperI18n.t('library.results.one')
        : paperI18n.t('library.results', { count: visible.length });
}

function renderAwards() {
    const unlocked = new Set(evaluateAwards(progressSnapshot(), paperI18n.language).map((award) => award.id));
    elements.awards.replaceChildren(...AWARD_CATALOG.map((source) => {
        const award = localizedAward(source);
        const earned = unlocked.has(award.id);
        const card = document.createElement('article');
        card.className = `library-award${earned ? ' is-unlocked' : ''}${award.kind === 'trophy' ? ' is-trophy' : ''}`;
        const stamp = document.createElement('span');
        stamp.className = 'library-award-stamp';
        stamp.textContent = paperI18n.t(earned ? 'library.award.unlocked' : 'library.award.locked');
        const image = document.createElement('img');
        image.src = getAwardArt(award.id);
        image.alt = '';
        image.width = 180;
        image.height = 180;
        image.loading = 'lazy';
        const title = document.createElement('strong');
        title.textContent = award.title;
        const description = document.createElement('small');
        description.textContent = award.description;
        card.append(stamp, image, title, description);
        return card;
    }));
}

function formatNumber(value) {
    return new Intl.NumberFormat(paperI18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(value);
}

function measurementItems(record) {
    const measure = record.measurements;
    return [
        ['library.measure.radius', measure.radiusKm ? `${formatNumber(measure.radiusKm)} km` : '—'],
        ['library.measure.distance', measure.distanceMillionKm ? `${formatNumber(measure.distanceMillionKm)} M km` : (record.key === 'sun' ? '0 km' : '—')],
        ['library.measure.day', measure.dayLength],
        ['library.measure.year', measure.yearLength],
        ['library.measure.temperature', measure.temperature],
        ['library.measure.moons', formatNumber(measure.moonCount)]
    ];
}

function renderMeasurements(record) {
    elements.detailMeasurements.replaceChildren(...measurementItems(record).map(([labelKey, value]) => {
        const group = document.createElement('div');
        const term = document.createElement('dt');
        term.textContent = paperI18n.t(labelKey);
        const description = document.createElement('dd');
        description.textContent = value;
        group.append(term, description);
        return group;
    }));
}

function renderQuiz(record) {
    const quiz = record.quizzes[0] ?? null;
    elements.quizOptions.replaceChildren();
    elements.quizFeedback.hidden = true;
    if (!quiz) {
        elements.quizQuestion.textContent = paperI18n.t('library.detail.noQuiz');
        return;
    }
    const completed = progress.completedQuizIds.includes(quiz.id);
    elements.quizQuestion.textContent = quiz.question;
    quiz.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.libraryQuizIndex = String(index);
        button.textContent = option;
        button.disabled = completed;
        if (completed && index === quiz.correctIndex) button.classList.add('is-correct');
        if (wrongQuizIndex === index) button.classList.add('is-wrong');
        elements.quizOptions.append(button);
    });
    if (completed) {
        elements.quizFeedback.textContent = paperI18n.t('library.quiz.completed');
        elements.quizFeedback.hidden = false;
    }
}

function renderDetail(record) {
    if (!record) return;
    elements.detailType.textContent = record.type;
    elements.detailTitle.textContent = record.name;
    elements.detailStamp.textContent = paperI18n.t(record.discovered ? 'library.card.discovered' : 'library.card.undiscovered');
    elements.detailPhoto.src = record.photo;
    elements.detailPhoto.alt = paperI18n.t('library.detail.realPhoto', { name: record.name });
    elements.detailPhotoCaption.textContent = paperI18n.t('library.detail.realPhoto', { name: record.name });
    elements.detailSource.textContent = paperI18n.t('library.detail.source');
    elements.detailSource.href = record.source.url;
    elements.detailFact.textContent = record.fact;
    elements.detailComparison.textContent = record.comparison;
    elements.detailWow.textContent = record.wowFacts[0];
    renderMeasurements(record);
    renderQuiz(record);
}

function openDetail(key) {
    const record = catalog.find((candidate) => candidate.key === key);
    if (!record) return;
    activeKey = key;
    wrongQuizIndex = null;
    quizAttempts = 0;
    renderDetail(record);
    elements.detail.showModal();
    siteAnalytics.track('object_open', { objectKey: record.key, category: record.category, surface: 'library' });
}

function closeDetail() {
    if (elements.detail.open) elements.detail.close();
    activeKey = null;
    wrongQuizIndex = null;
}

function rebuild({ preserveDetail = false } = {}) {
    reconcileProgress();
    catalog = createLibraryCatalog({ language: paperI18n.language, progress });
    renderLanguage();
    renderProgress();
    renderCatalog();
    renderAwards();
    if (preserveDetail && activeKey) renderDetail(catalog.find((record) => record.key === activeKey));
}

elements.search.addEventListener('input', () => {
    renderCatalog();
    if (searchTimer) window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => siteAnalytics.track('library_search', {
        resultBucket: resultCountBucket(visibleResultCount),
        category: activeCategory,
        language: paperI18n.language
    }), 500);
});
elements.discoveryFilter.addEventListener('change', () => {
    renderCatalog();
    siteAnalytics.track('library_filter', {
        category: activeCategory,
        discovery: elements.discoveryFilter.value,
        resultBucket: resultCountBucket(visibleResultCount),
        language: paperI18n.language
    });
});
elements.categoryButtons.forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.libraryCategory;
    elements.categoryButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    renderCatalog();
    siteAnalytics.track('library_filter', {
        category: activeCategory,
        discovery: elements.discoveryFilter.value,
        resultBucket: resultCountBucket(visibleResultCount),
        language: paperI18n.language
    });
}));
elements.grid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-library-key]');
    if (card) openDetail(card.dataset.libraryKey);
});
elements.detailClose.addEventListener('click', closeDetail);
elements.detailPhotoOpen.addEventListener('click', () => {
    const record = catalog.find((candidate) => candidate.key === activeKey);
    if (!record) return;
    mediaViewer.open({
        objectKey: record.key,
        src: record.photo,
        alt: paperI18n.t('library.detail.realPhoto', { name: record.name }),
        caption: elements.detailPhotoCaption.textContent,
        source: record.source,
        trigger: elements.detailPhotoOpen
    });
});
elements.detailSource.addEventListener('click', () => {
    const record = catalog.find((candidate) => candidate.key === activeKey);
    if (record) siteAnalytics.track('source_open', {
        objectKey: record.key,
        provider: providerFamily(record.source.name),
        surface: 'library'
    });
});
elements.detail.addEventListener('cancel', (event) => { event.preventDefault(); closeDetail(); });
bindBackdropDismiss(elements.detail, closeDetail);
elements.quizOptions.addEventListener('click', (event) => {
    const button = event.target.closest('[data-library-quiz-index]');
    const record = catalog.find((candidate) => candidate.key === activeKey);
    const quiz = record?.quizzes[0];
    if (!button || !quiz || progress.completedQuizIds.includes(quiz.id)) return;
    const selected = Number(button.dataset.libraryQuizIndex);
    quizAttempts += 1;
    const attemptBucket = quizAttempts >= 3 ? '3+' : String(quizAttempts);
    if (selected !== quiz.correctIndex) {
        siteAnalytics.track('quiz_result', { quizId: quiz.id, correct: false, attemptBucket });
        wrongQuizIndex = selected;
        renderQuiz(record);
        elements.quizFeedback.textContent = `${paperI18n.t('library.quiz.wrong')} ${quiz.explanation}`;
        elements.quizFeedback.hidden = false;
        return;
    }
    progress = { ...progress, completedQuizIds: [...new Set([...progress.completedQuizIds, quiz.id])] };
    siteAnalytics.track('quiz_result', { quizId: quiz.id, correct: true, attemptBucket });
    wrongQuizIndex = null;
    rebuild({ preserveDetail: true });
    elements.quizFeedback.textContent = `${paperI18n.t('library.quiz.correct')} ${quiz.explanation}`;
    elements.quizFeedback.hidden = false;
});
elements.languageToggle.addEventListener('click', () => {
    paperI18n.toggle();
    siteAnalytics.track('language_change', { language: paperI18n.language, surface: 'library' });
});
paperI18n.subscribe(() => rebuild({ preserveDetail: elements.detail.open }));

rebuild();
mountBuildInfo();
siteAnalytics.start('library');
