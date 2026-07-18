const NASA = Object.freeze({ name: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/' });
const JPL = Object.freeze({ name: 'NASA/JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' });
const CELESTRAK = Object.freeze({ name: 'CelesTrak GP/OMM', url: 'https://celestrak.org/' });

function entry(value) {
    return Object.freeze({
        discoverable: true,
        ...value,
        orbit: value.orbit ? Object.freeze(value.orbit) : undefined,
        source: Object.freeze(value.source ?? NASA)
    });
}

export const PRIMARY_WORLDS = Object.freeze([
    entry({ key: 'sun', name: 'Sol', type: 'star', command: '10', anchor: [0, 0, 0], scale: 1.7, collisionRadius: 4.2, interactionRadius: 5.2, fact: 'A nossa estrela reúne quase toda a massa do Sistema Solar e alimenta a vida na Terra.' }),
    entry({ key: 'mercury', name: 'Mercúrio', type: 'planet', command: '199', anchor: [11, 1, -6], scale: 1.15, collisionRadius: 1.2, interactionRadius: 2.4, orbit: { semiMajorAxisAu: 0.3871, eccentricity: 0.2056, inclinationDeg: 7.005, ascendingNodeDeg: 48.331, argumentPeriapsisDeg: 29.124, meanAnomalyAtEpochDeg: 174.796, periodDays: 87.969 }, fact: 'Mercúrio é o planeta mais próximo do Sol e possui uma superfície marcada por crateras.' }),
    entry({ key: 'venus', name: 'Vénus', type: 'planet', command: '299', anchor: [22, -2, -13], scale: 1.3, collisionRadius: 1.7, interactionRadius: 2.9, orbit: { semiMajorAxisAu: 0.7233, eccentricity: 0.0068, inclinationDeg: 3.3946, ascendingNodeDeg: 76.68, argumentPeriapsisDeg: 54.884, meanAnomalyAtEpochDeg: 50.115, periodDays: 224.701 }, fact: 'Vénus é o planeta mais quente devido ao intenso efeito de estufa da sua atmosfera.' }),
    entry({ key: 'earth', name: 'Terra', type: 'planet', command: '399', anchor: [34, 3, -22], scale: 1.45, collisionRadius: 2.35, interactionRadius: 3.4, orbit: { semiMajorAxisAu: 1, eccentricity: 0.0167, inclinationDeg: 0.0001, ascendingNodeDeg: -11.261, argumentPeriapsisDeg: 114.198, meanAnomalyAtEpochDeg: 357.517, periodDays: 365.256 }, fact: 'A Terra é o único mundo conhecido com oceanos de água líquida e vida abundante.' }),
    entry({ key: 'mars', name: 'Marte', type: 'planet', command: '499', anchor: [48, -4, -33], scale: 1.25, collisionRadius: 1.65, interactionRadius: 2.9, orbit: { semiMajorAxisAu: 1.5237, eccentricity: 0.0934, inclinationDeg: 1.85, ascendingNodeDeg: 49.558, argumentPeriapsisDeg: 286.502, meanAnomalyAtEpochDeg: 19.373, periodDays: 686.98 }, fact: 'Marte conserva vulcões gigantes, vales profundos e sinais de água no seu passado.' }),
    entry({ key: 'jupiter', name: 'Júpiter', type: 'planet', command: '599', anchor: [68, 5, -50], scale: 1.75, collisionRadius: 3.5, interactionRadius: 4.7, orbit: { semiMajorAxisAu: 5.2028, eccentricity: 0.0484, inclinationDeg: 1.303, ascendingNodeDeg: 100.464, argumentPeriapsisDeg: 273.867, meanAnomalyAtEpochDeg: 20.02, periodDays: 4332.589 }, fact: 'Júpiter é o maior planeta e a sua Grande Mancha Vermelha é uma tempestade colossal.' }),
    entry({ key: 'saturn', name: 'Saturno', type: 'planet', command: '699', anchor: [91, -5, -72], scale: 1.7, collisionRadius: 5.8, interactionRadius: 6.8, orbit: { semiMajorAxisAu: 9.5388, eccentricity: 0.0539, inclinationDeg: 2.489, ascendingNodeDeg: 113.666, argumentPeriapsisDeg: 339.392, meanAnomalyAtEpochDeg: 317.02, periodDays: 10759.22 }, fact: 'Os anéis de Saturno são compostos por incontáveis fragmentos de gelo e rocha.' }),
    entry({ key: 'uranus', name: 'Urano', type: 'planet', command: '799', anchor: [116, 4, -96], scale: 1.55, collisionRadius: 2.65, interactionRadius: 3.8, orbit: { semiMajorAxisAu: 19.1914, eccentricity: 0.0473, inclinationDeg: 0.773, ascendingNodeDeg: 74.006, argumentPeriapsisDeg: 96.999, meanAnomalyAtEpochDeg: 142.2386, periodDays: 30688.5 }, fact: 'Urano gira quase deitado, provavelmente devido a uma colisão ocorrida há muito tempo.' }),
    entry({ key: 'neptune', name: 'Neptuno', type: 'planet', command: '899', anchor: [143, -3, -122], scale: 1.55, collisionRadius: 2.65, interactionRadius: 3.8, orbit: { semiMajorAxisAu: 30.0611, eccentricity: 0.0086, inclinationDeg: 1.77, ascendingNodeDeg: 131.784, argumentPeriapsisDeg: 273.187, meanAnomalyAtEpochDeg: 256.228, periodDays: 60182 }, fact: 'Neptuno tem alguns dos ventos mais rápidos já medidos em todo o Sistema Solar.' })
]);

const MOONS = [
    ['moon', 'Lua', 'earth', 5.4, 0.42, 'A Lua estabiliza a inclinação da Terra e é o único mundo além da Terra visitado por humanos.', 27.322],
    ['phobos', 'Fobos', 'mars', 3.1, 0.18, 'Fobos orbita Marte tão depressa que nasce no oeste e põe-se no leste do céu marciano.'],
    ['deimos', 'Deimos', 'mars', 3.75, 0.14, 'Deimos é uma pequena lua irregular de Marte coberta por uma espessa camada de poeira.'],
    ['io', 'Io', 'jupiter', 5.4, 0.35, 'Io é o mundo com maior atividade vulcânica conhecida no Sistema Solar.'],
    ['europa', 'Europa', 'jupiter', 6.3, 0.34, 'Europa esconde provavelmente um oceano global de água salgada sob a sua crosta de gelo.'],
    ['ganymede', 'Ganimedes', 'jupiter', 7.3, 0.48, 'Ganimedes é a maior lua do Sistema Solar e possui o seu próprio campo magnético.'],
    ['callisto', 'Calisto', 'jupiter', 8.4, 0.44, 'Calisto tem uma das superfícies mais antigas e crateradas do Sistema Solar.'],
    ['mimas', 'Mimas', 'saturn', 7.4, 0.2, 'A enorme cratera Herschel dá a Mimas uma silhueta imediatamente reconhecível.'],
    ['enceladus', 'Encélado', 'saturn', 8.4, 0.24, 'Encélado lança jatos de água e gelo do oceano escondido sob a sua superfície.'],
    ['titan', 'Titã', 'saturn', 10.0, 0.5, 'Titã tem uma atmosfera densa e lagos de metano e etano na superfície.'],
    ['iapetus', 'Jápeto', 'saturn', 11.4, 0.28, 'Jápeto tem um hemisfério muito escuro e outro brilhante, além de uma grande crista equatorial.'],
    ['titania', 'Titânia', 'uranus', 4.7, 0.34, 'Titânia é a maior lua de Urano e apresenta grandes falhas e desfiladeiros.'],
    ['oberon', 'Oberon', 'uranus', 5.8, 0.31, 'Oberon é uma lua gelada e craterada que orbita longe das nuvens de Urano.'],
    ['triton', 'Tritão', 'neptune', 5.1, 0.4, 'Tritão orbita Neptuno ao contrário e possui géiseres de azoto na superfície gelada.']
].map(([key, name, parentKey, orbitRadius, scale, fact, orbitPeriodDays], index) => entry({
    key, name, type: 'moon', parentKey, orbitRadius, scale, orbitPeriodDays, orbitSpeed: 0.008 + (index % 5) * 0.003,
    orbitPhase: index * 1.71, fact, source: NASA
}));

const HUMAN_OBJECTS = [
    entry({ key: 'iss', name: 'Estação Espacial Internacional', type: 'spacecraft', parentKey: 'earth', orbitRadius: 4.2, scale: 0.2, orbitSpeed: 0.018, fact: 'A ISS é um laboratório habitado que completa aproximadamente uma órbita da Terra a cada 90 minutos.', source: { ...CELESTRAK, command: '25544' } }),
    entry({ key: 'hubble', name: 'Telescópio Hubble', type: 'spacecraft', parentKey: 'earth', orbitRadius: 4.8, scale: 0.18, orbitSpeed: 0.015, fact: 'O Hubble observa o Universo acima da maior parte da atmosfera terrestre desde 1990.', source: { ...CELESTRAK, command: '20580' } }),
    entry({ key: 'jwst', name: 'Telescópio James Webb', type: 'spacecraft', parentKey: 'earth', orbitRadius: 7.2, scale: 0.24, orbitSpeed: 0.006, fact: 'O James Webb observa sobretudo em infravermelho perto do ponto de equilíbrio gravitacional L2.', source: JPL }),
    entry({ key: 'voyager-1', name: 'Voyager 1', type: 'spacecraft', anchor: [153, 9, -136], scale: 0.28, fact: 'A Voyager 1 é o objeto construído por humanos mais distante da Terra e explora o espaço interestelar.', source: JPL }),
    entry({ key: 'tesla-roadster', name: 'Tesla Roadster e Starman', type: 'spacecraft', anchor: [41, 8, -27], scale: 0.42, fact: 'O Roadster lançado no teste do Falcon Heavy percorre uma órbita heliocêntrica que cruza a órbita de Marte.', source: { ...JPL, command: '-143205' } })
];

const SMALL_BODIES = [
    ['ceres', 'Ceres', [57, -1, -41], 'Ceres é o maior objeto da cintura de asteroides e um planeta anão com sinais de água salgada.'],
    ['vesta', 'Vesta', [61, 7, -43], 'Vesta é um dos maiores asteroides e possui uma enorme bacia de impacto no hemisfério sul.'],
    ['bennu', 'Bennu', [29, -7, -18], 'A sonda OSIRIS-REx trouxe para a Terra uma amostra do asteroide Bennu em 2023.'],
    ['apophis', 'Apophis', [37, 9, -26], 'Apophis passará muito perto da Terra em 2029, mas não representa perigo de colisão nessa passagem.'],
    ['halley', 'Cometa Halley', [79, 12, -61], 'O cometa Halley regressa ao interior do Sistema Solar aproximadamente a cada 76 anos.'],
    ['67p', 'Cometa 67P', [72, -11, -55], 'A missão Rosetta acompanhou o cometa 67P e colocou a sonda Philae na sua superfície.'],
    ['chelyabinsk', 'Meteoro de Chelyabinsk', [31, 10, -19], 'O meteoro de Chelyabinsk explodiu na atmosfera em 2013 e a onda de choque partiu milhares de janelas.'],
    ['tunguska', 'Eco de Tunguska', [36, 11, -18], 'O evento de Tunguska derrubou uma enorme área de floresta em 1908, provavelmente após uma explosão no ar.'],
    ['hoba', 'Meteorito Hoba — arquivo', [30, -8, -23], 'O Hoba permanece na Namíbia e é o maior meteorito inteiro conhecido; aqui surge como marcador educativo, não em órbita.']
].map(([key, name, anchor, fact], index) => entry({
    key, name, type: 'small-body', anchor, scale: index > 3 ? 0.42 : 0.28, fact, source: JPL
}));

export const WORLD_OBJECTS = Object.freeze([
    ...PRIMARY_WORLDS,
    ...MOONS,
    ...HUMAN_OBJECTS,
    ...SMALL_BODIES
]);

const BY_KEY = new Map(WORLD_OBJECTS.map((object) => [object.key, object]));

export function getWorldObject(key) {
    return BY_KEY.get(key) ?? null;
}

export function listWorldObjects(type) {
    return WORLD_OBJECTS.filter((object) => object.type === type);
}
