function freezeStyle(style) {
    return Object.freeze({
        ...style,
        surfaceColors: Object.freeze([...style.surfaceColors]),
        features: Object.freeze(style.features)
    });
}

export const PLANET_STYLES = Object.freeze({
    sun: freezeStyle({
        key: 'sun',
        radius: 1.72,
        geometryDetail: 2,
        seed: 31,
        surfaceColors: ['#e3a63b', '#f0c65f', '#c97832', '#f5d77c'],
        outlineColor: '#28170f',
        rimColor: '#9d5a2c',
        outlineScale: 1.045,
        paperRimScale: 1.025,
        emissive: '#9a571f',
        emissiveIntensity: 0.32,
        features: Object.freeze({
            corona: Object.freeze({ count: 14, innerRadius: 1.93, outerRadius: 2.18 })
        })
    }),
    earth: freezeStyle({
        key: 'earth',
        radius: 1.42,
        geometryDetail: 2,
        seed: 47,
        surfaceColors: ['#4f8298', '#5d91a5', '#6f9064', '#86a276', '#e5e1d2'],
        outlineColor: '#132633',
        rimColor: '#315d6e',
        outlineScale: 1.045,
        paperRimScale: 1.022,
        emissive: '#1e4657',
        emissiveIntensity: 0.08,
        features: Object.freeze({
            landPlates: Object.freeze({ count: 9, minScale: 0.22, maxScale: 0.46 }),
            clouds: Object.freeze({ count: 4, minScale: 0.2, maxScale: 0.38 }),
            polarCaps: Object.freeze({ count: 2 })
        })
    }),
    saturn: freezeStyle({
        key: 'saturn',
        radius: 1.48,
        geometryDetail: 2,
        seed: 63,
        surfaceColors: ['#caa36d', '#dfbd82', '#ad795c', '#ead39b'],
        outlineColor: '#2b211d',
        rimColor: '#8f654b',
        outlineScale: 1.045,
        paperRimScale: 1.022,
        emissive: '#5e4431',
        emissiveIntensity: 0.05,
        features: Object.freeze({
            rings: Object.freeze({
                innerRadius: 1.78,
                outerRadius: 2.72,
                segments: 48,
                tilt: 1.03
            })
        })
    })
});

function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        return value / 4294967296;
    };
}

export function createSeededDirections(seed, count) {
    const random = seededRandom(seed);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const phase = random() * Math.PI * 2;
    return Array.from({ length: count }, (_, index) => {
        const y = 1 - ((index + 0.5) / count) * 2;
        const radial = Math.sqrt(Math.max(0, 1 - y * y));
        const angle = phase + index * goldenAngle + (random() - 0.5) * 0.22;
        const direction = {
            x: Math.cos(angle) * radial,
            y,
            z: Math.sin(angle) * radial
        };
        const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
        return {
            x: direction.x / length,
            y: direction.y / length,
            z: direction.z / length
        };
    });
}
