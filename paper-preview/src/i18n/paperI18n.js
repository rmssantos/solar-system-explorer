const STORAGE_KEY = 'paperSolarExplorer:language';

export const PAPER_TRANSLATIONS = Object.freeze({
    pt: Object.freeze({
        'shared.language': 'Idioma', 'shared.switchTo': 'Mudar para English', 'shared.skip': 'Saltar para o conteúdo',
        'privacy.settings': 'Definições de privacidade', 'privacy.footer': 'Privacidade',
        'media.enlarge': 'Ampliar fotografia', 'media.close': 'Fechar imagem',
        'privacy.consent.kicker': 'Métricas opcionais · escolha de um adulto', 'privacy.consent.title': 'Ajuda-nos a melhorar a expedição?',
        'privacy.consent.copy': 'Podemos contar visitas e ações gerais. Não guardamos nomes, pesquisas, respostas, coordenadas, gravações do ecrã ou movimentos do rato. O jogo funciona igual se recusares.',
        'privacy.consent.allow': 'Permitir métricas', 'privacy.consent.decline': 'Recusar', 'privacy.consent.revoke': 'Desligar métricas', 'privacy.consent.policy': 'Ler a privacidade',
        'privacy.status.on': 'As métricas estão ligadas neste dispositivo.', 'privacy.status.off': 'As métricas estão desligadas neste dispositivo.',
        'privacy.eyebrow': 'Caderno de privacidade', 'privacy.title': 'Poucos dados. Escolha clara.', 'privacy.lead': 'A expedição funciona sem métricas. Só medimos como o site é usado se um adulto ou responsável permitir.',
        'privacy.collect.title': 'O que medimos', 'privacy.collect.copy': 'Visitas e ações gerais como abrir uma ficha, iniciar uma viagem automática, concluir uma missão ou ampliar uma imagem.',
        'privacy.collect.noNames': 'Não pedimos nome nem email.', 'privacy.collect.noText': 'Não enviamos pesquisas escritas, respostas ou coordenadas da nave.', 'privacy.collect.noReplay': 'Não gravamos o ecrã, teclas ou movimentos do rato.',
        'privacy.purpose.title': 'Porque medimos', 'privacy.purpose.copy': 'As contagens ajudam a descobrir onde a experiência é confusa, que conteúdos despertam curiosidade e onde o jogo precisa de melhorar.',
        'privacy.children.title': 'Crianças e famílias', 'privacy.children.copy': 'Este projeto foi feito para famílias e escolas. Por isso, as métricas ficam desligadas até existir uma escolha clara. Pedimos a um adulto ou responsável que decida.',
        'privacy.storage.title': 'Onde e por quanto tempo', 'privacy.storage.copy': 'As métricas aceites são enviadas para Azure Application Insights na União Europeia. Recomendamos guardar registos brutos durante 30 dias. O endereço IP não é guardado e nunca deve ser ativada a recolha de IP sem nova avaliação.',
        'privacy.choice.title': 'A tua escolha', 'privacy.choice.copy': 'Podes recusar e continuar a usar tudo. Podes também mudar de ideia nesta página. Guardamos no dispositivo apenas a escolha e o progresso do jogo.',
        'privacy.rights.title': 'Direitos e contacto', 'privacy.rights.copy': 'Podes pedir informação, oposição ou eliminação. Como não criamos contas nem guardamos um identificador pessoal, normalmente não conseguimos ligar uma métrica a uma pessoa. Contacta o responsável pelo projeto através do repositório público.', 'privacy.rights.contact': 'Contactar no GitHub ↗',
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
        'home.footer.copy': 'Um laboratório de exploração espacial em papel.', 'home.footer.play': 'Jogar agora →', 'home.footer.explore': 'Explorar', 'home.footer.project': 'Projeto', 'home.footer.feedback': 'Enviar feedback ↗', 'home.footer.science': 'Experiência educativa · dados NASA, JPL, ESA e CelesTrak',
        'library.nav.home': 'Início', 'library.nav.catalog': 'Arquivo', 'library.nav.awards': 'Prémios', 'library.nav.play': 'Continuar expedição',
        'library.hero.eyebrow': 'Arquivo da expedição · edição viva', 'library.hero.title': 'Tudo o que já sabemos.', 'library.hero.emphasis': 'Tudo o que falta descobrir.',
        'library.hero.copy': 'Abre fichas de planetas, luas, sondas e pequenos corpos. Compara medidas, observa fotografias reais e leva o conhecimento de volta ao cockpit.', 'library.hero.browse': 'Abrir o arquivo',
        'library.progress.kicker': 'Passaporte atual', 'library.stats.discovered': 'Descobertos', 'library.stats.quizzes': 'Quizzes', 'library.stats.awards': 'Prémios',
        'library.catalog.eyebrow': '37 fichas científicas', 'library.catalog.title': 'Arquivo do Sistema Solar', 'library.results': '{count} objetos', 'library.results.one': '1 objeto',
        'library.search.label': 'Pesquisar no arquivo', 'library.search.placeholder': 'Planeta, lua, missão…',
        'library.filter.all': 'Todos', 'library.filter.worlds': 'Planetas', 'library.filter.moons': 'Luas', 'library.filter.human': 'Exploração humana', 'library.filter.small': 'Pequenos corpos',
        'library.filter.progress': 'Estado', 'library.filter.any': 'Todos', 'library.filter.discovered': 'Descobertos', 'library.filter.undiscovered': 'Por descobrir',
        'library.empty.title': 'Nenhuma ficha encontrada', 'library.empty.copy': 'Experimenta outro nome ou remove um filtro.',
        'library.awards.eyebrow': 'Carimbos no passaporte', 'library.awards.title': 'Prémios que contam', 'library.awards.emphasis': 'histórias reais.', 'library.awards.copy': 'Cada selo nasce de uma descoberta, missão ou conjunto de desafios. Não se compra e não desaparece.',
        'library.card.open': 'Abrir ficha →', 'library.card.discovered': 'Descoberto', 'library.card.undiscovered': 'Por descobrir',
        'library.detail.source': 'Ver fonte ↗', 'library.detail.realPhoto': 'Fotografia real de {name}', 'library.detail.noQuiz': 'Esta ficha ainda não tem quiz.',
        'library.quiz.completed': 'Desafio já concluído.', 'library.quiz.correct': 'Certo! +35 XP registados.', 'library.quiz.wrong': 'Ainda não. Revê a ficha e tenta outra opção.',
        'library.measure.radius': 'Raio', 'library.measure.distance': 'Distância ao Sol', 'library.measure.day': 'Dia', 'library.measure.year': 'Ano', 'library.measure.temperature': 'Temperatura', 'library.measure.moons': 'Luas',
        'library.award.unlocked': 'Conquistado', 'library.award.locked': 'Por conquistar', 'library.footer': 'Um arquivo vivo para regressar ao espaço com novas perguntas.',
        'game.home': '← Início', 'game.library': 'Biblioteca', 'game.loading': 'A montar o diorama…', 'game.objective.kicker': 'Missão de bolso', 'game.notebook': 'Caderno',
        'game.zoom.label': 'Distância da câmara', 'game.zoom.out': 'Afastar câmara', 'game.zoom.in': 'Aproximar câmara', 'game.cockpit': 'Cockpit', 'game.orbits': 'Órbitas',
        'game.cockpit.speed': 'Velocidade', 'game.cockpit.radar': 'Radar de missão', 'game.cockpit.attitude': 'Atitude', 'game.flight.boost': 'Boost',
        'game.explore.kicker': 'Ao alcance', 'game.explore': 'Explorar {name}', 'game.controls': 'W/S frente · A/D lateral · rato olha · roda zoom · V cockpit · Shift boost · R/F roda',
        'game.tabs.discover': 'Descobrir', 'game.tabs.measure': 'Medir', 'game.tabs.today': 'Hoje', 'game.tabs.challenge': 'Desafio', 'game.close': 'Fechar',
        'game.photo.real': 'Fotografia real de {name}', 'game.source.included': 'Fonte incluída',
        'game.measure.radius': 'Raio', 'game.measure.distance': 'Distância média ao Sol', 'game.measure.day': 'Duração do dia', 'game.measure.year': 'Duração do ano', 'game.measure.temperature': 'Temperatura média', 'game.measure.moons': 'Luas conhecidas',
        'game.measure.center': 'Centro do Sistema Solar', 'game.measure.millionKm': '{value} milhões km', 'game.measure.scale': 'Os tamanhos e distâncias do diorama são ampliados para poderes explorar.',
        'game.data.included': 'Dados incluídos', 'game.data.live': 'Ao vivo', 'game.data.cached': 'Cache recente', 'game.data.reference': 'Referência científica', 'game.data.updated': 'Atualizado {value}', 'game.data.source': 'Ver fonte científica',
        'game.quiz.kicker': 'Testa o que descobriste', 'game.quiz.correct': 'Certo!', 'game.quiz.wrong': 'Ainda não.', 'game.quiz.retry': 'Tentar novamente', 'game.quiz.none': 'Ainda não há desafio para este objeto.',
        'game.mission.complete': 'Missão cumprida', 'game.missions.all': 'Todas as missões cumpridas',
        'game.passport.kicker': 'Passaporte de exploração', 'game.passport.title': 'Diário de bordo', 'game.passport.missions': 'Missões', 'game.passport.collection': 'Coleção', 'game.passport.awards': 'Prémios',
        'game.passport.missionCopy': 'Podes completar descobertas fora de ordem. O diário guarda tudo neste dispositivo.', 'game.passport.collectionCopy': 'Cada cartão é um lugar ou objeto que encontraste pessoalmente.', 'game.passport.awardsCopy': 'Medalhas por curiosidade; troféus por viagens extraordinárias.', 'game.passport.device': 'Expedição guardada apenas neste dispositivo',
        'game.collection.locked': 'Por descobrir', 'game.collection.hint': 'Segue a curiosidade', 'game.awards.locked': 'Ainda por conquistar',
        'game.lumi.kicker': 'Lumi · guia de bordo', 'game.lumi.reward': '+15 XP', 'game.lumi.dismiss': 'Fechar transmissão',
        'game.level': 'Nível {level} · {title}', 'game.rank.kicker': 'Patente de explorador',
        'game.progress.saved': 'Progresso registado', 'game.progress.keep': 'Continua a explorar.', 'game.progress.levelUp': 'Nova patente', 'game.progress.award': 'Novo prémio',
        'game.autopilot.hover': 'Clica para ativar o piloto de papel', 'game.autopilot.kicker': 'Piloto de papel', 'game.autopilot.cancel': 'Cancelar',
        'game.distance.diorama': '{value} u no diorama', 'game.distance.solar': '{value} UA ao Sol'
    }),
    en: Object.freeze({
        'shared.language': 'Language', 'shared.switchTo': 'Switch to Português', 'shared.skip': 'Skip to content',
        'privacy.settings': 'Privacy settings', 'privacy.footer': 'Privacy',
        'media.enlarge': 'Enlarge photograph', 'media.close': 'Close image',
        'privacy.consent.kicker': 'Optional metrics · an adult chooses', 'privacy.consent.title': 'Help us improve the expedition?',
        'privacy.consent.copy': 'We can count visits and broad actions. We do not store names, searches, answers, coordinates, screen recordings or mouse movement. The game works the same if you decline.',
        'privacy.consent.allow': 'Allow metrics', 'privacy.consent.decline': 'Decline', 'privacy.consent.revoke': 'Turn metrics off', 'privacy.consent.policy': 'Read the privacy notice',
        'privacy.status.on': 'Metrics are on for this device.', 'privacy.status.off': 'Metrics are off for this device.',
        'privacy.eyebrow': 'Privacy field note', 'privacy.title': 'Less data. A clear choice.', 'privacy.lead': 'The expedition works without metrics. We only measure how the site is used if an adult or guardian allows it.',
        'privacy.collect.title': 'What we measure', 'privacy.collect.copy': 'Visits and broad actions such as opening a record, starting an automatic journey, completing a mission or enlarging an image.',
        'privacy.collect.noNames': 'We do not ask for a name or email.', 'privacy.collect.noText': 'We do not send typed searches, answers or ship coordinates.', 'privacy.collect.noReplay': 'We do not record the screen, keys or mouse movement.',
        'privacy.purpose.title': 'Why we measure', 'privacy.purpose.copy': 'Counts help us find confusing parts, understand which content sparks curiosity and decide where the game needs improvement.',
        'privacy.children.title': 'Children and families', 'privacy.children.copy': 'This project is made for families and schools. Metrics therefore remain off until there is a clear choice. We ask an adult or guardian to decide.',
        'privacy.storage.title': 'Where and for how long', 'privacy.storage.copy': 'Accepted metrics are sent to Azure Application Insights in the European Union. We recommend keeping raw logs for 30 days. IP addresses are not stored and IP collection must never be enabled without a new assessment.',
        'privacy.choice.title': 'Your choice', 'privacy.choice.copy': 'You can decline and keep using everything. You can also change your mind on this page. We store only the choice and game progress on this device.',
        'privacy.rights.title': 'Rights and contact', 'privacy.rights.copy': 'You can ask for information, object or request deletion. Because we create no accounts or personal identifier, we normally cannot connect a metric to a person. Contact the project owner through the public repository.', 'privacy.rights.contact': 'Contact on GitHub ↗',
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
        'home.footer.copy': 'A paper laboratory for space exploration.', 'home.footer.play': 'Play now →', 'home.footer.explore': 'Explore', 'home.footer.project': 'Project', 'home.footer.feedback': 'Send feedback ↗', 'home.footer.science': 'Educational experience · NASA, JPL, ESA and CelesTrak data',
        'library.nav.home': 'Home', 'library.nav.catalog': 'Archive', 'library.nav.awards': 'Awards', 'library.nav.play': 'Continue expedition',
        'library.hero.eyebrow': 'Expedition archive · living edition', 'library.hero.title': 'Everything we know.', 'library.hero.emphasis': 'Everything left to discover.',
        'library.hero.copy': 'Open records for planets, moons, probes and small bodies. Compare measurements, see real photographs and take new knowledge back to the cockpit.', 'library.hero.browse': 'Open the archive',
        'library.progress.kicker': 'Current passport', 'library.stats.discovered': 'Discovered', 'library.stats.quizzes': 'Quizzes', 'library.stats.awards': 'Awards',
        'library.catalog.eyebrow': '37 science records', 'library.catalog.title': 'Solar System archive', 'library.results': '{count} objects', 'library.results.one': '1 object',
        'library.search.label': 'Search the archive', 'library.search.placeholder': 'Planet, moon, mission…',
        'library.filter.all': 'All', 'library.filter.worlds': 'Planets', 'library.filter.moons': 'Moons', 'library.filter.human': 'Human exploration', 'library.filter.small': 'Small bodies',
        'library.filter.progress': 'Status', 'library.filter.any': 'All', 'library.filter.discovered': 'Discovered', 'library.filter.undiscovered': 'Undiscovered',
        'library.empty.title': 'No records found', 'library.empty.copy': 'Try another name or remove a filter.',
        'library.awards.eyebrow': 'Passport stamps', 'library.awards.title': 'Awards that tell', 'library.awards.emphasis': 'real stories.', 'library.awards.copy': 'Every stamp comes from a discovery, mission or set of challenges. It cannot be bought and never disappears.',
        'library.card.open': 'Open record →', 'library.card.discovered': 'Discovered', 'library.card.undiscovered': 'Undiscovered',
        'library.detail.source': 'View source ↗', 'library.detail.realPhoto': 'Real photograph of {name}', 'library.detail.noQuiz': 'This record does not have a quiz yet.',
        'library.quiz.completed': 'Challenge already completed.', 'library.quiz.correct': 'Correct! +35 XP recorded.', 'library.quiz.wrong': 'Not yet. Review the record and try another option.',
        'library.measure.radius': 'Radius', 'library.measure.distance': 'Distance from Sun', 'library.measure.day': 'Day', 'library.measure.year': 'Year', 'library.measure.temperature': 'Temperature', 'library.measure.moons': 'Moons',
        'library.award.unlocked': 'Earned', 'library.award.locked': 'Not earned', 'library.footer': 'A living archive for returning to space with new questions.',
        'game.home': '← Home', 'game.library': 'Library', 'game.loading': 'Assembling the diorama…', 'game.objective.kicker': 'Pocket mission', 'game.notebook': 'Notebook',
        'game.zoom.label': 'Camera distance', 'game.zoom.out': 'Move camera away', 'game.zoom.in': 'Move camera closer', 'game.cockpit': 'Cockpit', 'game.orbits': 'Orbits',
        'game.cockpit.speed': 'Speed', 'game.cockpit.radar': 'Mission radar', 'game.cockpit.attitude': 'Attitude', 'game.flight.boost': 'Boost',
        'game.explore.kicker': 'Within reach', 'game.explore': 'Explore {name}', 'game.controls': 'W/S forward · A/D strafe · mouse look · wheel zoom · V cockpit · Shift boost · R/F roll',
        'game.tabs.discover': 'Discover', 'game.tabs.measure': 'Measure', 'game.tabs.today': 'Today', 'game.tabs.challenge': 'Challenge', 'game.close': 'Close',
        'game.photo.real': 'Real photograph of {name}', 'game.source.included': 'Included source',
        'game.measure.radius': 'Radius', 'game.measure.distance': 'Average distance from the Sun', 'game.measure.day': 'Day length', 'game.measure.year': 'Year length', 'game.measure.temperature': 'Average temperature', 'game.measure.moons': 'Known moons',
        'game.measure.center': 'Centre of the Solar System', 'game.measure.millionKm': '{value} million km', 'game.measure.scale': 'Diorama sizes and distances are enlarged so that you can explore them.',
        'game.data.included': 'Included data', 'game.data.live': 'Live', 'game.data.cached': 'Recent cache', 'game.data.reference': 'Scientific reference', 'game.data.updated': 'Updated {value}', 'game.data.source': 'View scientific source',
        'game.quiz.kicker': 'Test what you discovered', 'game.quiz.correct': 'Correct!', 'game.quiz.wrong': 'Not yet.', 'game.quiz.retry': 'Try again', 'game.quiz.none': 'There is no challenge for this object yet.',
        'game.mission.complete': 'Mission complete', 'game.missions.all': 'All missions complete',
        'game.passport.kicker': 'Exploration passport', 'game.passport.title': 'Captain’s log', 'game.passport.missions': 'Missions', 'game.passport.collection': 'Collection', 'game.passport.awards': 'Awards',
        'game.passport.missionCopy': 'Discoveries can be completed out of order. This log is saved on your device.', 'game.passport.collectionCopy': 'Each card is a place or object you personally found.', 'game.passport.awardsCopy': 'Medals for curiosity; trophies for extraordinary journeys.', 'game.passport.device': 'Expedition saved only on this device',
        'game.collection.locked': 'Undiscovered', 'game.collection.hint': 'Follow your curiosity', 'game.awards.locked': 'Not earned yet',
        'game.lumi.kicker': 'Lumi · flight guide', 'game.lumi.reward': '+15 XP', 'game.lumi.dismiss': 'Close transmission',
        'game.level': 'Level {level} · {title}', 'game.rank.kicker': 'Explorer rank',
        'game.progress.saved': 'Progress recorded', 'game.progress.keep': 'Keep exploring.', 'game.progress.levelUp': 'New rank', 'game.progress.award': 'New award',
        'game.autopilot.hover': 'Click to start the paper pilot', 'game.autopilot.kicker': 'Paper pilot', 'game.autopilot.cancel': 'Cancel',
        'game.distance.diorama': '{value} u in the diorama', 'game.distance.solar': '{value} AU from the Sun'
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
            const key = element.getAttribute('data-i18n');
            if (key) element.textContent = t(key);
        });
        root.querySelectorAll('[data-i18n-aria]').forEach((element) => {
            const key = element.getAttribute('data-i18n-aria');
            if (key) element.setAttribute('aria-label', t(key));
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
