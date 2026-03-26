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
    // ===== ENGLISH (Simplified for brevity but covers structure) =====
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
            "sol": { id: "sol", nome: "Sun", tipo: "Star", categoria: "star", emoji: "☀️", imagem: REAL_PHOTOS.sun, estatisticas: { raio: "696,340 km" }, factosUau: ["🔥 Hot enough to evaporate you from millions of km away!", "💪 Contains 99.86% of Solar System mass."], comparacao: "A soccer ball vs pinhead Earth." },
            "mercurio": { id: "mercurio", nome: "Mercury", tipo: "Rocky Planet", categoria: "planets", emoji: "☿️", imagem: REAL_PHOTOS.mercury, estatisticas: { raio: "2,439 km" }, factosUau: ["🥶 Pizza oven by day, freezer by night!", "🏃‍♂️ Fastest planet (170,000 km/h)."] },
            "venus": { id: "venus", nome: "Venus", tipo: "Rocky Planet", categoria: "planets", emoji: "♀️", imagem: REAL_PHOTOS.venus, estatisticas: { raio: "6,051 km" }, factosUau: ["🌋 More volcanoes than any planet!", "🍳 Hot enough to melt lead!"] },
            "terra": { id: "terra", nome: "Earth", tipo: "Rocky Planet", categoria: "planets", emoji: "🌍", imagem: REAL_PHOTOS.earth, estatisticas: { raio: "6,371 km" }, factosUau: ["⚡ 100 lightning strikes per second!", "🦕 Dinosaurs lived here for 165 million years!"] },
            "marte": { id: "marte", nome: "Mars", tipo: "Rocky Planet", categoria: "planets", emoji: "♂️", imagem: REAL_PHOTOS.mars, estatisticas: { raio: "3,389 km" }, factosUau: ["🏔️ Highest mountain in the Solar System!", "👽 Only planet inhabited solely by robots."] },
            "jupiter": { id: "jupiter", nome: "Jupiter", tipo: "Gas Giant", categoria: "planets", emoji: "♃", imagem: REAL_PHOTOS.jupiter, estatisticas: { raio: "69,911 km" }, factosUau: ["🌪️ Great Red Spot is a hurricane bigger than Earth!", "🎈 Can fit 1,300 Earths inside."] },
            "saturno": { id: "saturno", nome: "Saturn", tipo: "Gas Giant", categoria: "planets", emoji: "♄", imagem: REAL_PHOTOS.saturn, estatisticas: { raio: "58,232 km" }, factosUau: ["🛁 Would float in a giant bathtub!", "💎 Rains diamonds!"] },
            "urano": { id: "urano", nome: "Uranus", tipo: "Ice Giant", categoria: "planets", emoji: "♅", imagem: REAL_PHOTOS.uranus, estatisticas: { raio: "25,362 km" }, factosUau: ["🛌 Rolls on its side!", "👃 Smells like rotten eggs."] },
            "neptuno": { id: "neptuno", nome: "Neptune", tipo: "Ice Giant", categoria: "planets", emoji: "♆", imagem: REAL_PHOTOS.neptune, estatisticas: { raio: "24,622 km" }, factosUau: ["💨 Fastest winds (2,100 km/h)!", "🥶 Moon Triton is super cold (-235°C)."] },

            // DWARFS EN
            "plutao": { id: "plutao", nome: "Pluto", tipo: "Dwarf Planet", categoria: "dwarfs", emoji: "🌑", imagem: REAL_PHOTOS.pluto, factosUau: ["❤️ Heart-shaped glacier!", "❄️ Red snow!"] },
            "ceres": { id: "ceres", nome: "Ceres", tipo: "Dwarf Planet", categoria: "dwarfs", emoji: "🪨", imagem: REAL_PHOTOS.ceres, factosUau: ["💧 May have more fresh water than Earth!"] },
            "eris": { id: "eris", nome: "Eris", tipo: "Dwarf Planet", categoria: "dwarfs", emoji: "❄️", imagem: REAL_PHOTOS.eris, factosUau: ["📏 Farther than Pluto!", "🥶 Atmosphere freezes and falls as snow."] },
            "makemake": { id: "makemake", nome: "Makemake", tipo: "Dwarf Planet", categoria: "dwarfs", emoji: "🗿", imagem: REAL_PHOTOS.makemake, factosUau: ["🏎️ Short day (22h) like Earth."] },
            "haumea": { id: "haumea", nome: "Haumea", tipo: "Dwarf Planet", categoria: "dwarfs", emoji: "🏉", imagem: REAL_PHOTOS.haumea, factosUau: ["🌪️ Spins super fast (4h day)!", "🏉 Rugby ball shape."] },

            // MOONS EN
            "lua": { id: "lua", nome: "Moon", tipo: "Moon", categoria: "moons", emoji: "🌝", imagem: REAL_PHOTOS.moon, galeria: [
                { url: REAL_PHOTOS.aldrin, caption: "Buzz Aldrin na Lua - Apollo 11, 1969. Sabias que no visor dele vês o reflexo de Neil Armstrong a tirar a foto? Por isso quase não há fotos do Neil na Lua!", captionEN: "Buzz Aldrin on the Moon - Apollo 11, 1969. Did you know you can see Neil Armstrong's reflection taking the photo? That's why there are almost no photos of Neil on the Moon!" },
                { url: REAL_PHOTOS.bootprint, caption: "Pegada de Buzz Aldrin no solo lunar. Sabias que ainda lá está hoje? Sem vento nem chuva na Lua, pode durar milhões de anos!", captionEN: "Buzz Aldrin's bootprint on lunar soil. Did you know it's still there today? With no wind or rain on the Moon, it could last millions of years!" },
                { url: REAL_PHOTOS.rover, caption: "Carro lunar das missões Apollo. Sabias que ficou na Lua para sempre? Custava muito combustível trazê-lo de volta!", captionEN: "Lunar Rover from Apollo missions. Did you know it was left on the Moon forever? It cost too much fuel to bring back!" }
            ], factosUau: ["👣 Footprints stay forever.", "🌊 Controls tides."] },
            "fobos": { id: "fobos", nome: "Phobos", tipo: "Mars Moon", categoria: "moons", emoji: "🥔", imagem: REAL_PHOTOS.phobos, factosUau: ["💥 Will crash into Mars one day."] },
            "deimos": { id: "deimos", nome: "Deimos", tipo: "Mars Moon", categoria: "moons", emoji: "🥔", imagem: REAL_PHOTOS.deimos, factosUau: ["👻 Named 'Terror'."] },
            "io": { id: "io", nome: "Io", tipo: "Jupiter Moon", categoria: "moons", emoji: "🌋", imagem: REAL_PHOTOS.io, factosUau: ["🌋 Most volcanic place!", "👃 Smells like sulfur."] },
            "europa": { id: "europa", nome: "Europa", tipo: "Jupiter Moon", categoria: "moons", emoji: "🧊", imagem: REAL_PHOTOS.europa, factosUau: ["🌊 2x more water than Earth!", "🦑 Life might exist in its ocean."] },
            "ganimedes": { id: "ganimedes", nome: "Ganymede", tipo: "Jupiter Moon", categoria: "moons", emoji: "⚪", imagem: REAL_PHOTOS.ganymede, factosUau: ["🛡️ Only moon with magnetic field."] },
            "calisto": { id: "calisto", nome: "Callisto", tipo: "Jupiter Moon", categoria: "moons", emoji: "🌑", imagem: REAL_PHOTOS.callisto, factosUau: ["🤕 Most cratered object."] },
            "tita": { id: "tita", nome: "Titan", tipo: "Saturn Moon", categoria: "moons", emoji: "🟡", imagem: REAL_PHOTOS.titan, factosUau: ["🌧️ Rains methane!", "✈️ You could fly with wings."] },
            "encelado": { id: "encelado", nome: "Enceladus", tipo: "Saturn Moon", categoria: "moons", emoji: "❄️", imagem: REAL_PHOTOS.enceladus, factosUau: ["⛲ Ice geysers form Saturn's E-ring!"] },
            "mimas": { id: "mimas", nome: "Mimas", tipo: "Saturn Moon", categoria: "moons", emoji: "💀", imagem: REAL_PHOTOS.mimas, factosUau: ["🎥 Looks like the Death Star!"] },
            "miranda": { id: "miranda", nome: "Miranda", tipo: "Uranus Moon", categoria: "moons", emoji: "🧩", factosUau: ["🧗 Highest cliff in solar system (20km)."] },
            "tritao": { id: "tritao", nome: "Triton", tipo: "Neptune Moon", categoria: "moons", emoji: "🥶", imagem: REAL_PHOTOS.triton, factosUau: ["❄️ Coldest object measured (-235°C)."] },
            "caronte": { id: "caronte", nome: "Charon", tipo: "Pluto Moon", categoria: "moons", emoji: "👫", imagem: REAL_PHOTOS.charon, factosUau: ["🔒 Locked in a dance with Pluto."] },

            // PROBES EN
            "voyager": { id: "voyager", nome: "Voyager 1", tipo: "Probe", categoria: "probes", emoji: "🛰️", imagem: REAL_PHOTOS.voyager, galeria: [
                { src: REAL_PHOTOS.voyager_launch, caption: "Lançamento da Voyager em 1977. Sabias que leva um disco dourado com músicas e sons da Terra para aliens nos conhecerem?", captionEN: "Voyager launch in 1977. Did you know it carries a golden record with music and sounds from Earth for aliens to learn about us?" },
                { src: REAL_PHOTOS.pale_blue_dot, caption: "Pale Blue Dot - a Terra a 6 mil milhões de km! Sabias que Carl Sagan pediu à Voyager para se virar e tirar esta foto? Aquele pontinho somos todos nós!", captionEN: "Pale Blue Dot - Earth from 6 billion km! Did you know Carl Sagan asked Voyager to turn around and take this photo? That tiny dot is all of us!" }
            ], factosUau: ["💿 Carries Earth sounds for aliens.", "🌌 In interstellar space."] },
            "iss": { id: "iss", nome: "Space Station", tipo: "Station", categoria: "probes", emoji: "🛸", imagem: REAL_PHOTOS.iss, galeria: [
                { src: REAL_PHOTOS.iss_interior, caption: "Interior da ISS. Sabias que os astronautas flutuam porque estão em queda livre constante à volta da Terra? É como estar num elevador a cair para sempre!", captionEN: "Inside the ISS. Did you know astronauts float because they're constantly falling around Earth? It's like being in an elevator falling forever!" },
                { src: REAL_PHOTOS.iss_2, caption: "Cúpula da ISS - a melhor janela do universo! Sabias que os astronautas passam horas aqui a ver a Terra e tirar fotos? Dá para ver auroras, tempestades e cidades à noite!", captionEN: "ISS Cupola - the best window in the universe! Did you know astronauts spend hours here watching Earth and taking photos? You can see auroras, storms and cities at night!" }
            ], factosUau: ["🌅 16 sunrises a day!", "💧 Pee recycled into water."] },
            "hubble": { id: "hubble", nome: "Hubble", tipo: "Telescope", categoria: "probes", emoji: "🔭", imagem: REAL_PHOTOS.hubble, galeria: [
                { src: REAL_PHOTOS.hubble_deploy, caption: "Space Shuttle a lançar o Hubble em 1990. Sabias que o Hubble tinha um defeito no espelho e as primeiras fotos saíam desfocadas? Astronautas foram lá arranjá-lo!", captionEN: "Space Shuttle deploying Hubble in 1990. Did you know Hubble had a mirror defect and the first photos were blurry? Astronauts went up to fix it!" }
            ], factosUau: ["👓 Showed us the accelerated universe."] },
            "curiosity": { id: "curiosity", nome: "Curiosity", tipo: "Rover", categoria: "probes", emoji: "🚙", imagem: REAL_PHOTOS.mars, galeria: [
                { src: REAL_PHOTOS.curiosity_selfie, caption: "Selfie do Curiosity em Marte! Sabias que ele usa um braço robótico para tirar várias fotos e depois junta-as? Por isso o braço não aparece na foto!", captionEN: "Curiosity selfie on Mars! Did you know it uses a robotic arm to take multiple photos and stitches them together? That's why the arm doesn't appear in the photo!" }
            ], factosUau: ["🎂 Sang Happy Birthday to itself on Mars!"] },
            "pioneer": { id: "pioneer", nome: "Pioneer 10", tipo: "Probe", categoria: "probes", emoji: "📡", imagem: REAL_PHOTOS.pioneer, galeria: [
                { src: REAL_PHOTOS.pioneer2, caption: "Placa da Pioneer - mensagem para aliens! Sabias que mostra um homem e uma mulher, a posição do Sol na galáxia, e o átomo de hidrogénio? É como um postal da humanidade!", captionEN: "Pioneer plaque - message for aliens! Did you know it shows a man and woman, the Sun's position in the galaxy, and the hydrogen atom? It's like a postcard from humanity!" }
            ], factosUau: ["👾 Carries a plaque with drawings of humans.", "⚡ Nuclear powered."] }
        }
    }
};

export default BIBLIOTECA_DATA;
