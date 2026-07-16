const DOCKING_CONTROLS = Object.freeze([
    'forward', 'reverse', 'up', 'down', 'rotate-left', 'rotate-right', 'stabilize'
]);
const FLAT_CONTROLS = Object.freeze(['forward', 'reverse', 'up', 'down', 'stabilize']);

function profile(value) {
    return Object.freeze({
        ...value,
        controls: Object.freeze([...(value.controls ?? DOCKING_CONTROLS)]),
        retryEvents: Object.freeze([...(value.retryEvents ?? [])]),
        initialState: Object.freeze({ ...value.initialState }),
        metrics: Object.freeze(value.metrics.map((metric) => Object.freeze({ ...metric }))),
        copy: Object.freeze({
            pt: Object.freeze({ ...value.copy.pt, metricLabels: Object.freeze([...value.copy.pt.metricLabels]) }),
            en: Object.freeze({ ...value.copy.en, metricLabels: Object.freeze([...value.copy.en.metricLabels]) })
        })
    });
}

const DOCKING_METRICS = Object.freeze([
    { field: 'distance', format: 'distance', safeField: 'corridorSafe' },
    { field: 'relativeSpeed', format: 'speed', safeField: 'speedSafe' },
    { field: 'alignmentDegrees', format: 'degrees', safeField: 'alignmentSafe' }
]);

export const ORBITAL_MISSION_PROFILES = Object.freeze({
    'iss-docking': profile({
        id: 'iss-docking',
        gameplay: 'docking',
        completionEvent: 'docked',
        retryEvents: ['unsafe-contact'],
        target: 'iss',
        driftAcceleration: 0,
        driftFrequency: 0,
        metrics: DOCKING_METRICS,
        initialState: { position: { x: -7, y: 1.35 }, velocity: { x: 0.42, y: 0 }, angle: 0.08 },
        copy: {
            pt: {
                kicker: 'Encomenda orbital · ISS', title: 'Correio para a ISS',
                playfield: 'Aproximação à Estação Espacial Internacional',
                guidance: 'Entra devagar no corredor amarelo e alinha o nariz da nave com a porta da ISS.',
                retry: 'A Lumi afastou a nave em segurança. Reduz a velocidade, estabiliza e tenta novamente.',
                success: 'Encomenda entregue!',
                science: 'A ISS recebe regularmente experiências, alimentos e equipamento através de naves de carga.',
                metricLabels: ['Distância', 'Velocidade relativa', 'Alinhamento'],
                centerControl: 'Estabilizar',
                keyboardHint: 'Teclado: WASD ou setas · Q/E roda · Espaço estabiliza'
            },
            en: {
                kicker: 'Orbital delivery · ISS', title: 'Mail for the ISS',
                playfield: 'Approach to the International Space Station',
                guidance: 'Enter the yellow corridor slowly and align the ship nose with the ISS docking port.',
                retry: 'Lumi moved the ship safely away. Reduce speed, stabilize and try again.',
                success: 'Delivery complete!',
                science: 'The ISS regularly receives experiments, food and equipment aboard cargo spacecraft.',
                metricLabels: ['Distance', 'Relative speed', 'Alignment'],
                centerControl: 'Stabilize',
                keyboardHint: 'Keyboard: WASD or arrows · Q/E rotates · Space stabilizes'
            }
        }
    }),
    'hubble-service': profile({
        id: 'hubble-service',
        gameplay: 'docking',
        completionEvent: 'docked',
        retryEvents: ['unsafe-contact'],
        target: 'hubble',
        driftAcceleration: 0.22,
        driftFrequency: 0.85,
        metrics: DOCKING_METRICS,
        initialState: { position: { x: -7.5, y: -1.1 }, velocity: { x: 0.34, y: 0 }, angle: -0.12 },
        copy: {
            pt: {
                kicker: 'Missão de manutenção · Hubble', title: 'Manutenção do Hubble',
                playfield: 'Aproximação de manutenção ao Telescópio Espacial Hubble',
                guidance: 'Compensa a deriva orbital e aproxima o módulo devagar da porta de manutenção.',
                retry: 'A Lumi abriu distância de segurança. Estabiliza antes de voltares a aproximar.',
                success: 'Módulo entregue ao Hubble!',
                science: 'O Hubble foi visitado por astronautas em cinco missões de manutenção entre 1993 e 2009.',
                metricLabels: ['Distância', 'Velocidade relativa', 'Alinhamento'],
                centerControl: 'Estabilizar',
                keyboardHint: 'Teclado: WASD ou setas · Q/E roda · Espaço estabiliza'
            },
            en: {
                kicker: 'Maintenance mission · Hubble', title: 'Hubble maintenance',
                playfield: 'Maintenance approach to the Hubble Space Telescope',
                guidance: 'Counter the orbital drift and bring the module slowly towards the maintenance port.',
                retry: 'Lumi opened a safe gap. Stabilize before approaching again.',
                success: 'Module delivered to Hubble!',
                science: 'Astronauts visited Hubble on five servicing missions between 1993 and 2009.',
                metricLabels: ['Distance', 'Relative speed', 'Alignment'],
                centerControl: 'Stabilize',
                keyboardHint: 'Keyboard: WASD or arrows · Q/E rotates · Space stabilizes'
            }
        }
    }),
    'lunar-sweep': profile({
        id: 'lunar-sweep',
        gameplay: 'sweep',
        completionEvent: 'sweep-complete',
        retryEvents: ['debris-hit'],
        controls: FLAT_CONTROLS,
        target: 'moon',
        metrics: [
            { field: 'collected', format: 'collection', safeField: 'primarySafe' },
            { field: 'shield', format: 'shield', safeField: 'secondarySafe' },
            { field: 'signalStrength', format: 'percent', safeField: 'tertiarySafe' }
        ],
        initialState: {},
        copy: {
            pt: {
                kicker: 'Recuperação orbital · Lua', title: 'Varredura lunar',
                playfield: 'Recolha de transmissores na órbita baixa da Lua',
                guidance: 'Segue os anéis amarelos, recolhe quatro transmissores e evita os fragmentos escuros.',
                retry: 'O escudo absorveu o impacto e a Lumi reposicionou a nave. Procura uma passagem mais limpa.',
                success: 'Transmissores recuperados!',
                science: 'As missões lunares usam redes de antenas e relés para manter contacto quando a geometria bloqueia um sinal direto.',
                metricLabels: ['Transmissores', 'Escudo', 'Sinal'],
                centerControl: 'Travar',
                keyboardHint: 'Teclado: WASD ou setas · Espaço trava a deriva'
            },
            en: {
                kicker: 'Orbital recovery · Moon', title: 'Lunar sweep',
                playfield: 'Transmitter recovery in low lunar orbit',
                guidance: 'Follow the yellow rings, collect four transmitters and avoid the dark fragments.',
                retry: 'The shield absorbed the impact and Lumi repositioned the ship. Find a cleaner route.',
                success: 'Transmitters recovered!',
                science: 'Lunar missions use antenna networks and relays to stay in contact when geometry blocks a direct signal.',
                metricLabels: ['Transmitters', 'Shield', 'Signal'],
                centerControl: 'Brake',
                keyboardHint: 'Keyboard: WASD or arrows · Space brakes the drift'
            }
        }
    }),
    'mars-relay': profile({
        id: 'mars-relay',
        gameplay: 'signal',
        completionEvent: 'signal-complete',
        controls: FLAT_CONTROLS,
        target: 'mars',
        metrics: [
            { field: 'anglePercent', format: 'percent', safeField: 'primarySafe' },
            { field: 'frequencyPercent', format: 'percent', safeField: 'secondarySafe' },
            { field: 'lockPercent', format: 'percent', safeField: 'tertiarySafe' }
        ],
        initialState: {},
        copy: {
            pt: {
                kicker: 'Transmissão profunda · Marte', title: 'Relé de Marte',
                playfield: 'Calibração do relé orbital de Marte',
                guidance: 'Centra os dois marcadores e mantém Transmitir premido até completares o bloqueio do sinal.',
                retry: 'O sinal saiu da janela. Volta a centrar o ângulo e a frequência.',
                success: 'Mensagem recebida em Marte!',
                science: 'As comunicações com Marte demoram vários minutos em cada sentido e dependem de antenas muito bem apontadas.',
                metricLabels: ['Ângulo', 'Frequência', 'Bloqueio'],
                centerControl: 'Transmitir',
                keyboardHint: 'Teclado: esquerda/direita ajusta o ângulo · cima/baixo ajusta a frequência · Espaço transmite'
            },
            en: {
                kicker: 'Deep-space transmission · Mars', title: 'Mars relay',
                playfield: 'Mars orbital relay calibration',
                guidance: 'Center both markers and hold Transmit until the signal lock is complete.',
                retry: 'The signal left the window. Center angle and frequency again.',
                success: 'Message received on Mars!',
                science: 'Messages to Mars take several minutes each way and depend on very accurately pointed antennas.',
                metricLabels: ['Angle', 'Frequency', 'Lock'],
                centerControl: 'Transmit',
                keyboardHint: 'Keyboard: left/right adjusts angle · up/down adjusts frequency · Space transmits'
            }
        }
    })
});

export function getOrbitalMissionProfile(id = 'iss-docking', language = 'pt') {
    const base = ORBITAL_MISSION_PROFILES[id] ?? ORBITAL_MISSION_PROFILES['iss-docking'];
    const copy = base.copy[language === 'en' ? 'en' : 'pt'];
    const metrics = base.metrics.map((metric, index) => Object.freeze({
        ...metric,
        label: copy.metricLabels[index]
    }));
    return Object.freeze({ ...base, ...copy, metrics: Object.freeze(metrics) });
}
