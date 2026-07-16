# Guided Paper Agency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the disconnected Agency dashboard with a replayable, no-fail-first guided science adventure loop for children aged 8–10.

**Architecture:** Keep deterministic simulations and persisted Agency records, but introduce a child-facing journey presentation layer with explicit stages, tutorial/replay modes, and a completion reveal. Consolidate live data, probe status, and reports into mission briefings, the route stepper, and a discovery album. DOM owns guidance and decisions; Canvas owns interactive science scenes.

**Tech Stack:** Vanilla JavaScript modules, deterministic Canvas 2D simulation, semantic HTML dialogs, responsive CSS, Vitest, Playwright browser QA, PT/EN dictionaries.

---

### Task 1: Journey and replay domain

**Files:**
- Create: `paper-preview/src/agency/agencyJourney.js`
- Test: `tests/paperAgencyJourney.test.js`

1. Write failing tests for the five journey stages, first-attempt tutorial detection, replay attempt numbering, best-score aggregation, and the three mastery thresholds.
2. Run `npm test -- --run tests/paperAgencyJourney.test.js` and verify RED because the module does not exist.
3. Implement pure helpers: `createAgencyJourney`, `advanceAgencyJourney`, `getOperationHistory`, and `getAgencyMastery`.
4. Run the focused tests and verify GREEN.

### Task 2: Guided Agency shell

**Files:**
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/agency/agencyUi.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperAgencyUi.test.js`
- Test: `tests/paperAgencyResponsive.test.js`

1. Write failing structural tests for a five-step route, mission board, briefing, equipment stage, album drawer, and removal of the four dashboard tabs.
2. Verify RED.
3. Build the route-first shell with one primary action per screen, preserving the desktop dossier and mobile fullscreen breakpoints.
4. Add PT/EN copy using verbs and vocabulary understood by ages 8–10.
5. Verify focused UI and responsive tests GREEN.

### Task 3: Meaningful equipment decisions

**Files:**
- Modify: `paper-preview/src/agency/agencyCatalog.js`
- Modify: `paper-preview/src/agency/agencyUi.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperAgencyJourney.test.js`
- Test: `tests/paperAgencyUi.test.js`

1. Write failing tests requiring every equipment option to expose a purpose, consequence, and mission recommendation.
2. Verify RED.
3. Render illustrated choice cards with `Recommended for this mission`, immediate consequence copy, and a visible loadout summary.
4. Keep alternatives valid and preserve quality effects in the existing state domain.
5. Verify focused tests GREEN.

### Task 4: Tutorial-safe science interactions

**Files:**
- Modify: `paper-preview/src/agency/scienceSimulation.js`
- Modify: `paper-preview/src/agency/scienceConsole.js`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperAgencyScienceSimulation.test.js`
- Test: `tests/paperAgencyUi.test.js`

1. Write failing tests for tutorial hints, rejected incorrect captures, asteroid focus lock, Mars drift, and replay scoring variations.
2. Verify RED.
3. Add mission-specific interaction state without introducing non-deterministic timers.
4. Add contextual DOM prompts and Canvas feedback while keeping touch, pointer, and keyboard support.
5. Verify focused tests GREEN.

### Task 5: Discovery reveal, replay, and album

**Files:**
- Modify: `paper-preview/src/agency/agencyState.js`
- Modify: `paper-preview/src/agency/agencyPresentation.js`
- Modify: `paper-preview/src/agency/agencyUi.js`
- Modify: `paper-preview/src/agency/scienceConsole.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperAgencyState.test.js`
- Test: `tests/paperAgencyIntegration.test.js`

1. Write failing tests for the in-console result reveal, immediate replay, best-score persistence, attempt count, archive action, and explicit return to the board.
2. Verify RED.
3. Return the completed report from the integration callback and keep the result screen open.
4. Implement `Try again`, `Save discovery`, and `Choose another adventure` actions.
5. Present reports as one album entry per operation with mastery and best result; place external sources in a secondary footer.
6. Verify focused tests GREEN.

### Task 6: Full validation and release readiness

**Files:**
- Modify as required by verified defects only.
- Test: all Agency test files and browser playtests.

1. Run all Agency tests, then `npm run lint`, `npm run typecheck`, `npm test -- --run`, and `npm run build`.
2. Playtest PT/EN at 1440×900, 1024×768, 390×844, and 844×390.
3. Verify the exact first-time and replay loops for all three adventures, including keyboard and touch.
4. Inspect screenshots for clipping, hierarchy, instruction clarity, and reward visibility.
5. Commit the completed redesign locally. Do not create or update a PR until explicitly approved after playtest.

