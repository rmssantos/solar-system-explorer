function reward(value) {
    return Object.freeze({
        ...value,
        copy: Object.freeze({
            pt: Object.freeze({ ...value.copy.pt }),
            en: Object.freeze({ ...value.copy.en })
        })
    });
}

export const CONTRACT_REWARDS = Object.freeze([
    reward({
        contractId: 'iss-delivery',
        xp: 120,
        art: '/art/awards/contract-iss-delivery.webp',
        copy: {
            pt: { title: 'Selo Órbita Amiga', description: 'Entregaste ciência em segurança.' },
            en: { title: 'Friendly Orbit Stamp', description: 'You delivered science safely.' }
        }
    }),
    reward({
        contractId: 'hubble-maintenance',
        xp: 140,
        art: '/art/awards/contract-hubble-maintenance.webp',
        copy: {
            pt: { title: 'Selo Olho Cósmico', description: 'Ajudaste o Hubble a observar mais longe.' },
            en: { title: 'Cosmic Eye Stamp', description: 'You helped Hubble see farther.' }
        }
    }),
    reward({
        contractId: 'lunar-sweep',
        xp: 170,
        art: '/art/awards/contract-lunar-sweep.webp',
        copy: {
            pt: { title: 'Selo Guardião Lunar', description: 'Limpaste a rota sobre a Lua.' },
            en: { title: 'Lunar Guardian Stamp', description: 'You cleared the route above the Moon.' }
        }
    }),
    reward({
        contractId: 'mars-relay',
        xp: 200,
        art: '/art/awards/contract-mars-relay.webp',
        copy: {
            pt: { title: 'Selo Ponte Vermelha', description: 'Ligaste a órbita à superfície de Marte.' },
            en: { title: 'Red Bridge Stamp', description: 'You linked Mars orbit to its surface.' }
        }
    }),
    reward({
        contractId: 'jupiter-slingshot',
        xp: 240,
        art: '/art/awards/contract-jupiter-slingshot.webp',
        copy: {
            pt: { title: 'Selo Curva Gigante', description: 'Transformaste gravidade em velocidade.' },
            en: { title: 'Giant Curve Stamp', description: 'You turned gravity into speed.' }
        }
    })
]);

const REWARD_BY_CONTRACT = new Map(CONTRACT_REWARDS.map((item) => [item.contractId, item]));

export function getContractReward(contractId) {
    return REWARD_BY_CONTRACT.get(contractId) ?? null;
}
