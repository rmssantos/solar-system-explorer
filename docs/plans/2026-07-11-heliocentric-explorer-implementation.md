# Heliocentric Paper Solar Explorer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the linear preview with a coherent heliocentric exploration game, editorial homepage, contextual surprises, and persistent learning rewards.

**Architecture:** Pure orbital/progression/surprise modules feed a shared dynamic world-position registry. The Three.js game lives at `jogo.html`; a lightweight homepage is served from `index.html`. Runtime features consume the registry rather than static anchors, and all external data remains optional through cache/fallback envelopes.

**Tech Stack:** Vite 8, vanilla ES modules, Three.js, satellite.js, Vitest, Playwright CLI, generated PNG/WebP artwork.

---

### Task 1: Orbital definitions and logarithmic scale

**Files:**
- Create: `paper-preview/src/world/orbitalSystem.js`
- Modify: `paper-preview/src/world/worldCatalog.js`
- Test: `tests/paperOrbitalSystem.test.js`

**Steps:**
1. Write failing tests for monotonic logarithmic AU compression, Sun origin, Earth radius, outer-planet spacing, deterministic date positions, and inclination.
2. Run `npm test -- --run tests/paperOrbitalSystem.test.js` and confirm failure because the module is missing.
3. Add orbital elements for all eight planets and pure `compressAu`, `positionAtDate`, and `createPrimarySnapshot` functions.
4. Run the focused tests and existing world tests.
5. Commit `feat: add heliocentric orbital model`.

### Task 2: Dynamic simulation collision and proximity

**Files:**
- Modify: `paper-preview/src/flightSimulation.js`
- Modify: `paper-preview/src/main.js`
- Test: `tests/paperDynamicFlight.test.js`

**Steps:**
1. Write failing tests showing collision/proximity follows passed dynamic bodies and no longer reads static anchors.
2. Run the test and confirm the old behavior fails.
3. Make `stepFlight` and proximity accept a current body snapshot; preserve camera-relative input.
4. Wire the snapshot from the scene/runtime.
5. Run flight, camera, and proximity tests.
6. Commit `refactor: use dynamic world positions for flight`.

### Task 3: Heliocentric rendering and orbit paths

**Files:**
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/scene/createPaperWorldObjects.js`
- Create: `paper-preview/src/scene/createOrbitPaths.js`
- Test: `tests/paperOrbitPaths.test.js`

**Steps:**
1. Write failing structural tests requiring eight independent solar orbit paths and forbidding `createStitchedRoute`.
2. Run and observe the expected failure.
3. Remove the stitched route; generate subtle ellipse lines centered at the Sun.
4. Update planets every frame from the orbital snapshot and moons from dynamic parent positions.
5. Add orbit visibility toggle and expose current world positions.
6. Run focused tests, build, and official web-game screenshot loop.
7. Commit `feat: render living heliocentric system`.

### Task 4: Waypoint scientific context

**Files:**
- Create: `paper-preview/src/navigation/waypoint.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/index.html` (later moved to `jogo.html`)
- Test: `tests/paperWaypoint.test.js`

**Steps:**
1. Write failing tests for camera-relative angle, compressed distance, solar AU context, and target reached state.
2. Implement the pure waypoint formatter/calculator.
3. Point all mission guidance at the dynamic registry.
4. Render game and scientific distance without implying a linear scale.
5. Verify turning, moving target updates, and mobile legibility.
6. Commit `feat: improve mission waypoint guidance`.

### Task 5: Lightweight editorial homepage

**Files:**
- Move: `paper-preview/index.html` to `paper-preview/jogo.html`
- Create: `paper-preview/index.html`
- Create: `paper-preview/landing.css`
- Create: `paper-preview/src/landing.js`
- Modify: `paper-preview/vite.config.js`
- Test: `tests/paperLanding.test.js`

**Steps:**
1. Write failing markup tests for audience, purpose, learning, scientific provenance, controls, and `/jogo.html` CTA.
2. Move the existing game shell and update all local entry links.
3. Build the expedition-folder homepage using the approved token system and signature hero space.
4. Add restrained assembly/reveal behavior and reduced-motion handling.
5. Configure Vite multi-page build.
6. Verify desktop/mobile homepage and homepage → game navigation.
7. Commit `feat: add paper explorer homepage`.

### Task 6: Generate and integrate original artwork

**Files:**
- Create: `paper-preview/public/art/hero-paper-orrery.png`
- Create: `paper-preview/public/art/lumi-guide.png`
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/landing.css`

**Steps:**
1. Generate a wide paper-orbit hero using built-in image generation.
2. Inspect it, iterate once if composition/style conflicts with the UI, then copy it into the project.
3. Generate Lumi on a removable chroma-key background, remove the key with the provided helper, and validate alpha.
4. Integrate responsive crops, meaningful alt text, and lazy loading below the fold.
5. Capture visual evidence and commit `feat: add original paper explorer art`.

### Task 7: Persistent expedition progression

**Files:**
- Create: `paper-preview/src/progression/expeditionProgress.js`
- Modify: `paper-preview/src/missions/progressStore.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Test: `tests/paperExpeditionProgress.test.js`

**Steps:**
1. Write failing tests for XP values, duplicate-event idempotency, levels, medals, trophies, and migration.
2. Implement pure progress reducers and versioned serialization.
3. Award progress from discoveries, quizzes, missions, and surprises.
4. Expand the mission log into Passport tabs for Missions, Collection, and Awards.
5. Verify persistence and completion states in browser.
6. Commit `feat: add expedition passport rewards`.

### Task 8: Contextual surprise director and Lumi guide

**Files:**
- Create: `paper-preview/src/surprises/surpriseDirector.js`
- Create: `paper-preview/src/scene/createSurpriseEffects.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/jogo.html`
- Test: `tests/paperSurpriseDirector.test.js`

**Steps:**
1. Write failing tests for cooldown, no-dialog triggering, deterministic selection, no immediate repeat, and reward completion.
2. Implement the pure director with injectable clock/random.
3. Add visual comet/meteor/data-capsule effects and a compact Lumi transmission card.
4. Connect observation actions to expedition XP and collection entries.
5. Add deterministic debug hooks to playtest each surprise.
6. Verify no surprise interrupts notebook/cockpit controls or mobile HUD.
7. Commit `feat: add contextual space surprises`.

### Task 9: Self-review and second visual pass

**Files:**
- Modify: files identified by screenshot critique
- Update: `progress.md`

**Steps:**
1. Use the official web-game client for homepage, inner system, outer system, waypoint, surprise, passport, and cockpit.
2. Inspect every screenshot at desktop and 390×844.
3. Record five strongest weaknesses in `progress.md`.
4. Fix all severity-high issues and at least three visual/UX weaknesses through test-first changes where behavioral.
5. Repeat screenshots and console checks.
6. Commit `fix: polish heliocentric explorer experience`.

### Task 10: Final audit

**Files:**
- Update: `progress.md`

**Steps:**
1. Run `npm run lint`, `npm test`, `npm run build:paper`, and `git diff --check`.
2. Verify homepage → game, moving-orbit waypoint, discovery → reward, surprise → reward, persistence reload, offline fallback, zoom/cockpit, mobile controls, and fullscreen.
3. Measure a two-second FPS sample and inspect browser console.
4. Audit each explicit user requirement against current files and rendered evidence.
5. Update `progress.md`, commit final verification notes, and only then mark the goal complete.
