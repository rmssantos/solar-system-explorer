# Paper Solar Explorer — Self-improvement handoff

Este documento é o ponto de partida para novas sessões. O histórico cronológico e as evidências visuais continuam em `progress.md`.

## Visão do produto

Uma exploração relaxante do Sistema Solar em terceira pessoa, com voo livre 360°, apresentada como um diorama digital artesanal. A qualidade visual vem de composição, cor, iluminação suave, volumes low-poly e materiais de papel — não de fotorealismo ou complexidade geométrica. O jogo combina descoberta, fotografias científicas reais, missões, quizzes, XP, níveis, prémios e uma Biblioteca PT/EN persistente.

Princípios inegociáveis:

- o jogador controla yaw, pitch e roll e o movimento segue sempre a orientação real da câmara;
- o espaço é legível, calmo e bonito, com distâncias comprimidas explicitamente identificadas como diorama;
- posições e fontes científicas nunca são apresentadas como “tempo real” quando são efemérides, cache ou fallback;
- arte de jogo é paper/low-poly; fotografias reais aparecem no contexto educativo e têm fonte própria;
- cada lua, veículo humano e pequeno corpo usa a fotografia do próprio objeto, nunca a Terra ou o planeta-pai como fallback;
- interações funcionam com rato, teclado e touch, em desktop e mobile;
- PT e EN partilham progresso e podem ser trocados sem reload;
- nenhuma rota pública expõe `.html`.

## Ambiente autoritativo

- Repositório base: `C:\Users\ruben\Desktop\sistemasolar`
- Worktree de desenvolvimento: `C:\Users\ruben\.config\superpowers\worktrees\sistemasolar\paper-diorama-preview`
- Branch: `codex/paper-diorama-preview`
- Servidor habitual: `npm run dev:paper -- --port 5176`
- Homepage: `http://127.0.0.1:5176/`
- Jogo: `http://127.0.0.1:5176/jogo/`
- Biblioteca: `http://127.0.0.1:5176/biblioteca/`

Não trabalhar no checkout Desktop por engano. Confirmar sempre `git branch --show-current` e `git status --short` antes de editar. Preservar alterações existentes do utilizador.

## Fontes de verdade no código

- Runtime e integração: `paper-preview/src/main.js`
- Cena Three.js: `paper-preview/src/scene/createPaperScene.js`
- Planetas low-poly/paper: `paper-preview/src/scene/createLowPolyPlanet.js`
- Nave: `paper-preview/src/scene/createPaperShip.js`
- Física manual: `paper-preview/src/flightSimulation.js`
- Piloto por clique: `paper-preview/src/navigation/autopilot.js`
- Catálogo de mundos: `paper-preview/src/world/worldCatalog.js`
- Órbitas heliocêntricas: `paper-preview/src/world/orbitalSystem.js`
- Catálogo educativo: `paper-preview/src/learning/learningCatalog.js`
- Fotografias secundárias e atribuições: `paper-preview/src/learning/objectPhotoCatalog.js`
- Serviço NASA/JPL/CelesTrak: `paper-preview/src/data/spaceDataService.js`
- Missões: `paper-preview/src/missions/missionSystem.js`
- XP, níveis e prémios: `paper-preview/src/progression/`
- Biblioteca: `paper-preview/src/library.js` e `paper-preview/src/library/libraryCatalog.js`
- i18n: `paper-preview/src/i18n/paperI18n.js` e `paperObjectTranslations.js`
- UI do jogo: `paper-preview/src/ui.js`
- Persistência: `paper-preview/src/missions/progressStore.js`

## Estado funcional atual

- Homepage editorial, jogo e Biblioteca usam rotas limpas.
- Sistema Solar heliocêntrico completo: Sol, 8 planetas, 14 luas, objetos humanos e pequenos corpos.
- Voo manual 360°, zoom contínuo e cockpit funcional.
- Piloto de papel: hover identifica objetos; clique curto inicia voo em arco com rasto; drag continua a controlar a câmara; input manual cancela; chegada para a uma distância explorável.
- Soundscape opcional e persistente: ambiente espacial, motor reativo a velocidade/boost e sinais semânticos para caderno, piloto, quiz, Lumi e recompensas. Autoplay só desbloqueia após gesto; separadores ocultos ficam silenciosos.
- Os nove mundos primários têm texturas geradas em papel aplicadas aos volumes low-poly; conservam facetas, contorno, iluminação e detalhes de silhueta. A Terra usa ainda papel creme fibroso nas nuvens elevadas.
- Fotos reais dedicadas para todos os 28 objetos secundários, com atribuições NASA/JPL/Wikimedia e assets locais otimizados.
- Caderno educativo, quizzes, dados dinâmicos resilientes, seis missões, surpresas, XP, seis níveis e sete prémios.
- Biblioteca bilingue com 37 entradas, pesquisa, filtros, detalhe científico, quizzes e prateleira de prémios.
- Caderno, Passaporte e detalhe da Biblioteca fecham por botão, `Esc` ou clique no backdrop.

## Pipeline de assets

- Arte editorial: `paper-preview/public/art/`
- Prémios únicos: `paper-preview/public/art/awards/`
- Texturas experimentais: `paper-preview/public/art/textures/`
- Fotografias principais: `paper-preview/public/learning/`
- Fotografias de objetos secundários: `paper-preview/public/learning/objects/`
- Áudio do jogo: `paper-preview/public/audio/`
- Script reprodutível das fotografias: `node scripts/fetch-object-photos.mjs`
- Pipeline ElevenLabs: `node scripts/generate-paper-audio.mjs` (requer `.env` ignorado; `--force` substitui assets)
- Fallback local reprodutível: `node scripts/generate-paper-audio-fallback.mjs`

As texturas foram geradas a partir do estilo de `paper-expedition-hero.webp`. A primeira aprovação está em `output/playwright/texture-pilot/comparison.jpg`; os nove mundos estão auditados em `output/playwright/all-paper-worlds-fixed/comparison.jpg`. Crateras geométricas salientes são usadas apenas como fallback sem textura.

## Workflow obrigatório por sessão

1. Ler este ficheiro, `progress.md` e o plano mais recente em `docs/plans/`.
2. Confirmar worktree/branch e alterações pendentes.
3. Escolher uma melhoria concreta ligada à visão completa.
4. Para bug: reproduzir, escrever regressão falhada, corrigir a causa, executar teste focado.
5. Para feature: fechar comportamento e critérios, escrever testes do modelo antes da integração visual.
6. Executar o cliente oficial do web game após alterações significativas.
7. Inspecionar screenshots e `render_game_to_text`; não aceitar apenas “build verde”.
8. Validar consola, desktop 1280/1440 e mobile 390×844, PT e EN quando a UI muda.
9. Atualizar `progress.md` com decisão, evidência e TODO real.
10. Antes de declarar conclusão: testes completos, lint, build, rotas HTTP e auditoria requisito a requisito.

Comandos base:

```powershell
npm test
npm run lint
npm run build:paper
node C:\Users\ruben\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:5176/jogo/ --actions-json '{"steps":[{"buttons":[],"frames":2}]}' --iterations 1 --pause-ms 250 --screenshot-dir output/playwright/smoke
```

## Critérios de aceitação globais

- zero erros de consola em homepage, jogo e Biblioteca;
- zero overflow horizontal em 390×844;
- `W/A/S/D` seguem a orientação visível depois de yaw/pitch/roll;
- piloto automático apresenta alinhamento frente/velocidade superior a 0,95 e não atravessa o Sol;
- cada objeto secundário resolve para `/learning/objects/<key>.jpg` e fonte HTTPS própria;
- XP não duplica em reload ou repetição de quiz/missão;
- sete prémios usam sete imagens únicas;
- todos os modais fecham por backdrop sem fechar ao clicar no conteúdo;
- URLs finais são `/`, `/jogo/` e `/biblioteca/`;
- todas as superfícies públicas relevantes funcionam em PT e EN;
- evidência visual é aberta e inspecionada, não apenas criada.

## Próximas decisões e melhorias

1. Afinar o piloto automático em viagens longas: duração máxima, desvio de múltiplos volumes e feedback de chegada acessível.
2. Enriquecer medições de luas/objetos secundários; alguns valores ainda são descrições genéricas.
3. Aumentar cobertura de quizzes próprios para além do quiz de identidade gerado.
4. Rever peso do bundle do jogo e introduzir carregamento progressivo de assets/Three.js se necessário.
5. Executar auditoria final de acessibilidade, performance e mobile touch antes de integrar a branch.
6. Fazer uma audição humana completa dos nove clips ElevenLabs em desktop/telemóvel e afinar níveis apenas se algum sinal competir com o ambiente ou ficar pouco audível.

## Prompt para iniciar uma nova sessão

> Continua o self-improvement loop do Paper Solar Explorer no worktree `C:\Users\ruben\.config\superpowers\worktrees\sistemasolar\paper-diorama-preview`. Lê primeiro `SELF-IMPROVEMENT.md`, `progress.md` e os planos mais recentes. Inspeciona o estado real e alterações pendentes; não assumes que o resumo está atualizado. Mantém a visão paper/low-poly, voo 360°, aprendizagem com fotos reais, PT/EN, missões, progressão e Biblioteca. Trabalha com TDD, usa o cliente oficial do web game, inspeciona screenshots e atualiza `progress.md`. Não declares conclusão sem auditoria requisito a requisito.
