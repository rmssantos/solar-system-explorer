export const LEARNING_SECTIONS = Object.freeze(['discover', 'measure', 'today', 'challenge']);

function freezeQuiz(quiz) {
    return Object.freeze({ ...quiz });
}

function freezeState(state) {
    return Object.freeze({
        ...state,
        quiz: freezeQuiz(state.quiz),
        discoveredKeys: Object.freeze([...state.discoveredKeys]),
        completedQuizIds: Object.freeze([...state.completedQuizIds]),
        dataByObject: Object.freeze({ ...state.dataByObject })
    });
}

function idleQuiz(attempts = 0) {
    return {
        status: 'idle',
        selectedIndex: null,
        attempts,
        explanation: null,
        quizId: null
    };
}

export function createLearningState({ discoveredKeys = [], completedQuizIds = [] } = {}) {
    return freezeState({
        objectKey: null,
        section: 'discover',
        quiz: idleQuiz(),
        discoveredKeys: [...new Set(discoveredKeys)],
        completedQuizIds: [...new Set(completedQuizIds)],
        dataByObject: {}
    });
}

export function openLearningRecord(state, objectKey) {
    if (!objectKey) return state;
    return freezeState({
        ...state,
        objectKey,
        section: 'discover',
        quiz: idleQuiz(),
        discoveredKeys: [...new Set([...state.discoveredKeys, objectKey])]
    });
}

export function selectLearningSection(state, section) {
    if (!LEARNING_SECTIONS.includes(section) || section === state.section) return state;
    return freezeState({ ...state, section });
}

export function answerLearningQuiz(state, quiz, selectedIndex) {
    if (!quiz || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= quiz.options.length) {
        return state;
    }
    const correct = selectedIndex === quiz.correctIndex;
    const completedQuizIds = correct
        ? [...new Set([...state.completedQuizIds, quiz.id])]
        : state.completedQuizIds;
    return freezeState({
        ...state,
        quiz: {
            status: correct ? 'correct' : 'wrong',
            selectedIndex,
            attempts: state.quiz.attempts + 1,
            explanation: quiz.explanation,
            quizId: quiz.id
        },
        completedQuizIds
    });
}

export function retryLearningQuiz(state) {
    if (state.quiz.status !== 'wrong') return state;
    return freezeState({ ...state, quiz: idleQuiz(state.quiz.attempts) });
}

export function setLearningDataEnvelope(state, objectKey, envelope) {
    const validStatus = ['live', 'cached', 'fallback'].includes(envelope?.status);
    const validSource = typeof envelope?.source?.name === 'string' && typeof envelope?.source?.url === 'string';
    const validTimestamp = typeof envelope?.updatedAt === 'string' && !Number.isNaN(Date.parse(envelope.updatedAt));
    const validData = envelope?.data && typeof envelope.data === 'object';
    if (!objectKey || !validStatus || !validSource || !validTimestamp || !validData) return state;

    const normalized = Object.freeze({
        status: envelope.status,
        source: Object.freeze({ name: envelope.source.name, url: envelope.source.url }),
        updatedAt: new Date(envelope.updatedAt).toISOString(),
        data: Object.freeze({ ...envelope.data })
    });
    return freezeState({
        ...state,
        dataByObject: { ...state.dataByObject, [objectKey]: normalized }
    });
}
