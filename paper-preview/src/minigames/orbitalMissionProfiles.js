function profile(value) {
    return Object.freeze({
        ...value,
        initialState: Object.freeze({ ...value.initialState }),
        copy: Object.freeze({
            pt: Object.freeze({ ...value.copy.pt }),
            en: Object.freeze({ ...value.copy.en })
        })
    });
}

export const ORBITAL_MISSION_PROFILES = Object.freeze({
    'iss-docking': profile({
        id: 'iss-docking',
        target: 'iss',
        driftAcceleration: 0,
        driftFrequency: 0,
        initialState: { position: { x: -7, y: 1.35 }, velocity: { x: 0.42, y: 0 }, angle: 0.08 },
        copy: {
            pt: {
                kicker: 'Encomenda orbital · ISS',
                title: 'Correio para a ISS',
                playfield: 'Aproximação à Estação Espacial Internacional',
                guidance: 'Entra devagar no corredor amarelo e alinha o nariz da nave com a porta da ISS.',
                retry: 'A Lumi afastou a nave em segurança. Reduz a velocidade, estabiliza e tenta novamente.',
                success: 'Encomenda entregue!',
                science: 'A ISS recebe regularmente experiências, alimentos e equipamento através de naves de carga.'
            },
            en: {
                kicker: 'Orbital delivery · ISS',
                title: 'Mail for the ISS',
                playfield: 'Approach to the International Space Station',
                guidance: 'Enter the yellow corridor slowly and align the ship nose with the ISS docking port.',
                retry: 'Lumi moved the ship safely away. Reduce speed, stabilize and try again.',
                success: 'Delivery complete!',
                science: 'The ISS regularly receives experiments, food and equipment aboard cargo spacecraft.'
            }
        }
    }),
    'hubble-service': profile({
        id: 'hubble-service',
        target: 'hubble',
        driftAcceleration: 0.22,
        driftFrequency: 0.85,
        initialState: { position: { x: -7.5, y: -1.1 }, velocity: { x: 0.34, y: 0 }, angle: -0.12 },
        copy: {
            pt: {
                kicker: 'Missão de manutenção · Hubble',
                title: 'Manutenção do Hubble',
                playfield: 'Aproximação de manutenção ao Telescópio Espacial Hubble',
                guidance: 'Compensa a deriva orbital e aproxima o módulo devagar da porta de manutenção.',
                retry: 'A Lumi abriu distância de segurança. Estabiliza antes de voltares a aproximar.',
                success: 'Módulo entregue ao Hubble!',
                science: 'O Hubble foi visitado por astronautas em cinco missões de manutenção entre 1993 e 2009.'
            },
            en: {
                kicker: 'Maintenance mission · Hubble',
                title: 'Hubble maintenance',
                playfield: 'Maintenance approach to the Hubble Space Telescope',
                guidance: 'Counter the orbital drift and bring the module slowly towards the maintenance port.',
                retry: 'Lumi opened a safe gap. Stabilize before approaching again.',
                success: 'Module delivered to Hubble!',
                science: 'Astronauts visited Hubble on five servicing missions between 1993 and 2009.'
            }
        }
    })
});

export function getOrbitalMissionProfile(id = 'iss-docking', language = 'pt') {
    const base = ORBITAL_MISSION_PROFILES[id] ?? ORBITAL_MISSION_PROFILES['iss-docking'];
    const copy = base.copy[language === 'en' ? 'en' : 'pt'];
    return Object.freeze({ ...base, ...copy });
}
