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
            pt: Object.freeze({
                ...value.copy.pt,
                metricLabels: Object.freeze([...value.copy.pt.metricLabels]),
                controlLabels: Object.freeze({ ...value.copy.pt.controlLabels }),
                tutorialSteps: Object.freeze([...(value.copy.pt.tutorialSteps ?? [])])
            }),
            en: Object.freeze({
                ...value.copy.en,
                metricLabels: Object.freeze([...value.copy.en.metricLabels]),
                controlLabels: Object.freeze({ ...value.copy.en.controlLabels }),
                tutorialSteps: Object.freeze([...(value.copy.en.tutorialSteps ?? [])])
            })
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
                controlLabels: { forward: 'Aproximar da ISS', reverse: 'Afastar da ISS', up: 'Subir', down: 'Descer', 'rotate-left': 'Rodar para a esquerda', 'rotate-right': 'Rodar para a direita', stabilize: 'Estabilizar' },
                tutorialTitle: 'Treino de acoplagem',
                tutorialSteps: ['Entra no corredor amarelo e aponta o nariz da nave para a porta.', 'Aproxima-te devagar. Se a velocidade ou o alinhamento ficarem amarelos, estabiliza.'],
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
                controlLabels: { forward: 'Approach the ISS', reverse: 'Move away from the ISS', up: 'Move up', down: 'Move down', 'rotate-left': 'Rotate left', 'rotate-right': 'Rotate right', stabilize: 'Stabilize' },
                tutorialTitle: 'Docking practice',
                tutorialSteps: ['Enter the yellow corridor and point the ship nose at the port.', 'Approach slowly. If speed or alignment turns yellow, stabilize.'],
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
                controlLabels: { forward: 'Aproximar do Hubble', reverse: 'Afastar do Hubble', up: 'Subir', down: 'Descer', 'rotate-left': 'Rodar para a esquerda', 'rotate-right': 'Rodar para a direita', stabilize: 'Estabilizar' },
                tutorialTitle: 'Treino de manutenção',
                tutorialSteps: ['Compensa a deriva antes de entrares no corredor.', 'Mantém velocidade e alinhamento verdes durante a aproximação.'],
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
                controlLabels: { forward: 'Approach Hubble', reverse: 'Move away from Hubble', up: 'Move up', down: 'Move down', 'rotate-left': 'Rotate left', 'rotate-right': 'Rotate right', stabilize: 'Stabilize' },
                tutorialTitle: 'Maintenance practice',
                tutorialSteps: ['Counter the drift before entering the corridor.', 'Keep speed and alignment green during the approach.'],
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
                controlLabels: { forward: 'Mover para a direita', reverse: 'Mover para a esquerda', up: 'Mover para cima', down: 'Mover para baixo', stabilize: 'Travar a deriva' },
                tutorialTitle: 'Treino de recolha',
                tutorialSteps: ['Segue os anéis amarelos até cada transmissor.', 'Evita os fragmentos escuros e trava para mudares de direção.'],
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
                controlLabels: { forward: 'Move right', reverse: 'Move left', up: 'Move up', down: 'Move down', stabilize: 'Brake drift' },
                tutorialTitle: 'Recovery practice',
                tutorialSteps: ['Follow the yellow rings to each transmitter.', 'Avoid dark debris and brake before changing direction.'],
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
                controlLabels: { forward: 'Aumentar ângulo', reverse: 'Diminuir ângulo', up: 'Diminuir frequência', down: 'Aumentar frequência', stabilize: 'Transmitir' },
                tutorialTitle: 'Treino de rádio',
                tutorialSteps: ['Usa esquerda e direita para centrar o ângulo.', 'Usa cima e baixo para centrar a frequência; depois mantém Transmitir.'],
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
                controlLabels: { forward: 'Increase angle', reverse: 'Decrease angle', up: 'Decrease frequency', down: 'Increase frequency', stabilize: 'Transmit' },
                tutorialTitle: 'Radio practice',
                tutorialSteps: ['Use left and right to center the angle.', 'Use up and down to center the frequency, then hold Transmit.'],
                centerControl: 'Transmit',
                keyboardHint: 'Keyboard: left/right adjusts angle · up/down adjusts frequency · Space transmits'
            }
        }
    }),
    'jupiter-slingshot': profile({
        id: 'jupiter-slingshot',
        gameplay: 'slingshot',
        completionEvent: 'slingshot-complete',
        retryEvents: ['heat-warning', 'slingshot-miss'],
        controls: FLAT_CONTROLS,
        target: 'jupiter',
        metrics: [
            { field: 'routePercent', format: 'percent', safeField: 'primarySafe' },
            { field: 'altitudeKm', format: 'kilometers', safeField: 'secondarySafe' },
            { field: 'speedGain', format: 'speed-gain', safeField: 'tertiarySafe' }
        ],
        initialState: {},
        copy: {
            pt: {
                kicker: 'Manobra de gravidade · Júpiter', title: 'Estilingue de Júpiter',
                playfield: 'Planeamento de assistência gravitacional junto de Júpiter',
                guidance: 'Centra a rota, escolhe a faixa verde e mantém Ativar impulso para contornar Júpiter.',
                retry: 'A passagem ainda não é segura. Afasta-te do calor ou volta a centrar a curva.',
                success: 'Impulso gravitacional conseguido!',
                science: 'Uma assistência gravitacional troca movimento com um planeta e pode aumentar a velocidade de uma sonda sem gastar mais combustível.',
                metricLabels: ['Rota', 'Distância a Júpiter', 'Velocidade ganha'],
                controlLabels: { forward: 'Curvar rota para a direita', reverse: 'Curvar rota para a esquerda', up: 'Passar mais longe de Júpiter', down: 'Passar mais perto de Júpiter', stabilize: 'Ativar impulso gravitacional' },
                tutorialTitle: 'Treino de estilingue',
                tutorialSteps: ['Usa esquerda e direita para centrar a linha da rota.', 'Usa cima e baixo para colocar a passagem na faixa verde: nem demasiado perto, nem demasiado longe.', 'Mantém Ativar impulso e observa a velocidade a aumentar.'],
                centerControl: 'Ativar impulso',
                keyboardHint: 'Teclado: esquerda/direita curva a rota · cima/baixo muda a distância · Espaço ativa o impulso'
            },
            en: {
                kicker: 'Gravity manoeuvre · Jupiter', title: 'Jupiter slingshot',
                playfield: 'Gravitational-assist planning near Jupiter',
                guidance: 'Center the route, choose the green band and hold Start boost to swing around Jupiter.',
                retry: 'The pass is not safe yet. Move away from the heat or center the curve again.',
                success: 'Gravity boost complete!',
                science: 'A gravitational assist exchanges motion with a planet and can speed up a probe without using extra fuel.',
                metricLabels: ['Route', 'Distance from Jupiter', 'Speed gained'],
                controlLabels: { forward: 'Curve route right', reverse: 'Curve route left', up: 'Pass farther from Jupiter', down: 'Pass closer to Jupiter', stabilize: 'Start gravitational boost' },
                tutorialTitle: 'Slingshot practice',
                tutorialSteps: ['Use left and right to center the route line.', 'Use up and down to place the flyby in the green band: neither too close nor too far.', 'Hold Start boost and watch the speed increase.'],
                centerControl: 'Start boost',
                keyboardHint: 'Keyboard: left/right curves the route · up/down changes distance · Space starts the boost'
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
