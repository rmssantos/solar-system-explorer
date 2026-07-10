import { REAL_PHOTOS, SOLAR_SYSTEM_DATA } from '../../../src/data/objectsInfo.js';
import { createQuizCatalog } from '../../../src/quizSystem.js';

export const PAPER_LEARNING_KEYS = Object.freeze([
    'sun',
    'mercury',
    'venus',
    'earth',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune'
]);

function freezeQuiz(quiz, index, key) {
    return Object.freeze({
        id: `${key}-${index}`,
        question: quiz.question,
        options: Object.freeze([...quiz.options]),
        correctIndex: quiz.correct,
        explanation: quiz.explanation
    });
}

function freezeRecord(record) {
    Object.freeze(record.measurements);
    Object.freeze(record.wowFacts);
    Object.freeze(record.quizzes);
    return Object.freeze(record);
}

export function createPaperLearningCatalog(language = 'pt') {
    const quizCatalog = createQuizCatalog();
    const quizzes = quizCatalog[language] ?? quizCatalog.pt;
    const records = {};

    for (const key of PAPER_LEARNING_KEYS) {
        const source = SOLAR_SYSTEM_DATA[key];
        records[key] = freezeRecord({
            key,
            name: source.name,
            type: source.type,
            fact: source.trivia[0],
            comparison: source.comparison,
            localPhoto: source.realPhoto ?? REAL_PHOTOS[key],
            photoSource: Object.freeze({
                name: 'NASA/ESA — fotografia incluída',
                status: 'fallback',
                url: source.realPhoto ?? REAL_PHOTOS[key]
            }),
            measurements: {
                radiusKm: source.radiusKm,
                distanceMillionKm: source.avgDistanceFromSun,
                dayLength: source.dayLength,
                yearLength: source.yearLength,
                temperature: source.avgTemperature,
                moonCount: source.knownMoonCount
            },
            wowFacts: Object.freeze([...source.wowFacts]),
            quizzes: Object.freeze((quizzes[key] ?? []).map((quiz, index) => freezeQuiz(quiz, index, key)))
        });
    }

    return Object.freeze(records);
}
