const NASA = Object.freeze({ name: 'NASA Solar System Exploration', url: 'https://science.nasa.gov/solar-system/' });
const JPL = Object.freeze({ name: 'NASA/JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' });
const CELESTRAK = Object.freeze({ name: 'CelesTrak GP/OMM', url: 'https://celestrak.org/' });

function entry(value) {
    return Object.freeze({ discoverable: true, ...value, source: Object.freeze(value.source ?? NASA) });
}

export const PRIMARY_WORLDS = Object.freeze([
    entry({ key: 'sun', name: 'Sol', type: 'star', command: '10', anchor: [0, 0, 0], scale: 1.7, collisionRadius: 4.2, interactionRadius: 5.2, fact: 'A nossa estrela reúne quase toda a massa do Sistema Solar e alimenta a vida na Terra.' }),
    entry({ key: 'mercury', name: 'Mercúrio', type: 'planet', command: '199', anchor: [11, 1, -6], scale: 1.15, collisionRadius: 1.2, interactionRadius: 2.4, fact: 'Mercúrio é o planeta mais próximo do Sol e possui uma superfície marcada por crateras.' }),
    entry({ key: 'venus', name: 'Vénus', type: 'planet', command: '299', anchor: [22, -2, -13], scale: 1.3, collisionRadius: 1.7, interactionRadius: 2.9, fact: 'Vénus é o planeta mais quente devido ao intenso efeito de estufa da sua atmosfera.' }),
    entry({ key: 'earth', name: 'Terra', type: 'planet', command: '399', anchor: [34, 3, -22], scale: 1.45, collisionRadius: 2.35, interactionRadius: 3.4, fact: 'A Terra é o único mundo conhecido com oceanos de água líquida e vida abundante.' }),
    entry({ key: 'mars', name: 'Marte', type: 'planet', command: '499', anchor: [48, -4, -33], scale: 1.25, collisionRadius: 1.65, interactionRadius: 2.9, fact: 'Marte conserva vulcões gigantes, vales profundos e sinais de água no seu passado.' }),
    entry({ key: 'jupiter', name: 'Júpiter', type: 'planet', command: '599', anchor: [68, 5, -50], scale: 1.75, collisionRadius: 3.5, interactionRadius: 4.7, fact: 'Júpiter é o maior planeta e a sua Grande Mancha Vermelha é uma tempestade colossal.' }),
    entry({ key: 'saturn', name: 'Saturno', type: 'planet', command: '699', anchor: [91, -5, -72], scale: 1.7, collisionRadius: 5.8, interactionRadius: 6.8, fact: 'Os anéis de Saturno são compostos por incontáveis fragmentos de gelo e rocha.' }),
    entry({ key: 'uranus', name: 'Urano', type: 'planet', command: '799', anchor: [116, 4, -96], scale: 1.55, collisionRadius: 2.65, interactionRadius: 3.8, fact: 'Urano gira quase deitado, provavelmente devido a uma colisão ocorrida há muito tempo.' }),
    entry({ key: 'neptune', name: 'Neptuno', type: 'planet', command: '899', anchor: [143, -3, -122], scale: 1.55, collisionRadius: 2.65, interactionRadius: 3.8, fact: 'Neptuno tem alguns dos ventos mais rápidos já medidos em todo o Sistema Solar.' })
]);

const MOONS = [
    ['moon', 'Lua', 'earth', 2.8, 0.42, 'A Lua estabiliza a inclinação da Terra e é o único mundo além da Terra visitado por humanos.'],
    ['phobos', 'Fobos', 'mars', 2.15, 0.22, 'Fobos orbita Marte tão depressa que nasce no oeste e põe-se no leste do céu marciano.'],
    ['deimos', 'Deimos', 'mars', 2.75, 0.17, 'Deimos é uma pequena lua irregular de Marte coberta por uma espessa camada de poeira.'],
    ['io', 'Io', 'jupiter', 4.2, 0.35, 'Io é o mundo com maior atividade vulcânica conhecida no Sistema Solar.'],
    ['europa', 'Europa', 'jupiter', 5.0, 0.34, 'Europa esconde provavelmente um oceano global de água salgada sob a sua crosta de gelo.'],
    ['ganymede', 'Ganimedes', 'jupiter', 5.9, 0.48, 'Ganimedes é a maior lua do Sistema Solar e possui o seu próprio campo magnético.'],
    ['callisto', 'Calisto', 'jupiter', 6.8, 0.44, 'Calisto tem uma das superfícies mais antigas e crateradas do Sistema Solar.'],
    ['mimas', 'Mimas', 'saturn', 4.0, 0.2, 'A enorme cratera Herschel dá a Mimas uma silhueta imediatamente reconhecível.'],
    ['enceladus', 'Encélado', 'saturn', 4.8, 0.24, 'Encélado lança jatos de água e gelo do oceano escondido sob a sua superfície.'],
    ['titan', 'Titã', 'saturn', 6.2, 0.5, 'Titã tem uma atmosfera densa e lagos de metano e etano na superfície.'],
    ['iapetus', 'Jápeto', 'saturn', 7.2, 0.28, 'Jápeto tem um hemisfério muito escuro e outro brilhante, além de uma grande crista equatorial.'],
    ['titania', 'Titânia', 'uranus', 3.8, 0.34, 'Titânia é a maior lua de Urano e apresenta grandes falhas e desfiladeiros.'],
    ['oberon', 'Oberon', 'uranus', 4.6, 0.31, 'Oberon é uma lua gelada e craterada que orbita longe das nuvens de Urano.'],
    ['triton', 'Tritão', 'neptune', 4.1, 0.4, 'Tritão orbita Neptuno ao contrário e possui géiseres de azoto na superfície gelada.']
].map(([key, name, parentKey, orbitRadius, scale, fact], index) => entry({
    key, name, type: 'moon', parentKey, orbitRadius, scale, orbitSpeed: 0.08 + (index % 5) * 0.025,
    orbitPhase: index * 1.71, fact, source: NASA
}));

const HUMAN_OBJECTS = [
    entry({ key: 'iss', name: 'Estação Espacial Internacional', type: 'spacecraft', parentKey: 'earth', orbitRadius: 2.15, scale: 0.2, orbitSpeed: 0.38, fact: 'A ISS é um laboratório habitado que completa aproximadamente uma órbita da Terra a cada 90 minutos.', source: { ...CELESTRAK, command: '25544' } }),
    entry({ key: 'hubble', name: 'Telescópio Hubble', type: 'spacecraft', parentKey: 'earth', orbitRadius: 2.45, scale: 0.18, orbitSpeed: 0.3, fact: 'O Hubble observa o Universo acima da maior parte da atmosfera terrestre desde 1990.', source: { ...CELESTRAK, command: '20580' } }),
    entry({ key: 'jwst', name: 'Telescópio James Webb', type: 'spacecraft', parentKey: 'earth', orbitRadius: 5.4, scale: 0.24, orbitSpeed: 0.06, fact: 'O James Webb observa sobretudo em infravermelho perto do ponto de equilíbrio gravitacional L2.', source: JPL }),
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
