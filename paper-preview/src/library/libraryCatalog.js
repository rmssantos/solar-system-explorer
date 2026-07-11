import { createPaperLearningCatalog } from '../learning/learningCatalog.js';
import { WORLD_OBJECTS } from '../world/worldCatalog.js';

function categoryFor(type) {
    if (type === 'star' || type === 'planet') return 'worlds';
    if (type === 'moon') return 'moons';
    if (type === 'spacecraft') return 'human';
    return 'small-bodies';
}

export function createLibraryCatalog({ language = 'pt', progress = {} } = {}) {
    const learning = createPaperLearningCatalog(language);
    const discoveries = new Set(progress.discoveredKeys ?? []);
    const completedQuizzes = new Set(progress.completedQuizIds ?? []);
    return Object.freeze(WORLD_OBJECTS.map((object) => {
        const record = learning[object.key];
        return Object.freeze({
            key: object.key,
            name: record.name,
            type: record.type,
            category: categoryFor(object.type),
            parentKey: object.parentKey ?? null,
            fact: record.fact,
            comparison: record.comparison,
            photo: record.localPhoto,
            source: record.photoSource,
            measurements: record.measurements,
            wowFacts: record.wowFacts,
            quizzes: record.quizzes,
            discovered: discoveries.has(object.key),
            quizCompleted: record.quizzes.some((quiz) => completedQuizzes.has(quiz.id))
        });
    }));
}

function normalizeSearch(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

export function filterLibraryCatalog(catalog = [], { query = '', category = 'all', discovery = 'all' } = {}) {
    const needle = normalizeSearch(query).trim();
    return Object.freeze(catalog.filter((card) => {
        if (category !== 'all' && card.category !== category) return false;
        if (discovery === 'discovered' && !card.discovered) return false;
        if (discovery === 'undiscovered' && card.discovered) return false;
        if (!needle) return true;
        return normalizeSearch(`${card.name} ${card.type} ${card.fact}`).includes(needle);
    }));
}

export function summarizeLibrary(catalog = []) {
    const discovered = catalog.filter((card) => card.discovered).length;
    return Object.freeze({
        total: catalog.length,
        discovered,
        quizzesCompleted: catalog.filter((card) => card.quizCompleted).length,
        discoveryPercent: catalog.length ? Math.round((discovered / catalog.length) * 100) : 0
    });
}
