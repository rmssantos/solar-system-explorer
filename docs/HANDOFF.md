# Handoff: Sistema Solar Paper

Atualizado em 18 de julho de 2026. Este documento é o ponto de partida recomendado para continuar o desenvolvimento noutra sessão.

## Estado atual

- A aplicação principal é a versão Paper em `paper-preview/`; `npm run dev` e `npm run dev:paper` arrancam esta versão.
- A experiência antiga está preservada em `arquivo/jogo-antigo/` e pode ser aberta com `npm run dev:archive`.
- O jogo principal está em `/jogo/`. O botão **Centro de Missões** abre a campanha orbital; a **Agência** continua disponível como experiência complementar e não substitui os minijogos.
- O progresso é local ao dispositivo, em `paperSolarExplorer:progress:v1` no `localStorage`.
- A experiência, tutoriais, treino, recompensas e instruções têm suporte PT/EN.
- Desktop, tablet, telefone em retrato e telefone em paisagem curta usam o mesmo fluxo, com controlos próprios para teclado, rato e touch.

## Agência Espacial de Papel e Sistema Vivo

A Agência acrescenta um ciclo científico persistente à exploração livre:

1. O **Despacho** apresenta três operações diárias: clima solar, aproximação de um objeto próximo da Terra e ligação rádio a Marte.
2. Cada operação explica o objetivo e recomenda instrumento, energia e trajetória numa linguagem adequada a crianças dos 8 aos 10 anos.
3. A sonda continua em viagem mesmo que o site seja fechado; até três operações podem decorrer em paralelo.
4. Quando chega, produz um relatório com qualidade calculada pela configuração escolhida.
5. Recolher o relatório arquiva a descoberta, atribui XP uma única vez e atualiza imediatamente a patente. A operação pode ser repetida para treinar e rever a experiência.

O separador **Sistema Vivo** explica os sinais que originaram cada operação. Os dados vêm de NASA DONKI, NeoWs e JPL Horizons, com cache local e fallbacks completos quando a rede ou um fornecedor falha. O estado exposto a analytics é deliberadamente amplo (`family` e `state`), sem identificadores, timestamps, respostas ou movimentos.

## Campanha orbital implementada

A campanha tem cinco contratos sequenciais e quatro mecânicas:

1. **Correio para a ISS**: aproximação e acoplagem.
2. **Manutenção do Hubble**: fotografia e acoplagem com deriva orbital adicional.
3. **Varredura lunar**: recolha de quatro transmissores, desvio de detritos e escudo assistido.
4. **Relé de Marte**: calibração guiada de ângulo e frequência, seguida de bloqueio do sinal.
5. **Estilingue de Júpiter**: assistência gravitacional: controlar direção e impulso para entrar na janela segura, contornar Júpiter e ganhar velocidade.

O fluxo de cada contrato é agora explícito: **aceitar → viajar em piloto automático → chegar → abrir missão → tutorial/treino → concluir → receber selo e XP próprios**. Os desbloqueios dependem das descobertas do destino e da conclusão do contrato anterior.

As tentativas incompletas são guardadas. Ao reabrir, o jogador pode **Continuar** do ponto guardado ou **Recomeçar**. O treino é repetível e não remove recompensas já conquistadas.

O Centro de Missões apresenta a rota completa, estado `n/5`, ações contextuais e cinco postais WebP paper-style. Cada contrato tem um selo, nome e valor de XP exclusivos.

## Paper Courier 2.0

A nave foi reconstruída para pertencer ao mesmo universo visual dos planetas:

- silhueta inspirada num vaivém de papel, composta por 28 meshes;
- bordas cartoon escuras por peça, painéis facetados e cores limpas sem filtro amarelo/sépia;
- canopy, motores, insígnia e volumes laterais legíveis a várias distâncias;
- exaustão em camadas e resposta visual ao impulso;
- geometria leve, sem introduzir um asset 3D pesado no carregamento inicial.

## Arquitetura relevante

| Área | Ficheiros principais | Responsabilidade |
| --- | --- | --- |
| Catálogo e progressão | `paper-preview/src/contracts/contractCatalog.js`, `contractState.js`, `contractRewards.js` | Cinco contratos, pré-requisitos, estado e recompensas exclusivas |
| Jornada e persistência | `contractJourney.js`, `contractAttemptState.js` | Aceitar, piloto automático, chegada, guardar/continuar/recomeçar tentativa |
| Tutoriais | `missionTrainingState.js`, `orbitalMissionProfiles.js` | Cópia PT/EN, instruções específicas e treino repetível |
| Domínio da Agência | `paper-preview/src/agency/agencyCatalog.js`, `agencyState.js` | Instrumentos, energia, rotas, sondas e relatórios imutáveis |
| Operações vivas | `paper-preview/src/agency/operationDirector.js`, `paper-preview/src/data/spaceDataService.js` | Direção diária, NASA DONKI, NeoWs, Horizons, cache e fallback |
| UI da Agência | `paper-preview/src/agency/agencyUi.js`, `agencyPresentation.js` | Despacho, setup, cronómetros, Sistema Vivo, sondas e arquivo |
| Integração | `paper-preview/src/main.js`, `paper-preview/src/ui.js` | Jornada, persistência, progressão e Centro de Missões |
| Router e host | `missionAdapterLoaders.js`, `createOrbitalMissionGame.js`, `localOrbitHost.js` | Fronteiras dinâmicas, jogo correto, modal, HUD e controlos |
| Acoplagem | `dockingSimulation.js`, `createDockingGame.js` | Física determinística e Canvas da ISS/Hubble |
| Varredura lunar | `sweepSimulation.js`, `createSweepGame.js` | Recolha, detritos, escudo e Canvas lunar |
| Relé de Marte | `signalSimulation.js`, `createSignalGame.js` | Sintonia, bloqueio de sinal e Canvas marciano |
| Estilingue de Júpiter | `slingshotSimulation.js`, `createSlingshotGame.js` | Assistência gravitacional determinística e renderer Phaser responsivo |
| Áudio | `paper-preview/src/audio/missionAudio.js`, `paper-preview/public/audio/` | Eventos semânticos, debounce e sete SFX gerados para as mecânicas |
| Performance | `missionPrefetch.js`, `scripts/verify-paper-build.mjs` | Prefetch idle com opt-out `saveData`, manifest e orçamento inicial |
| UI responsiva | `paper-preview/jogo/index.html`, `paper-preview/styles.css` | Tabuleiro, controlos, safe areas, resultados e cartões |
| Arte | `paper-preview/public/art/missions/` | Cinco postais e selos paper-style otimizados |

As simulações são imutáveis e determinísticas. A renderização Phaser fica separada da lógica, permitindo testes Vitest sem browser. O Phaser e cada adaptador são carregados dinamicamente; a missão selecionada é pre-carregada durante tempo ocioso, exceto quando o dispositivo indica economia de dados.

## Alterações mais recentes

- `d1ca665`: viagem em piloto automático ligada aos contratos.
- `e809e18`: guardar, continuar e recomeçar tentativas orbitais.
- `e9a9185`: tutoriais e treino específicos por missão.
- `f5d4a5e`: recompensas e selos exclusivos por contrato.
- `9f71262`: feedback audiovisual tátil com sete SFX.
- `a06a604`: reconstrução visual Paper Courier 2.0.
- `b36ef42`: quinta missão: estilingue gravitacional de Júpiter.
- `fdddc09`: fronteiras dinâmicas e prefetch da missão selecionada.

## Verificação realizada

Comandos de qualidade:

```powershell
npm test
npm run lint
npm run typecheck
npm run build:paper
npm run verify:paper-build
npm run test:e2e
```

A suíte unitária/integrada cobre 99 ficheiros e 506 testes. O E2E Playwright cobre oito cenários em Chromium e Firefox:

- campanha completa dos cinco contratos: aceitar, viajar, chegar, iniciar, guardar, recarregar, continuar, concluir e validar a recompensa única;
- mudança de idioma PT/EN durante a campanha;
- tablet retrato `820 × 1180`;
- telefone retrato `390 × 844`;
- telefone paisagem `844 × 390`.

O estilingue de Júpiter foi ainda jogado até ao fim com teclado no desktop e touch em mobile. O playtest visual confirmou nave, HUD, tutorial, resultado e texto científico sem sobreposições.

Na build medida, o JavaScript inicial soma **946 551 bytes**. O Phaser fica num chunk dinâmico separado de cerca de **1 198,78 kB** e não entra no carregamento inicial. O verificador falha acima do orçamento inicial de 1,8 MB ou se encontrar Phaser no grafo inicial.

Limitação conhecida de QA: a matriz automatizada cobre os viewports e motores acima, mas ainda é recomendável uma passagem manual em hardware iOS e Android real antes de alterações grandes à física ou aos gestos.

Avisos atuais do build, não bloqueantes:

- anotações `/*#__PURE__*/` dentro da dependência Application Insights que o bundler ignora;
- aviso de chunk grande para Phaser, esperado porque permanece isolado e lazy-loaded.

## Decisões e cuidados importantes

- Não voltar a representar ISS/Hubble em distância real dentro do diorama 3D. Os minijogos usam uma folha 2D ampliada separada.
- Preservar recortes de papel, bordas cartoon, sombras físicas e paleta creme/coral/azul-marinho/verde-rádio/amarelo-sinal; evitar o “piss filter” sépia.
- Manter linguagem direta e visual para 8–10 anos: cada controlo deve dizer o que altera e porquê.
- Não assumir que `pointer: coarse` significa ausência de rato. Há suporte explícito para equipamentos híbridos.
- Em mobile, o tabuleiro deve ocupar o viewport, os controlos devem respeitar `env(safe-area-inset-*)` e a ação principal nunca pode depender apenas de teclado.
- A Lua é um objeto com `parentKey: earth`; a proximidade de contratos precisa comparar planeta, objeto próximo e objeto-pai.
- Não guardar respostas de quiz, posições ou movimentos em analytics. O consentimento continua opcional.
- Não remover os fallbacks da Agência nem bloquear o Despacho à espera da rede.
- Não reconstruir a árvore interativa da Agência a cada frame/segundo.
- Preservar a escolha **Continuar/Recomeçar** nas tentativas guardadas e a possibilidade de repetir treino/missões.
- Manter Phaser fora do bundle inicial e respeitar `navigator.connection.saveData` no prefetch.

## Próximos passos depois desta roadmap

1. Validar a campanha em iPhone/iPad e Android físicos, com atenção a áudio desbloqueado por gesto, safe areas e desempenho do primeiro minijogo.
2. Afinar dificuldade com sessões de crianças dos 8 aos 10 anos: tempo até compreender o objetivo, número de tentativas e pontos de abandono.
3. Considerar um modo de acessibilidade adicional para contraste, velocidade reduzida e instruções narradas, preservando PT/EN.
4. Monitorizar peso e cache do Phaser em produção; só trocar de runtime se medições reais mostrarem benefício material.

## Como retomar noutra sessão

```powershell
cd C:\Users\ruben\Desktop\sistemasolar
git status
npm install
npm test
npm run dev
```

Abrir `http://localhost:5173/jogo/` e começar pelo botão **Centro de Missões**. Antes de alterar uma mecânica, adicionar primeiro um teste à respetiva simulação. Para problemas visuais, testar pelo menos desktop, `390 × 844` e `844 × 390`, capturando o Canvas e o HUD DOM em conjunto.

## Expansão — O Sinal das Luas (julho de 2026)

A tab **Investigação** complementa — não substitui — as cinco missões Courier. A Lumi conduz uma aventura contínua e local-first:

1. Lua: colocar três sismómetros, alinhar ondas e localizar um impacto.
2. Europa: mapear três faixas com radar, equilibrando potência e calor.
3. Encélado: recolher cinco cristais limpos na pluma e evitar blocos grandes.
4. Titã: pilotar a libélula de papel, compensar o vento e comparar dois locais.
5. Finale: abrir as quatro pistas e concluir que “potencialmente habitável” não significa “habitado”.

O progresso, tentativas, evidências, instrumentos e finale são persistidos no dispositivo. Todas as atividades têm PT/EN, teclado e touch, repetição livre, ausência de cronómetro e três ajudas sem penalização: Guia Lumi, Ritmo calmo e Controlos XL. Os instrumentos conquistados aparecem fisicamente na Paper Courier.

Arte nova em `paper-preview/public/art/expedition/`: cinco postais WebP 960×600 com brancos neutros, azul-noite, teal e coral; o amarelo é apenas acento. Não aplicar filtros sépia/amarelos globais (“piss filter”).

Arquitetura principal:

- domínio e finale: `paper-preview/src/expedition/`;
- simulações/renderers: `seismicSimulation.js`, `iceRadarSimulation.js`, `plumeSimulation.js`, `dragonflySimulation.js` e respetivos `create*Game.js`;
- ajudas: `missionAssistance.js` e `localOrbitHost.js`;
- upgrades visuais: `createPaperShip.js` e `createPaperScene.js`;
- integração/persistência: `main.js`, `ui.js` e `missions/progressStore.js`.

O relógio do Observatório do Tempo abre agora em **1×** para todos. `10×` e `100×` continuam disponíveis apenas por escolha explícita.

Verificação desta expansão: **121 ficheiros / 604 testes Vitest**, 34 cenários Playwright aprovados em Chromium e Firefox, lint, TypeScript, build e orçamento de performance aprovados. JavaScript inicial medido: **992 862 bytes**; Phaser permanece num chunk lazy separado.
