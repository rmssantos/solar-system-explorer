# Paper Solar Explorer Complete Vertical Slice Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the isolated paper preview into a complete educational solar-system vertical slice with all major planets, real photography, quizzes and cached current space data.

**Architecture:** Keep simulation, learning state and remote data as pure modules outside Three.js. Adapt existing original-game content into a preview catalog, render it through a semantic DOM notebook, then enrich the scene through normalized cached providers. All online behavior has local fallback and explicit provenance.

**Tech Stack:** Vite, vanilla JavaScript, Three.js, Vitest, Playwright, NASA Images/APOD, JPL Horizons, CelesTrak OMM, satellite.js.

---

### Task 1: Reusable learning and quiz catalog

**Files:**
- Modify: `src/quizSystem.js`
- Create: `paper-preview/src/learning/learningCatalog.js`
- Create: `tests/paperLearningCatalog.test.js`

1. Write failing tests that request Sun/Earth/Saturn records and expect local real photos, statistics, facts and two valid quiz questions reused from the original catalog.
2. Export a pure `createQuizCatalog()` adapter from `src/quizSystem.js` without storage or DOM access.
3. Build immutable preview records from `SOLAR_SYSTEM_DATA`, `REAL_PHOTOS` and the pure quiz catalog.
4. Verify all nine major body records have a local photo, fact, measurement set and quiz.
5. Commit as `feat: reuse solar learning catalog in paper preview`.

### Task 2: Notebook and quiz state machine

**Files:**
- Modify: `paper-preview/src/state.js`
- Create: `paper-preview/src/learning/learningState.js`
- Create: `tests/paperLearningState.test.js`

1. Write failing tests for notebook sections, correct/wrong quiz answers, retry, discovery persistence shape and live-data envelopes.
2. Implement pure transitions; never mutate catalog records or remote payloads.
3. Keep existing mission-completion behavior compatible.
4. Run state and existing preview tests.
5. Commit as `feat: add paper learning state machine`.

### Task 3: Real-photo learning notebook UI

**Files:**
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/main.js`
- Test: `tests/paperLearningState.test.js`

1. Add semantic tab buttons and panels for Discover, Measure, Today and Challenge.
2. Render local real photos with source/fallback metadata and fixed aspect ratio.
3. Render measurements, facts and quiz options with accessible feedback.
4. Wire pure state transitions and preserve flight pause/resume behavior.
5. Playtest Sun/Earth/Saturn notebooks at 1440×900 and 390×844.
6. Commit as `feat: add real photo field notebook`.

### Task 4: Cached NASA/JPL/CelesTrak data service

**Files:**
- Create: `paper-preview/src/data/cache.js`
- Create: `paper-preview/src/data/spaceDataService.js`
- Create: `paper-preview/src/data/parsers.js`
- Create: `tests/paperSpaceData.test.js`

1. Write failing tests with injected fetch/clock/storage for live, cached, stale and fallback paths.
2. Implement bounded NASA Images and APOD requests with schema validation.
3. Implement Horizons vector parsing and daily cache.
4. Implement individual ISS/Hubble OMM requests with a two-hour minimum cache.
5. Ensure every response includes source, status and timestamp.
6. Commit as `feat: add cached scientific data providers`.

### Task 5: Full low-poly solar-system catalog

**Files:**
- Modify: `paper-preview/src/scene/planetStyle.js`
- Modify: `paper-preview/src/scene/createLowPolyPlanet.js`
- Modify: `paper-preview/src/flightSimulation.js`
- Modify: `paper-preview/src/state.js`
- Test: `tests/paperPlanetStyle.test.js`

1. Add failing tests for Sun plus eight ordered planets and unique silhouette features.
2. Add restrained styles for Mercury, Venus, Mars, Jupiter, Uranus and Neptune.
3. Expand anchors, bounds and discovery radii while retaining readable travel times.
4. Normalize optional JPL vectors into a stable game-space layout.
5. Playtest near/far recognition and collision for every body.
6. Commit as `feat: complete low poly solar system`.

### Task 6: ISS, Hubble and orbital propagation

**Files:**
- Add dependency: `satellite.js`
- Create: `paper-preview/src/data/orbitPropagation.js`
- Create: `paper-preview/src/scene/createPaperSatellite.js`
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Test: `tests/paperOrbitPropagation.test.js`

1. Write failing deterministic propagation tests from fixed OMM fixtures and timestamps.
2. Propagate ISS/Hubble with satellite.js and normalize Earth-relative direction.
3. Build distinct low-poly paper models and exaggerated visible orbital markers.
4. Add proximity, notebook records and honest scale labels.
5. Commit as `feat: add current orbital satellites`.

### Task 7: Calm atmosphere, lighting and discovery objects

**Files:**
- Create: `paper-preview/src/scene/createSpaceAtmosphere.js`
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/scene/paperTextures.js`
- Create: `tests/paperSpaceAtmosphere.test.js`

1. Add failing deterministic count/bounds tests.
2. Add clustered stars, quiet regions, two soft nebula cards, sparse asteroids, one comet and one probe.
3. Tune warm key, cool fill, hemisphere light and soft shadows without required bloom.
4. Expose visible discovery-object diagnostics in text state.
5. Commit as `feat: author complete paper space atmosphere`.

### Task 8: Guided mission, persistence and daily discovery

**Files:**
- Modify: `paper-preview/src/state.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Create: `paper-preview/src/learning/previewStorage.js`
- Test: `tests/paperLearningState.test.js`

1. Add failing tests for Earth → satellite → Saturn progression, unlocks and preview-specific persistence.
2. Add APOD daily discovery without blocking core play.
3. Restore progress safely and ignore malformed storage.
4. Verify keyboard, touch and offline mission completion.
5. Commit as `feat: complete paper exploration mission`.

### Task 9: Complete playtest and verification

**Files:**
- Modify: `progress.md`
- Modify only as defects require: `paper-preview/**`

1. Run the official web-game client after every meaningful fix.
2. Exercise yaw/pitch/roll, forward/strafe/vertical, boost, brake, fullscreen and touch controls.
3. Explore photos, measurements, live/fallback data and quizzes for Sun/Earth/Saturn/ISS/Hubble.
4. Inspect desktop/mobile screenshots, console, network failures and text-state parity.
5. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run build:paper` and `git diff --check`.
6. Commit as `feat: complete paper solar explorer`.

