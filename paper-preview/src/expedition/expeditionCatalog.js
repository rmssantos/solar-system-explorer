function chapter(value) {
    return Object.freeze({
        ...value,
        unlockDiscoveries: Object.freeze([...(value.unlockDiscoveries ?? [])]),
        unlockContracts: Object.freeze([...(value.unlockContracts ?? [])]),
        unlockChapters: Object.freeze([...(value.unlockChapters ?? [])]),
        copy: Object.freeze({
            pt: Object.freeze({ ...value.copy.pt }),
            en: Object.freeze({ ...value.copy.en })
        })
    });
}

export const OCEAN_FINALE_ID = 'ocean-worlds-finale';

export const EXPEDITION_CHAPTERS = Object.freeze([
    chapter({
        id: 'moon-seismology',
        kind: 'investigation',
        destinationKey: 'moon',
        activity: 'moon-seismology',
        evidenceId: 'moon-seismic-evidence',
        upgradeId: 'paper-seismometer',
        art: '/art/expedition/moon-seismology.webp',
        xp: 80,
        unlockDiscoveries: ['moon'],
        unlockContracts: ['iss-delivery'],
        copy: {
            pt: {
                title: 'O eco da Lua',
                summary: 'Monta uma rede de sensores e encontra o impacto escondido no ruído lunar.',
                briefing: 'Lumi encontrou um pulso repetido no arquivo. Primeiro precisamos de aprender a ouvir uma lua.',
                action: 'Investigar a Lua',
                reward: 'Sismómetro de Papel'
            },
            en: {
                title: 'The Moon echo',
                summary: 'Build a sensor network and find the impact hidden in lunar noise.',
                briefing: 'Lumi found a repeating pulse in the archive. First we need to learn how to listen to a moon.',
                action: 'Investigate the Moon',
                reward: 'Paper Seismometer'
            }
        }
    }),
    chapter({
        id: 'europa-radar',
        kind: 'investigation',
        destinationKey: 'europa',
        activity: 'europa-radar',
        evidenceId: 'europa-ocean-evidence',
        upgradeId: 'ice-radar',
        art: '/art/expedition/europa-radar.webp',
        xp: 120,
        unlockChapters: ['moon-seismology'],
        copy: {
            pt: {
                title: 'Debaixo do gelo',
                summary: 'Usa radar para desenhar o que se esconde sob as fissuras de Europa.',
                briefing: 'O segundo fragmento atravessa uma camada de gelo. Vamos medir o eco sem aquecer o radar.',
                action: 'Mapear Europa',
                reward: 'Radar de Gelo'
            },
            en: {
                title: 'Beneath the ice',
                summary: 'Use radar to draw what hides below Europa’s cracked surface.',
                briefing: 'The second fragment passes through a layer of ice. Let’s measure the echo without overheating the radar.',
                action: 'Map Europa',
                reward: 'Ice Radar'
            }
        }
    }),
    chapter({
        id: 'enceladus-plume',
        kind: 'investigation',
        destinationKey: 'enceladus',
        activity: 'enceladus-plume',
        evidenceId: 'enceladus-plume-evidence',
        upgradeId: 'plume-collector',
        art: '/art/expedition/enceladus-plume.webp',
        xp: 140,
        unlockChapters: ['europa-radar'],
        copy: {
            pt: {
                title: 'A fonte congelada',
                summary: 'Atravessa as plumas de Encélado e guarda uma amostra limpa e fria.',
                briefing: 'Há água a escapar para o espaço. Se recolhermos os cristais certos, podemos ler a história do oceano.',
                action: 'Recolher a pluma',
                reward: 'Coletor de Plumas'
            },
            en: {
                title: 'The frozen fountain',
                summary: 'Cross Enceladus’s plumes and preserve a clean, cold sample.',
                briefing: 'Water is escaping into space. If we collect the right crystals, we can read the ocean’s story.',
                action: 'Sample the plume',
                reward: 'Plume Collector'
            }
        }
    }),
    chapter({
        id: 'titan-dragonfly',
        kind: 'investigation',
        destinationKey: 'titan',
        activity: 'titan-dragonfly',
        evidenceId: 'titan-chemistry-evidence',
        upgradeId: 'atmosphere-lab',
        art: '/art/expedition/titan-dragonfly.webp',
        xp: 160,
        unlockChapters: ['enceladus-plume'],
        copy: {
            pt: {
                title: 'Chuva de metano',
                summary: 'Pilota uma libélula de papel por dunas e lagos até ao melhor local de estudo.',
                briefing: 'O último fragmento vem de um mundo com nuvens, chuva e lagos — mas quase nada é água líquida.',
                action: 'Voar em Titã',
                reward: 'Laboratório Atmosférico'
            },
            en: {
                title: 'Methane rain',
                summary: 'Fly a paper dragonfly across dunes and lakes to the best study site.',
                briefing: 'The last fragment comes from a world with clouds, rain and lakes — but almost none of it is liquid water.',
                action: 'Fly on Titan',
                reward: 'Atmosphere Laboratory'
            }
        }
    }),
    chapter({
        id: OCEAN_FINALE_ID,
        kind: 'finale',
        destinationKey: null,
        activity: 'ocean-worlds-finale',
        evidenceId: 'ocean-worlds-map',
        upgradeId: 'guardian-ocean-seal',
        art: '/art/expedition/ocean-worlds-finale.webp',
        xp: 200,
        unlockChapters: ['moon-seismology', 'europa-radar', 'enceladus-plume', 'titan-dragonfly'],
        copy: {
            pt: {
                title: 'O mapa invisível',
                summary: 'Compara as quatro pistas e constrói um mapa dos mundos com oceanos escondidos.',
                briefing: 'Temos todas as peças. Agora precisamos de separar o que sabemos daquilo que ainda procuramos.',
                action: 'Montar o mapa final',
                reward: 'Selo Guardião dos Oceanos'
            },
            en: {
                title: 'The invisible map',
                summary: 'Compare the four clues and build a map of worlds with hidden oceans.',
                briefing: 'We have every piece. Now we must separate what we know from what we are still looking for.',
                action: 'Build the final map',
                reward: 'Guardian of the Oceans Stamp'
            }
        }
    })
]);

export const PLAYABLE_EXPEDITION_CHAPTERS = Object.freeze(
    EXPEDITION_CHAPTERS.filter((item) => item.kind === 'investigation')
);

export function getExpeditionChapter(id) {
    return EXPEDITION_CHAPTERS.find((item) => item.id === id) ?? null;
}
