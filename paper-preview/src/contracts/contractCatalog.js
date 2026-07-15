function contract(value) {
    return Object.freeze({
        ...value,
        unlockDiscoveries: Object.freeze([...(value.unlockDiscoveries ?? [])]),
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
                destination: 'Órbita baixa da Terra'
            },
            en: {
                title: 'Mail for the ISS',
                summary: 'Deliver a capsule of science experiments to the International Space Station.',
                cargo: 'Experiment capsule',
                destination: 'Low Earth orbit'
            }
        }
    })
]);

export function getContract(id) {
    return CONTRACT_CATALOG.find((item) => item.id === id) ?? null;
}

