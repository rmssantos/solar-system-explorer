export const SATELLITE_FALLBACKS = Object.freeze({
    iss: Object.freeze({
        name: 'ISS (ZARYA)', catalogNumber: 25544, epoch: '2026-07-01T00:00:00.000Z',
        meanMotion: 15.49, eccentricity: 0.0005, inclinationDeg: 51.64,
        rightAscensionDeg: 210.4, argumentPerigeeDeg: 86.2, meanAnomalyDeg: 34.8, bstar: 0.00012
    }),
    hubble: Object.freeze({
        name: 'Hubble Space Telescope', catalogNumber: 20580, epoch: '2026-07-01T00:00:00.000Z',
        meanMotion: 15.09, eccentricity: 0.0003, inclinationDeg: 28.47,
        rightAscensionDeg: 118.2, argumentPerigeeDeg: 71.4, meanAnomalyDeg: 288.6, bstar: 0.00003
    })
});
