# Handoff — Sistema Solar Paper

Atualizado em 16 de julho de 2026. Este documento é o ponto de partida recomendado para continuar o desenvolvimento noutra sessão.

## Estado atual

- A aplicação principal é a versão Paper em `paper-preview/`.
- `npm run dev` e `npm run dev:paper` arrancam esta versão.
- A experiência antiga está preservada em `arquivo/jogo-antigo/` e pode ser aberta com `npm run dev:archive`.
- O jogo principal está em `/jogo/`; o Centro de Missões abre pelo botão amarelo **Missões** no topo.
- O progresso é local ao dispositivo, em `paperSolarExplorer:progress:v1` no `localStorage`.
- A interface e as missões têm texto em português e inglês.

## Campanha orbital implementada

A campanha tem quatro contratos sequenciais e três mecânicas de jogo:

1. **Correio para a ISS** — aproximação e acoplagem.
2. **Manutenção do Hubble** — acoplagem com deriva orbital adicional.
3. **Varredura lunar** — recolha de quatro transmissores, desvio de detritos e escudo assistido.
4. **Relé de Marte** — calibração de ângulo e frequência, seguida de bloqueio do sinal.

Os desbloqueios dependem das descobertas do destino e da conclusão do contrato anterior. O Centro de Missões apresenta a rota completa, o estado de cada contrato, progresso `n/4`, ações contextuais e quatro postais WebP no estilo paper.

## Arquitetura relevante

| Área | Ficheiros principais | Responsabilidade |
| --- | --- | --- |
| Catálogo e progressão | `paper-preview/src/contracts/contractCatalog.js`, `contractState.js` | Contratos, pré-requisitos, estado e proximidade do destino |
| Integração da aplicação | `paper-preview/src/main.js`, `paper-preview/src/ui.js` | Aceitar/iniciar/concluir, persistência e renderização do Centro de Missões |
| Perfis das missões | `paper-preview/src/minigames/orbitalMissionProfiles.js` | Texto, métricas, controlos, evento de conclusão e tipo de gameplay |
| Router e host | `createOrbitalMissionGame.js`, `localOrbitHost.js` | Lazy loading do jogo correto e adaptação do modal, HUD e controlos |
| Acoplagem | `dockingSimulation.js`, `createDockingGame.js` | Física determinística e Canvas da ISS/Hubble |
| Varredura lunar | `sweepSimulation.js`, `createSweepGame.js` | Recolha, detritos, escudo e Canvas lunar |
| Relé de Marte | `signalSimulation.js`, `createSignalGame.js` | Sintonia, bloqueio de sinal e Canvas marciano |
| UI responsiva | `paper-preview/jogo/index.html`, `paper-preview/styles.css` | Modal fullscreen, D-pad, telemetria, safe areas e cartões |
| Arte | `paper-preview/public/art/missions/` | Quatro postais paper-style otimizados |

As simulações são imutáveis e determinísticas. A renderização Phaser fica separada da lógica, permitindo testes Vitest sem browser. O Phaser e cada adaptador de missão são carregados dinamicamente.

## Alterações mais recentes

- `264dc79` — botão visível do Centro de Missões e rota da campanha.
- `d0834ab` — quatro contratos, desbloqueios, postais e proximidade individual.
- `270984b` — jogo de varredura lunar.
- `4c9884d` — jogo de calibração do relé de Marte.
- `a3a076a` — router, host genérico, telemetria e controlos por perfil.
- `279f531` — correções de proximidade da Lua e robustez em vários viewports.

Também foram incluídos nesta linha de trabalho:

- Application Insights opcional e tolerante a bloqueadores; o vocabulário obrigatório saiu do caminho `/analytics/`.
- Deteção separada de rato e touch, evitando joystick em desktop e em máquinas híbridas quando o rato está ativo.
- Remoção do marcador/cometa que aparecia ao clicar em objetos.
- Scroll do Passaporte sobre cartões de missão em rato e touch.
- Modal de jogo fullscreen em mobile e em paisagens curtas, incluindo janelas sem touch.

## Verificação realizada

Na `main` integrada foram executados com sucesso:

```powershell
npm test
npm run lint
npm run typecheck
npm run build:paper
```

Resultado: **82 ficheiros de teste, 394 testes aprovados**, lint e TypeScript sem erros, build de produção concluído.

O playtest no browser cobriu:

- Centro de Missões em desktop e mobile.
- Scroll com o ponteiro sobre os cartões.
- Lua e Marte em `390 × 844`.
- Marte em paisagem curta `844 × 390`.
- Teclado, controlos DOM, telemetria dinâmica e consola sem erros.

Avisos atuais do build, não bloqueantes:

- Anotações `/*#__PURE__*/` dentro da dependência Application Insights que o Rolldown ignora.
- Chunk do Phaser acima de 750 kB após minificação. O Phaser já está isolado e só é pedido ao abrir um minijogo.

## Decisões e cuidados importantes

- Não voltar a representar ISS/Hubble em distância real dentro do diorama 3D. Os minijogos usam uma folha 2D ampliada separada.
- Preservar o estilo de recortes de papel, sombras físicas, paleta creme/coral/azul-marinho/verde-rádio/amarelo-sinal.
- Não assumir que `pointer: coarse` significa ausência de rato. Há suporte explícito para equipamentos híbridos.
- Em mobile, o tabuleiro deve ocupar o viewport e os controlos devem respeitar `env(safe-area-inset-*)`.
- A Lua é um objeto com `parentKey: earth`; a proximidade de contratos precisa comparar planeta, objeto próximo e objeto-pai.
- Não guardar respostas de quiz, posições ou movimentos em analytics. O consentimento continua opcional.
- Os contratos concluídos são persistidos, mas o estado intermédio da simulação reinicia ao fechar um minijogo.

## Próximos passos sugeridos

### Prioridade alta

1. **Jogar a campanha completa sem atalhos de QA** em Android, iPhone/iPad, Firefox e Chrome, afinando aceleração, deriva, colisões e duração do bloqueio.
2. **Melhorar a viagem para contratos aceites**: o cartão apresenta a intenção “Viajar até…”, mas deve poder iniciar o piloto automático diretamente para o destino.
3. **Rever acessibilidade específica por missão**: substituir rótulos genéricos como “Avançar/Recuar” por “Aumentar/diminuir ângulo” ou frequência no relé de Marte.
4. **Dar feedback mais rico às novas mecânicas**: som de transmissor recolhido, impacto de escudo, janela de sintonia, sinal perdido e celebração final.

### Prioridade média

5. Guardar opcionalmente o progresso parcial do minijogo ao fechar, ou comunicar claramente que a tentativa será reiniciada.
6. Criar selos/recompensas visuais exclusivos por contrato e deixar de mostrar a mesma recompensa `+140 XP` em todos.
7. Adicionar uma introdução curta à primeira missão de cada mecânica e uma página de treino acessível pelo Centro de Missões.
8. Completar testes end-to-end da campanha, incluindo aceitar, viajar, iniciar, concluir, recarregar e mudar de idioma.

### Exploração futura

9. Quinta missão educativa: assistência gravitacional, montagem de rover, recolha de amostras ou triangulação de um sinal.
10. Otimizar o peso inicial e avaliar uma build Phaser mais reduzida se o carregamento do primeiro minijogo for lento em telemóveis modestos.

## Como retomar noutra sessão

```powershell
cd C:\Users\ruben\Desktop\sistemasolar
git status
npm install
npm test
npm run dev
```

Abrir `http://localhost:5173/jogo/` e começar pelo botão **Missões**.

Antes de alterar uma mecânica, adicionar primeiro um teste à respetiva simulação. Para problemas visuais, testar pelo menos desktop, `390 × 844` e `844 × 390`, capturando o Canvas e o HUD DOM em conjunto.
