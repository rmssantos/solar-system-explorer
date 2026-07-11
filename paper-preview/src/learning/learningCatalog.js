import { REAL_PHOTOS, SOLAR_SYSTEM_DATA } from '../../../src/data/objectsInfo.js';
import { SOLAR_SYSTEM_DATA_EN } from '../../../src/data/objectsInfoEN.js';
import { createQuizCatalog } from '../../../src/quizSystem.js';
import { WORLD_OBJECTS } from '../world/worldCatalog.js';
import { translateWorldObject } from '../i18n/paperObjectTranslations.js';
import { getObjectPhoto } from './objectPhotoCatalog.js';

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
        const baseSource = SOLAR_SYSTEM_DATA[key];
        const translatedSource = language === 'en' ? SOLAR_SYSTEM_DATA_EN[key] : null;
        const source = translatedSource ? { ...baseSource, ...translatedSource } : baseSource;
        const localPhoto = `/learning/${key}.jpg`;
        records[key] = freezeRecord({
            key,
            name: source.name,
            type: source.type,
            fact: source.trivia[0],
            comparison: source.comparison,
            localPhoto,
            photoSource: Object.freeze({
                name: language === 'en' ? 'NASA/ESA — included photograph' : 'NASA/ESA — fotografia incluída',
                status: 'fallback',
                originalAsset: source.realPhoto ?? REAL_PHOTOS[key],
                url: localPhoto
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

    for (const object of WORLD_OBJECTS) {
        if (records[object.key]) continue;
        const translatedObject = translateWorldObject(object, language);
        const photo = getObjectPhoto(object.key);
        if (!photo) throw new Error(`Missing real-photo catalog entry for ${object.key}`);
        const typeLabels = language === 'en'
            ? { moon: 'Moon', spacecraft: 'Human object', 'small-body': 'Small body' }
            : { moon: 'Lua', spacecraft: 'Objeto humano', 'small-body': 'Pequeno corpo' };
        records[object.key] = freezeRecord({
            key: object.key,
            name: translatedObject.name,
            type: translatedObject.typeLabel ?? typeLabels[object.type] ?? (language === 'en' ? 'Space object' : 'Objeto espacial'),
            fact: translatedObject.fact,
            comparison: object.parentKey
                ? (language === 'en'
                    ? `It is shown beside ${translateWorldObject(WORLD_OBJECTS.find((entry) => entry.key === object.parentKey), 'en')?.name ?? 'its parent world'}. Diorama scales are enlarged for exploration.`
                    : `Encontra-se representado junto de ${WORLD_OBJECTS.find((entry) => entry.key === object.parentKey)?.name ?? 'o seu mundo'}. As escalas do diorama foram ampliadas para ser explorável.`)
                : (language === 'en'
                    ? 'Its visual position is compressed to fit the diorama; the Today tab identifies the data source.'
                    : 'A posição visual é comprimida para caber no diorama; o separador Hoje identifica a origem dos dados.'),
            localPhoto: photo.localPhoto,
            photoSource: Object.freeze({
                name: photo.sourceName,
                status: 'verified',
                originalAsset: photo.sourceUrl,
                url: photo.sourceUrl
            }),
            measurements: {
                radiusKm: 0,
                distanceMillionKm: 0,
                dayLength: language === 'en' ? 'Varies with its orbit' : 'Varia com a órbita',
                yearLength: object.parentKey
                    ? (language === 'en' ? 'Orbits its parent world' : 'Orbita o mundo principal')
                    : (language === 'en' ? 'Independent orbit' : 'Órbita própria'),
                temperature: language === 'en' ? 'Depends on illumination' : 'Depende da iluminação',
                moonCount: 0
            },
            wowFacts: Object.freeze([translatedObject.fact]),
            quizzes: Object.freeze([Object.freeze({
                id: `${object.key}-identity`,
                question: language === 'en' ? `What makes ${translatedObject.name} special?` : `O que torna ${object.name} especial?`,
                options: Object.freeze(language === 'en' ? [
                    translatedObject.fact,
                    'It is a star larger than the Sun.',
                    'It is stationary and never moves through space.'
                ] : [object.fact, 'É uma estrela maior do que o Sol.', 'Está parado e não se move no espaço.']),
                correctIndex: 0,
                explanation: translatedObject.fact
            })])
        });
    }

    return Object.freeze(records);
}
