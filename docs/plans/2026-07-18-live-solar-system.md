# Live Solar System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make planetary orbits, moon circulation and body rotation visibly controllable through a responsive PT/EN orbital-time observatory.

**Architecture:** Add an immutable orbital-clock domain module outside Three.js, then let the scene consume its snapshots as a render adapter. Keep the controls in accessible DOM, with `main.js` bridging user actions, scene state and deterministic text output.

**Tech Stack:** JavaScript ES modules, Three.js, Vite, Vitest, Playwright, semantic HTML and CSS.

---

### Task 1: Orbital clock domain

**Files:**
- Create: `paper-preview/src/world/orbitalClock.js`
- Create: `tests/paperOrbitalClock.test.js`

1. Write failing tests for allowed scales `0/1/10/100`, default `10`, deterministic date advancement, pause and capped visual motion factors.
2. Run `npx vitest run tests/paperOrbitalClock.test.js` and confirm RED because the module is missing.
3. Implement immutable `createOrbitalClock`, `setOrbitalTimeScale`, `stepOrbitalClock` and `presentOrbitalClock` functions.
4. Run the focused test and confirm GREEN.
5. Commit the domain slice.

### Task 2: Three.js scene bridge

**Files:**
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/scene/createPaperWorldObjects.js`
- Create: `tests/paperLiveSolarScene.test.js`

1. Write source-integration tests requiring the scene to use the orbital-clock snapshot, scale planet rotation, scale satellite elapsed time and expose the clock in `getState()`.
2. Run the focused tests and confirm RED.
3. Replace the fixed `ORBIT_DAYS_PER_SECOND` path with the clock domain and add `setOrbitalTimeScale`.
4. Pass scaled elapsed time to world objects while leaving ship/effect elapsed time unchanged.
5. Run focused clock/orbit/scene tests and commit.

### Task 3: Accessible observatory HUD

**Files:**
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Modify: `paper-preview/src/ui.js`
- Create: `tests/paperTimeObservatoryUi.test.js`
- Modify: `tests/paperI18n.test.js`

1. Write failing structure, responsive, focus and PT/EN coverage for the toggle, panel, date, explanation and four 44px controls.
2. Run focused tests and confirm RED.
3. Add semantic DOM and paper-style CSS with desktop/mobile/short-landscape layouts and reduced-motion rules.
4. Add UI event delegation, expanded/pressed states and a localized `updateOrbitalClock` renderer using `Intl.DateTimeFormat`.
5. Run focused tests and commit.

### Task 4: Main-loop integration and deterministic state

**Files:**
- Modify: `paper-preview/src/main.js`
- Create: `tests/paperTimeObservatoryIntegration.test.js`

1. Write failing integration tests for the callback bridge, reduced-motion initial scale, frame updates and `render_game_to_text` clock state.
2. Run the focused test and confirm RED.
3. Wire `onOrbitalTimeScale`, update the DOM at a throttled cadence, expose `setTimeScale` for QA and include state in the deterministic payload.
4. Run unit/integration tests and commit.

### Task 5: Browser playtest and regression gate

**Files:**
- Create: `tests/e2e/paperTimeObservatory.spec.js`
- Modify: `docs/HANDOFF.md`

1. Use the required web-game Playwright client and inspect its screenshot, text state and console errors.
2. Add E2E checks for default motion, pause, 1×/10×/100×, PT/EN, keyboard focus and touch at 390×844 and short landscape.
3. Inspect desktop/mobile screenshots and adjust one visual variable at a time until the HUD stays clear of flight controls.
4. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build:paper`, `npm run verify:paper-build` and the focused E2E suite.
5. Update the handoff and commit the verified feature.
