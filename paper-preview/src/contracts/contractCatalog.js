function contract(value) {
    return Object.freeze({
        ...value,
        unlockDiscoveries: Object.freeze([...(value.unlockDiscoveries ?? [])]),
        unlockContracts: Object.freeze([...(value.unlockContracts ?? [])]),
        copy: Object.freeze({
            pt: Object.freeze({ ...value.copy.pt }),
            en: Object.freeze({ ...value.copy.en })
        })
    });
}

export const CONTRACT_CATALOG = Object.freeze([
    contract({
        id: 'iss-delivery',
        art: '/art/missions/mission-iss.webp',
        destinationKey: 'earth',
        activity: 'iss-docking',
        unlockDiscoveries: ['earth'],
        cargo: 'science-capsule',
        copy: {
            pt: {
                title: 'Correio para a ISS',
                summary: 'Entrega uma cápsula de experiências científicas à Estação Espacial Internacional.',
                cargo: 'Cápsula de experiências',
                destination: 'Órbita baixa da Terra',
                unlock: 'Descobre a Terra',
                accept: 'Aceitar encomenda',
                start: 'Entrar em órbita baixa',
                travel: 'Viajar até à Terra'
            },
            en: {
                title: 'Mail for the ISS',
                summary: 'Deliver a capsule of science experiments to the International Space Station.',
                cargo: 'Experiment capsule',
                destination: 'Low Earth orbit',
                unlock: 'Discover Earth',
                accept: 'Accept delivery',
                start: 'Enter low Earth orbit',
                travel: 'Fly to Earth'
            }
        }
    }),
    contract({
        id: 'hubble-maintenance',
        art: '/art/missions/mission-hubble.webp',
        destinationKey: 'earth',
        activity: 'hubble-service',
        unlockDiscoveries: ['earth'],
        unlockContracts: ['iss-delivery'],
        cargo: 'service-module',
        copy: {
            pt: {
                title: 'Manutenção do Hubble',
                summary: 'Leva um módulo de manutenção ao telescópio e aproxima-te sem perturbar a observação.',
                cargo: 'Módulo de manutenção',
                destination: 'Órbita do Hubble',
                unlock: 'Completa o correio para a ISS',
                accept: 'Aceitar manutenção',
                start: 'Aproximar do Hubble',
                travel: 'Viajar até à Terra'
            },
            en: {
                title: 'Hubble maintenance',
                summary: 'Carry a maintenance module to the telescope and approach without disturbing its observation.',
                cargo: 'Maintenance module',
                destination: 'Hubble orbit',
                unlock: 'Complete the ISS delivery',
                accept: 'Accept maintenance',
                start: 'Approach Hubble',
                travel: 'Fly to Earth'
            }
        }
    }),
    contract({
        id: 'lunar-sweep',
        art: '/art/missions/mission-lunar-sweep.webp',
        destinationKey: 'moon',
        activity: 'lunar-sweep',
        unlockDiscoveries: ['moon'],
        unlockContracts: ['hubble-maintenance'],
        cargo: 'relay-beacons',
        copy: {
            pt: {
                title: 'Varredura lunar',
                summary: 'Recupera os transmissores perdidos e desvia-te dos fragmentos que cruzam a órbita da Lua.',
                cargo: 'Balizas de retransmissão',
                destination: 'Órbita baixa da Lua',
                unlock: 'Repara o Hubble e descobre a Lua',
                accept: 'Aceitar varredura',
                start: 'Iniciar recolha orbital',
                travel: 'Viajar até à Lua'
            },
            en: {
                title: 'Lunar sweep',
                summary: 'Recover the lost transmitters and dodge the fragments crossing low lunar orbit.',
                cargo: 'Relay beacons',
                destination: 'Low lunar orbit',
                unlock: 'Repair Hubble and discover the Moon',
                accept: 'Accept sweep',
                start: 'Begin orbital collection',
                travel: 'Fly to the Moon'
            }
        }
    }),
    contract({
        id: 'mars-relay',
        art: '/art/missions/mission-mars-relay.webp',
        destinationKey: 'mars',
        activity: 'mars-relay',
        unlockDiscoveries: ['mars'],
        unlockContracts: ['lunar-sweep'],
        cargo: 'relay-code',
        copy: {
            pt: {
                title: 'Relé de Marte',
                summary: 'Afina a antena orbital e mantém o sinal estável até a mensagem chegar à superfície marciana.',
                cargo: 'Código de sincronização',
                destination: 'Órbita de Marte',
                unlock: 'Completa a varredura e descobre Marte',
                accept: 'Aceitar transmissão',
                start: 'Calibrar o relé',
                travel: 'Viajar até Marte'
            },
            en: {
                title: 'Mars relay',
                summary: 'Tune the orbital antenna and hold a stable signal until the message reaches the Martian surface.',
                cargo: 'Synchronization code',
                destination: 'Mars orbit',
                unlock: 'Complete the sweep and discover Mars',
                accept: 'Accept transmission',
                start: 'Calibrate the relay',
                travel: 'Fly to Mars'
            }
        }
    })
]);

export function getContract(id) {
    return CONTRACT_CATALOG.find((item) => item.id === id) ?? null;
}
