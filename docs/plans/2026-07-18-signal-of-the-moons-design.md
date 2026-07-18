# O Sinal das Luas — desenho da expansão

## Visão do produto

**O Sinal das Luas** é uma temporada narrativa local-first para crianças dos 8 aos 10 anos. A Lumi interceta um arquivo científico fragmentado e acompanha a criança numa investigação sobre uma pergunta concreta: **como pode existir um oceano num mundo completamente gelado?** A história liga a exploração 3D, o Centro de Missões, o Caderno e novas missões jogáveis. Não cria uma quarta experiência isolada nem substitui a campanha orbital ou a Agência.

A temporada usa ciência real sobre mundos oceânicos e distingue sempre ficção narrativa de evidência científica. O mistério não promete vida extraterrestre: conduz à conclusão de que “habitável” não significa “habitado”. Europa, Encélado e Titã são destinos cientificamente relevantes; o prólogo lunar ensina a separar sinal de ruído antes da investigação profunda.

## Princípios

- A criança é a protagonista; a Lumi é companheira, nunca resolve o desafio por ela.
- Cada gesto deve dizer visualmente o que altera e porquê.
- A evidência substitui o quiz escolar: observar, medir, comparar e concluir.
- Todo o conteúdo funciona offline. Dados atuais podem enriquecer, nunca bloquear.
- Progresso sem conta, guardado e migrado no dispositivo.
- PT/EN completos para interface, tutoriais, ciência, legendas e áudio falado opcional.
- Desktop, tablet, telefone retrato e paisagem curta têm ações equivalentes.
- Paper-style limpo: bordas cartoon, recortes, sombras físicas e cor; sem filtro sépia.

## Estrutura narrativa

O Mural da Investigação vive no Centro de Missões como uma nova secção do Passaporte. Começa quase vazio e recebe cartões, fios, amostras e cortes interiores a cada descoberta.

1. **Prólogo — Lua:** montar um sismómetro e distinguir a assinatura de um impacto do ruído. Recompensa: Sismómetro de Papel.
2. **Europa — Debaixo do gelo:** realizar passagens de radar e mapear zonas de crosta fina sem sobreaquecer o instrumento. Recompensa: Radar de Gelo.
3. **Encélado — A fonte congelada:** atravessar plumas, recolher partículas e conservar a amostra. Recompensa: Coletor de Plumas.
4. **Titã — Chuva de metano:** pilotar uma pequena libélula por dunas e lagos, escolhendo locais de aterragem seguros. Recompensa: Laboratório Atmosférico.
5. **Final — O mapa invisível:** organizar as quatro evidências num corte comparativo e concluir onde existe água, energia e química interessante. Recompensa: selo Guardião dos Oceanos e configuração visual completa da Paper Courier.

O loop de capítulo é: mensagem da Lumi → preparar instrumento → viajar → observar → jogar → interpretar evidência → atualizar mural e nave. A entrada desbloqueia após a descoberta da Lua e a conclusão de Correio para a ISS, permitindo acesso relativamente cedo sem exigir toda a campanha orbital.

## Arquitetura

O novo domínio `paper-preview/src/expedition/` mantém regras independentes da UI e do Phaser:

- `expeditionCatalog.js`: capítulos, destinos, missões, pré-requisitos, evidências, upgrades e cópia PT/EN.
- `expeditionState.js`: estado imutável, sanitização, aceitação, conclusão e idempotência.
- `expeditionJourney.js`: viagem, chegada e ação contextual, paralela a `contractJourney.js` sem alterar contratos.
- `expeditionPresentation.js`: view model localizado para mural e final.

`main.js` integra o estado com o progresso atual, piloto automático, áudio, host de minijogos e UI. O save mantém a chave existente, acrescentando campos versionados e tolerantes a dados antigos. O reconciliador de XP recebe eventos `expedition-chapter`, cada um atribuído uma única vez.

As novas atividades usam o host existente e adapters lazy-loaded. Perfis de missão continuam a possuir métricas, controlos, tutorial, resultado e ciência. Cada simulação é imutável e determinística; Phaser apenas desenha e converte input em ações. Checkpoints usam a infraestrutura de tentativas existente com uma chave de atividade estável.

## Direção visual

O mural é azul-noite, com papel creme, fios coral e etiquetas amarelo-sinal. Cada destino tem paleta própria:

- Lua: cinzentos neutros, sombras longas e ondas coral.
- Europa: gelo branco/azul, fissuras coral e radar turquesa.
- Encélado: branco frio, Saturno dourado limpo e plumas azul-claro.
- Titã: atmosfera laranja limpa, metano violeta, lagos azul-marinho.

Cada capítulo recebe postal WebP, selo, ilustração de evidência e textura leve. As imagens abrem no visualizador existente. Upgrades são pequenos módulos paper-style ligados à nave por nomes estáveis, visíveis sem alterar colisão ou física.

## Acessibilidade e dificuldade

O jogador pode ativar mais tempo, trajetória guiada ou movimento lento sem perder recompensas. `prefers-reduced-motion` reduz parallax, tremor, flashes e partículas. Todos os controlos têm alvos mínimos de 44 px, foco visível e nomes específicos da ação científica. Nenhuma conclusão depende apenas de cor, som ou teclado. Narração é opcional e distribuída como assets PT/EN; o texto permanece completo.

## Falhas, offline e performance

Falha de rede usa arquivo editorial. Falha de adapter apresenta ilustração da missão, retry e regresso seguro ao mural. Save corrompido é sanitizado sem apagar contratos ou relatórios válidos. Fechar uma tentativa oferece continuar, guardar ou recomeçar. Recompensas são idempotentes.

Cada capítulo, renderer, textura e áudio fica num chunk separado. `saveData` desativa prefetch. Canvas limita pixel ratio e partículas conforme viewport/reduced motion. Destruir a cena liberta texturas, áudio, timers e listeners. O bundle inicial não pode incluir Phaser nem assets dos capítulos.

## Verificação e sucesso

- Testes unitários das quatro simulações, catálogo, estado, jornada, migração e apresentação.
- Testes de integração do router, host, progressão, PT/EN, upgrades e carregamento dinâmico.
- E2E do arco completo em Chromium e Firefox nos viewports desktop, 820×1180, 390×844 e 844×390.
- Testes offline, `saveData`, reduced motion, teclado, rato e touch.
- Playtest manual em Android e iPhone/iPad reais.

Uma missão só é considerada bem-sucedida quando a criança consegue: identificar o objetivo sem ajuda adulta, recuperar de um erro e explicar a descoberta no final.

## Referências científicas

- NASA Ocean Worlds: https://science.nasa.gov/solar-system/ocean-worlds/
- Europa Clipper: https://science.nasa.gov/mission/europa-clipper/
- Cassini em Encélado: https://science.nasa.gov/mission/cassini/science/enceladus/
- Dragonfly: https://science.nasa.gov/mission/dragonfly/
- NASA Citizen Science: https://science.nasa.gov/citizen-science/
