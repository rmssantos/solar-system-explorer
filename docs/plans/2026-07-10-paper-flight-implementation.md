# Free Paper Flight Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace rail navigation with direct, accessible 2.5D ship flight and a restrained follow/orbit camera while preserving the approved paper-diorama visual system.

**Architecture:** Add a pure deterministic flight simulation that owns ship position, velocity, depth layer, bounds and proximity. A DOM input adapter produces normalized intent; the Three.js scene consumes flight snapshots and camera orbit values. Mission/UI state remains separate and exploration is allowed only near a planet.

**Tech Stack:** Vanilla ES modules, Three.js, Vite, Vitest, Pointer Events, Playwright game client.

---

### Task 1: Deterministic flight simulation

**Files:**
- Create: `tests/paperPreviewFlight.test.js`
- Create: `paper-preview/src/flightSimulation.js`
- Modify: `paper-preview/src/state.js`

**Step 1: Write failing tests**

Request these APIs before implementation:

- `createFlightState()` starts the ship inside declared bounds with zero velocity and middle depth.
- `stepFlight(state, input, dt)` accelerates camera-relative X/Y movement, damps without input, caps speed and clamps world bounds.
- `cycleDepthLayer(state, direction)` clamps to back/middle/front and `stepFlight` approaches the layer Z smoothly.
- `findNearbyPlanet(position)` returns the closest planet inside its interaction radius and `null` outside every radius.
- `explorePlanet(previewState, key)` opens the requested field note and completes only Saturn.

**Step 2: Verify RED**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: FAIL because `flightSimulation.js` and `explorePlanet` do not exist.

**Step 3: Implement minimum pure logic**

Export `PLANET_ANCHORS`, `FLIGHT_BOUNDS`, `DEPTH_LAYERS`, `createFlightState`, `stepFlight`, `cycleDepthLayer` and `findNearbyPlanet`. Use immutable objects, fixed numeric constants and no DOM/Three.js imports.

**Step 4: Verify GREEN**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: all flight tests pass.

**Step 5: Commit**

Commit: `feat: add deterministic paper flight simulation`

### Task 2: Flight controls and contextual HUD

**Files:**
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/ui.js`
- Create: `paper-preview/src/flightInput.js`
- Modify: `tests/paperPreviewFlight.test.js`

**Step 1: Write the failing input test**

Request `normalizeJoystick(dx, dy, radius)` and assert dead-zone handling, unit clamping and preserved direction.

**Step 2: Verify RED**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: FAIL because `normalizeJoystick` is missing.

**Step 3: Implement control adapter**

Track WASD/arrows, Q/E edge presses, stage pointer drag and a mobile virtual joystick. Return normalized X/Y intent, accumulated camera yaw/pitch deltas and a consumable depth-layer delta. Use Pointer Events and pointer capture.

**Step 4: Replace rail controls**

Remove previous/current/next strip. Add a bottom-center contextual Explore action, left mobile joystick, right “Camada” control and transient desktop hint. Keep targets ≥44 px, safe areas, visible focus and no permanent cockpit panel.

**Step 5: Static browser check and commit**

Assert no overflow at 390×844 and 1440×900. Commit: `feat: add paper flight controls`

### Task 3: Follow camera and render bridge

**Files:**
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/scene/createPaperPlanet.js`

**Step 1: Use simulation anchors**

Place Sun, Earth and Saturn from `PLANET_ANCHORS`, including shallow Z offsets. Keep cutouts fixed so camera yaw exposes cardboard thickness.

**Step 2: Add flight snapshot adapter**

Expose `setFlightSnapshot(flightState, cameraOrbit, deltaSeconds)`. Move/rotate/tilt the rocket from velocity. Follow with damped camera position and look-ahead; cap yaw/pitch to approved safe ranges.

**Step 3: Preserve paper readability**

Keep camera distance and field of view stable, add visible cardboard side layers, and ensure rocket/nearby planet remain readable at front/back depth.

**Step 4: Verify rendering**

Run lint, typecheck and `build:paper`. Browser console must have no application errors.

**Step 5: Commit**

Commit: `feat: add 2.5d paper follow camera`

### Task 4: Compose flight, proximity and exploration

**Files:**
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `progress.md`

**Step 1: Replace rail state flow**

Each fixed step samples input, updates pure flight state, updates nearby planet, sends a snapshot to the scene and refreshes contextual UI. Enter/Explore does nothing when no planet is nearby.

**Step 2: Update diagnostics**

`render_game_to_text()` must include ship position/velocity, depth layer, nearby planet, camera orbit, input and mission/notebook state. `advanceTime(ms)` remains deterministic.

**Step 3: Preserve modal rules**

Opening the notebook clears input and freezes flight. Escape closes and returns focus. Fullscreen still resizes correctly.

**Step 4: Commit**

Commit: `feat: connect free flight exploration loop`

### Task 5: Exhaustive flight playtest and verification

**Files:**
- Modify as evidence requires: `paper-preview/src/**`, `paper-preview/styles.css`
- Modify: `progress.md`

**Step 1: Desktop control chains**

With the official web-game client, verify idle → accelerate → coast/decelerate → reverse → boundary; visit Earth and Saturn; change each depth layer; drag camera; explore Saturn; close notebook.

**Step 2: Mobile control chains**

At 390×844, verify joystick pointer movement, camera drag, layer cycling and contextual Explore without overlap or overflow.

**Step 3: Accessibility and resilience**

Verify arrows/Enter/Escape/F, reduced motion, focus, resize and zero application console errors. Compare screenshots with text state.

**Step 4: Full verification**

Run: `npm test && npm run lint && npm run typecheck && npm run build && npm run build:paper && git diff --check`
Expected: every command exits 0.

**Step 5: Record evidence and handoff**

Update `progress.md` with controls, screenshots, known limitations and honest recommendation on whether to port the direction into the main game.
