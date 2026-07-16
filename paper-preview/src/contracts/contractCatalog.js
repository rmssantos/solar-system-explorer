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
                start: 'Entrar em órbita baixa'
            },
            en: {
                title: 'Mail for the ISS',
                summary: 'Deliver a capsule of science experiments to the International Space Station.',
                cargo: 'Experiment capsule',
                destination: 'Low Earth orbit',
                unlock: 'Discover Earth',
                accept: 'Accept delivery',
                start: 'Enter low Earth orbit'
            }
        }
    }),
    contract({
        id: 'hubble-maintenance',
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
                start: 'Aproximar do Hubble'
            },
            en: {
                title: 'Hubble maintenance',
                summary: 'Carry a maintenance module to the telescope and approach without disturbing its observation.',
                cargo: 'Maintenance module',
                destination: 'Hubble orbit',
                unlock: 'Complete the ISS delivery',
                accept: 'Accept maintenance',
                start: 'Approach Hubble'
            }
        }
    })
]);

export function getContract(id) {
    return CONTRACT_CATALOG.find((item) => item.id === id) ?? null;
}

