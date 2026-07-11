function createSeededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        return value / 4294967296;
    };
}

export function createPaperProfile({ seed, segments, jitter }) {
    const pointCount = Math.max(3, Math.floor(segments));
    const edgeJitter = Math.max(0, jitter);
    const random = createSeededRandom(seed);

    return Array.from({ length: pointCount }, (_, index) => {
        const angle = (index / pointCount) * Math.PI * 2;
        const radius = 1 + ((random() * 2) - 1) * edgeJitter;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    });
}
