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
        'game.home': '← Início', 'game.library': 'Biblioteca', 'game.loading': 'A montar o diorama…', 'game.stage': 'Diorama interativo do Sistema Solar em papel', 'game.accessibleControls': 'No ecrã tátil, usa o joystick inferior esquerdo para mover, arrasta o cenário com um dedo para olhar e usa dois dedos para zoom. Com teclado, usa W, A, S, D ou as setas para mover, Espaço e Control para subir e descer.', 'game.objective.kicker': 'Missão de bolso', 'game.notebook': 'Caderno',
        'game.missionCenter.open': 'Missões', 'game.missionCenter.kicker': 'Despacho orbital', 'game.missionCenter.title': 'Centro de Missões', 'game.missionCenter.copy': 'Escolhe uma rota, prepara a carga e ganha novos selos de explorador.',
        'game.agency.open': 'Agência', 'game.agency.kicker': 'Base orbital · mesa 01', 'game.agency.title': 'Agência Espacial de Papel', 'game.agency.copy': 'Planeia sondas, acompanha o Sistema Solar real e transforma sinais em descobertas.',
        'game.agency.journey': 'Etapas da aventura', 'game.agency.route.mission': 'Missão', 'game.agency.route.equip': 'Equipar', 'game.agency.route.travel': 'Viajar', 'game.agency.route.investigate': 'Investigar', 'game.agency.route.discovery': 'Descoberta',
        'game.agency.adventure.open': 'Começar aventura', 'game.agency.back': '← Aventuras', 'game.agency.briefing.kicker': 'O teu desafio', 'game.agency.briefing.live': 'Mensagem do observatório', 'game.agency.briefing.today': 'O que sabemos hoje', 'game.agency.briefing.start': 'Montar a minha sonda', 'game.agency.briefing.tutorial': 'Primeira viagem: vamos aprender juntos. Podes experimentar sem perder pontos.', 'game.agency.briefing.replay': 'Tentativa {attempt}: agora podes melhorar a tua melhor descoberta.',
        'game.agency.album.open': 'Álbum', 'game.agency.album.kicker': 'Álbum de descobertas', 'game.agency.album.title': 'Tudo o que já encontraste', 'game.agency.album.attempt': '{count} tentativa', 'game.agency.album.attempts': '{count} tentativas', 'game.agency.album.best': 'Melhor descoberta', 'game.agency.album.saveReward': 'Guardar recompensa', 'game.agency.progress': '{done}/{total} aventuras descobertas', 'game.agency.mastery.new': 'Nova aventura', 'game.agency.mastery.discovered': 'Descoberto', 'game.agency.mastery.investigator': 'Investigador', 'game.agency.mastery.specialist': 'Especialista', 'game.agency.source.more': 'Para exploradores curiosos: {source}',
        'game.agency.close': 'Fechar Agência', 'game.agency.navigation': 'Áreas da Agência', 'game.agency.dispatch': 'Despacho', 'game.agency.live': 'Sistema Vivo', 'game.agency.probes': 'Sondas', 'game.agency.reports': 'Relatórios',
        'game.agency.dispatchKicker': 'Operações de hoje', 'game.agency.dispatchTitle': 'Escolhe uma pergunta para investigar', 'game.agency.campaign': 'Contratos orbitais',
        'game.agency.liveKicker': 'Observatório ligado', 'game.agency.liveTitle': 'O que está a acontecer agora', 'game.agency.probesKicker': 'Trajetórias perfuradas', 'game.agency.probesTitle': 'Sondas em missão', 'game.agency.reportsKicker': 'Arquivo científico', 'game.agency.reportsTitle': 'Descobertas enviadas para casa',
        'game.agency.prepare': 'Preparar sonda', 'game.agency.launch': 'Lançar sonda', 'game.agency.cancel': 'Cancelar', 'game.agency.collect': 'Recolher relatório', 'game.agency.collected': 'Relatório arquivado', 'game.agency.launched': 'Sonda lançada. A missão continua mesmo que feches o site.',
        'game.agency.instrument': 'Instrumento científico', 'game.agency.power': 'Perfil de energia', 'game.agency.route': 'Trajetória', 'game.agency.capacity': '{used}/{total} sondas', 'game.agency.emptyProbes': 'Nenhuma sonda em viagem. Escolhe uma operação no Despacho.', 'game.agency.emptyReports': 'Os relatórios das sondas concluídas aparecerão aqui.',
        'game.agency.source.live': 'Dados ao vivo', 'game.agency.source.cached': 'Cache recente', 'game.agency.source.fallback': 'Dados incluídos',
        'game.agency.instrument.camera': 'Câmara', 'game.agency.instrument.magnetometer': 'Magnetómetro', 'game.agency.instrument.radio': 'Antena rádio',
        'game.agency.choice.recommended': 'Recomendado', 'game.agency.instrument.camera.purpose': 'Tira fotografias nítidas.', 'game.agency.instrument.camera.consequence': 'Melhor para ver formas e superfícies.', 'game.agency.instrument.magnetometer.purpose': 'Sente forças magnéticas invisíveis.', 'game.agency.instrument.magnetometer.consequence': 'Melhor para investigar o Sol.', 'game.agency.instrument.radio.purpose': 'Escuta sinais muito distantes.', 'game.agency.instrument.radio.consequence': 'Melhor para comunicar com Marte.',
        'game.agency.power.survey': 'Varrimento', 'game.agency.power.balanced': 'Equilibrado', 'game.agency.power.focused': 'Focado', 'game.agency.route.fast': 'Rota rápida', 'game.agency.route.stable': 'Rota estável',
        'game.agency.power.survey.purpose': 'Observa uma área maior.', 'game.agency.power.survey.consequence': 'Encontra mais pistas, com menos detalhe.', 'game.agency.power.balanced.purpose': 'Divide a energia por todos os sistemas.', 'game.agency.power.balanced.consequence': 'Uma escolha segura para qualquer aventura.', 'game.agency.power.focused.purpose': 'Envia mais energia para o instrumento.', 'game.agency.power.focused.consequence': 'Leituras mais fortes e precisas.', 'game.agency.route.fast.purpose': 'Chega ao destino mais depressa.', 'game.agency.route.fast.consequence': 'A viagem abana mais a sonda.', 'game.agency.route.stable.purpose': 'Viaja devagar e com pouco movimento.', 'game.agency.route.stable.consequence': 'Mais fácil obter uma leitura limpa.',
        'game.agency.science.open': 'Abrir consola', 'game.agency.science.close': 'Fechar consola científica', 'game.agency.science.canvasLabel': 'Vista científica interativa da sonda', 'game.agency.science.kicker': 'Ligação direta · sonda', 'game.agency.science.title': 'Consola científica', 'game.agency.science.capture': 'Capturar leitura', 'game.agency.science.capture.solar': 'Capturar pulso', 'game.agency.science.capture.neo': 'Tirar fotografia',
        'game.agency.science.launching': 'Lançamento em curso…', 'game.agency.science.solar.instructions': 'Captura três leituras quando a linha atravessar a assinatura luminosa. Espaço também captura.', 'game.agency.science.neo.instructions': 'Move a mira com o rato ou arrasta o dedo sobre o ecrã. Quando o círculo ficar verde, toca ou clica no asteroide, ou usa “Tirar fotografia”. No teclado, prime Espaço.', 'game.agency.science.mars.instructions': 'Arrasta a barra para a esquerda ou direita até o sinal ficar forte. Depois mantém a barra quieta durante dois segundos.',
        'game.agency.science.samples': '{count}/3 leituras · qualidade {score}%', 'game.agency.science.tuning': 'Arrasta para ajustar a frequência', 'game.agency.science.lock': 'Bloqueio de sinal {value}%', 'game.agency.science.complete': 'Dados científicos enviados · qualidade {score}%', 'game.agency.science.reportScore': 'Desempenho científico {score}%',
        'game.agency.science.feedback.launch': 'A sonda está a caminho. Observa a rota!', 'game.agency.science.feedback.ready': 'Tudo pronto para investigar.', 'game.agency.science.feedback.scan': 'Segue a linha branca até à faixa brilhante.', 'game.agency.science.feedback.find-pulse': 'Quase! Espera que a linha branca entre na faixa brilhante.', 'game.agency.science.feedback.pulse-captured': 'Pulso encontrado! Procura o próximo.', 'game.agency.science.feedback.follow-object': 'Move a mira com o rato ou arrasta o dedo até ao asteroide.', 'game.agency.science.feedback.hold-focus': 'Mantém a mira sobre o asteroide até o círculo ficar verde.', 'game.agency.science.feedback.focus-ready': 'Focado! Clica ou toca no asteroide, ou usa “Tirar fotografia”. Espaço também funciona.', 'game.agency.science.feedback.photo-captured': 'Boa fotografia! O asteroide mudou de posição.', 'game.agency.science.feedback.find-signal': 'Arrasta a barra para a esquerda ou direita à procura do sinal forte.', 'game.agency.science.feedback.signal-strong': 'Sinal encontrado! Mantém a barra quieta.', 'game.agency.science.feedback.hold-signal': 'Ligação forte! Mantém a barra quieta.', 'game.agency.science.feedback.complete': 'Investigação terminada. Preparar descoberta!',
        'game.agency.discovery.kicker': 'Descoberta confirmada!', 'game.agency.discovery.quality': 'Qualidade da missão', 'game.agency.discovery.reward': 'Novo selo pronto para o álbum', 'game.agency.discovery.replay': 'Tentar novamente', 'game.agency.discovery.archive': 'Guardar descoberta', 'game.agency.discovery.another': 'Escolher outra aventura',
        'game.agency.discovery.solar-weather.title': 'Descobriste um pulso solar!', 'game.agency.discovery.solar-weather.copy': 'O Sol libertou energia e a tua sonda reconheceu a assinatura magnética do pulso.', 'game.agency.discovery.near-earth-object.title': 'Fotografaste um asteroide!', 'game.agency.discovery.near-earth-object.copy': 'Ao seguires o seu movimento, ajudaste a medir por onde este pequeno mundo vai passar.', 'game.agency.discovery.planetary-map.title': 'Ligaste a Terra a Marte!', 'game.agency.discovery.planetary-map.copy': 'A tua antena encontrou um sinal que demora vários minutos a atravessar o espaço.',
        'game.agency.fact.flareClass': 'Classe', 'game.agency.fact.peakTime': 'Pico', 'game.agency.fact.sourceLocation': 'Origem', 'game.agency.fact.objectName': 'Objeto', 'game.agency.fact.approachDate': 'Aproximação', 'game.agency.fact.missDistanceKm': 'Distância km', 'game.agency.fact.distanceKm': 'Distância km', 'game.agency.fact.ephemerisDate': 'Efeméride',
        'game.zoom.label': 'Ferramentas de voo', 'game.zoom.out': 'Afastar câmara', 'game.zoom.in': 'Aproximar câmara', 'game.cockpit': 'Cockpit', 'game.orbits': 'Órbitas',
        'game.audio.sound': 'Som', 'game.audio.mute': 'Desligar som', 'game.audio.enable': 'Ligar som',
        'game.cockpit.speed': 'Velocidade', 'game.cockpit.radar': 'Radar de missão', 'game.cockpit.attitude': 'Atitude', 'game.flight.boost': 'Boost',
        'game.flight.move': 'Mover', 'game.flight.up': 'Subir', 'game.flight.down': 'Descer', 'game.flight.brake': 'Travão', 'game.flight.rollLeft': 'Rodar para a esquerda', 'game.flight.rollRight': 'Rodar para a direita', 'game.flight.boostToggle': 'Alternar impulso',
        'game.explore.kicker': 'Ao alcance', 'game.explore': 'Explorar {name}', 'game.controls': 'W/S frente · A/D lateral · rato olha · roda zoom · V cockpit · Shift boost · R/F roda', 'game.touchControls': 'Mover à esquerda · arrasta o cenário para olhar',
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
        'game.distance.diorama': '{value} u no diorama', 'game.distance.solar': '{value} UA ao Sol',
        'game.contract.iss.title': 'Correio para a ISS', 'game.contract.iss.accept': 'Aceitar encomenda', 'game.contract.iss.start': 'Entrar em órbita baixa',
        'game.contract.kicker': 'Agência de Correio Interplanetário', 'game.contract.iss.summary': 'Entrega uma cápsula de experiências científicas à Estação Espacial Internacional.',
        'game.contract.cargo': 'Carga', 'game.contract.destination': 'Destino', 'game.contract.reward': 'Recompensa', 'game.contract.iss.cargo': 'Cápsula de experiências', 'game.contract.iss.destination': 'Órbita baixa da Terra',
        'game.contract.locked': 'Por descobrir', 'game.contract.available': 'Nova encomenda', 'game.contract.accepted': 'Em trânsito', 'game.contract.completed': 'Entregue', 'game.contract.travel': 'Voa até à Terra', 'game.contract.complete': 'Encomenda concluída', 'game.contract.iss.unlock': 'Descobre a Terra',
        'game.docking.kicker': 'Encomenda orbital · ISS', 'game.docking.scale': 'Vista orbital ampliada — tamanhos e distâncias adaptados para o desafio.',
        'game.docking.playfield': 'Aproximação à Estação Espacial Internacional', 'game.docking.telemetry': 'Telemetria de acoplagem', 'game.docking.controls': 'Propulsores da nave',
        'game.docking.loading': 'A abrir a folha orbital…', 'game.docking.loadError': 'Não foi possível montar esta órbita.', 'game.docking.retry': 'Tentar novamente',
        'game.docking.guidance': 'Entra devagar no corredor amarelo e alinha o nariz da nave com a porta da ISS.', 'game.docking.keys': 'Teclado: WASD ou setas · Q/E roda · Espaço estabiliza', 'game.docking.stabilize': 'Estabilizar',
        'game.docking.assisted': 'A Lumi afastou a nave em segurança. Reduz a velocidade, estabiliza e tenta novamente.',
        'game.docking.distance': 'Distância', 'game.docking.speed': 'Velocidade relativa', 'game.docking.alignment': 'Alinhamento',
        'game.docking.forward': 'Avançar', 'game.docking.reverse': 'Recuar', 'game.docking.up': 'Subir', 'game.docking.down': 'Descer',
        'game.docking.rotateLeft': 'Rodar para a esquerda', 'game.docking.rotateRight': 'Rodar para a direita', 'game.docking.leave': 'Regressar ao diorama',
        'game.docking.success': 'Encomenda entregue!', 'game.docking.science': 'A ISS recebe regularmente experiências, alimentos e equipamento através de naves de carga.', 'game.docking.return': 'Regressar à expedição'
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
        'game.home': '← Home', 'game.library': 'Library', 'game.loading': 'Assembling the diorama…', 'game.stage': 'Interactive paper Solar System diorama', 'game.accessibleControls': 'On a touch screen, use the lower-left joystick to move, drag the scene with one finger to look, and pinch with two fingers to zoom. With a keyboard, use W, A, S, D or the arrow keys to move, and Space or Control to climb or descend.', 'game.objective.kicker': 'Pocket mission', 'game.notebook': 'Notebook',
        'game.missionCenter.open': 'Missions', 'game.missionCenter.kicker': 'Orbital dispatch', 'game.missionCenter.title': 'Mission Control', 'game.missionCenter.copy': 'Choose a route, prepare the cargo and earn new explorer stamps.',
        'game.agency.open': 'Agency', 'game.agency.kicker': 'Orbital base · desk 01', 'game.agency.title': 'Paper Space Agency', 'game.agency.copy': 'Plan probes, follow the real Solar System and turn signals into discoveries.',
        'game.agency.journey': 'Adventure steps', 'game.agency.route.mission': 'Mission', 'game.agency.route.equip': 'Equip', 'game.agency.route.travel': 'Travel', 'game.agency.route.investigate': 'Investigate', 'game.agency.route.discovery': 'Discovery',
        'game.agency.adventure.open': 'Start adventure', 'game.agency.back': '← Adventures', 'game.agency.briefing.kicker': 'Your challenge', 'game.agency.briefing.live': 'Observatory message', 'game.agency.briefing.today': 'What we know today', 'game.agency.briefing.start': 'Build my probe', 'game.agency.briefing.tutorial': 'First trip: we will learn together. You can experiment without losing points.', 'game.agency.briefing.replay': 'Attempt {attempt}: now you can improve your best discovery.',
        'game.agency.album.open': 'Album', 'game.agency.album.kicker': 'Discovery album', 'game.agency.album.title': 'Everything you have found', 'game.agency.album.attempt': '{count} attempt', 'game.agency.album.attempts': '{count} attempts', 'game.agency.album.best': 'Best discovery', 'game.agency.album.saveReward': 'Save reward', 'game.agency.progress': '{done}/{total} adventures discovered', 'game.agency.mastery.new': 'New adventure', 'game.agency.mastery.discovered': 'Discovered', 'game.agency.mastery.investigator': 'Investigator', 'game.agency.mastery.specialist': 'Specialist', 'game.agency.source.more': 'For curious explorers: {source}',
        'game.agency.close': 'Close Agency', 'game.agency.navigation': 'Agency areas', 'game.agency.dispatch': 'Dispatch', 'game.agency.live': 'Living System', 'game.agency.probes': 'Probes', 'game.agency.reports': 'Reports',
        'game.agency.dispatchKicker': 'Today’s operations', 'game.agency.dispatchTitle': 'Choose a question to investigate', 'game.agency.campaign': 'Orbital contracts',
        'game.agency.liveKicker': 'Observatory connected', 'game.agency.liveTitle': 'What is happening now', 'game.agency.probesKicker': 'Perforated trajectories', 'game.agency.probesTitle': 'Probes on mission', 'game.agency.reportsKicker': 'Science archive', 'game.agency.reportsTitle': 'Discoveries sent home',
        'game.agency.prepare': 'Prepare probe', 'game.agency.launch': 'Launch probe', 'game.agency.cancel': 'Cancel', 'game.agency.collect': 'Collect report', 'game.agency.collected': 'Report archived', 'game.agency.launched': 'Probe launched. The mission continues even if you close the site.',
        'game.agency.instrument': 'Science instrument', 'game.agency.power': 'Power profile', 'game.agency.route': 'Trajectory', 'game.agency.capacity': '{used}/{total} probes', 'game.agency.emptyProbes': 'No probes are travelling. Choose an operation in Dispatch.', 'game.agency.emptyReports': 'Reports from completed probes will appear here.',
        'game.agency.source.live': 'Live data', 'game.agency.source.cached': 'Recent cache', 'game.agency.source.fallback': 'Included data',
        'game.agency.instrument.camera': 'Camera', 'game.agency.instrument.magnetometer': 'Magnetometer', 'game.agency.instrument.radio': 'Radio antenna',
        'game.agency.choice.recommended': 'Recommended', 'game.agency.instrument.camera.purpose': 'Takes sharp photographs.', 'game.agency.instrument.camera.consequence': 'Best for seeing shapes and surfaces.', 'game.agency.instrument.magnetometer.purpose': 'Feels invisible magnetic forces.', 'game.agency.instrument.magnetometer.consequence': 'Best for investigating the Sun.', 'game.agency.instrument.radio.purpose': 'Listens to very distant signals.', 'game.agency.instrument.radio.consequence': 'Best for communicating with Mars.',
        'game.agency.power.survey': 'Survey', 'game.agency.power.balanced': 'Balanced', 'game.agency.power.focused': 'Focused', 'game.agency.route.fast': 'Fast route', 'game.agency.route.stable': 'Stable route',
        'game.agency.power.survey.purpose': 'Observes a wider area.', 'game.agency.power.survey.consequence': 'Finds more clues with less detail.', 'game.agency.power.balanced.purpose': 'Shares power between every system.', 'game.agency.power.balanced.consequence': 'A safe choice for any adventure.', 'game.agency.power.focused.purpose': 'Sends more power to the instrument.', 'game.agency.power.focused.consequence': 'Stronger and more precise readings.', 'game.agency.route.fast.purpose': 'Reaches the destination sooner.', 'game.agency.route.fast.consequence': 'The probe shakes more during travel.', 'game.agency.route.stable.purpose': 'Travels slowly with little movement.', 'game.agency.route.stable.consequence': 'Makes a clean reading easier.',
        'game.agency.science.open': 'Open console', 'game.agency.science.close': 'Close science console', 'game.agency.science.canvasLabel': 'Interactive probe science view', 'game.agency.science.kicker': 'Direct link · probe', 'game.agency.science.title': 'Science console', 'game.agency.science.capture': 'Capture reading', 'game.agency.science.capture.solar': 'Capture pulse', 'game.agency.science.capture.neo': 'Take photograph',
        'game.agency.science.launching': 'Launch in progress…', 'game.agency.science.solar.instructions': 'Capture three readings when the scan line crosses the bright signature. Space also captures.', 'game.agency.science.neo.instructions': 'Move the reticle with the mouse or drag your finger across the screen. When the circle turns green, tap or click the asteroid, or use “Take photograph”. On a keyboard, press Space.', 'game.agency.science.mars.instructions': 'Drag the slider left or right until the signal is strong. Then keep the slider still for two seconds.',
        'game.agency.science.samples': '{count}/3 readings · quality {score}%', 'game.agency.science.tuning': 'Drag to tune the frequency', 'game.agency.science.lock': 'Signal lock {value}%', 'game.agency.science.complete': 'Science data sent · quality {score}%', 'game.agency.science.reportScore': 'Science performance {score}%',
        'game.agency.science.feedback.launch': 'The probe is on its way. Watch the route!', 'game.agency.science.feedback.ready': 'Everything is ready to investigate.', 'game.agency.science.feedback.scan': 'Follow the white line towards the bright band.', 'game.agency.science.feedback.find-pulse': 'Almost! Wait for the white line to enter the bright band.', 'game.agency.science.feedback.pulse-captured': 'Pulse found! Look for the next one.', 'game.agency.science.feedback.follow-object': 'Move the reticle with the mouse or drag your finger to the asteroid.', 'game.agency.science.feedback.hold-focus': 'Keep the reticle on the asteroid until the circle turns green.', 'game.agency.science.feedback.focus-ready': 'Focused! Click or tap the asteroid, or use “Take photograph”. Space also works.', 'game.agency.science.feedback.photo-captured': 'Good photograph! The asteroid changed position.', 'game.agency.science.feedback.find-signal': 'Drag the slider left or right to look for a strong signal.', 'game.agency.science.feedback.signal-strong': 'Signal found! Keep the slider still.', 'game.agency.science.feedback.hold-signal': 'Strong link! Keep the slider still.', 'game.agency.science.feedback.complete': 'Investigation complete. Preparing discovery!',
        'game.agency.discovery.kicker': 'Discovery confirmed!', 'game.agency.discovery.quality': 'Mission quality', 'game.agency.discovery.reward': 'New stamp ready for your album', 'game.agency.discovery.replay': 'Try again', 'game.agency.discovery.archive': 'Save discovery', 'game.agency.discovery.another': 'Choose another adventure',
        'game.agency.discovery.solar-weather.title': 'You discovered a solar pulse!', 'game.agency.discovery.solar-weather.copy': 'The Sun released energy and your probe recognised the pulse’s magnetic signature.', 'game.agency.discovery.near-earth-object.title': 'You photographed an asteroid!', 'game.agency.discovery.near-earth-object.copy': 'By following its motion, you helped measure where this little world will pass.', 'game.agency.discovery.planetary-map.title': 'You linked Earth to Mars!', 'game.agency.discovery.planetary-map.copy': 'Your antenna found a signal that takes several minutes to cross space.',
        'game.agency.fact.flareClass': 'Class', 'game.agency.fact.peakTime': 'Peak', 'game.agency.fact.sourceLocation': 'Origin', 'game.agency.fact.objectName': 'Object', 'game.agency.fact.approachDate': 'Approach', 'game.agency.fact.missDistanceKm': 'Distance km', 'game.agency.fact.distanceKm': 'Distance km', 'game.agency.fact.ephemerisDate': 'Ephemeris',
        'game.zoom.label': 'Flight tools', 'game.zoom.out': 'Move camera away', 'game.zoom.in': 'Move camera closer', 'game.cockpit': 'Cockpit', 'game.orbits': 'Orbits',
        'game.audio.sound': 'Sound', 'game.audio.mute': 'Mute sound', 'game.audio.enable': 'Enable sound',
        'game.cockpit.speed': 'Speed', 'game.cockpit.radar': 'Mission radar', 'game.cockpit.attitude': 'Attitude', 'game.flight.boost': 'Boost',
        'game.flight.move': 'Move', 'game.flight.up': 'Climb', 'game.flight.down': 'Descend', 'game.flight.brake': 'Brake', 'game.flight.rollLeft': 'Roll left', 'game.flight.rollRight': 'Roll right', 'game.flight.boostToggle': 'Toggle boost',
        'game.explore.kicker': 'Within reach', 'game.explore': 'Explore {name}', 'game.controls': 'W/S forward · A/D strafe · mouse look · wheel zoom · V cockpit · Shift boost · R/F roll', 'game.touchControls': 'Move on the left · drag the scene to look',
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
        'game.distance.diorama': '{value} u in the diorama', 'game.distance.solar': '{value} AU from the Sun',
        'game.contract.iss.title': 'Mail for the ISS', 'game.contract.iss.accept': 'Accept delivery', 'game.contract.iss.start': 'Enter low Earth orbit',
        'game.contract.kicker': 'Interplanetary Mail Agency', 'game.contract.iss.summary': 'Deliver a capsule of science experiments to the International Space Station.',
        'game.contract.cargo': 'Cargo', 'game.contract.destination': 'Destination', 'game.contract.reward': 'Reward', 'game.contract.iss.cargo': 'Experiment capsule', 'game.contract.iss.destination': 'Low Earth orbit',
        'game.contract.locked': 'Undiscovered', 'game.contract.available': 'New delivery', 'game.contract.accepted': 'In transit', 'game.contract.completed': 'Delivered', 'game.contract.travel': 'Fly to Earth', 'game.contract.complete': 'Delivery complete', 'game.contract.iss.unlock': 'Discover Earth',
        'game.docking.kicker': 'Orbital delivery · ISS', 'game.docking.scale': 'Magnified orbital view — sizes and distances are adapted for the challenge.',
        'game.docking.playfield': 'Approach to the International Space Station', 'game.docking.telemetry': 'Docking telemetry', 'game.docking.controls': 'Ship thrusters',
        'game.docking.loading': 'Opening the orbital sheet…', 'game.docking.loadError': 'This orbit could not be assembled.', 'game.docking.retry': 'Try again',
        'game.docking.guidance': 'Enter the yellow corridor slowly and align the ship nose with the ISS docking port.', 'game.docking.keys': 'Keyboard: WASD or arrows · Q/E rotate · Space stabilizes', 'game.docking.stabilize': 'Stabilize',
        'game.docking.assisted': 'Lumi moved the ship safely away. Reduce speed, stabilize and try again.',
        'game.docking.distance': 'Distance', 'game.docking.speed': 'Relative speed', 'game.docking.alignment': 'Alignment',
        'game.docking.forward': 'Forward', 'game.docking.reverse': 'Reverse', 'game.docking.up': 'Up', 'game.docking.down': 'Down',
        'game.docking.rotateLeft': 'Rotate left', 'game.docking.rotateRight': 'Rotate right', 'game.docking.leave': 'Return to diorama',
        'game.docking.success': 'Delivery complete!', 'game.docking.science': 'The ISS regularly receives experiments, food and equipment aboard cargo spacecraft.', 'game.docking.return': 'Return to the expedition'
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
