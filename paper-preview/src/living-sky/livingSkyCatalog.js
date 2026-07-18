export const OBSERVATION_FILTERS = Object.freeze(['visible', 'infrared', 'magnetic']);

const NASA_SOURCES = Object.freeze({
    aurora: Object.freeze({ name: 'NASA Science · Auroras', url: 'https://science.nasa.gov/sun/auroras/' }),
    io: Object.freeze({ name: 'NASA Science · Io in front of Jupiter', url: 'https://science.nasa.gov/resource/io-in-front-of-jupiter/' }),
    mars: Object.freeze({ name: 'NASA Science · Dust storms on Mars', url: 'https://science.nasa.gov/solar-system/planets/mars/10-things-massive-dust-storm-on-mars/' }),
    halley: Object.freeze({ name: 'NASA Science · 1P/Halley', url: 'https://science.nasa.gov/solar-system/comets/1p-halley/' })
});

function event(value) {
    return Object.freeze({
        ...value,
        art: `/art/living-sky/${value.id}.webp`,
        distanceRange: Object.freeze([...value.distanceRange]),
        schedule: Object.freeze({ ...value.schedule }),
        source: Object.freeze({ ...value.source }),
        copy: Object.freeze({
            pt: Object.freeze({ ...value.copy.pt }),
            en: Object.freeze({ ...value.copy.en })
        })
    });
}

export const LIVING_SKY_EVENTS = Object.freeze([
    event({
        id: 'earth-aurora', targetKey: 'earth', companionKey: null, visual: 'aurora',
        preferredFilter: 'magnetic', rewardXp: 80, distanceRange: [4, 15],
        schedule: { epochMs: Date.parse('2026-07-18T00:00:00Z'), periodDays: 27, durationDays: 2.5 },
        source: NASA_SOURCES.aurora,
        copy: {
            pt: {
                kicker: 'Clima espacial', title: 'Aurora da Terra', short: 'Partículas do Sol encontram o escudo magnético da Terra.',
                objective: 'Enquadra os polos e usa Campo magnético para revelar o caminho das partículas.',
                discovery: 'As partículas energéticas seguem o campo magnético e fazem gases da atmosfera brilhar.',
                simulationNote: 'Janela recorrente simulada no diorama; não é uma previsão real de auroras.'
            },
            en: {
                kicker: 'Space weather', title: 'Earth aurora', short: 'Particles from the Sun meet Earth’s magnetic shield.',
                objective: 'Frame the poles and use Magnetic field to reveal the particles’ path.',
                discovery: 'Energetic particles follow the magnetic field and make gases in the atmosphere glow.',
                simulationNote: 'Recurring window simulated in the diorama; this is not a real aurora forecast.'
            }
        }
    }),
    event({
        id: 'io-shadow-transit', targetKey: 'jupiter', companionKey: 'io', visual: 'moon-shadow',
        preferredFilter: 'visible', rewardXp: 90, distanceRange: [5, 18],
        schedule: { epochMs: Date.parse('2026-07-20T03:00:00Z'), periodDays: 1.769, durationDays: 0.2 },
        source: NASA_SOURCES.io,
        copy: {
            pt: {
                kicker: 'Eclipse noutro mundo', title: 'A sombra de Io', short: 'Io atravessa a luz do Sol e desenha uma sombra nas nuvens de Júpiter.',
                objective: 'Segue o ponto escuro sobre Júpiter com Luz visível.',
                discovery: 'Tal como a Lua num eclipse solar, Io pode projetar a sua sombra sobre o planeta.',
                simulationNote: 'Trânsito simulado com períodos comprimidos para o diorama.'
            },
            en: {
                kicker: 'Eclipse on another world', title: 'Io’s shadow', short: 'Io crosses the sunlight and draws a shadow on Jupiter’s clouds.',
                objective: 'Follow the dark spot across Jupiter with Visible light.',
                discovery: 'Like our Moon during a solar eclipse, Io can cast its shadow on the planet.',
                simulationNote: 'Transit simulated with periods compressed for the diorama.'
            }
        }
    }),
    event({
        id: 'mars-dust-front', targetKey: 'mars', companionKey: null, visual: 'dust-front',
        preferredFilter: 'infrared', rewardXp: 100, distanceRange: [4, 15],
        schedule: { epochMs: Date.parse('2027-01-12T00:00:00Z'), periodDays: 686.98, durationDays: 35 },
        source: NASA_SOURCES.mars,
        copy: {
            pt: {
                kicker: 'Meteorologia marciana', title: 'A frente de poeira', short: 'Poeira fina sobe e esconde parte da superfície de Marte.',
                objective: 'Usa Infravermelho para comparar calor e poeira mesmo quando o solo fica escondido.',
                discovery: 'Orbitadores acompanham poeira e temperatura para perceber como a tempestade cresce.',
                simulationNote: 'Época de tempestade simulada no diorama; não representa o tempo atual em Marte.'
            },
            en: {
                kicker: 'Martian weather', title: 'The dust front', short: 'Fine dust rises and hides part of Mars’s surface.',
                objective: 'Use Infrared to compare heat and dust even when the ground is hidden.',
                discovery: 'Orbiters track dust and temperature to understand how a storm grows.',
                simulationNote: 'Storm season simulated in the diorama; it does not represent current weather on Mars.'
            }
        }
    }),
    event({
        id: 'halley-2061', targetKey: 'halley', companionKey: null, visual: 'comet-tails',
        preferredFilter: 'visible', rewardXp: 120, distanceRange: [3, 13],
        schedule: { epochMs: Date.parse('2061-06-01T00:00:00Z'), periodDays: 27_759, durationDays: 120 },
        source: NASA_SOURCES.halley,
        copy: {
            pt: {
                kicker: 'Visitante gelado', title: 'O regresso do Halley', short: 'O cometa aquece perto do Sol e abre duas caudas diferentes.',
                objective: 'Usa Luz visível e enquadra o núcleo com as duas caudas.',
                discovery: 'A poeira forma uma cauda curva; o vento solar empurra os iões numa cauda mais direita.',
                simulationNote: 'Regresso de 2061 representado numa órbita e escala simuladas no diorama.'
            },
            en: {
                kicker: 'Icy visitor', title: 'Halley returns', short: 'The comet warms near the Sun and opens two different tails.',
                objective: 'Use Visible light and frame the nucleus with both tails.',
                discovery: 'Dust makes a curved tail; the solar wind pushes ions into a straighter tail.',
                simulationNote: 'The 2061 return is shown with a simulated orbit and scale in the diorama.'
            }
        }
    })
]);

const EVENT_BY_ID = new Map(LIVING_SKY_EVENTS.map((item) => [item.id, item]));

export function getLivingSkyEvent(id) {
    return EVENT_BY_ID.get(id) ?? null;
}
