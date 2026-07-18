# Signal of the Moons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete bilingual “Signal of the Moons” narrative expedition with four playable investigations, an evidence board, ship upgrades, resumable progress, responsive controls, and an educational finale.

**Architecture:** Add an immutable `expedition/` domain beside contracts, reuse the existing autopilot and local mission host, and route four new deterministic simulations through lazy Phaser adapters. Persist sanitized expedition state in the existing local save and render its localized presentation inside a new Mission Centre tab.

**Tech Stack:** Vite, vanilla JavaScript, Three.js, Phaser Canvas, CSS Grid, Vitest, Playwright, WebP/MP3 assets.

---

### Task 1: Expedition catalog and immutable state

**Files:**
- Create: `paper-preview/src/expedition/expeditionCatalog.js`
- Create: `paper-preview/src/expedition/expeditionState.js`
- Test: `tests/paperExpeditionCatalog.test.js`
- Test: `tests/paperExpeditionState.test.js`

**Step 1: Write failing catalog tests**

Assert five ordered entries (`moon-seismology`, `europa-radar`, `enceladus-plume`, `titan-dragonfly`, `ocean-worlds-finale`), localized PT/EN copy, stable destination/activity/evidence/upgrade IDs, and immutable nested data.

**Step 2: Run tests and verify RED**

Run: `npm test -- tests/paperExpeditionCatalog.test.js tests/paperExpeditionState.test.js`
Expected: FAIL because the modules do not exist.

**Step 3: Implement minimal domain**

Expose `EXPEDITION_CHAPTERS`, `getExpeditionChapter`, `createExpeditionState`, `getExpeditionChapterStatus`, `acceptExpeditionChapter`, `completeExpeditionChapter`, and `completeExpeditionFinale`. Sanitize arrays with stable uniqueness and ignore unknown IDs. Completion must be idempotent and automatically add the chapter evidence/upgrade.

**Step 4: Verify GREEN and commit**

Run the focused tests, then `git add paper-preview/src/expedition tests/paperExpedition*.test.js && git commit -m "feat: add ocean-world expedition domain"`.

### Task 2: Journey, unlock director, persistence, and XP

**Files:**
- Create: `paper-preview/src/expedition/expeditionJourney.js`
- Create: `paper-preview/src/expedition/expeditionDirector.js`
- Modify: `paper-preview/src/missions/progressStore.js`
- Modify: `paper-preview/src/progression/expeditionProgress.js`
- Test: `tests/paperExpeditionJourney.test.js`
- Test: `tests/paperExpeditionDirector.test.js`
- Modify: `tests/paperProgressStore.test.js`
- Modify: `tests/paperExpeditionProgress.test.js`

**Steps:**

1. Write failing tests for locked/available/accepted/travelling/arrived/completed states and prerequisites.
2. Verify RED with the four focused test files.
3. Implement a journey API matching contract journey semantics and a director that unlocks the prologue after Moon discovery plus ISS delivery.
4. Persist `expeditionVersion`, accepted/completed/evidence/upgrade IDs, and attempts without changing old saves.
5. Reconcile unique `expedition-chapter` XP events (80/120/140/160/200).
6. Run focused and full unit tests; commit `feat: persist signal expedition progress`.

### Task 3: Evidence board presentation and Mission Centre shell

**Files:**
- Create: `paper-preview/src/expedition/expeditionPresentation.js`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/styles.css`
- Test: `tests/paperExpeditionPresentation.test.js`
- Test: `tests/paperExpeditionUi.test.js`
- Modify: `tests/paperI18n.test.js`

**Steps:**

1. Write RED tests for localized Lumi briefing, 0/4 evidence count, chapter action labels, final lock, and all required i18n keys.
2. Add an `investigation` Passaporte tab and panel containing Lumi’s transmission, evidence board, chapter route, assist controls, and live region.
3. Render the board from a view model; use buttons for chapter art and actions, semantic progress, and no inline business rules.
4. Add desktop/tablet/phone/short-landscape CSS with 44 px targets, safe areas, reduced motion, and neutral paper colors.
5. Verify unit tests, lint, and typecheck; commit `feat: add Lumi investigation board`.

### Task 4: Integrate expedition journey with autopilot and mission host

**Files:**
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Modify: `paper-preview/src/minigames/missionAdapterLoaders.js`
- Modify: `paper-preview/src/minigames/createOrbitalMissionGame.js`
- Modify: `paper-preview/src/minigames/missionPrefetch.js`
- Test: `tests/paperExpeditionIntegration.test.js`
- Modify: `tests/paperLocalOrbitHost.test.js`
- Modify: `tests/paperOrbitalMissionRouter.test.js`

**Steps:**

1. Write RED integration tests for accept → travel → arrive → open → complete and saved-attempt restore.
2. Add expedition callbacks/state to `createPreviewUI`; reuse `flyToWorldObject` and distinguish contract/expedition active mission context.
3. Generalize host attempt metadata from `contractId` to a stable `attemptKey` while retaining contract compatibility.
4. Add gameplay loader keys `seismic`, `ice-radar`, `plume`, and `dragonfly`; confirm each remains a dynamic import.
5. Preserve dialog freeze, input enable/disable, training, retry, and audio behavior.
6. Run focused/full tests and commit `feat: connect expedition journey to mission runtime`.

### Task 5: Lunar seismology simulation and renderer

**Files:**
- Create: `paper-preview/src/minigames/seismicSimulation.js`
- Create: `paper-preview/src/minigames/createSeismicGame.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Test: `tests/paperSeismicSimulation.test.js`
- Test: `tests/paperSeismicGame.test.js`

**Behavior:** Place three paper sensors, align their timing windows, and classify the shared impact pulse. Telemetry: sensors placed, signal clarity, triangulation. Controls: move cursor, place sensor, inspect pulse. Completion event: `seismic-solved`.

**Steps:** Write deterministic RED tests; implement immutable state/step/action functions; create responsive Phaser Canvas scene; verify keyboard/touch/reduced-motion behavior; run tests; commit `feat: add lunar seismology prologue`.

### Task 6: Europa ice-radar simulation and renderer

**Files:**
- Create: `paper-preview/src/minigames/iceRadarSimulation.js`
- Create: `paper-preview/src/minigames/createIceRadarGame.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Test: `tests/paperIceRadarSimulation.test.js`
- Test: `tests/paperIceRadarGame.test.js`

**Behavior:** Steer three radar passes across fissures, keep heat below the safe limit, and reveal a subsurface boundary. Telemetry: map coverage, instrument heat, echo confidence. Completion event: `ice-map-complete`.

Follow strict RED/GREEN/refactor, add touch-first controls and paper ice layers, then commit `feat: map Europa hidden ocean with radar`.

### Task 7: Enceladus plume simulation and renderer

**Files:**
- Create: `paper-preview/src/minigames/plumeSimulation.js`
- Create: `paper-preview/src/minigames/createPlumeGame.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Test: `tests/paperPlumeSimulation.test.js`
- Test: `tests/paperPlumeGame.test.js`

**Behavior:** Cross moving plume bands, open the collector only inside clean zones, and keep sample temperature low. Telemetry: particles, contamination, sample temperature. Completion event: `plume-sample-complete`; unsafe collection triggers assisted retry rather than a hard fail.

Implement test-first, responsive particle density, cleanup, and commit `feat: collect Enceladus plume samples`.

### Task 8: Titan Dragonfly simulation and renderer

**Files:**
- Create: `paper-preview/src/minigames/dragonflySimulation.js`
- Create: `paper-preview/src/minigames/createDragonflyGame.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Test: `tests/paperDragonflySimulation.test.js`
- Test: `tests/paperDragonflyGame.test.js`

**Behavior:** Fly between three candidate sites, read wind and surface safety, then land at the scientifically useful safe site. Telemetry: route, wind stability, landing confidence. Completion event: `dragonfly-landed`.

Implement immutable physics, portrait/landscape layouts, keyboard/touch parity, reduced motion, cleanup, and commit `feat: explore Titan with paper Dragonfly`.

### Task 9: Evidence interpretation and finale

**Files:**
- Create: `paper-preview/src/expedition/evidenceCatalog.js`
- Create: `paper-preview/src/expedition/finaleState.js`
- Create: `paper-preview/src/expedition/createFinaleActivity.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/styles.css`
- Test: `tests/paperOceanEvidence.test.js`
- Test: `tests/paperOceanFinale.test.js`

**Steps:**

1. RED-test four evidence cards with water/energy/chemistry traits and a final comparison activity.
2. Implement drag-or-tap placement that never relies only on dragging.
3. Require the conclusion “potentially habitable is not proof of life”; provide corrective Lumi feedback without punishment.
4. Complete the finale idempotently, display the cutaway comparison, and unlock the Guardian seal.
5. Verify and commit `feat: conclude the ocean worlds investigation`.

### Task 10: Ship upgrades, rewards, art, and audio

**Files:**
- Modify: `paper-preview/src/scene/createPaperShip.js`
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/audio/audioDirector.js`
- Modify: `paper-preview/src/audio/missionAudio.js`
- Create: `paper-preview/public/art/expedition/*.webp`
- Create: `paper-preview/public/art/awards/ocean-*.webp`
- Create: `paper-preview/public/audio/moon-*.mp3`
- Modify: `tests/paperShipStyle.test.js`
- Modify: `tests/paperAudioDirector.test.js`

**Steps:** Generate clean paper-style source art and optimize to WebP; add four named lightweight ship modules controlled by unlocked IDs; add language-neutral seismic/radar/plume/rotor/finale SFX; verify stable mesh names, no collision changes, lazy asset paths, and audio debounce; commit `feat: add ocean expedition art and ship upgrades`.

### Task 11: Accessibility, assistance, and narration contract

**Files:**
- Create: `paper-preview/src/expedition/expeditionAssist.js`
- Modify: all four simulations and profiles
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Modify: `paper-preview/styles.css`
- Test: `tests/paperExpeditionAssist.test.js`
- Test: `tests/paperExpeditionAccessibility.test.js`

Add persisted no-penalty options for guided path, slow motion, and extra time. Ensure aria labels name scientific effects, color has icon/text equivalents, focus is trapped/restored, and optional narration never gates progress. Verify reduced motion and commit `feat: add accessible expedition assists`.

### Task 12: Full integration, E2E, performance, and documentation

**Files:**
- Create: `tests/e2e/paperSignalOfTheMoons.spec.js`
- Create: `tests/e2e/paperExpeditionResponsive.spec.js`
- Modify: `scripts/lib/paper-build-performance.mjs`
- Modify: `tests/paperBuildPerformance.test.js`
- Modify: `docs/HANDOFF.md`
- Modify: `CHANGELOG.md` only through release automation, not manually

**Steps:**

1. E2E the complete season in PT and switch to EN; cover save/reload, replay, offline fallback, and unique rewards.
2. Validate desktop, 820×1180, 390×844, and 844×390 in Chromium/Firefox.
3. Assert Phaser/new adapters stay outside the initial graph and each mission loads only its own chunk.
4. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify:paper-build`, and `npm run test:e2e`.
5. Update handoff with architecture, controls, known QA limitations, and real-device checklist.
6. Commit `feat: complete Signal of the Moons expedition`.

### Task 13: Pull request and review loop

Run verification again from a clean tree, push `agent/signal-of-the-moons`, create a non-draft PR with screenshots and test evidence, request CodeRabbit review, validate each actionable comment, fix only confirmed issues, and repeat until checks and review are green.
