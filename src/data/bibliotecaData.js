// Import shared data from main data file (avoid duplication!)
// REAL_PHOTOS shared, SOLAR_SYSTEM_DATA used for numeric stats consistency
import { REAL_PHOTOS as BASE_PHOTOS, SOLAR_SYSTEM_DATA } from './objectsInfo.js';

// Extend with biblioteca-specific photos (Apollo, missions, galleries)
const REAL_PHOTOS = {
    ...BASE_PHOTOS,
    // Apollo mission photos
    aldrin: '/textures/apollo/aldrin.jpg',
    bootprint: '/textures/apollo/bootprint.jpg',
    rover: '/textures/apollo/rover.jpg',
    // Mission gallery photos
    iss_2: '/textures/missions/iss_2.jpg',
    iss_interior: '/textures/missions/iss_interior.jpg',
    voyager_launch: '/textures/missions/voyager_missions.jpg',
    hubble_deploy: '/textures/missions/hubble_deploy.jpg',
    curiosity_selfie: '/textures/missions/curiosity_selfie.jpg',
    pale_blue_dot: '/textures/missions/pale_blue_dot.jpg'
};

export const BIBLIOTECA_DATA = {
    // ===== PORTUGUÊS =====
    pt: {
        ui: {
            back_to_solar: "← Voltar ao Sistema Solar",
            library_title: "📚 Biblioteca do Sistema Solar",
            library_subtitle: "Explora tudo sobre a nossa vizinhança cósmica!",
            search_placeholder: "Procurar planetas, luas, sondas...",
            cat_all: "🌌 Todos",
            cat_star: "☀️ Estrela",
            cat_planets: "🪐 Planetas",
            cat_moons: "🌙 Luas",
            cat_dwarfs: "🔴 Anões",
            cat_probes: "🛰️ Sondas",
            section_stats: "📊 Estatísticas",
            section_curiosities: "🔍 Curiosidades",
            section_wow_facts: "🤯 Factos Uau!",
            section_moons: "🌙 Luas",
            section_history: "📜 História",
            section_comparison: "🌍 Comparação",
            section_gallery: "📸 Galeria",
            stat_radius: "Raio",
            stat_distance: "Distância ao Sol",
            stat_day: "Duração do Dia",
            stat_year: "Duração do Ano",
            stat_temp: "Temperatura",
            stat_moons: "Luas Conhecidas",
            stat_age: "Idade",
            stat_type: "Tipo",
            stat_composition: "Composição",
            stat_speed: "Velocidade",
            stat_launch: "Lançamento",
            stat_size: "Tamanho",
            click_to_learn: "Clica para saber mais"
        },
        objects: {
            "sol": {
                id: "sol",
                nome: "Sol",
                tipo: "Estrela",
                categoria: "star",
                emoji: "☀️",
                imagem: REAL_PHOTOS.sun,
                descricaoLonga: `O Sol é a nossa estrela! É uma bola GIGANTE de gás super quente que está sempre a "queimar" (na verdade, faz fusão nuclear). Sem o Sol, não haveria vida na Terra - ele dá-nos luz, calor e energia!

O Sol é TÃO grande que caberiam mais de 1 MILHÃO de Terras lá dentro! E está a 150 milhões de quilómetros de nós - tão longe que a luz demora 8 minutos a chegar cá!`,
                historia: `Os humanos sempre adoraram o Sol! Civilizações antigas como os Egípcios adoravam-no como um deus chamado Rá. Os Gregos chamavam-lhe Hélios e imaginavam que ele atravessava o céu numa carruagem de fogo.`,
                estatisticas: {
                    raio: "696.340 km",
                    temperatura: "5.500°C (superfície) / 15M°C (centro)",
                    idade: "4,6 mil milhões de anos",
                    tipo: "Estrela Anã Amarela (G2V)",
                    composicao: "73% Hidrogénio, 25% Hélio"
                },
                curiosidades: [
                    "O Sol contém 99,86% de toda a massa do Sistema Solar!",
                    "A cada segundo, o Sol converte 600 milhões de toneladas de hidrogénio em hélio.",
                    "O Sol gira sobre si mesmo - demora 25 dias no equador e 35 dias nos polos!",
                    "A luz do Sol que vês agora demorou 8 minutos e 20 segundos a chegar até ti."
                ],
                factosUau: [
                    "🔥 O Sol é tão QUENTE que se pudesses ir lá, evaporavas a milhões de km de distância!",
                    "💪 A gravidade do Sol é 28x mais forte que a da Terra - pesarias 2 TONELADAS lá!",
                    "⚡ A energia que o Sol produz num SEGUNDO bastaria para a humanidade durante 500.000 anos!",
                    "🌈 O Sol parece amarelo, mas no espaço é BRANCO! A atmosfera da Terra muda a cor.",
                    "💥 O Sol tem EXPLOSÕES gigantes chamadas erupções solares - algumas são maiores que a Terra!"
                ],
                comparacao: "Se o Sol fosse uma bola de futebol, a Terra seria do tamanho de uma cabeça de alfinete a 25 metros de distância!"
            },
            "mercurio": {
                id: "mercurio",
                nome: "Mercúrio",
                tipo: "Planeta Rochoso",
                categoria: "planets",
                emoji: "☿️",
                imagem: REAL_PHOTOS.mercury,
                descricaoLonga: `Mercúrio é o planeta mais pequeno e o mais próximo do Sol! É como se fosse a "Lua" do Sistema Solar, porque é cinzento e cheio de crateras. 

Apesar de estar colado ao Sol, não é o mais quente! Como quase não tem atmosfera (ar), não consegue guardar o calor. De dia é super quente, mas de noite congela!`,
                estatisticas: {
                    raio: "2.439 km",
                    distancia: "58 milhões km",
                    dia: "59 dias terrestres",
                    ano: "88 dias terrestres",
                    temperatura: "-173°C a 427°C",
                    luas: "0"
                },
                factosUau: [
                    "🥶 De dia assas pizzas na rua, de noite transformas-te num cubo de gelo instantâneo!",
                    "🏃‍♂️ É o planeta mais rápido de todos - viaja a 170.000 km/h!",
                    "🕳️ Tem uma cratera chamada 'Caloris' que é tão grande como Portugal e Espanha juntos!",
                    "🌑 O céu em Mercúrio é sempre preto, mesmo de dia, porque não tem atmosfera para espalhar a luz."
                ],
                comparacao: "Mercúrio é pouco maior que a nossa Lua. Se a Terra fosse uma laranja, Mercúrio seria uma uva!"
            },
            "venus": {
                id: "venus",
                nome: "Vénus",
                tipo: "Planeta Rochoso",
                categoria: "planets",
                emoji: "♀️",
                imagem: REAL_PHOTOS.venus,
                descricaoLonga: `Vénus é o "irmão" da Terra porque tem quase o mesmo tamanho, mas é um irmão muito zangado! É o planeta mais quente de todo o Sistema Solar.

Tem uma atmosfera super grossa de nuvens tóxicas que funcionam como um cobertor, aprisionando todo o calor.`,
                estatisticas: {
                    raio: "6.051 km",
                    distancia: "108 milhões km",
                    dia: "243 dias terrestres",
                    ano: "225 dias terrestres",
                    temperatura: "462°C (constante)",
                    luas: "0"
                },
                factosUau: [
                    "🌋 Vénus tem mais vulcões do que qualquer outro planeta - mais de 1.600!",
                    "🍳 É quente o suficiente para derreter chumbo sólido!",
                    "💨 Os ventos nas nuvens sopram a 360 km/h - mais rápido que um furacão!",
                    "🌧️ Chove ácido sulfúrico (o líquido das baterias), mas evapora antes de tocar no chão!"
                ],
                comparacao: "Vénus e a Terra são quase gémeos de tamanho."
            },
            "terra": {
                id: "terra",
                nome: "Terra",
                tipo: "Planeta Rochoso",
                categoria: "planets",
                emoji: "🌍",
                imagem: REAL_PHOTOS.earth,
                descricaoLonga: `A Terra é o nosso lar - o único planeta onde sabemos que existe vida! É o terceiro planeta a contar do Sol e o único com água líquida na superfície.`,
                estatisticas: {
                    raio: "6.371 km",
                    distancia: "150 milhões km",
                    dia: "24 horas",
                    ano: "365 dias",
                    temperatura: "-88°C a 58°C",
                    luas: "1 (A Lua)"
                },
                factosUau: [
                    "⚡ A Terra recebe 100 relâmpagos por segundo!",
                    "🌊 Conhecemos melhor a superfície de Marte do que o fundo dos nossos oceanos!",
                    "💎 O centro da Terra é tão quente como a superfície do Sol!",
                    "🦕 A Terra já existe há tanto tempo que os dinossauros viveram aqui durante 165 milhões de anos!"
                ],
                comparacao: "Se a Terra fosse uma bola de basquete, a Lua seria uma bola de ténis a 7 metros.",
                luas: ["lua"]
            },
            "marte": {
                id: "marte",
                nome: "Marte",
                tipo: "Planeta Rochoso",
                categoria: "planets",
                emoji: "♂️",
                imagem: REAL_PHOTOS.mars,
                descricaoLonga: `Marte é o "Planeta Vermelho"! É o sítio mais provável para encontrarmos vida ou para os humanos viverem no futuro. É um deserto frio e poeirento.`,
                estatisticas: {
                    raio: "3.389 km",
                    distancia: "228 milhões km",
                    dia: "24h 37m",
                    ano: "687 dias terrestres",
                    temperatura: "-63°C",
                    luas: "2"
                },
                factosUau: [
                    "🏔️ O Monte Olimpo é tão alto que sai para fora da atmosfera marciana!",
                    "🏜️ Tem um desfiladeiro (Valles Marineris) que atravessaria os Estados Unidos inteiros!",
                    "❄️ Tem calotas polares feitas de 'gelo seco' (dióxido de carbono congelado)!",
                    "👽 É o único planeta habitado inteiramente por robots (os que nós enviámos)!"
                ],
                comparacao: "Marte é cerca de metade do tamanho da Terra.",
                luas: ["fobos", "deimos"]
            },
            "jupiter": {
                id: "jupiter",
                nome: "Júpiter",
                tipo: "Gigante Gasoso",
                categoria: "planets",
                emoji: "♃",
                imagem: REAL_PHOTOS.jupiter,
                descricaoLonga: `Júpiter é o REI dos planetas. É o maior de todos e é feito de gás. Não tem chão sólido - se tentasses pisar, cairias para sempre!`,
                estatisticas: {
                    raio: "69.911 km",
                    distancia: "778 milhões km",
                    dia: "9h 55m",
                    ano: "12 anos terrestres",
                    temperatura: "-108°C",
                    luas: "95"
                },
                factosUau: [
                    "🏋️ Júpiter pesa mais que TODOS os outros planetas juntos multiplicados por 2,5!",
                    "🌪️ A 'Grande Mancha Vermelha' é um furacão maior que a Terra inteira!",
                    "🎈 Se Júpiter fosse oci, caberiam 1.300 Terras lá dentro!",
                    "⚡ Tem auroras (luzes) nos polos que são maiores que o nosso planeta inteiro!"
                ],
                comparacao: "Júpiter é 11 vezes maior que a Terra.",
                luas: ["io", "europa", "ganimedes", "calisto"]
            },
            "saturno": {
                id: "saturno",
                nome: "Saturno",
                tipo: "Gigante Gasoso",
                categoria: "planets",
                emoji: "♄",
                imagem: REAL_PHOTOS.saturn,
                descricaoLonga: `Saturno é a joia do Sistema Solar! Famoso pelos seus anéis espetaculares feitos de gelo e rocha.`,
                estatisticas: {
                    raio: "58.232 km",
                    distancia: "1,4 mil milhões km",
                    dia: "10h 33m",
                    ano: "29 anos terrestres",
                    temperatura: "-139°C",
                    luas: "146"
                },
                factosUau: [
                    "🛁 Se houvesse uma banheira gigante, Saturno FLUTUARIA na água!",
                    "💍 Os anéis estendem-se por 280.000 km mas nalguns sítios são mais finos que um prédio!",
                    "💎 Chovem diamantes em Saturno devido à pressão extrema!",
                    "👑 É o rei das luas - tem 146 luas, mais que qualquer outro planeta!"
                ],
                comparacao: "Saturno é quase tão grande como Júpiter, mas muito mais leve.",
                luas: ["tita", "encelado", "mimas"]
            },
            "urano": {
                id: "urano",
                nome: "Úrano",
                tipo: "Gigante de Gelo",
                categoria: "planets",
                emoji: "♅",
                imagem: REAL_PHOTOS.uranus,
                descricaoLonga: `Úrano é o "Gigante de Gelo". Roda deitado de lado! É super frio e tem uma cor azul-esverdeada bonita.`,
                estatisticas: {
                    raio: "25.362 km",
                    distancia: "2,9 mil milhões km",
                    dia: "17h 14m",
                    ano: "84 anos terrestres",
                    temperatura: "-224°C",
                    luas: "27"
                },
                factosUau: [
                    "🛌 Úrano roda deitado de lado, como uma bola a rolar no chão!",
                    "❄️ É o planeta mais frio do Sistema Solar, chegando a -224°C!",
                    "👃 Cheira a ovos podres! (Gás sulfureto de hidrogénio)",
                    "🌑 As suas luas têm nomes de personagens de Shakespeare!"
                ],
                comparacao: "Úrano é 4 vezes maior que a Terra.",
                luas: ["miranda", "ariel", "titania"]
            },
            "neptuno": {
                id: "neptuno",
                nome: "Neptuno",
                tipo: "Gigante de Gelo",
                categoria: "planets",
                emoji: "♆",
                imagem: REAL_PHOTOS.neptune,
                descricaoLonga: `Neptuno é o último planeta, ventoso e azul profundo. Tem os ventos mais rápidos do sistema solar!`,
                estatisticas: {
                    raio: "24.622 km",
                    distancia: "4,5 mil milhões km",
                    dia: "16 horas",
                    ano: "165 anos terrestres",
                    temperatura: "-214°C",
                    luas: "14"
                },
                factosUau: [
                    "💨 Os ventos sopram a 2.100 km/h - mais rápido que um caça!",
                    "💎 Tal como em Saturno, é provável que chovam diamantes no interior!",
                    "🥶 A sua lua Tritão é super fria (-235°C)!",
                    "🔭 Só foi visitado por uma sonda (Voyager 2) em 1989!"
                ],
                comparacao: "Neptuno é irmão gémeo de Úrano.",
                luas: ["tritao"]
            },

            // === PLANETAS ANÕES (Faltava Ceres, Eris, Makemake, Haumea) ===
            "plutao": {
                id: "plutao",
                nome: "Plutão",
                tipo: "Planeta Anão",
                categoria: "dwarfs",
                emoji: "🌑",
                imagem: REAL_PHOTOS.pluto,
                descricaoLonga: `Plutão já foi o 9º planeta e é o mais famoso dos anões. Tem um coração gigante de gelo na superfície!`,
                estatisticas: { raio: "1.188 km", temperatura: "-232°C" },
                factosUau: ["❤️ Tem um glaciar em forma de coração!", "❄️ Neva neve vermelha!", "🏔️ Tem montanhas de gelo de 3.500m!"],
                luas: ["caronte"]
            },
            "ceres": {
                id: "ceres",
                nome: "Ceres",
                tipo: "Planeta Anão",
                categoria: "dwarfs",
                emoji: "🪨",
                imagem: REAL_PHOTOS.ceres,
                descricaoLonga: `Ceres é o único planeta anão que vive na cintura de asteroides (entre Marte e Júpiter). É o maior asteroide de todos!`,
                estatisticas: { raio: "473 km", temperatura: "-105°C" },
                factosUau: ["💧 Pode ter mais água doce que a Terra (congelada)!", "💡 Tem 'luzes misteriosas' (manchas de sal brilhante) na superfície."]
            },
            "eris": {
                id: "eris",
                nome: "Éris",
                tipo: "Planeta Anão",
                categoria: "dwarfs",
                emoji: "❄️",
                imagem: REAL_PHOTOS.eris,
                descricaoLonga: `Éris foi a 'troublemaker' que fez Plutão deixar de ser planeta! É quase do mesmo tamanho que Plutão mas muito mais longe.`,
                estatisticas: { raio: "1.163 km", temperatura: "-243°C" },
                factosUau: ["📏 Está 3x mais longe do Sol que Plutão!", "🥶 A atmosfera congela e cai como neve quando se afasta do Sol."]
            },
            "makemake": {
                id: "makemake",
                nome: "Makemake",
                tipo: "Planeta Anão",
                categoria: "dwarfs",
                emoji: "🗿",
                imagem: REAL_PHOTOS.makemake,
                descricaoLonga: `Pequeno mundo gelado na Cintura de Kuiper. Recebeu o nome do deus criador da Ilha de Pascoa.`,
                estatisticas: { raio: "715 km", temperatura: "-239°C" },
                factosUau: ["🏎️ Um dia dura 22 horas e meia, parecido com a Terra!", "🔴 É avermelhado como Plutão."]
            },
            "haumea": {
                id: "haumea",
                nome: "Haumea",
                tipo: "Planeta Anão",
                categoria: "dwarfs",
                emoji: "🏉",
                imagem: REAL_PHOTOS.haumea,
                descricaoLonga: `Haumea é estranho porque parece uma bola de râguebi! Gira tão depressa que ficou esticado.`,
                estatisticas: { raio: "816 km (média)", dia: "4 horas!" },
                factosUau: ["🌪️ Gira super rápido: um dia dura só 4 horas!", "💍 Tem anéis, o que é raro num objeto tão pequeno!"]
            },

            // === LUAS (Faltava Phobos, Deimos, Luas de Júpiter/Saturno/Urano) ===
            "lua": { id: "lua", nome: "Lua", tipo: "Lua", categoria: "moons", emoji: "🌝", imagem: REAL_PHOTOS.moon, galeria: [
                { url: REAL_PHOTOS.aldrin, caption: "Buzz Aldrin na Lua - Apollo 11, 1969. Sabias que no visor dele vês o reflexo de Neil Armstrong a tirar a foto? Por isso quase não há fotos do Neil na Lua!", captionEN: "Buzz Aldrin on the Moon - Apollo 11, 1969. Did you know you can see Neil Armstrong's reflection taking the photo? That's why there are almost no photos of Neil on the Moon!" },
                { url: REAL_PHOTOS.bootprint, caption: "Pegada de Buzz Aldrin no solo lunar. Sabias que ainda lá está hoje? Sem vento nem chuva na Lua, pode durar milhões de anos!", captionEN: "Buzz Aldrin's bootprint on lunar soil. Did you know it's still there today? With no wind or rain on the Moon, it could last millions of years!" },
                { url: REAL_PHOTOS.rover, caption: "Carro lunar das missões Apollo. Sabias que ficou na Lua para sempre? Custava muito combustível trazê-lo de volta!", captionEN: "Lunar Rover from Apollo missions. Did you know it was left on the Moon forever? It cost too much fuel to bring back!" }
            ], estatisticas: { raio: "1.737 km" }, factosUau: ["👣 Pegadas eternas!", "🌊 Cria as marés."] },
            "fobos": { id: "fobos", nome: "Fobos", tipo: "Lua de Marte", categoria: "moons", emoji: "🥔", imagem: REAL_PHOTOS.phobos, descricaoLonga: "Uma das duas luas de Marte. Parece uma batata e está a cair lentamente para Marte!", factosUau: ["💥 Um dia vai chocar com Marte ou desfazer-se num anel."] },
            "deimos": { id: "deimos", nome: "Deimos", tipo: "Lua de Marte", categoria: "moons", emoji: "🥔", imagem: REAL_PHOTOS.deimos, descricaoLonga: "A outra batata de Marte. É mais pequena e suave que Fobos.", factosUau: ["👻 O seu nome significa 'Terror' em grego."] },
            // Júpiter
            "io": { id: "io", nome: "Io", tipo: "Lua de Júpiter", categoria: "moons", emoji: "🌋", imagem: REAL_PHOTOS.io, descricaoLonga: "O mundo mais vulcânico de todos! Tem centenas de vulcões ativos a explodir lava.", factosUau: ["🌋 A superfície renova-se constantemente com a lava.", "👃 Cheira a ovos podres (enxofre)."] },
            "europa": { id: "europa", nome: "Europa", tipo: "Lua de Júpiter", categoria: "moons", emoji: "🧊", imagem: REAL_PHOTOS.europa, descricaoLonga: "A melhor aposta para vida! Tem um oceano gigante de água salgada debaixo do gelo.", factosUau: ["🌊 Tem 2x mais água que a Terra!", "🦑 Pode haver vida no seu oceano escuro."] },
            "ganimedes": { id: "ganimedes", nome: "Ganimedes", tipo: "Lua de Júpiter", categoria: "moons", emoji: "⚪", imagem: REAL_PHOTOS.ganymede, descricaoLonga: "A maior lua do Sistema Solar! É maior que o planeta Mercúrio.", factosUau: ["🛡️ É a única lua com campo magnético próprio."] },
            "calisto": { id: "calisto", nome: "Calisto", tipo: "Lua de Júpiter", categoria: "moons", emoji: "🌑", imagem: REAL_PHOTOS.callisto, descricaoLonga: "A bola de golfe cósmica! É o objeto com mais crateras que conhecemos.", factosUau: ["🤕 A superfície mais antiga e 'bombardeada' do sistema solar."] },
            // Saturno
            "tita": { id: "tita", nome: "Titã", tipo: "Lua de Saturno", categoria: "moons", emoji: "🟡", imagem: REAL_PHOTOS.titan, estatisticas: { raio: "2.574 km" }, factosUau: ["🌧️ Chove metano!", "✈️ Podias voar com asas nos braços!"] },
            "encelado": { id: "encelado", nome: "Encélado", tipo: "Lua de Saturno", categoria: "moons", emoji: "❄️", imagem: REAL_PHOTOS.enceladus, descricaoLonga: "Uma bola de neve branca e brilhante. Cospe geysers de gelo para o espaço!", factosUau: ["⛲ Os seus geysers criam um dos anéis de Saturno!", "🌊 Tem oceano subterrâneo."] },
            "mimas": { id: "mimas", nome: "Mimas", tipo: "Lua de Saturno", categoria: "moons", emoji: "💀", imagem: REAL_PHOTOS.mimas, descricaoLonga: "A 'Estrela da Morte'! Tem uma cratera gigante que a faz parecer a estação espacial do Star Wars.", factosUau: ["🎥 Parece mesmo a Death Star!", "💥 A cratera 'Herschel' quase partiu a lua ao meio."] },
            // Urano/Neptuno/Plutão
            "miranda": { id: "miranda", nome: "Miranda", tipo: "Lua de Úrano", categoria: "moons", emoji: "🧩", descricaoLonga: "A lua Frankenstein! Parece que foi partida e colada de novo de forma errada.", factosUau: ["🧗 Tem o maior penhasco do sistema solar (20km de altura!)."] },
            "ariel": { id: "ariel", nome: "Ariel", tipo: "Lua de Úrano", categoria: "moons", emoji: "✨", descricaoLonga: "A lua mais brilhante de Úrano! A sua superfície é coberta de gelo fresco e tem vales e desfiladeiros enormes.", factosUau: ["✨ É a lua mais brilhante de Úrano!", "🏔️ Tem desfiladeiros profundos cheios de gelo!"] },
            "titania": { id: "titania", nome: "Titânia", tipo: "Lua de Úrano", categoria: "moons", emoji: "👑", imagem: REAL_PHOTOS.titania, descricaoLonga: "A maior lua de Úrano! Tem o nome da rainha das fadas de Shakespeare. A sua superfície tem desfiladeiros gigantes maiores que o Grand Canyon.", factosUau: ["👑 É a MAIOR lua de Úrano!", "🏔️ Tem desfiladeiros maiores que o Grand Canyon da Terra!"] },
            "tritao": { id: "tritao", nome: "Tritão", tipo: "Lua de Neptuno", categoria: "moons", emoji: "🥶", imagem: REAL_PHOTOS.triton, descricaoLonga: "Gira ao contrário! É um mundo capturado por Neptuno. Cospe nitrogénio preto.", factosUau: ["❄️ É o objeto mais frio medido (-235°C).", "🌋 Tem vulcões de gelo (criovulcões)!"] },
            "caronte": { id: "caronte", nome: "Caronte", tipo: "Lua de Plutão", categoria: "moons", emoji: "👫", imagem: REAL_PHOTOS.charon, descricaoLonga: "É tão grande comparada com Plutão que dançam uma à volta da outra.", factosUau: ["🔒 Mostra sempre a mesma face a Plutão e vice-versa.", "🏞️ Tem um desfiladeiro 4x mais profundo que o Grand Canyon."] },

            // === SONDAS E OUTROS ===
            "voyager": { id: "voyager", nome: "Voyager 1", tipo: "Sonda", categoria: "probes", emoji: "🛰️", imagem: REAL_PHOTOS.voyager, galeria: [
                { src: REAL_PHOTOS.voyager_launch, caption: "Lançamento da Voyager em 1977. Sabias que leva um disco dourado com músicas e sons da Terra para aliens nos conhecerem?", captionEN: "Voyager launch in 1977. Did you know it carries a golden record with music and sounds from Earth for aliens to learn about us?" },
                { src: REAL_PHOTOS.pale_blue_dot, caption: "Pale Blue Dot - a Terra a 6 mil milhões de km! Sabias que Carl Sagan pediu à Voyager para se virar e tirar esta foto? Aquele pontinho somos todos nós!", captionEN: "Pale Blue Dot - Earth from 6 billion km! Did you know Carl Sagan asked Voyager to turn around and take this photo? That tiny dot is all of us!" }
            ], descricaoLonga: "O objeto humano mais distante. Saiu do Sistema Solar!", factosUau: ["💿 Leva música e sons da Terra para aliens.", "📸 Tirou a foto 'Pale Blue Dot'."] },
            "iss": { id: "iss", nome: "Estação Espacial", tipo: "Estação", categoria: "probes", emoji: "🛸", imagem: REAL_PHOTOS.iss, galeria: [
                { src: REAL_PHOTOS.iss_interior, caption: "Interior da ISS. Sabias que os astronautas flutuam porque estão em queda livre constante à volta da Terra? É como estar num elevador a cair para sempre!", captionEN: "Inside the ISS. Did you know astronauts float because they're constantly falling around Earth? It's like being in an elevator falling forever!" },
                { src: REAL_PHOTOS.iss_2, caption: "Cúpula da ISS - a melhor janela do universo! Sabias que os astronautas passam horas aqui a ver a Terra e tirar fotos? Dá para ver auroras, tempestades e cidades à noite!", captionEN: "ISS Cupola - the best window in the universe! Did you know astronauts spend hours here watching Earth and taking photos? You can see auroras, storms and cities at night!" }
            ], descricaoLonga: "Casa no espaço para astronautas. É um laboratório gigante que dá a volta à Terra a cada 90 minutos!\n\n⚠️ Nota Triste: A ISS está a ficar velhinha e vai ser 'reformada' (desativada) por volta de 2031. Vai cair no oceano de forma controlada.", factosUau: ["🌅 16 nasceres do sol por dia!", "💧 Reciclam o chichi para água."] },
            "hubble": { id: "hubble", nome: "Hubble", tipo: "Telescópio", categoria: "probes", emoji: "🔭", imagem: REAL_PHOTOS.hubble, galeria: [
                { src: REAL_PHOTOS.hubble_deploy, caption: "Space Shuttle a lançar o Hubble em 1990. Sabias que o Hubble tinha um defeito no espelho e as primeiras fotos saíam desfocadas? Astronautas foram lá arranjá-lo!", captionEN: "Space Shuttle deploying Hubble in 1990. Did you know Hubble had a mirror defect and the first photos were blurry? Astronauts went up to fix it!" }
            ], descricaoLonga: "O olho da Terra no espaço. Viu galáxias super distantes.", factosUau: ["👓 Podemos ver o passado com ele!", "🌌 Descobriu que o universo está a acelerar."] },
            "curiosity": { id: "curiosity", nome: "Curiosity", tipo: "Rover", categoria: "probes", emoji: "🚙", imagem: REAL_PHOTOS.mars, galeria: [
                { src: REAL_PHOTOS.curiosity_selfie, caption: "Selfie do Curiosity em Marte! Sabias que ele usa um braço robótico para tirar várias fotos e depois junta-as? Por isso o braço não aparece na foto!", captionEN: "Curiosity selfie on Mars! Did you know it uses a robotic arm to take multiple photos and stitches them together? That's why the arm doesn't appear in the photo!" }
            ], descricaoLonga: "Um laboratório com rodas em Marte.", factosUau: ["🎂 Cantou os Parabéns a si mesmo em Marte!", "🔫 Tem um laser para vaporizar pedras."] },
            "pioneer": { id: "pioneer", nome: "Pioneer 10", tipo: "Sonda", categoria: "probes", emoji: "📡", imagem: REAL_PHOTOS.pioneer, galeria: [
                { src: REAL_PHOTOS.pioneer2, caption: "Placa da Pioneer - mensagem para aliens! Sabias que mostra um homem e uma mulher, a posição do Sol na galáxia, e o átomo de hidrogénio? É como um postal da humanidade!", captionEN: "Pioneer plaque - message for aliens! Did you know it shows a man and woman, the Sun's position in the galaxy, and the hydrogen atom? It's like a postcard from humanity!" }
            ], descricaoLonga: "A primeira sonda a atravessar a cintura de asteroides e a visitar Júpiter. Foi uma verdadeira pioneira!", factosUau: ["👾 Leva uma placa com desenhos de humanos para aliens.", "⚡ Usa energia nuclear."] }
        }
    },
    // ===== ENGLISH =====
    en: {
        ui: {
            back_to_solar: "← Back to Solar System",
            library_title: "📚 Solar System Library",
            library_subtitle: "Explore everything about our cosmic neighborhood!",
            search_placeholder: "Search planets, moons, probes...",
            cat_all: "🌌 All",
            cat_star: "☀️ Star",
            cat_planets: "🪐 Planets",
            cat_moons: "🌙 Moons",
            cat_dwarfs: "🔴 Dwarfs",
            cat_probes: "🛰️ Probes",
            section_stats: "📊 Statistics",
            section_curiosities: "🔍 Curiosities",
            section_wow_facts: "🤯 Wow Facts!",
            section_moons: "🌙 Moons",
            section_history: "📜 History",
            section_comparison: "🌍 Comparison",
            section_gallery: "📸 Gallery",
            stat_radius: "Radius",
            stat_distance: "Distance to Sun",
            stat_day: "Day Length",
            stat_year: "Year Length",
            stat_temp: "Temperature",
            stat_moons: "Known Moons",
            stat_age: "Age",
            stat_type: "Type",
            stat_composition: "Composition",
            stat_speed: "Speed",
            stat_launch: "Launch",
            stat_size: "Size",
            click_to_learn: "Click to learn more"
        },
        objects: {
            "sol": {
                id: "sol",
                nome: "Sun",
                tipo: "Star",
                categoria: "star",
                emoji: "☀️",
                imagem: REAL_PHOTOS.sun,
                descricaoLonga: `The Sun is our star! It's a GIANT ball of super hot gas that is always "burning" (actually, it does nuclear fusion). Without the Sun, there would be no life on Earth - it gives us light, heat and energy!

The Sun is SO big that more than 1 MILLION Earths could fit inside it! And it's 150 million kilometers away from us - so far that light takes 8 minutes to get here!`,
                historia: `Humans have always loved the Sun! Ancient civilizations like the Egyptians worshipped it as a god called Ra. The Greeks called it Helios and imagined it crossing the sky in a chariot of fire.`,
                estatisticas: {
                    raio: "696,340 km",
                    temperatura: "5,500°C (surface) / 15M°C (core)",
                    idade: "4.6 billion years",
                    tipo: "Yellow Dwarf Star (G2V)",
                    composicao: "73% Hydrogen, 25% Helium"
                },
                curiosidades: [
                    "The Sun contains 99.86% of all the mass in the Solar System!",
                    "Every second, the Sun converts 600 million tons of hydrogen into helium.",
                    "The Sun rotates on its own axis - it takes 25 days at the equator and 35 days at the poles!",
                    "The sunlight you see right now took 8 minutes and 20 seconds to reach you."
                ],
                factosUau: [
                    "🔥 The Sun is so HOT that if you could go there, you'd evaporate millions of km away!",
                    "💪 The Sun's gravity is 28x stronger than Earth's - you'd weigh 2 TONS there!",
                    "⚡ The energy the Sun produces in ONE SECOND would be enough for all of humanity for 500,000 years!",
                    "🌈 The Sun looks yellow, but in space it's WHITE! Earth's atmosphere changes the color.",
                    "💥 The Sun has GIANT explosions called solar flares - some are bigger than Earth!"
                ],
                comparacao: "If the Sun were a soccer ball, Earth would be the size of a pinhead 25 meters away!"
            },
            "mercurio": {
                id: "mercurio",
                nome: "Mercury",
                tipo: "Rocky Planet",
                categoria: "planets",
                emoji: "☿️",
                imagem: REAL_PHOTOS.mercury,
                descricaoLonga: `Mercury is the smallest planet and the closest to the Sun! It's like the "Moon" of the Solar System, because it's gray and full of craters.

Even though it's right next to the Sun, it's not the hottest! Since it has almost no atmosphere (air), it can't keep the heat. During the day it's super hot, but at night it freezes!`,
                estatisticas: {
                    raio: "2,439 km",
                    distancia: "58 million km",
                    dia: "59 Earth days",
                    ano: "88 Earth days",
                    temperatura: "-173°C to 427°C",
                    luas: "0"
                },
                factosUau: [
                    "🥶 During the day you could bake pizzas outside, at night you'd instantly turn into an ice cube!",
                    "🏃‍♂️ It's the fastest planet of all - it travels at 170,000 km/h!",
                    "🕳️ It has a crater called 'Caloris' that's as big as Portugal and Spain put together!",
                    "🌑 The sky on Mercury is always black, even during the day, because it has no atmosphere to scatter light."
                ],
                comparacao: "Mercury is only a little bigger than our Moon. If Earth were an orange, Mercury would be a grape!"
            },
            "venus": {
                id: "venus",
                nome: "Venus",
                tipo: "Rocky Planet",
                categoria: "planets",
                emoji: "♀️",
                imagem: REAL_PHOTOS.venus,
                descricaoLonga: `Venus is Earth's "sibling" because it's almost the same size, but it's a very angry sibling! It's the hottest planet in the entire Solar System.

It has a super thick atmosphere of toxic clouds that works like a blanket, trapping all the heat.`,
                estatisticas: {
                    raio: "6,051 km",
                    distancia: "108 million km",
                    dia: "243 Earth days",
                    ano: "225 Earth days",
                    temperatura: "462°C (constant)",
                    luas: "0"
                },
                factosUau: [
                    "🌋 Venus has more volcanoes than any other planet - more than 1,600!",
                    "🍳 It's hot enough to melt solid lead!",
                    "💨 Winds in the clouds blow at 360 km/h - faster than a hurricane!",
                    "🌧️ It rains sulfuric acid (battery acid), but it evaporates before touching the ground!"
                ],
                comparacao: "Venus and Earth are almost twins in size."
            },
            "terra": {
                id: "terra",
                nome: "Earth",
                tipo: "Rocky Planet",
                categoria: "planets",
                emoji: "🌍",
                imagem: REAL_PHOTOS.earth,
                descricaoLonga: `Earth is our home - the only planet where we know life exists! It's the third planet from the Sun and the only one with liquid water on its surface.`,
                estatisticas: {
                    raio: "6,371 km",
                    distancia: "150 million km",
                    dia: "24 hours",
                    ano: "365 days",
                    temperatura: "-88°C to 58°C",
                    luas: "1 (The Moon)"
                },
                factosUau: [
                    "⚡ Earth gets hit by 100 lightning bolts every second!",
                    "🌊 We know the surface of Mars better than the bottom of our own oceans!",
                    "💎 The center of the Earth is as hot as the surface of the Sun!",
                    "🦕 Earth has been around for so long that dinosaurs lived here for 165 million years!"
                ],
                comparacao: "If Earth were a basketball, the Moon would be a tennis ball 7 meters away.",
                luas: ["lua"]
            },
            "marte": {
                id: "marte",
                nome: "Mars",
                tipo: "Rocky Planet",
                categoria: "planets",
                emoji: "♂️",
                imagem: REAL_PHOTOS.mars,
                descricaoLonga: `Mars is the "Red Planet"! It's the most likely place to find life or for humans to live in the future. It's a cold, dusty desert.`,
                estatisticas: {
                    raio: "3,389 km",
                    distancia: "228 million km",
                    dia: "24h 37m",
                    ano: "687 Earth days",
                    temperatura: "-63°C",
                    luas: "2"
                },
                factosUau: [
                    "🏔️ Mount Olympus is so tall it pokes out of Mars' atmosphere!",
                    "🏜️ It has a canyon (Valles Marineris) that would stretch across the entire United States!",
                    "❄️ It has polar ice caps made of 'dry ice' (frozen carbon dioxide)!",
                    "👽 It's the only planet inhabited entirely by robots (the ones we sent)!"
                ],
                comparacao: "Mars is about half the size of Earth.",
                luas: ["fobos", "deimos"]
            },
            "jupiter": {
                id: "jupiter",
                nome: "Jupiter",
                tipo: "Gas Giant",
                categoria: "planets",
                emoji: "♃",
                imagem: REAL_PHOTOS.jupiter,
                descricaoLonga: `Jupiter is the KING of the planets. It's the biggest of them all and it's made of gas. It has no solid ground - if you tried to stand on it, you'd fall forever!`,
                estatisticas: {
                    raio: "69,911 km",
                    distancia: "778 million km",
                    dia: "9h 55m",
                    ano: "12 Earth years",
                    temperatura: "-108°C",
                    luas: "95"
                },
                factosUau: [
                    "🏋️ Jupiter weighs more than ALL the other planets combined times 2.5!",
                    "🌪️ The 'Great Red Spot' is a hurricane bigger than the entire Earth!",
                    "🎈 If Jupiter were hollow, 1,300 Earths could fit inside!",
                    "⚡ It has auroras (lights) at the poles that are bigger than our entire planet!"
                ],
                comparacao: "Jupiter is 11 times bigger than Earth.",
                luas: ["io", "europa", "ganimedes", "calisto"]
            },
            "saturno": {
                id: "saturno",
                nome: "Saturn",
                tipo: "Gas Giant",
                categoria: "planets",
                emoji: "♄",
                imagem: REAL_PHOTOS.saturn,
                descricaoLonga: `Saturn is the jewel of the Solar System! Famous for its spectacular rings made of ice and rock.`,
                estatisticas: {
                    raio: "58,232 km",
                    distancia: "1.4 billion km",
                    dia: "10h 33m",
                    ano: "29 Earth years",
                    temperatura: "-139°C",
                    luas: "146"
                },
                factosUau: [
                    "🛁 If there were a giant bathtub, Saturn would FLOAT in the water!",
                    "💍 The rings stretch 280,000 km but in some places are thinner than a building!",
                    "💎 It rains diamonds on Saturn due to extreme pressure!",
                    "👑 It's the king of moons - it has 146 moons, more than any other planet!"
                ],
                comparacao: "Saturn is almost as big as Jupiter, but much lighter.",
                luas: ["tita", "encelado", "mimas"]
            },
            "urano": {
                id: "urano",
                nome: "Uranus",
                tipo: "Ice Giant",
                categoria: "planets",
                emoji: "♅",
                imagem: REAL_PHOTOS.uranus,
                descricaoLonga: `Uranus is the "Ice Giant". It rolls on its side! It's super cold and has a beautiful blue-green color.`,
                estatisticas: {
                    raio: "25,362 km",
                    distancia: "2.9 billion km",
                    dia: "17h 14m",
                    ano: "84 Earth years",
                    temperatura: "-224°C",
                    luas: "27"
                },
                factosUau: [
                    "🛌 Uranus rolls on its side, like a ball rolling on the ground!",
                    "❄️ It's the coldest planet in the Solar System, reaching -224°C!",
                    "👃 It smells like rotten eggs! (Hydrogen sulfide gas)",
                    "🌑 Its moons are named after characters from Shakespeare!"
                ],
                comparacao: "Uranus is 4 times bigger than Earth.",
                luas: ["miranda", "ariel", "titania"]
            },
            "neptuno": {
                id: "neptuno",
                nome: "Neptune",
                tipo: "Ice Giant",
                categoria: "planets",
                emoji: "♆",
                imagem: REAL_PHOTOS.neptune,
                descricaoLonga: `Neptune is the last planet, windy and deep blue. It has the fastest winds in the solar system!`,
                estatisticas: {
                    raio: "24,622 km",
                    distancia: "4.5 billion km",
                    dia: "16 hours",
                    ano: "165 Earth years",
                    temperatura: "-214°C",
                    luas: "14"
                },
                factosUau: [
                    "💨 Winds blow at 2,100 km/h - faster than a fighter jet!",
                    "💎 Just like Saturn, it probably rains diamonds inside!",
                    "🥶 Its moon Triton is super cold (-235°C)!",
                    "🔭 It was only visited by one probe (Voyager 2) in 1989!"
                ],
                comparacao: "Neptune is Uranus' twin sibling.",
                luas: ["tritao"]
            },

            // === DWARF PLANETS ===
            "plutao": {
                id: "plutao",
                nome: "Pluto",
                tipo: "Dwarf Planet",
                categoria: "dwarfs",
                emoji: "🌑",
                imagem: REAL_PHOTOS.pluto,
                descricaoLonga: `Pluto used to be the 9th planet and is the most famous of the dwarfs. It has a giant heart made of ice on its surface!`,
                estatisticas: { raio: "1,188 km", temperatura: "-232°C" },
                factosUau: [
                    "❤️ It has a glacier shaped like a heart!",
                    "❄️ It snows red snow!",
                    "🏔️ It has ice mountains 3,500m tall!"
                ],
                luas: ["caronte"]
            },
            "ceres": {
                id: "ceres",
                nome: "Ceres",
                tipo: "Dwarf Planet",
                categoria: "dwarfs",
                emoji: "🪨",
                imagem: REAL_PHOTOS.ceres,
                descricaoLonga: `Ceres is the only dwarf planet that lives in the asteroid belt (between Mars and Jupiter). It's the biggest asteroid of all!`,
                estatisticas: { raio: "473 km", temperatura: "-105°C" },
                factosUau: [
                    "💧 It may have more fresh water than Earth (frozen)!",
                    "💡 It has 'mysterious lights' (bright salt spots) on its surface."
                ]
            },
            "eris": {
                id: "eris",
                nome: "Eris",
                tipo: "Dwarf Planet",
                categoria: "dwarfs",
                emoji: "❄️",
                imagem: REAL_PHOTOS.eris,
                descricaoLonga: `Eris was the 'troublemaker' that made Pluto stop being a planet! It's almost the same size as Pluto but much farther away.`,
                estatisticas: { raio: "1,163 km", temperatura: "-243°C" },
                factosUau: [
                    "📏 It's 3x farther from the Sun than Pluto!",
                    "🥶 Its atmosphere freezes and falls like snow when it moves away from the Sun."
                ]
            },
            "makemake": {
                id: "makemake",
                nome: "Makemake",
                tipo: "Dwarf Planet",
                categoria: "dwarfs",
                emoji: "🗿",
                imagem: REAL_PHOTOS.makemake,
                descricaoLonga: `A small icy world in the Kuiper Belt. It was named after the creator god of Easter Island.`,
                estatisticas: { raio: "715 km", temperatura: "-239°C" },
                factosUau: [
                    "🏎️ A day lasts 22 and a half hours, similar to Earth!",
                    "🔴 It's reddish like Pluto."
                ]
            },
            "haumea": {
                id: "haumea",
                nome: "Haumea",
                tipo: "Dwarf Planet",
                categoria: "dwarfs",
                emoji: "🏉",
                imagem: REAL_PHOTOS.haumea,
                descricaoLonga: `Haumea is weird because it looks like a rugby ball! It spins so fast that it got stretched out.`,
                estatisticas: { raio: "816 km (average)", dia: "4 hours!" },
                factosUau: [
                    "🌪️ It spins super fast: a day lasts only 4 hours!",
                    "💍 It has rings, which is rare for such a small object!"
                ]
            },

            // === MOONS ===
            "lua": {
                id: "lua",
                nome: "Moon",
                tipo: "Moon",
                categoria: "moons",
                emoji: "🌝",
                imagem: REAL_PHOTOS.moon,
                galeria: [
                    { url: REAL_PHOTOS.aldrin, caption: "Buzz Aldrin on the Moon - Apollo 11, 1969. Did you know you can see Neil Armstrong's reflection in his visor taking the photo? That's why there are almost no photos of Neil on the Moon!", captionEN: "Buzz Aldrin on the Moon - Apollo 11, 1969. Did you know you can see Neil Armstrong's reflection taking the photo? That's why there are almost no photos of Neil on the Moon!" },
                    { url: REAL_PHOTOS.bootprint, caption: "Buzz Aldrin's bootprint on lunar soil. Did you know it's still there today? With no wind or rain on the Moon, it could last millions of years!", captionEN: "Buzz Aldrin's bootprint on lunar soil. Did you know it's still there today? With no wind or rain on the Moon, it could last millions of years!" },
                    { url: REAL_PHOTOS.rover, caption: "Lunar Rover from Apollo missions. Did you know it was left on the Moon forever? It cost too much fuel to bring back!", captionEN: "Lunar Rover from Apollo missions. Did you know it was left on the Moon forever? It cost too much fuel to bring back!" }
                ],
                estatisticas: { raio: "1,737 km" },
                factosUau: [
                    "👣 Footprints last forever on the Moon!",
                    "🌊 It creates the ocean tides."
                ]
            },
            "fobos": {
                id: "fobos",
                nome: "Phobos",
                tipo: "Mars Moon",
                categoria: "moons",
                emoji: "🥔",
                imagem: REAL_PHOTOS.phobos,
                descricaoLonga: "One of Mars' two moons. It looks like a potato and is slowly falling towards Mars!",
                factosUau: [
                    "💥 One day it will crash into Mars or break apart into a ring."
                ]
            },
            "deimos": {
                id: "deimos",
                nome: "Deimos",
                tipo: "Mars Moon",
                categoria: "moons",
                emoji: "🥔",
                imagem: REAL_PHOTOS.deimos,
                descricaoLonga: "Mars' other potato. It's smaller and smoother than Phobos.",
                factosUau: [
                    "👻 Its name means 'Terror' in Greek."
                ]
            },
            // Jupiter Moons
            "io": {
                id: "io",
                nome: "Io",
                tipo: "Jupiter Moon",
                categoria: "moons",
                emoji: "🌋",
                imagem: REAL_PHOTOS.io,
                descricaoLonga: "The most volcanic world of all! It has hundreds of active volcanoes blasting out lava.",
                factosUau: [
                    "🌋 The surface constantly renews itself with lava.",
                    "👃 It smells like rotten eggs (sulfur)."
                ]
            },
            "europa": {
                id: "europa",
                nome: "Europa",
                tipo: "Jupiter Moon",
                categoria: "moons",
                emoji: "🧊",
                imagem: REAL_PHOTOS.europa,
                descricaoLonga: "The best bet for life! It has a giant ocean of salt water hidden under the ice.",
                factosUau: [
                    "🌊 It has 2x more water than Earth!",
                    "🦑 There could be life in its dark ocean."
                ]
            },
            "ganimedes": {
                id: "ganimedes",
                nome: "Ganymede",
                tipo: "Jupiter Moon",
                categoria: "moons",
                emoji: "⚪",
                imagem: REAL_PHOTOS.ganymede,
                descricaoLonga: "The biggest moon in the Solar System! It's bigger than the planet Mercury.",
                factosUau: [
                    "🛡️ It's the only moon with its own magnetic field."
                ]
            },
            "calisto": {
                id: "calisto",
                nome: "Callisto",
                tipo: "Jupiter Moon",
                categoria: "moons",
                emoji: "🌑",
                imagem: REAL_PHOTOS.callisto,
                descricaoLonga: "The cosmic golf ball! It's the most cratered object we know of.",
                factosUau: [
                    "🤕 The oldest and most 'bombarded' surface in the solar system."
                ]
            },
            // Saturn Moons
            "tita": {
                id: "tita",
                nome: "Titan",
                tipo: "Saturn Moon",
                categoria: "moons",
                emoji: "🟡",
                imagem: REAL_PHOTOS.titan,
                estatisticas: { raio: "2,574 km" },
                factosUau: [
                    "🌧️ It rains methane!",
                    "✈️ You could fly with wings on your arms!"
                ]
            },
            "encelado": {
                id: "encelado",
                nome: "Enceladus",
                tipo: "Saturn Moon",
                categoria: "moons",
                emoji: "❄️",
                imagem: REAL_PHOTOS.enceladus,
                descricaoLonga: "A bright white snowball. It shoots ice geysers into space!",
                factosUau: [
                    "⛲ Its geysers create one of Saturn's rings!",
                    "🌊 It has an underground ocean."
                ]
            },
            "mimas": {
                id: "mimas",
                nome: "Mimas",
                tipo: "Saturn Moon",
                categoria: "moons",
                emoji: "💀",
                imagem: REAL_PHOTOS.mimas,
                descricaoLonga: "The 'Death Star'! It has a giant crater that makes it look like the Star Wars space station.",
                factosUau: [
                    "🎥 It really looks like the Death Star!",
                    "💥 The 'Herschel' crater nearly split the moon in half."
                ]
            },
            // Uranus/Neptune/Pluto Moons
            "miranda": {
                id: "miranda",
                nome: "Miranda",
                tipo: "Uranus Moon",
                categoria: "moons",
                emoji: "🧩",
                descricaoLonga: "The Frankenstein moon! It looks like it was broken apart and glued back together the wrong way.",
                factosUau: [
                    "🧗 It has the tallest cliff in the solar system (20km high!)."
                ]
            },
            "ariel": {
                id: "ariel",
                nome: "Ariel",
                tipo: "Uranus Moon",
                categoria: "moons",
                emoji: "✨",
                descricaoLonga: "The brightest moon of Uranus! Its surface is covered in fresh ice and has enormous valleys and canyons.",
                factosUau: [
                    "✨ It's the brightest moon of Uranus!",
                    "🏔️ It has deep canyons filled with ice!"
                ]
            },
            "titania": {
                id: "titania",
                nome: "Titania",
                tipo: "Uranus Moon",
                categoria: "moons",
                emoji: "👑",
                imagem: REAL_PHOTOS.titania,
                descricaoLonga: "The largest moon of Uranus! Named after the fairy queen from Shakespeare. Its surface has giant canyons bigger than the Grand Canyon.",
                factosUau: [
                    "👑 It's the LARGEST moon of Uranus!",
                    "🏔️ It has canyons bigger than Earth's Grand Canyon!"
                ]
            },
            "tritao": {
                id: "tritao",
                nome: "Triton",
                tipo: "Neptune Moon",
                categoria: "moons",
                emoji: "🥶",
                imagem: REAL_PHOTOS.triton,
                descricaoLonga: "It spins backwards! It's a captured world by Neptune. It spits out black nitrogen.",
                factosUau: [
                    "❄️ It's the coldest object ever measured (-235°C).",
                    "🌋 It has ice volcanoes (cryovolcanoes)!"
                ]
            },
            "caronte": {
                id: "caronte",
                nome: "Charon",
                tipo: "Pluto Moon",
                categoria: "moons",
                emoji: "👫",
                imagem: REAL_PHOTOS.charon,
                descricaoLonga: "It's so big compared to Pluto that they dance around each other.",
                factosUau: [
                    "🔒 It always shows the same face to Pluto and vice versa.",
                    "🏞️ It has a canyon 4x deeper than the Grand Canyon."
                ]
            },

            // === PROBES AND OTHERS ===
            "voyager": {
                id: "voyager",
                nome: "Voyager 1",
                tipo: "Probe",
                categoria: "probes",
                emoji: "🛰️",
                imagem: REAL_PHOTOS.voyager,
                galeria: [
                    { src: REAL_PHOTOS.voyager_launch, caption: "Voyager launch in 1977. Did you know it carries a golden record with music and sounds from Earth for aliens to learn about us?", captionEN: "Voyager launch in 1977. Did you know it carries a golden record with music and sounds from Earth for aliens to learn about us?" },
                    { src: REAL_PHOTOS.pale_blue_dot, caption: "Pale Blue Dot - Earth from 6 billion km! Did you know Carl Sagan asked Voyager to turn around and take this photo? That tiny dot is all of us!", captionEN: "Pale Blue Dot - Earth from 6 billion km! Did you know Carl Sagan asked Voyager to turn around and take this photo? That tiny dot is all of us!" }
                ],
                descricaoLonga: "The most distant human-made object. It has left the Solar System!",
                factosUau: [
                    "💿 It carries music and sounds from Earth for aliens.",
                    "📸 It took the famous 'Pale Blue Dot' photo."
                ]
            },
            "iss": {
                id: "iss",
                nome: "Space Station",
                tipo: "Station",
                categoria: "probes",
                emoji: "🛸",
                imagem: REAL_PHOTOS.iss,
                galeria: [
                    { src: REAL_PHOTOS.iss_interior, caption: "Inside the ISS. Did you know astronauts float because they're constantly falling around Earth? It's like being in an elevator falling forever!", captionEN: "Inside the ISS. Did you know astronauts float because they're constantly falling around Earth? It's like being in an elevator falling forever!" },
                    { src: REAL_PHOTOS.iss_2, caption: "ISS Cupola - the best window in the universe! Did you know astronauts spend hours here watching Earth and taking photos? You can see auroras, storms and cities at night!", captionEN: "ISS Cupola - the best window in the universe! Did you know astronauts spend hours here watching Earth and taking photos? You can see auroras, storms and cities at night!" }
                ],
                descricaoLonga: "A home in space for astronauts. It's a giant laboratory that orbits the Earth every 90 minutes!\n\n⚠️ Sad Note: The ISS is getting old and will be 'retired' (deactivated) around 2031. It will fall into the ocean in a controlled way.",
                factosUau: [
                    "🌅 16 sunrises every day!",
                    "💧 They recycle pee into drinking water."
                ]
            },
            "hubble": {
                id: "hubble",
                nome: "Hubble",
                tipo: "Telescope",
                categoria: "probes",
                emoji: "🔭",
                imagem: REAL_PHOTOS.hubble,
                galeria: [
                    { src: REAL_PHOTOS.hubble_deploy, caption: "Space Shuttle deploying Hubble in 1990. Did you know Hubble had a mirror defect and the first photos were blurry? Astronauts went up to fix it!", captionEN: "Space Shuttle deploying Hubble in 1990. Did you know Hubble had a mirror defect and the first photos were blurry? Astronauts went up to fix it!" }
                ],
                descricaoLonga: "Earth's eye in space. It saw super distant galaxies.",
                factosUau: [
                    "👓 We can see the past with it!",
                    "🌌 It discovered that the universe is accelerating."
                ]
            },
            "curiosity": {
                id: "curiosity",
                nome: "Curiosity",
                tipo: "Rover",
                categoria: "probes",
                emoji: "🚙",
                imagem: REAL_PHOTOS.mars,
                galeria: [
                    { src: REAL_PHOTOS.curiosity_selfie, caption: "Curiosity selfie on Mars! Did you know it uses a robotic arm to take multiple photos and stitches them together? That's why the arm doesn't appear in the photo!", captionEN: "Curiosity selfie on Mars! Did you know it uses a robotic arm to take multiple photos and stitches them together? That's why the arm doesn't appear in the photo!" }
                ],
                descricaoLonga: "A laboratory on wheels on Mars.",
                factosUau: [
                    "🎂 It sang Happy Birthday to itself on Mars!",
                    "🔫 It has a laser to vaporize rocks."
                ]
            },
            "pioneer": {
                id: "pioneer",
                nome: "Pioneer 10",
                tipo: "Probe",
                categoria: "probes",
                emoji: "📡",
                imagem: REAL_PHOTOS.pioneer,
                galeria: [
                    { src: REAL_PHOTOS.pioneer2, caption: "Pioneer plaque - message for aliens! Did you know it shows a man and woman, the Sun's position in the galaxy, and the hydrogen atom? It's like a postcard from humanity!", captionEN: "Pioneer plaque - message for aliens! Did you know it shows a man and woman, the Sun's position in the galaxy, and the hydrogen atom? It's like a postcard from humanity!" }
                ],
                descricaoLonga: "The first probe to cross the asteroid belt and visit Jupiter. It was a true pioneer!",
                factosUau: [
                    "👾 It carries a plaque with drawings of humans for aliens.",
                    "⚡ It uses nuclear energy."
                ]
            }
        }
    }
};

export default BIBLIOTECA_DATA;
