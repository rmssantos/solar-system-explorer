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
    mercury: freezeStyle({
        key: 'mercury', radius: 0.78, geometryDetail: 2, seed: 37,
        surfaceColors: ['#928b7e', '#b0a797', '#716d68', '#c7baa7'],
        outlineColor: '#292725', rimColor: '#665f56', outlineScale: 1.055,
        paperRimScale: 1.028, emissive: '#302b26', emissiveIntensity: 0.03,
        features: Object.freeze({ craters: Object.freeze({ count: 7 }) })
    }),
    venus: freezeStyle({
        key: 'venus', radius: 1.12, geometryDetail: 2, seed: 41,
        surfaceColors: ['#d8a85d', '#e8c47c', '#b97845', '#f0d596'],
        outlineColor: '#35251c', rimColor: '#9d683f', outlineScale: 1.048,
        paperRimScale: 1.024, emissive: '#63401f', emissiveIntensity: 0.05,
        features: Object.freeze({ cloudBands: true })
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
    mars: freezeStyle({
        key: 'mars', radius: 0.94, geometryDetail: 2, seed: 53,
        surfaceColors: ['#b85f42', '#cf7956', '#8f493a', '#dfa078', '#e5d9c7'],
        outlineColor: '#321e1a', rimColor: '#7d4335', outlineScale: 1.05,
        paperRimScale: 1.025, emissive: '#4a251f', emissiveIntensity: 0.03,
        features: Object.freeze({ craters: Object.freeze({ count: 5 }), polarCaps: Object.freeze({ count: 2 }) })
    }),
    jupiter: freezeStyle({
        key: 'jupiter', radius: 1.7, geometryDetail: 2, seed: 59,
        surfaceColors: ['#d5b38a', '#ead7b2', '#ae7357', '#c88f69', '#f1e5cd'],
        outlineColor: '#30241e', rimColor: '#8e674e', outlineScale: 1.04,
        paperRimScale: 1.02, emissive: '#4e382c', emissiveIntensity: 0.03,
        features: Object.freeze({ bands: true, greatSpot: true })
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
    }),
    uranus: freezeStyle({
        key: 'uranus', radius: 1.28, geometryDetail: 2, seed: 71,
        surfaceColors: ['#85c4c3', '#a9d8d2', '#6aa6ad', '#c3e4dc'],
        outlineColor: '#173238', rimColor: '#4d8488', outlineScale: 1.045,
        paperRimScale: 1.022, emissive: '#28585d', emissiveIntensity: 0.05,
        features: Object.freeze({ rings: Object.freeze({ innerRadius: 1.55, outerRadius: 2.02, segments: 40, tilt: 1.32 }) })
    }),
    neptune: freezeStyle({
        key: 'neptune', radius: 1.24, geometryDetail: 2, seed: 79,
        surfaceColors: ['#426ea8', '#547fb9', '#31578f', '#7397c4'],
        outlineColor: '#152442', rimColor: '#284d78', outlineScale: 1.045,
        paperRimScale: 1.022, emissive: '#173c6a', emissiveIntensity: 0.09,
        features: Object.freeze({ bands: true, greatSpot: true })
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
