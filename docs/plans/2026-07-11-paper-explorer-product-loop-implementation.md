# Paper Explorer Product Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expor progressão e prémios, criar uma Biblioteca educativa bilingue, substituir a arte fraca de Saturno e publicar todas as superfícies com URLs limpas.

**Architecture:** Três entradas Vite por diretório (`/`, `/jogo/`, `/biblioteca/`) partilham i18n, catálogo e progresso via módulos ES e localStorage. A lógica de progressão continua pura e idempotente; um novo presenter calcula deltas para feedback. A Biblioteca deriva todas as fichas dos catálogos existentes e mantém conteúdo local como fallback.

**Tech Stack:** Vite 8, JavaScript ES modules, Three.js, Vitest, Playwright, HTML/CSS, Sharp para otimização de assets.

---

### Task 1: Arte editorial de Saturno

**Files:**
- Create: `paper-preview/public/art/field-notebook-saturn.webp`
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/landing.css`
- Test: `tests/paperLandingAssets.test.js`

1. Escrever teste que exige a imagem otimizada e rejeita `.planet-photo`.
2. Executar `npx vitest run tests/paperLandingAssets.test.js` e confirmar falha.
3. Integrar `<img>` com dimensões/alt e adaptar a moldura responsiva.
4. Reexecutar o teste e inspecionar homepage desktop/mobile.
5. Commit: `feat: add Saturn field notebook artwork`.

### Task 2: Rotas públicas limpas

**Files:**
- Move: `paper-preview/jogo.html` → `paper-preview/jogo/index.html`
- Create: `paper-preview/biblioteca/index.html`
- Modify: `paper-preview/vite.config.js`
- Modify: links em `paper-preview/index.html`, `paper-preview/jogo/index.html`
- Modify: testes que leem `jogo.html`
- Test: `tests/paperCleanRoutes.test.js`

1. Criar teste que percorre HTML público e falha perante `href` com `.html`.
2. Confirmar RED.
3. Criar entradas por diretório e atualizar inputs Vite/links.
4. Atualizar fixtures de testes para o novo caminho.
5. Confirmar `/`, `/jogo/`, `/biblioteca/` com HTTP 200 e URLs sem extensão.
6. Commit: `refactor: publish paper experience on clean routes`.

### Task 3: Modelo de apresentação da progressão

**Files:**
- Create: `paper-preview/src/progression/progressPresentation.js`
- Modify: `paper-preview/src/progression/expeditionProgress.js`
- Test: `tests/paperProgressPresentation.test.js`

1. Testar snapshot de patente, XP até ao próximo nível, delta de XP, subida de nível e novos prémios.
2. Confirmar RED por módulo ausente.
3. Implementar funções puras `presentProgress` e `compareProgress`.
4. Cobrir nível máximo e eventos repetidos.
5. Commit: `feat: add progression presentation model`.

### Task 4: HUD de patente e feedback de recompensas

**Files:**
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperProgressUi.test.js`

1. Testar presença do chip, progressbar, toast e região live.
2. Confirmar RED.
3. Renderizar patente/XP no HUD e abrir Passaporte a partir do chip.
4. Comparar progresso antes/depois de cada evento e mostrar recibo/conquista.
5. Validar descoberta, quiz, missão e repetição idempotente via browser.
6. Commit: `feat: make expedition progress visible in flight`.

### Task 5: Catálogo da Biblioteca

**Files:**
- Create: `paper-preview/src/library/libraryCatalog.js`
- Test: `tests/paperLibraryCatalog.test.js`

1. Testar transformação de todos os objetos em fichas bilingues e categorias.
2. Testar pesquisa sem acentos e filtros por tipo/descoberta.
3. Confirmar RED.
4. Implementar catálogo/filtros sem DOM e sem duplicar dados.
5. Commit: `feat: add bilingual expedition library catalog`.

### Task 6: Interface completa da Biblioteca

**Files:**
- Expand: `paper-preview/biblioteca/index.html`
- Create: `paper-preview/library.css`
- Create: `paper-preview/src/library.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperLibraryUi.test.js`

1. Testar landmarks, pesquisa, filtros, progresso, grelha e dialog.
2. Confirmar RED.
3. Construir shell editorial e renderização dinâmica do catálogo.
4. Ligar pesquisa, filtros, PT/EN, progresso local, detail dialog, fontes e quiz.
5. Validar estados vazio, offline/fallback e mobile.
6. Commit: `feat: build the Paper Explorer library`.

### Task 7: Navegação e continuidade de progresso

**Files:**
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/biblioteca/index.html`
- Modify: `paper-preview/src/landing.js`
- Modify: `paper-preview/src/library.js`
- Test: `tests/paperNavigation.test.js`

1. Testar navegação cruzada sem extensões e idioma persistente.
2. Confirmar RED.
3. Adicionar Biblioteca à navegação e resumo dinâmico de patente na homepage.
4. Validar homepage → Biblioteca → Jogo → Biblioteca com o mesmo estado.
5. Commit: `feat: connect expedition surfaces and progress`.

### Task 8: Auditoria e self-improvement final

**Files:**
- Modify conforme problemas encontrados
- Update: `progress.md`
- Update: `relatorio-self-improvement-2026-07-11.html`

1. Executar cliente oficial do web game e Playwright para as três rotas em desktop/mobile.
2. Inspecionar screenshots, estado textual e consola; corrigir problemas um a um com teste de regressão.
3. Executar `npm test`, `npm run lint`, `npm run build:paper`, `git diff --check`.
4. Auditar requisito a requisito e atualizar relatório/progress log.
5. Commit final apenas após evidência fresca.
