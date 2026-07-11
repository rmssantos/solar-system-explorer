export function createEphemerisPresentation({ key, name, distanceKm, language = 'pt' }) {
    if (key === 'sun') {
        return Object.freeze({
            kind: 'reference',
            summary: language === 'en'
                ? 'The Sun is the central reference for this map. Instead of measuring the Sun from itself, this date is used to calculate the positions of the other worlds.'
                : 'O Sol é a referência central deste mapa. Em vez de medir o Sol a partir de si próprio, esta data é usada para calcular as posições dos restantes mundos.'
        });
    }

    const distance = distanceKm / 1_000_000;
    return Object.freeze({
        kind: 'ephemeris',
        summary: language === 'en'
            ? `${name} is about ${distance.toLocaleString('en-GB', { maximumFractionDigits: 1 })} million kilometres from the Sun on this date. This is a calculated JPL ephemeris, not an instant GPS signal.`
            : `${name} está nesta data a cerca de ${distance.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} milhões de quilómetros do Sol. É uma efeméride calculada pelo JPL, não um sinal GPS instantâneo.`
    });
}
