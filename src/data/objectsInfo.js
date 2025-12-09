/**
 * Dados dos objectos do Sistema Solar em Português de Portugal.
 * Com factos "Uau" especiais para crianças!
 * 
 * Suporta internacionalização (PT/EN)
 */

import { SOLAR_SYSTEM_DATA_EN } from './objectsInfoEN.js';
import { i18n } from '../i18n.js';

// LOCAL TEXTURES (Served via Vite public/textures folder)
const TEXTURES = {
    sun: '/textures/sun_real.jpg',
    mercury: '/textures/mercurymap.jpg',
    venus: '/textures/venusmap.jpg',
    earth: '/textures/earthmap1k.jpg',
    moon: '/textures/moonmap1k.jpg',
    mars: '/textures/marsmap1k.jpg',
    jupiter: '/textures/jupitermap.jpg',
    saturn: '/textures/saturnmap.jpg',
    uranus: '/textures/uranusmap.jpg',
    neptune: '/textures/neptunemap.jpg',
    // Moon textures
    io: '/textures/io.jpg',
    europa: '/textures/europa.jpg',
    callisto: '/textures/callisto.jpg',
    mimas: '/textures/mimas.jpg',
    phobos: '/textures/phobos.jpg',
    deimos: '/textures/deimos.jpg',
    triton: '/textures/triton.jpg'
};

// NASA/ESA Real photos for info panel (LOCAL FILES)
// Exported for use in biblioteca.js
export const REAL_PHOTOS = {
    // Sun & Planets
    sun: '/textures/real/sun.jpg',
    mercury: '/textures/real/mercury.jpg',
    venus: '/textures/real/venus.jpg',
    earth: '/textures/real/earth.jpg',
    mars: '/textures/real/mars.jpg',
    jupiter: '/textures/real/jupiter.jpg',
    saturn: '/textures/real/saturn.jpg',
    uranus: '/textures/real/uranus.jpg',
    neptune: '/textures/real/neptune.jpg',
    // Dwarf Planets
    pluto: '/textures/real/pluto.jpg',
    ceres: '/textures/real/ceres.jpg',
    eris: '/textures/real/eris.jpg',
    makemake: '/textures/real/makemake.jpg',
    haumea: '/textures/real/haumea.jpg',
    // Moons - Earth
    moon: '/textures/real/moon.jpg',
    // Moons - Mars
    phobos: '/textures/real/phobos.jpg',
    deimos: '/textures/real/deimos.jpg',
    // Moons - Jupiter
    io: '/textures/real/io.jpg',
    europa: '/textures/real/europa.jpg',
    ganymede: '/textures/real/ganymede.jpg',
    callisto: '/textures/real/callisto.jpg',
    // Moons - Saturn
    titan: '/textures/real/titan.jpg',
    enceladus: '/textures/real/enceladus.jpg',
    mimas: '/textures/real/mimas.jpg',
    // Moons - Uranus
    titania: '/textures/real/titania.jpg',
    oberon: '/textures/real/oberon.jpg',
    // Moons - Neptune
    triton: '/textures/real/triton.jpg',
    proteus: '/textures/real/proteus.jpg',
    // Moons - Pluto
    charon: '/textures/real/charon.jpg',
    // Moons - Eris
    dysnomia: '/textures/real/dysnomia.jpg',
    // Spacecraft
    voyager: '/textures/real/voyager.jpg',
    newhorizons: '/textures/real/newhorizons.jpg',
    pioneer: '/textures/real/pioneer.jpg',
    pioneer2: '/textures/real/pioneer2.jpg',
    juno: '/textures/real/juno.jpg',
    cassini: '/textures/real/cassini.jpg',
    iss: '/textures/real/iss.jpg',
    hubble: '/textures/real/hubble.jpeg'
};

export const SOLAR_SYSTEM_DATA = {
    "sun": {
        nome: "Sol",
        tipo: "Estrela",
        distanciaMediaAoSol: 0,
        duracaoDia: "25-35 dias",
        duracaoAno: "N/A",
        numeroLuasConhecidas: 0,
        principaisLuas: [],
        temperaturaMediaAproximada: "5500 °C (superfície)",
        curiosidades: [
            "Contém 99,86% da massa de todo o Sistema Solar.",
            "É uma estrela anã amarela.",
            "A luz do Sol demora cerca de 8 minutos a chegar à Terra."
        ],
        factosUau: [
            "🤯 O Sol é TÃO grande que caberiam 1 MILHÃO de Terras lá dentro!",
            "🔥 O centro do Sol está a 15 MILHÕES de graus! Mais quente que qualquer coisa na Terra!",
            "⚡ A cada segundo, o Sol transforma 4 milhões de toneladas de si mesmo em luz e calor!",
            "🚗 Se pudesses conduzir até ao Sol a 100 km/h, demoravas 170 ANOS a chegar!"
        ],
        comparacao: "Se o Sol fosse uma bola de praia, a Terra seria do tamanho de uma ervilha!",
        raioKm: 696340,
        cor: 0xffff00,
        textureUrl: TEXTURES.sun,
        imagemReal: REAL_PHOTOS.sun
    },
    "mercury": {
        nome: "Mercúrio",
        tipo: "Planeta Rochoso",
        distanciaMediaAoSol: 58,
        duracaoDia: "59 dias terrestres",
        duracaoAno: "88 dias terrestres",
        numeroLuasConhecidas: 0,
        principaisLuas: [],
        temperaturaMediaAproximada: "167 °C",
        curiosidades: [
            "É o planeta mais pequeno do Sistema Solar.",
            "Não tem atmosfera para reter calor, oscilando entre muito quente e muito frio.",
            "A sua superfície assemelha-se à da Lua com muitas crateras."
        ],
        factosUau: [
            "🏃 Mercúrio é o planeta mais RÁPIDO! Dá a volta ao Sol em apenas 88 dias!",
            "🌡️ De dia faz 430°C (derretia uma pizza!) mas à noite faz -180°C (mais frio que o congelador)!",
            "📏 Mercúrio é tão pequeno que só é um pouco maior que a nossa Lua!",
            "🕳️ Está cheio de crateras porque não tem ar para protegê-lo de meteoritos!"
        ],
        comparacao: "Mercúrio é do tamanho de uma bola de ténis se a Terra fosse uma bola de basebol.",
        raioKm: 2439,
        cor: 0xA9A9A9,
        textureUrl: TEXTURES.mercury,
        imagemReal: REAL_PHOTOS.mercury
    },
    "venus": {
        nome: "Vénus",
        tipo: "Planeta Rochoso",
        distanciaMediaAoSol: 108,
        duracaoDia: "243 dias terrestres",
        duracaoAno: "225 dias terrestres",
        numeroLuasConhecidas: 0,
        principaisLuas: [],
        temperaturaMediaAproximada: "464 °C",
        curiosidades: [
            "É o planeta mais quente do Sistema Solar devido ao efeito de estufa.",
            "Roda no sentido contrário à maioria dos outros planetas.",
            "É frequentemente chamado de 'Estrela da Manhã' ou 'Estrela da Tarde'."
        ],
        factosUau: [
            "🔥 Vénus é o planeta mais QUENTE! Faz 464°C - mais quente que um forno de pizza!",
            "🔄 Um dia em Vénus é MAIOR que um ano! Demora 243 dias a rodar, mas só 225 a dar a volta ao Sol!",
            "🙃 Vénus roda ao CONTRÁRIO! O Sol nasce a Oeste e põe-se a Este!",
            "⭐ Às vezes podes ver Vénus à noite! É a 'estrela' mais brilhante no céu!"
        ],
        comparacao: "Vénus é quase do mesmo tamanho que a Terra - são como planetas gémeos!",
        raioKm: 6051,
        cor: 0xE6E6FA,
        textureUrl: TEXTURES.venus,
        imagemReal: REAL_PHOTOS.venus
    },
    "earth": {
        nome: "Terra",
        tipo: "Planeta Rochoso",
        distanciaMediaAoSol: 150,
        duracaoDia: "24 horas",
        duracaoAno: "365,25 dias",
        numeroLuasConhecidas: 1,
        principaisLuas: ["Lua"],
        temperaturaMediaAproximada: "15 °C",
        curiosidades: [
            "O único planeta conhecido que alberga vida.",
            "70% da sua superfície está coberta por água.",
            "Tem um campo magnético que nos protege da radiação solar."
        ],
        factosUau: [
            "🏠 A Terra é o ÚNICO lugar no Universo onde sabemos que existe vida!",
            "💧 70% da Terra é coberta por ÁGUA - por isso parece uma bola azul do espaço!",
            "🧲 A Terra é como um íman gigante! O campo magnético protege-nos do Sol!",
            "🌍 A Terra está a RODAR a 1670 km/h! Mas não sentimos porque tudo à nossa volta também roda!"
        ],
        comparacao: "A Terra é como uma nave espacial gigante - viaja pelo espaço a 107.000 km/h à volta do Sol!",
        raioKm: 6371,
        cor: 0x0000FF,
        textureUrl: TEXTURES.earth,
        imagemReal: REAL_PHOTOS.earth,
        moons: [
            {
                id: "moon",
                nome: "Lua",
                raioKm: 1737,
                distanciaKm: 384400,
                cor: 0x888888,
                descricao: "O único satélite natural da Terra e o quinto maior do Sistema Solar.",
                textureUrl: TEXTURES.moon,
                imagemReal: REAL_PHOTOS.moon,
                factosUau: [
                    "👨‍🚀 12 pessoas já CAMINHARAM na Lua! A primeira foi Neil Armstrong em 1969!",
                    "🦶 Na Lua não há vento, então as pegadas dos astronautas ainda lá estão!",
                    "🏋️ Na Lua pesarias 6x menos! Se pesas 30 kg, lá pesarias só 5 kg!",
                    "🌙 A Lua está a afastar-se da Terra 3,8 cm por ano - mais ou menos como as tuas unhas crescem!"
                ]
            }
        ]
    },
    "mars": {
        nome: "Marte",
        tipo: "Planeta Rochoso",
        distanciaMediaAoSol: 228,
        duracaoDia: "24h 37m",
        duracaoAno: "687 dias terrestres",
        numeroLuasConhecidas: 2,
        principaisLuas: ["Fobos", "Deimos"],
        temperaturaMediaAproximada: "-63 °C",
        curiosidades: [
            "Conhecido como o Planeta Vermelho devido ao óxido de ferro.",
            "Tem o maior vulcão do Sistema Solar, o Monte Olimpo.",
            "Existem evidências de água líquida no passado."
        ],
        factosUau: [
            "🔴 Marte é VERMELHO porque está coberto de FERRUGEM! (óxido de ferro)",
            "🌋 O Monte Olimpo em Marte é o MAIOR vulcão do Sistema Solar - 3x maior que o Evereste!",
            "🤖 Há robots da NASA em Marte AGORA MESMO a explorar! Chamam-se rovers.",
            "👨‍🚀 Os cientistas querem enviar PESSOAS para Marte! Talvez tu possas ir quando fores grande!"
        ],
        comparacao: "Se pudesses saltar 1 metro na Terra, em Marte saltarias 2,5 metros!",
        raioKm: 3389,
        cor: 0xFF4500,
        textureUrl: TEXTURES.mars,
        imagemReal: REAL_PHOTOS.mars,
        moons: [
            {
                id: "phobos",
                nome: "Fobos",
                raioKm: 11,
                distanciaKm: 9377,
                cor: 0x8B4513,
                textureUrl: TEXTURES.phobos,
                imagemReal: REAL_PHOTOS.phobos,
                descricao: "A maior e mais próxima das duas luas de Marte.",
                factosUau: [
                    "💥 Fobos está a aproximar-se de Marte e um dia vai chocar com o planeta ou partir-se em bocadinhos!",
                    "🏃 Fobos dá a volta a Marte 3 vezes por dia marciano! É rapidíssima!"
                ]
            },
            {
                id: "deimos",
                nome: "Deimos",
                raioKm: 6,
                distanciaKm: 23460,
                cor: 0xA0522D,
                textureUrl: TEXTURES.deimos,
                imagemReal: REAL_PHOTOS.deimos,
                descricao: "A lua mais pequena e mais afastada de Marte.",
                factosUau: [
                    "🥔 Deimos tem forma de batata! Só tem 6 km de tamanho.",
                    "👀 Vista de Marte, Deimos parece uma estrela brilhante, não uma lua!"
                ]
            }
        ]
    },
    "jupiter": {
        nome: "Júpiter",
        tipo: "Gigante Gasoso",
        distanciaMediaAoSol: 778,
        duracaoDia: "9h 56m",
        duracaoAno: "12 anos terrestres",
        numeroLuasConhecidas: 95,
        principaisLuas: ["Io", "Europa", "Ganimedes", "Calisto"],
        temperaturaMediaAproximada: "-108 °C",
        curiosidades: [
            "É o maior planeta do Sistema Solar.",
            "Tem uma Grande Mancha Vermelha, uma tempestade gigante.",
            "Tem anéis ténues, mas difíceis de ver."
        ],
        factosUau: [
            "👑 Júpiter é o REI dos planetas! É TÃO grande que cabiam mais de 1300 Terras lá dentro!",
            "🌀 A Grande Mancha Vermelha é uma TEMPESTADE maior que a Terra! Dura há mais de 400 anos!",
            "⏱️ Júpiter roda TÃO rápido que um dia só tem 10 horas! É o dia mais curto de todos os planetas!",
            "🛡️ Júpiter é o nosso PROTETOR! A sua gravidade atrai asteróides perigosos para longe da Terra!"
        ],
        comparacao: "Júpiter é como o guarda-costas da Terra - protege-nos de rochas espaciais!",
        raioKm: 69911,
        cor: 0xDAA520,
        textureUrl: TEXTURES.jupiter,
        imagemReal: REAL_PHOTOS.jupiter,
        moons: [
            {
                id: "io",
                nome: "Io",
                raioKm: 1821,
                distanciaKm: 421700,
                cor: 0xFFFFE0,
                textureUrl: TEXTURES.io,
                imagemReal: REAL_PHOTOS.io,
                descricao: "O corpo geologicamente mais ativo do Sistema Solar com centenas de vulcões.",
                factosUau: [
                    "🌋 Io tem CENTENAS de vulcões activos! É o lugar com mais vulcões do Sistema Solar!",
                    "🍕 As cores de Io (amarelo, laranja, vermelho) fazem-na parecer uma pizza gigante!",
                    "🔥 Os vulcões de Io lançam lava a 300 km de altura no espaço!"
                ]
            },
            {
                id: "europa",
                nome: "Europa",
                raioKm: 1560,
                distanciaKm: 670900,
                cor: 0xF5F5F5,
                textureUrl: TEXTURES.europa,
                imagemReal: REAL_PHOTOS.europa,
                descricao: "Possui uma superfície de gelo muito suave e possivelmente um oceano subterrâneo.",
                factosUau: [
                    "🌊 Debaixo do gelo de Europa há um OCEANO com mais água que todos os oceanos da Terra juntos!",
                    "👽 Os cientistas acham que pode haver VIDA alienígena em Europa! (micróbios, não extraterrestres verdes)",
                    "🧊 A superfície de Europa é gelo liso - seria perfeita para patinar!"
                ]
            },
            {
                id: "ganymede",
                nome: "Ganimedes",
                raioKm: 2634,
                distanciaKm: 1070400,
                cor: 0xA9A9A9,
                imagemReal: REAL_PHOTOS.ganymede,
                descricao: "A maior lua do Sistema Solar, maior que Mercúrio.",
                factosUau: [
                    "🏆 Ganimedes é a MAIOR lua do Sistema Solar! É maior que o planeta Mercúrio!",
                    "🧲 É a única lua com o seu próprio campo magnético - como uma mini-Terra!",
                    "🥪 Ganimedes é como uma sanduíche: camadas de gelo, água e rocha!"
                ]
            },
            {
                id: "callisto",
                nome: "Calisto",
                raioKm: 2410,
                distanciaKm: 1882700,
                cor: 0x696969,
                textureUrl: TEXTURES.callisto,
                imagemReal: REAL_PHOTOS.callisto,
                descricao: "Satélite com a superfície mais antiga e com mais crateras do Sistema Solar.",
                factosUau: [
                    "🕳️ Calisto tem TANTAS crateras que não cabe mais nenhuma! É a superfície mais antiga do Sistema Solar!",
                    "🏠 Calisto seria um bom lugar para uma base espacial porque não tem muita radiação!"
                ]
            }
        ]
    },
    "saturn": {
        nome: "Saturno",
        tipo: "Gigante Gasoso",
        distanciaMediaAoSol: 1434,
        duracaoDia: "10h 34m",
        duracaoAno: "29 anos terrestres",
        numeroLuasConhecidas: 146,
        principaisLuas: ["Titã", "Encélado", "Mimas"],
        temperaturaMediaAproximada: "-139 °C",
        curiosidades: [
            "Famoso pelo seu sistema de anéis complexo e visível.",
            "É o planeta menos denso, flutuaria em água.",
            "A sua forma é visivelmente achatada nos pólos."
        ],
        factosUau: [
            "💍 Os ANÉIS de Saturno são feitos de BILHÕES de pedaços de gelo e rocha! Alguns pequenos como grãos de areia, outros grandes como casas!",
            "🛁 Saturno FLUTUARIA numa banheira gigante! É menos denso que a água!",
            "🌙 Saturno tem 146 LUAS! Mais do que qualquer outro planeta!",
            "📏 Os anéis têm 280.000 km de largura, mas só 10 metros de espessura - como uma folha de papel gigante!"
        ],
        comparacao: "Se Saturno fosse uma bola de basquetebol, os anéis seriam como um disco de pizza gigante à volta!",
        raioKm: 58232,
        cor: 0xF4C430,
        temAneis: true,
        tipoAneis: 'bright', // Saturn has bright, prominent rings
        textureUrl: TEXTURES.saturn,
        imagemReal: REAL_PHOTOS.saturn,
        moons: [
            {
                id: "titan",
                nome: "Titã",
                raioKm: 2575,
                distanciaKm: 1222000,
                cor: 0xD2B48C,
                imagemReal: REAL_PHOTOS.titan,
                descricao: "A segunda maior lua do Sistema Solar e a única com uma atmosfera densa.",
                factosUau: [
                    "🌫️ Titã é a ÚNICA lua com atmosfera espessa! Nem consegues ver a superfície por causa das nuvens!",
                    "🌊 Titã tem LAGOS e RIOS, mas não de água - são de METANO líquido! (o gás do fogão)",
                    "☔ Em Titã chove metano! Imagina chuva de gás!",
                    "🚀 Uma sonda chamada Huygens aterrou em Titã em 2005 e tirou fotos!"
                ]
            },
            {
                id: "enceladus",
                nome: "Encélado",
                raioKm: 252,
                distanciaKm: 238000,
                cor: 0xFFFFFF,
                imagemReal: REAL_PHOTOS.enceladus,
                descricao: "Reflete quase 100% da luz solar, é coberto de gelo fresco e limpo.",
                factosUau: [
                    "💨 Encélado tem GEYSERS que lançam água para o espaço! Fazem um dos anéis de Saturno!",
                    "✨ É a lua mais BRILHANTE do Sistema Solar! Reflete quase toda a luz que recebe!",
                    "🌊 Debaixo do gelo há um oceano quente - pode ter vida!"
                ]
            },
            {
                id: "mimas",
                nome: "Mimas",
                raioKm: 198,
                distanciaKm: 185500,
                cor: 0xDCDCDC,
                textureUrl: TEXTURES.mimas,
                imagemReal: REAL_PHOTOS.mimas,
                descricao: "Conhecida pela sua enorme cratera Herschel, fazendo-a parecer a 'Estrela da Morte'.",
                factosUau: [
                    "⭐ Mimas parece a ESTRELA DA MORTE do Star Wars! Tem uma cratera GIGANTE que quase a partiu ao meio!",
                    "🎯 A cratera Herschel tem 130 km - 1/3 do tamanho de toda a lua!",
                    "🏔️ O pico no centro da cratera é quase tão alto como o Monte Evereste!"
                ]
            }
        ]
    },
    "uranus": {
        nome: "Úrano",
        tipo: "Gigante Gelado",
        distanciaMediaAoSol: 2871,
        duracaoDia: "17h 14m",
        duracaoAno: "84 anos terrestres",
        numeroLuasConhecidas: 27,
        principaisLuas: ["Titânia", "Oberon"],
        temperaturaMediaAproximada: "-197 °C",
        curiosidades: [
            "Roda 'deitado' com o eixo quase no plano da órbita.",
            "A sua cor azul-esverdeada deve-se ao metano na atmosfera.",
            "Foi o primeiro planeta descoberto com um telescópio."
        ],
        factosUau: [
            "🛋️ Úrano está DEITADO! Roda de lado como uma bola a rolar - ninguém sabe bem porquê!",
            "💎 Pode CHOVER DIAMANTES em Úrano! A pressão é tão grande que transforma carbono em diamantes!",
            "❄️ É o planeta mais FRIO! Chega a -224°C!",
            "🔭 Foi o primeiro planeta descoberto com um TELESCÓPIO em 1781! Os antigos não o conheciam."
        ],
        comparacao: "Úrano cabiam 63 Terras lá dentro! É um gigante, mas não se vê bem a olho nu.",
        raioKm: 25362,
        cor: 0x40E0D0,
        temAneis: true,
        tipoAneis: 'dark', // Uranus has dark, thin rings
        textureUrl: TEXTURES.uranus,
        imagemReal: REAL_PHOTOS.uranus,
        moons: [
            {
                id: "titania",
                nome: "Titânia",
                raioKm: 788,
                distanciaKm: 436300,
                cor: 0xD3D3D3,
                imagemReal: REAL_PHOTOS.titania,
                descricao: "A maior lua de Úrano.",
                factosUau: [
                    "👑 Titânia é a RAINHA das luas de Úrano - é a maior!",
                    "🏔️ Tem canyons gigantes maiores que o Grand Canyon da Terra!"
                ]
            },
            {
                id: "oberon",
                nome: "Oberon",
                raioKm: 761,
                distanciaKm: 583500,
                cor: 0xA9A9A9,
                imagemReal: REAL_PHOTOS.oberon,
                descricao: "A segunda maior lua de Úrano e a mais distante das grandes luas.",
                factosUau: [
                    "📚 Oberon tem o nome do rei das fadas de uma peça de Shakespeare!",
                    "🏔️ Tem uma montanha com 11 km de altura - mais alta que qualquer montanha na Terra!"
                ]
            }
        ]
    },
    "neptune": {
        nome: "Neptuno",
        tipo: "Gigante Gelado",
        distanciaMediaAoSol: 4495,
        duracaoDia: "16h 6m",
        duracaoAno: "165 anos terrestres",
        numeroLuasConhecidas: 14,
        principaisLuas: ["Tritão"],
        temperaturaMediaAproximada: "-201 °C",
        curiosidades: [
            "É o planeta mais distante do Sol (dos conhecidos).",
            "Tem ventos supersónicos que atingem 2100 km/h.",
            "A sua cor azul intensa também vem do metano, mas algo mais contribui para a cor viva."
        ],
        factosUau: [
            "💨 Neptuno tem os ventos mais FORTES do Sistema Solar! Chegam a 2100 km/h - mais rápido que um avião a jacto!",
            "🔵 Neptuno é o planeta mais AZUL! Parece uma bola de gude gigante!",
            "🧮 Neptuno foi descoberto com MATEMÁTICA! Calcularam onde estava antes de o verem!",
            "📅 Um ano em Neptuno = 165 anos terrestres! Se lá nascesses, ainda não terias feito 1 ano!"
        ],
        comparacao: "Neptuno está TÃO longe que a luz do Sol demora 4 HORAS a chegar lá!",
        raioKm: 24622,
        cor: 0x00008B,
        temAneis: true,
        tipoAneis: 'faint', // Neptune has very faint, thin rings
        textureUrl: TEXTURES.neptune,
        imagemReal: REAL_PHOTOS.neptune,
        moons: [
            {
                id: "triton",
                nome: "Tritão",
                raioKm: 1353,
                distanciaKm: 354759,
                cor: 0xFFC0CB,
                imagemReal: REAL_PHOTOS.triton,
                descricao: "A única grande lua do Sistema Solar que orbita na direção oposta à rotação do planeta.",
                factosUau: [
                    "🔄 Tritão orbita ao CONTRÁRIO! É a única lua grande que faz isso!",
                    "🧊 Tritão é TÃO frio (-235°C) que tem geysers de AZOTO congelado!",
                    "🎣 Neptuno provavelmente 'pescou' Tritão - era um objecto que passava e ficou preso pela gravidade!"
                ]
            },
            {
                id: "proteus",
                nome: "Proteu",
                raioKm: 210,
                distanciaKm: 117647,
                cor: 0x708090,
                imagemReal: REAL_PHOTOS.proteus,
                descricao: "A segunda maior lua de Neptuno.",
                factosUau: [
                    "🥔 Proteu tem forma irregular - parece uma batata espacial!",
                    "🔭 Só foi descoberta em 1989 pela sonda Voyager 2!"
                ]
            }
        ]
    },
    // ============ PLANETAS ANÕES ============
    "pluto": {
        nome: "Plutão",
        tipo: "Planeta Anão",
        distanciaMediaAoSol: 5900,
        duracaoDia: "6,4 dias terrestres",
        duracaoAno: "248 anos terrestres",
        numeroLuasConhecidas: 5,
        principaisLuas: ["Caronte"],
        temperaturaMediaAproximada: "-230 °C",
        curiosidades: [
            "Foi considerado o 9º planeta até 2006.",
            "Tem um coração gigante de gelo de nitrogénio.",
            "A sua maior lua, Caronte, é quase do seu tamanho."
        ],
        factosUau: [
            "💔 Plutão foi 'despromovido' de planeta em 2006! Muitas pessoas ficaram tristes.",
            "❤️ Plutão tem um CORAÇÃO gigante! É uma planície de gelo em forma de coração chamada Tombaugh Regio!",
            "💃 Plutão e a sua lua Caronte dançam juntos - estão sempre virados um para o outro!",
            "🥶 É TÃO frio que o ar congela e cai como neve!"
        ],
        comparacao: "Plutão é mais pequeno que a nossa Lua! Tem apenas 2/3 do tamanho dela.",
        raioKm: 1188,
        cor: 0xE5D3B3,
        ehPlanetoAnao: true,
        imagemReal: REAL_PHOTOS.pluto,
        moons: [
            {
                id: "charon",
                nome: "Caronte",
                raioKm: 606,
                distanciaKm: 19591,
                cor: 0x808080,
                imagemReal: REAL_PHOTOS.charon,
                descricao: "A maior lua de Plutão, quase metade do seu tamanho.",
                factosUau: [
                    "💑 Caronte e Plutão são como um casal - estão sempre virados um para o outro!",
                    "🏔️ Tem uma montanha dentro de uma cratera - ninguém sabe bem porquê!"
                ]
            }
        ]
    },
    "ceres": {
        nome: "Ceres",
        tipo: "Planeta Anão",
        distanciaMediaAoSol: 414,
        duracaoDia: "9 horas",
        duracaoAno: "4,6 anos terrestres",
        numeroLuasConhecidas: 0,
        principaisLuas: [],
        temperaturaMediaAproximada: "-105 °C",
        curiosidades: [
            "É o maior objeto no cinturão de asteroides.",
            "Foi o primeiro asteroide a ser descoberto em 1801.",
            "Contém mais água doce que toda a Terra."
        ],
        factosUau: [
            "💧 Ceres pode ter MAIS água doce que toda a Terra! Está escondida debaixo da superfície!",
            "💡 Tem pontos BRILHANTES misteriosos - são sais que refletem a luz do Sol!",
            "🏆 Foi o primeiro asteroide descoberto, em 1801! Um padre italiano encontrou-o.",
            "🌍 Se Ceres tivesse nascido mais perto do Sol, poderia ter virado um planeta!"
        ],
        comparacao: "Ceres é do tamanho do Texas, mas redondo como uma bola!",
        raioKm: 473,
        cor: 0x9E9E9E,
        ehPlanetoAnao: true,
        imagemReal: REAL_PHOTOS.ceres
    },
    "eris": {
        nome: "Éris",
        tipo: "Planeta Anão",
        distanciaMediaAoSol: 10125,
        duracaoDia: "25,9 horas",
        duracaoAno: "558 anos terrestres",
        numeroLuasConhecidas: 1,
        principaisLuas: ["Disnomia"],
        temperaturaMediaAproximada: "-243 °C",
        curiosidades: [
            "É o planeta anão mais massivo conhecido.",
            "A sua descoberta levou à reclassificação de Plutão.",
            "Está tão longe que demora 13 horas para a luz chegar lá."
        ],
        factosUau: [
            "😈 Éris tem o nome da deusa grega da discórdia - porque causou confusão sobre o que é um planeta!",
            "🥇 Éris é mais PESADA que Plutão! Por isso Plutão deixou de ser planeta.",
            "🌨️ A sua superfície é coberta de gelo de metano - parece uma bola de neve gigante!",
            "📏 Está TÃO longe que um ano lá dura 558 anos terrestres!"
        ],
        comparacao: "Éris está 3x mais longe do Sol que Plutão!",
        raioKm: 1163,
        cor: 0xFAFAFA,
        ehPlanetoAnao: true,
        imagemReal: REAL_PHOTOS.eris,
        moons: [
            {
                id: "dysnomia",
                nome: "Disnomia",
                raioKm: 350,
                distanciaKm: 37350,
                cor: 0x696969,
                imagemReal: REAL_PHOTOS.dysnomia,
                descricao: "A única lua de Éris, nomeada em honra da filha da deusa Éris.",
                factosUau: [
                    "👻 Disnomia é a deusa da ilegalidade na mitologia grega!",
                    "🔭 Foi descoberta em 2005 pelo telescópio Hubble!"
                ]
            }
        ]
    },
    "makemake": {
        nome: "Makemake",
        tipo: "Planeta Anão",
        distanciaMediaAoSol: 6850,
        duracaoDia: "22,5 horas",
        duracaoAno: "305 anos terrestres",
        numeroLuasConhecidas: 1,
        principaisLuas: [],
        temperaturaMediaAproximada: "-243 °C",
        curiosidades: [
            "É um dos objetos mais brilhantes no Cinturão de Kuiper.",
            "Não tem atmosfera significativa.",
            "Foi descoberto na Páscoa de 2005."
        ],
        factosUau: [
            "🐣 Foi descoberto perto da Páscoa, por isso tem o nome do deus da fertilidade da Ilha de Páscoa!",
            "🔴 Makemake é avermelhado por causa de químicos orgânicos congelados!",
            "🥶 É um dos lugares mais FRIOS do Sistema Solar!",
            "🌑 Não tem atmosfera - o ar congelou todo!"
        ],
        comparacao: "Makemake é como uma bola de neve vermelha do tamanho de um país pequeno!",
        raioKm: 715,
        cor: 0xCD853F,
        ehPlanetoAnao: true,
        imagemReal: REAL_PHOTOS.makemake
    },
    "haumea": {
        nome: "Haumea",
        tipo: "Planeta Anão",
        distanciaMediaAoSol: 6452,
        duracaoDia: "3,9 horas",
        duracaoAno: "284 anos terrestres",
        numeroLuasConhecidas: 2,
        principaisLuas: ["Hiʻiaka", "Namaka"],
        temperaturaMediaAproximada: "-241 °C",
        curiosidades: [
            "Tem a forma de uma bola de rugby por rodar muito rápido.",
            "Tem dois anéis e duas luas conhecidas.",
            "É composto principalmente de rocha coberta de gelo."
        ],
        factosUau: [
            "🏈 Haumea tem forma de BOLA DE RUGBY! Roda tão rápido que esticou!",
            "⏱️ Um dia em Haumea dura só 4 horas! É o planeta anão mais rápido a rodar!",
            "💍 Tem ANÉIS como Saturno, mas muito mais pequenos!",
            "🌺 Tem o nome da deusa havaiana da fertilidade!"
        ],
        comparacao: "Haumea parece um ovo espacial gigante a girar!",
        raioKm: 816,
        cor: 0xF5F5DC,
        ehPlanetoAnao: true,
        imagemReal: REAL_PHOTOS.haumea
    },
    
    // Space Probes
    "voyager1": {
        nome: "Voyager 1",
        tipo: "Sonda Espacial",
        distanciaKm: "24 mil milhões km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-270 °C",
        imagemReal: REAL_PHOTOS.voyager,
        curiosidades: [
            "É o objeto feito pelo Homem mais distante da Terra!",
            "Viaja no espaço desde 1977.",
            "Leva um disco dourado com sons e imagens da Terra."
        ],
        factosUau: [
            "🚀 A Voyager 1 está TÃO longe que os sinais demoram 22 HORAS a chegar!",
            "💿 Leva um disco de OURO com músicas e mensagens caso aliens a encontrem!",
            "🌌 Já saiu do Sistema Solar e está no espaço interestelar!",
            "⚡ Ainda funciona depois de 45+ anos no espaço!"
        ],
        comparacao: "A Voyager 1 é como uma mensagem numa garrafa lançada ao oceano do espaço!",
        descricao: "Lançada em 1977, a Voyager 1 é a sonda espacial mais distante da Terra. Transporta um disco dourado com sons e imagens da nossa civilização."
    },
    "voyager2": {
        nome: "Voyager 2",
        tipo: "Sonda Espacial",
        distanciaKm: "20 mil milhões km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-270 °C",
        imagemReal: REAL_PHOTOS.voyager,
        curiosidades: [
            "É a única sonda a ter visitado os 4 planetas gigantes!",
            "Visitou Júpiter, Saturno, Úrano e Neptuno.",
            "Também leva um disco dourado para os aliens."
        ],
        factosUau: [
            "🏆 É a ÚNICA sonda a ter visitado Úrano e Neptuno!",
            "👀 Fotografou vulcões ativos em Io, uma lua de Júpiter!",
            "🎯 Foi lançada 16 dias ANTES da Voyager 1, mas chegou depois!",
            "🌍 Ainda envia dados para a Terra depois de 45+ anos!"
        ],
        comparacao: "A Voyager 2 fez um tour completo pelos planetas gigantes!",
        descricao: "A Voyager 2 é a única sonda a ter visitado os quatro planetas gigantes gasosos do nosso Sistema Solar."
    },
    "newhorizons": {
        nome: "New Horizons",
        tipo: "Sonda Espacial",
        distanciaKm: "8 mil milhões km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-230 °C",
        imagemReal: REAL_PHOTOS.newhorizons,
        curiosidades: [
            "Fotografou Plutão de perto em 2015!",
            "Descobriu que Plutão tem um coração de gelo.",
            "É a sonda mais rápida já lançada."
        ],
        factosUau: [
            "❤️ Descobriu um CORAÇÃO gigante de gelo em Plutão!",
            "🏎️ Foi a sonda mais RÁPIDA a deixar a Terra - 58.000 km/h!",
            "📸 As fotos de Plutão demoraram 4 HORAS a chegar à Terra!",
            "🪨 Depois de Plutão, visitou outro objeto ainda mais longe!"
        ],
        comparacao: "A New Horizons revelou que Plutão tem um coração!",
        descricao: "Lançada em 2006, a New Horizons foi a primeira sonda a visitar Plutão, revelando detalhes incríveis sobre este mundo distante."
    },
    "pioneer10": {
        nome: "Pioneer 10",
        tipo: "Sonda Espacial",
        distanciaKm: "18 mil milhões km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-270 °C",
        imagemReal: [REAL_PHOTOS.pioneer, REAL_PHOTOS.pioneer2],
        curiosidades: [
            "Primeira sonda a atravessar o cinturão de asteroides.",
            "Primeira a fazer um flyby de Júpiter.",
            "Perdemos contacto em 2003."
        ],
        factosUau: [
            "🥇 Foi a PRIMEIRA sonda a cruzar o cinturão de asteroides!",
            "📡 O último sinal foi recebido em 2003!",
            "🗺️ Leva uma placa com um mapa para a Terra!",
            "⏳ Demorará 2 MILHÕES de anos a chegar à estrela mais próxima!"
        ],
        comparacao: "A Pioneer 10 foi a exploradora que abriu caminho para as outras!",
        descricao: "Lançada em 1972, a Pioneer 10 foi a primeira sonda a atravessar o cinturão de asteroides e a primeira a estudar Júpiter de perto."
    },
    "juno": {
        nome: "Juno",
        tipo: "Sonda Espacial",
        distanciaKm: "778 milhões km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-145 °C",
        imagemReal: REAL_PHOTOS.juno,
        curiosidades: [
            "Estuda Júpiter desde 2016.",
            "Tem os maiores painéis solares de qualquer sonda.",
            "Orbita por cima dos polos de Júpiter."
        ],
        factosUau: [
            "☀️ Os painéis solares da Juno são do tamanho de um autocarro!",
            "🌀 Descobriu que a Grande Mancha Vermelha vai até 500 km de profundidade!",
            "🔊 Gravou sons estranhos de Júpiter que parecem música eletrónica!",
            "🛡️ Tem uma 'armadura' de titânio para resistir à radiação!"
        ],
        comparacao: "A Juno é como um espião que orbita Júpiter!",
        descricao: "A sonda Juno está em órbita de Júpiter desde 2016, estudando a atmosfera e o interior do maior planeta do Sistema Solar."
    },
    "cassini": {
        nome: "Cassini",
        tipo: "Sonda Espacial",
        distanciaKm: "1.4 mil milhões km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-180 °C",
        imagemReal: REAL_PHOTOS.cassini,
        curiosidades: [
            "Estudou Saturno durante 13 anos!",
            "Descobriu oceanos em Encélado.",
            "Mergulhou em Saturno em 2017."
        ],
        factosUau: [
            "💧 Descobriu ÁGUA líquida a jorrar de Encélado!",
            "📸 Tirou mais de 450.000 fotos de Saturno e suas luas!",
            "🪐 Atravessou os anéis de Saturno - e sobreviveu!",
            "🔥 No final da missão, mergulhou em Saturno e derreteu!"
        ],
        comparacao: "A Cassini foi a melhor amiga de Saturno durante 13 anos!",
        descricao: "A missão Cassini-Huygens estudou Saturno e suas luas de 2004 a 2017, fazendo descobertas revolucionárias sobre o sistema saturniano."
    },
    "iss": {
        nome: "Estação Espacial Internacional",
        tipo: "Estação Espacial",
        distanciaKm: "408 km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-157°C a 121°C",
        imagemReal: REAL_PHOTOS.iss,
        curiosidades: [
            "Orbita a Terra 16 vezes por dia!",
            "Tem o tamanho de um campo de futebol.",
            "Astronautas de 19 países já lá estiveram."
        ],
        factosUau: [
            "🏠 É a maior estrutura já construída no ESPAÇO!",
            "🌅 Os astronautas veem 16 nasceres e pores do sol por DIA!",
            "⚽ Tem o tamanho de um CAMPO DE FUTEBOL!",
            "🚀 Viaja a 28.000 km/h - dá a volta à Terra em 90 minutos!"
        ],
        comparacao: "A ISS é uma casa voadora onde astronautas vivem e trabalham no espaço!",
        descricao: "A Estação Espacial Internacional é um laboratório em órbita onde astronautas fazem experiências e estudam como viver no espaço. É um projeto de 15 países!"
    },
    "hubble": {
        nome: "Telescópio Espacial Hubble",
        tipo: "Telescópio Espacial",
        distanciaKm: "547 km",
        duracaoDia: "N/A",
        duracaoAno: "N/A",
        temperaturaMediaAproximada: "-150°C a 20°C",
        imagemReal: REAL_PHOTOS.hubble,
        curiosidades: [
            "Orbita a Terra desde 1990.",
            "Tirou mais de 1,5 milhões de fotografias.",
            "Consegue ver galáxias a 13 mil milhões de anos-luz."
        ],
        factosUau: [
            "📸 Tirou mais de 1,5 MILHÕES de fotos do espaço!",
            "👀 Consegue ver galáxias a 13 MIL MILHÕES de anos-luz!",
            "🔧 Astronautas foram ao espaço 5 vezes para o reparar!",
            "📡 Envia 120 gigabytes de dados por SEMANA!"
        ],
        comparacao: "O Hubble é como um super olho no espaço que nos mostra maravilhas do Universo!",
        descricao: "O Telescópio Espacial Hubble orbita acima da atmosfera da Terra, tirando fotos incrivelmente nítidas de galáxias, nebulosas e estrelas distantes. Revolucionou a nossa compreensão do Universo!"
    },
    
    // Easter Egg: UFO / Alien Spaceship 🛸
    "ufo": {
        nome: "OVNI Misterioso",
        tipo: "Nave Alienígena",
        distanciaKm: "??? km",
        duracaoDia: "???",
        duracaoAno: "???",
        temperaturaMediaAproximada: "??? °C",
        curiosidades: [
            "Objeto Voador Não Identificado detetado perto da Terra!",
            "Os cientistas procuram vida extraterrestre com radiotelescópios.",
            "O programa SETI procura sinais de civilizações alienígenas.",
            "Ainda não encontrámos provas de vida inteligente fora da Terra."
        ],
        factosUau: [
            "👽 A Via Láctea tem 100 a 400 MIL MILHÕES de estrelas - pode haver vida algures!",
            "🔭 O telescópio James Webb pode ver planetas a anos-luz de distância!",
            "💧 Já encontrámos água em luas como Europa e Encélado - onde há água, pode haver vida!",
            "📡 Enviámos mensagens para o espaço! O 'Golden Record' nas Voyager tem sons da Terra!",
            "🦠 A vida mais resistente na Terra são os tardígrados - sobrevivem no espaço!"
        ],
        comparacao: "Se existirem alienígenas, provavelmente são micróbios ou seres muito diferentes de nós!",
        descricao: "Será que estamos sozinhos no Universo? Os cientistas procuram vida em todo o lado - desde micróbios em Marte até sinais de rádio de civilizações distantes. O Universo é ENORME, e ainda só explorámos uma pequenina parte!",
        isEasterEgg: true,
        emoji: "🛸"
    }
};

/**
 * Get translated data for a solar system object
 * Merges base data (with textures, numeric values) with translated strings
 * @param {string} objectName - Internal name of the object (e.g., "Sol", "Terra")
 * @returns {object} Object data with translated strings
 */
export function getTranslatedObjectData(objectName) {
    const baseData = SOLAR_SYSTEM_DATA[objectName];
    if (!baseData) return null;
    
    // If language is Portuguese, return base data as-is
    if (i18n.lang === 'pt') {
        return baseData;
    }
    
    // Get English translation if available
    const enData = SOLAR_SYSTEM_DATA_EN[objectName];
    if (!enData) {
        return baseData; // Fallback to Portuguese
    }
    
    // Merge: keep base properties (textures, colors, numeric values)
    // but override translated strings
    const merged = { ...baseData };
    
    // Override translatable fields
    if (enData.nome) merged.nome = enData.nome;
    if (enData.tipo) merged.tipo = enData.tipo;
    if (enData.duracaoDia) merged.duracaoDia = enData.duracaoDia;
    if (enData.duracaoAno) merged.duracaoAno = enData.duracaoAno;
    if (enData.temperaturaMediaAproximada) merged.temperaturaMediaAproximada = enData.temperaturaMediaAproximada;
    if (enData.curiosidades) merged.curiosidades = enData.curiosidades;
    if (enData.factosUau) merged.factosUau = enData.factosUau;
    if (enData.comparacao) merged.comparacao = enData.comparacao;
    if (enData.descricao) merged.descricao = enData.descricao;
    if (enData.distanciaKm) merged.distanciaKm = enData.distanciaKm;
    
    // Translate moons if available
    if (baseData.moons && enData.moons) {
        merged.moons = baseData.moons.map((moon, index) => {
            const enMoon = enData.moons[index];
            if (!enMoon) return moon;
            
            return {
                ...moon,
                nome: enMoon.nome || moon.nome,
                descricao: enMoon.descricao || moon.descricao,
                factosUau: enMoon.factosUau || moon.factosUau
            };
        });
    }
    
    return merged;
}

/**
 * Get all translated object data
 * @returns {object} All solar system data with current language translations
 */
export function getAllTranslatedData() {
    const result = {};
    for (const key in SOLAR_SYSTEM_DATA) {
        result[key] = getTranslatedObjectData(key);
    }
    return result;
}
