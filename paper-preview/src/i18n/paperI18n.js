const STORAGE_KEY = 'paperSolarExplorer:language';

export const PAPER_TRANSLATIONS = Object.freeze({
    pt: Object.freeze({
        'shared.language': 'Idioma', 'shared.switchTo': 'Mudar para English', 'shared.skip': 'Saltar para o conteúdo',
        'home.brand.top': 'Sistema Solar', 'home.brand.bottom': 'de Bolso',
        'home.nav.expedition': 'A expedição', 'home.nav.learn': 'Aprender', 'home.nav.library': 'Biblioteca', 'home.nav.sources': 'As fontes', 'home.enter': 'Entrar no jogo',
        'home.hero.eyebrow': 'Uma expedição espacial calma e curiosa', 'home.hero.title': 'Explora o Sistema Solar', 'home.hero.emphasis': 'por dentro.',
        'home.hero.lead': 'Pilota uma pequena nave num universo 3D feito de papel. Visita planetas e luas, encontra sondas, resolve desafios e abre um caderno de campo cheio de descobertas reais.',
        'home.hero.start': 'Começar a expedição', 'home.hero.how': 'Ver como funciona', 'home.hero.noteFlight': 'Voo livre 360°', 'home.hero.noteAds': 'Sem anúncios', 'home.hero.noteProgress': 'Progresso neste dispositivo',
        'home.hero.caption': 'Um diorama vivo',
        'home.audience.family': 'Para famílias', 'home.audience.familyCopy': 'Uma viagem partilhada, acessível e sem pressas.',
        'home.audience.school': 'Para escolas', 'home.audience.schoolCopy': 'Ciência visual para explorar, perguntar e conversar.',
        'home.audience.curious': 'Para pequenos curiosos', 'home.audience.curiousCopy': 'Controlos simples, grandes perguntas e muitas surpresas.',
        'home.expedition.eyebrow': 'O teu mapa não acaba na Terra', 'home.expedition.title': 'Uma aventura feita para', 'home.expedition.emphasis': 'descobrir.',
        'home.expedition.copy': 'O Sistema Solar é apresentado como um grande móvel de papel: simples de ler à distância, rico em histórias quando te aproximas.',
        'home.steps.fly': 'Voa', 'home.steps.flyCopy': 'Segue a câmara em 360°, aproxima-te dos mundos ou entra no cockpit.',
        'home.steps.discover': 'Descobre', 'home.steps.discoverCopy': 'Encontra planetas, luas, estações, sondas, cometas e objetos inesperados.',
        'home.steps.learn': 'Aprende', 'home.steps.learnCopy': 'Abre o caderno, compara medidas e observa fotografias reais do espaço.',
        'home.steps.collect': 'Coleciona', 'home.steps.collectCopy': 'Cumpre missões, responde a quizzes e conquista prémios de explorador.',
        'home.learn.field': 'CADERNO DE CAMPO · 03', 'home.learn.caption': 'Saturno · Cassini · maquete de papel', 'home.learn.question': 'Porque tem Saturno tantos anéis?',
        'home.learn.answer': 'Milhões de fragmentos de gelo e rocha orbitam o planeta. Alguns são tão pequenos como grãos de pó; outros são maiores do que uma casa.',
        'home.learn.eyebrow': 'Da fantasia à ciência', 'home.learn.title': 'Primeiro encanta.', 'home.learn.emphasis': 'Depois explica.',
        'home.learn.copy': 'O grafismo é artesanal, mas a aprendizagem é séria. Cada destino liga a medidas, curiosidades, missões históricas, quizzes e fotografias reais.',
        'home.learn.point1': 'Comparações que uma criança consegue imaginar', 'home.learn.point2': 'Fontes identificadas e dados com data', 'home.learn.point3': 'Conteúdo guardado para funcionar mesmo offline',
        'home.rewards.eyebrow': 'Diário de bordo', 'home.rewards.title': 'Pequenos objetivos.', 'home.rewards.emphasis': 'Grandes viagens.',
        'home.rewards.first': 'Primeira luz', 'home.rewards.moons': 'Salta-luas', 'home.rewards.rings': 'Rota dos anéis', 'home.rewards.next': 'PRÓXIMA MISSÃO', 'home.rewards.signal': 'Escuta um sinal perdido',
        'home.rewards.copy': 'As missões dão direção sem transformar a exploração numa lista de tarefas. Podes seguir a seta, desviar-te por curiosidade e regressar quando quiseres.',
        'home.sources.eyebrow': 'Um universo ligado ao universo real', 'home.sources.title': 'Dados abertos.', 'home.sources.emphasis': 'Fontes visíveis.',
        'home.sources.copy': 'O jogo combina uma simulação educativa com informação pública de instituições científicas. Quando existe ligação, pode atualizar efemérides, imagens e notícias; quando não existe, mantém conteúdo editorial revisto.',
        'home.sources.note': 'As distâncias do diorama são comprimidas para serem jogáveis. O caderno distingue sempre o modelo visual dos valores científicos.',
        'home.cta.eyebrow': 'A nave está pronta', 'home.cta.title': 'Qual será a tua', 'home.cta.emphasis': 'primeira descoberta?', 'home.cta.button': 'Abrir o hangar',
        'home.footer.copy': 'Um laboratório de exploração espacial em papel.', 'home.footer.play': 'Jogar agora →',
        'game.home': '← Início', 'game.library': 'Biblioteca', 'game.loading': 'A montar o diorama…', 'game.objective.kicker': 'Missão de bolso', 'game.notebook': 'Caderno',
        'game.zoom.label': 'Distância da câmara', 'game.zoom.out': 'Afastar câmara', 'game.zoom.in': 'Aproximar câmara', 'game.cockpit': 'Cockpit', 'game.orbits': 'Órbitas',
        'game.cockpit.speed': 'Velocidade', 'game.cockpit.radar': 'Radar de missão', 'game.cockpit.attitude': 'Atitude', 'game.flight.boost': 'Boost',
        'game.explore.kicker': 'Ao alcance', 'game.explore': 'Explorar {name}', 'game.controls': 'W/S frente · A/D lateral · rato olha · roda zoom · V cockpit · Shift boost · R/F roda',
        'game.tabs.discover': 'Descobrir', 'game.tabs.measure': 'Medir', 'game.tabs.today': 'Hoje', 'game.tabs.challenge': 'Desafio', 'game.close': 'Fechar',
        'game.photo.real': 'Fotografia real de {name}', 'game.source.included': 'Fonte incluída',
        'game.measure.radius': 'Raio', 'game.measure.distance': 'Distância média ao Sol', 'game.measure.day': 'Duração do dia', 'game.measure.year': 'Duração do ano', 'game.measure.temperature': 'Temperatura média', 'game.measure.moons': 'Luas conhecidas',
        'game.measure.center': 'Centro do Sistema Solar', 'game.measure.millionKm': '{value} milhões km', 'game.measure.scale': 'Os tamanhos e distâncias do diorama são ampliados para poderes explorar.',
        'game.data.included': 'Dados incluídos', 'game.data.live': 'Ao vivo', 'game.data.cached': 'Cache recente', 'game.data.updated': 'Atualizado {value}', 'game.data.source': 'Ver fonte científica',
        'game.quiz.kicker': 'Testa o que descobriste', 'game.quiz.correct': 'Certo!', 'game.quiz.wrong': 'Ainda não.', 'game.quiz.retry': 'Tentar novamente', 'game.quiz.none': 'Ainda não há desafio para este objeto.',
        'game.mission.complete': 'Missão cumprida', 'game.missions.all': 'Todas as missões cumpridas',
        'game.passport.kicker': 'Passaporte de exploração', 'game.passport.title': 'Diário de bordo', 'game.passport.missions': 'Missões', 'game.passport.collection': 'Coleção', 'game.passport.awards': 'Prémios',
        'game.passport.missionCopy': 'Podes completar descobertas fora de ordem. O diário guarda tudo neste dispositivo.', 'game.passport.collectionCopy': 'Cada cartão é um lugar ou objeto que encontraste pessoalmente.', 'game.passport.awardsCopy': 'Medalhas por curiosidade; troféus por viagens extraordinárias.',
        'game.collection.locked': 'Por descobrir', 'game.collection.hint': 'Segue a curiosidade', 'game.awards.locked': 'Ainda por conquistar',
        'game.lumi.kicker': 'Lumi · guia de bordo', 'game.lumi.reward': '+15 XP', 'game.lumi.dismiss': 'Fechar transmissão',
        'game.level': 'Nível {level} · {title}', 'game.distance.diorama': '{value} u no diorama', 'game.distance.solar': '{value} UA ao Sol'
    }),
    en: Object.freeze({
        'shared.language': 'Language', 'shared.switchTo': 'Switch to Português', 'shared.skip': 'Skip to content',
        'home.brand.top': 'Pocket Solar', 'home.brand.bottom': 'System',
        'home.nav.expedition': 'The expedition', 'home.nav.learn': 'Learn', 'home.nav.library': 'Library', 'home.nav.sources': 'Our sources', 'home.enter': 'Enter the game',
        'home.hero.eyebrow': 'A calm and curious space expedition', 'home.hero.title': 'Explore the Solar System', 'home.hero.emphasis': 'from within.',
        'home.hero.lead': 'Pilot a tiny ship through a 3D universe made of paper. Visit planets and moons, find probes, solve challenges and open a field notebook packed with real discoveries.',
        'home.hero.start': 'Start the expedition', 'home.hero.how': 'See how it works', 'home.hero.noteFlight': 'Free 360° flight', 'home.hero.noteAds': 'No ads', 'home.hero.noteProgress': 'Progress saved on this device',
        'home.hero.caption': 'A living diorama',
        'home.audience.family': 'For families', 'home.audience.familyCopy': 'A shared, accessible journey with no need to rush.',
        'home.audience.school': 'For schools', 'home.audience.schoolCopy': 'Visual science to explore, question and discuss.',
        'home.audience.curious': 'For young explorers', 'home.audience.curiousCopy': 'Simple controls, big questions and many surprises.',
        'home.expedition.eyebrow': 'Your map does not end on Earth', 'home.expedition.title': 'An adventure made for', 'home.expedition.emphasis': 'discovery.',
        'home.expedition.copy': 'The Solar System is presented as a great paper mobile: easy to read from afar and rich in stories when you move closer.',
        'home.steps.fly': 'Fly', 'home.steps.flyCopy': 'Follow the camera in 360°, approach new worlds or step into the cockpit.',
        'home.steps.discover': 'Discover', 'home.steps.discoverCopy': 'Find planets, moons, stations, probes, comets and unexpected objects.',
        'home.steps.learn': 'Learn', 'home.steps.learnCopy': 'Open the notebook, compare measurements and see real photographs of space.',
        'home.steps.collect': 'Collect', 'home.steps.collectCopy': 'Complete missions, answer quizzes and earn explorer awards.',
        'home.learn.field': 'FIELD NOTEBOOK · 03', 'home.learn.caption': 'Saturn · Cassini · paper model', 'home.learn.question': 'Why does Saturn have so many rings?',
        'home.learn.answer': 'Millions of fragments of ice and rock orbit the planet. Some are as small as grains of dust; others are larger than a house.',
        'home.learn.eyebrow': 'From wonder to science', 'home.learn.title': 'Enchant first.', 'home.learn.emphasis': 'Then explain.',
        'home.learn.copy': 'The artwork is handcrafted, but the learning is serious. Every destination connects to measurements, facts, historic missions, quizzes and real photographs.',
        'home.learn.point1': 'Comparisons children can picture', 'home.learn.point2': 'Identified sources and dated data', 'home.learn.point3': 'Saved content that also works offline',
        'home.rewards.eyebrow': 'Captain’s log', 'home.rewards.title': 'Small objectives.', 'home.rewards.emphasis': 'Great journeys.',
        'home.rewards.first': 'First light', 'home.rewards.moons': 'Moon hopper', 'home.rewards.rings': 'Route of the Rings', 'home.rewards.next': 'NEXT MISSION', 'home.rewards.signal': 'Listen for a lost signal',
        'home.rewards.copy': 'Missions offer direction without turning exploration into a checklist. Follow the arrow, wander off out of curiosity and return whenever you like.',
        'home.sources.eyebrow': 'A universe connected to the real one', 'home.sources.title': 'Open data.', 'home.sources.emphasis': 'Visible sources.',
        'home.sources.copy': 'The game combines an educational simulation with public information from scientific institutions. Online, it can refresh ephemerides, images and news; offline, reviewed editorial content remains available.',
        'home.sources.note': 'Diorama distances are compressed to remain playable. The notebook always distinguishes the visual model from scientific values.',
        'home.cta.eyebrow': 'The ship is ready', 'home.cta.title': 'What will be your', 'home.cta.emphasis': 'first discovery?', 'home.cta.button': 'Open the hangar',
        'home.footer.copy': 'A paper laboratory for space exploration.', 'home.footer.play': 'Play now →',
        'game.home': '← Home', 'game.library': 'Library', 'game.loading': 'Assembling the diorama…', 'game.objective.kicker': 'Pocket mission', 'game.notebook': 'Notebook',
        'game.zoom.label': 'Camera distance', 'game.zoom.out': 'Move camera away', 'game.zoom.in': 'Move camera closer', 'game.cockpit': 'Cockpit', 'game.orbits': 'Orbits',
        'game.cockpit.speed': 'Speed', 'game.cockpit.radar': 'Mission radar', 'game.cockpit.attitude': 'Attitude', 'game.flight.boost': 'Boost',
        'game.explore.kicker': 'Within reach', 'game.explore': 'Explore {name}', 'game.controls': 'W/S forward · A/D strafe · mouse look · wheel zoom · V cockpit · Shift boost · R/F roll',
        'game.tabs.discover': 'Discover', 'game.tabs.measure': 'Measure', 'game.tabs.today': 'Today', 'game.tabs.challenge': 'Challenge', 'game.close': 'Close',
        'game.photo.real': 'Real photograph of {name}', 'game.source.included': 'Included source',
        'game.measure.radius': 'Radius', 'game.measure.distance': 'Average distance from the Sun', 'game.measure.day': 'Day length', 'game.measure.year': 'Year length', 'game.measure.temperature': 'Average temperature', 'game.measure.moons': 'Known moons',
        'game.measure.center': 'Centre of the Solar System', 'game.measure.millionKm': '{value} million km', 'game.measure.scale': 'Diorama sizes and distances are enlarged so that you can explore them.',
        'game.data.included': 'Included data', 'game.data.live': 'Live', 'game.data.cached': 'Recent cache', 'game.data.updated': 'Updated {value}', 'game.data.source': 'View scientific source',
        'game.quiz.kicker': 'Test what you discovered', 'game.quiz.correct': 'Correct!', 'game.quiz.wrong': 'Not yet.', 'game.quiz.retry': 'Try again', 'game.quiz.none': 'There is no challenge for this object yet.',
        'game.mission.complete': 'Mission complete', 'game.missions.all': 'All missions complete',
        'game.passport.kicker': 'Exploration passport', 'game.passport.title': 'Captain’s log', 'game.passport.missions': 'Missions', 'game.passport.collection': 'Collection', 'game.passport.awards': 'Awards',
        'game.passport.missionCopy': 'Discoveries can be completed out of order. This log is saved on your device.', 'game.passport.collectionCopy': 'Each card is a place or object you personally found.', 'game.passport.awardsCopy': 'Medals for curiosity; trophies for extraordinary journeys.',
        'game.collection.locked': 'Undiscovered', 'game.collection.hint': 'Follow your curiosity', 'game.awards.locked': 'Not earned yet',
        'game.lumi.kicker': 'Lumi · flight guide', 'game.lumi.reward': '+15 XP', 'game.lumi.dismiss': 'Close transmission',
        'game.level': 'Level {level} · {title}', 'game.distance.diorama': '{value} u in the diorama', 'game.distance.solar': '{value} AU from the Sun'
    })
});

function normalizeLanguage(language) {
    return language === 'en' ? 'en' : 'pt';
}

export function createPaperI18n({ storage = globalThis.localStorage, document = globalThis.document } = {}) {
    let language = 'pt';
    const listeners = new Set();
    try {
        language = normalizeLanguage(storage?.getItem(STORAGE_KEY) ?? storage?.getItem('spaceExplorer_lang'));
    } catch {}

    function t(key, params = {}) {
        let value = PAPER_TRANSLATIONS[language][key] ?? PAPER_TRANSLATIONS.pt[key] ?? key;
        for (const [name, replacement] of Object.entries(params)) {
            value = value.split(`{${name}}`).join(String(replacement));
        }
        return value;
    }

    function apply(root = document) {
        if (!root?.querySelectorAll) return;
        root.querySelectorAll('[data-i18n]').forEach((element) => {
            element.textContent = t(element.dataset.i18n);
        });
        root.querySelectorAll('[data-i18n-aria]').forEach((element) => {
            element.setAttribute('aria-label', t(element.dataset.i18nAria));
        });
        if (document?.documentElement) document.documentElement.lang = language === 'pt' ? 'pt-PT' : 'en';
    }

    function setLanguage(nextLanguage) {
        const normalized = normalizeLanguage(nextLanguage);
        language = normalized;
        try {
            storage?.setItem(STORAGE_KEY, normalized);
            storage?.setItem('spaceExplorer_lang', normalized);
        } catch {}
        apply();
        listeners.forEach((listener) => listener(normalized));
    }

    function toggle() {
        setLanguage(language === 'pt' ? 'en' : 'pt');
    }

    return Object.freeze({
        get language() { return language; },
        t,
        apply,
        setLanguage,
        toggle,
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
    });
}

export const paperI18n = createPaperI18n();
