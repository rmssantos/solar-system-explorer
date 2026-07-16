import { describe, expect, it } from 'vitest';
import { createPaperI18n, PAPER_TRANSLATIONS } from '../paper-preview/src/i18n/paperI18n.js';
import { createPaperLearningCatalog } from '../paper-preview/src/learning/learningCatalog.js';
import { evaluateMissions } from '../paper-preview/src/missions/missionSystem.js';
import { getLocalizedSurprise } from '../paper-preview/src/surprises/surpriseDirector.js';
import { evaluateAwards } from '../paper-preview/src/progression/expeditionProgress.js';

describe('Paper Solar Explorer PT/EN i18n', () => {
    it('covers the critical homepage and game surfaces in both languages', () => {
        const required = [
            'home.hero.title', 'home.steps.fly', 'home.steps.discover', 'home.steps.learn', 'home.steps.collect',
            'game.objective.kicker', 'game.notebook', 'game.tabs.discover', 'game.passport.missions',
            'game.collection.locked', 'game.quiz.correct', 'game.lumi.kicker',
            'game.contract.iss.title', 'game.contract.iss.accept', 'game.contract.iss.start',
            'game.docking.scale', 'game.docking.guidance', 'game.docking.keys', 'game.docking.stabilize',
            'game.docking.success', 'game.docking.retry', 'game.docking.loadError'
        ];
        for (const language of ['pt', 'en']) {
            for (const key of required) expect(PAPER_TRANSLATIONS[language][key], `${language}:${key}`).toBeTruthy();
        }
    });

    it('persists language and updates the document language', () => {
        const values = new Map();
        const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
        const document = { documentElement: { lang: '' }, querySelectorAll: () => [] };
        const i18n = createPaperI18n({ storage, document });
        i18n.setLanguage('en');
        expect(values.get('paperSolarExplorer:language')).toBe('en');
        expect(document.documentElement.lang).toBe('en');
        expect(i18n.t('game.notebook')).toBe('Notebook');
    });

    it('localizes learning, missions, awards and surprises rather than only the shell', () => {
        const catalog = createPaperLearningCatalog('en');
        expect(catalog.earth.name).toBe('Earth');
        expect(catalog.earth.fact).toMatch(/life|water/i);
        expect(catalog.moon.name).toBe('Moon');
        expect(catalog.moon.fact).toMatch(/Earth|humans/i);
        expect(catalog.earth.quizzes[0].question).toMatch(/Solar System|water|Earth/i);

        expect(evaluateMissions({}, 'en').active.title).toBe('Route of the Rings');
        expect(getLocalizedSurprise('paper-comet', 'en').title).toMatch(/sky|comet/i);
        const awards = evaluateAwards({ discoveredKeys: ['sun'] }, 'en');
        expect(awards[0].title).toBe('First light');
    });

    it('uses singular result copy for one library record', () => {
        const i18n = createPaperI18n({ storage: null, document: null });
        expect(i18n.t('library.results.one')).toBe('1 objeto');
        i18n.setLanguage('en');
        expect(i18n.t('library.results.one')).toBe('1 object');
    });
});
