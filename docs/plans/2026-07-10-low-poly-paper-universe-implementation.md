# Low-Poly Paper Universe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the exposed slice-based paper scene with a polished, closed low-poly paper universe while preserving responsive 360-degree flight.

**Architecture:** Keep deterministic flight and mission state independent from Three.js. Add pure visual configuration helpers that tests can validate, then let the scene adapter construct low-poly meshes, materials, outlines and atmosphere from those configs. Keep HUD in DOM and avoid adding a heavy post-processing dependency in this pass.

**Tech Stack:** Vite, vanilla JavaScript, Three.js, Vitest, Playwright web-game client.

---

### Task 1: Camera-relative arcade steering

**Files:**
- Modify: `paper-preview/src/flightSimulation.js`
- Test: `tests/paperPreviewFlight.test.js`

1. Add a failing test that accelerates along `-Z`, rotates yaw by 90 degrees while forward remains active, advances 250 ms and expects the X velocity to dominate the old Z velocity.
2. Run `npm test -- --run tests/paperPreviewFlight.test.js` and confirm the old world-space inertia fails.
3. Add exponential steering toward normalized input intent while preserving speed magnitude.
4. Re-run the focused test and an actual Playwright `W + mouse turn` sequence.
5. Commit as `fix: steer forward flight with camera`.

### Task 2: Pure low-poly planet specification

**Files:**
- Create: `paper-preview/src/scene/planetStyle.js`
- Create: `tests/paperPlanetStyle.test.js`

1. Write failing tests for stable planet keys, a maximum of five surface colors per planet, valid radii, silhouette features and finite seeded detail placement.
2. Run `npm test -- --run tests/paperPlanetStyle.test.js` and confirm the module is missing.
3. Implement immutable configs and deterministic seeded direction generation.
4. Re-run the focused tests.
5. Commit as `feat: define low poly paper planets`.

### Task 3: Closed planet meshes and artisan edges

**Files:**
- Create: `paper-preview/src/scene/createLowPolyPlanet.js`
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Remove runtime use of: `paper-preview/src/scene/createPaperPlanet.js`
- Test: `tests/paperPlanetStyle.test.js`

1. Add failing structural tests for geometry detail budgets and outline/rim configuration.
2. Build each body with `IcosahedronGeometry`, flat-shaded standard materials and deterministic face colors.
3. Add a back-side outline shell and shallow paper rim; add only silhouette-defining secondary geometry.
4. Replace scene construction with the new planet factory.
5. Run focused tests and the web-game client; inspect all three planets from oblique angles.
6. Commit as `feat: rebuild planets as low poly paper pieces`.

### Task 4: Soft authored lighting and space atmosphere

**Files:**
- Create: `paper-preview/src/scene/createSpaceAtmosphere.js`
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/scene/paperTextures.js`
- Test: `tests/paperPlanetStyle.test.js`

1. Add failing deterministic tests for bounded star, dust, asteroid and probe counts.
2. Lower paper-fiber contrast and create two translucent procedural nebula textures.
3. Replace uniform stars with clustered stars plus quiet regions; add sparse asteroid groups and one probe.
4. Tune hemisphere/key/fill lighting and shadow opacity without bloom.
5. Run tests and inspect screenshots at the Sun, Earth, Saturn and in empty space.
6. Commit as `feat: author calm paper space atmosphere`.

### Task 5: Chase-camera polish and visual QA

**Files:**
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/main.js`
- Modify: `progress.md`

1. Add text-state diagnostics for camera/forward alignment and visible discovery objects.
2. Tune quaternion, camera-position and focus smoothing independently; verify roll has no world-up lock.
3. Run the official web-game client after each tuning change with short movement bursts.
4. Playtest desktop 1440×900 and mobile 390×844: forward turns, pitch, roll, boost, brake, proximity and notebook.
5. Inspect screenshots and console output; fix the first issue and repeat until clean.
6. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run build:paper` and `git diff --check`.
7. Commit as `feat: polish low poly paper exploration`.

