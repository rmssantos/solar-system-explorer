export const AWARD_ART = Object.freeze({
    'first-light': '/art/awards/award-first-light.webp',
    'rings-route': '/art/awards/award-rings-route.webp',
    'inner-cartographer': '/art/awards/award-inner-cartographer.webp',
    'moon-hopper': '/art/awards/award-moon-hopper.webp',
    'human-traces': '/art/awards/award-human-traces.webp',
    'quiz-scholar': '/art/awards/award-quiz-scholar.webp',
    'grand-tour': '/art/awards/award-grand-tour.webp'
});

export function getAwardArt(id) {
    return AWARD_ART[id] ?? null;
}
