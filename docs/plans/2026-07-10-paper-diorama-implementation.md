# Paper Diorama Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone, responsive Three.js preview proving the paper-cut diorama art direction through a one-minute Sun–Earth–Saturn exploration loop.

**Architecture:** Keep rules in pure functions and treat Three.js as a render adapter. Serve `paper-preview/` as an independent Vite root using the repository's tooling, with no imports from the production application. Generate every visual texture procedurally so the concept is offline and reproducible.

**Tech Stack:** Vite, vanilla ES modules, Three.js, CanvasTexture, Vitest, Playwright CLI.

---

### Task 1: Pure preview state and mission loop

**Files:**
- Create: `tests/paperPreviewState.test.js`
- Create: `paper-preview/src/state.js`

**Step 1: Write the failing state tests**

Import `PLANETS`, `createPreviewState`, `navigate`, `exploreActive` and `closeNotebook`. Assert:

- initial target is the Sun and objective target is Saturn;
- navigation clamps at both ends;
- exploring Earth opens its notebook without completing the mission;
- exploring Saturn opens its notebook and completes the mission;
- closing the notebook preserves completion.

**Step 2: Run test to verify RED**

Run: `npm test -- tests/paperPreviewState.test.js`
Expected: FAIL because `paper-preview/src/state.js` does not exist.

**Step 3: Implement the minimum pure state API**

Use immutable return values and a three-record `PLANETS` content array. Do not reference the DOM or Three.js.

**Step 4: Run test to verify GREEN**

Run: `npm test -- tests/paperPreviewState.test.js`
Expected: 5 tests pass.

**Step 5: Commit**

Commit message: `feat: add paper preview mission state`

### Task 2: Deterministic paper geometry helpers

**Files:**
- Modify: `tests/paperPreviewState.test.js`
- Create: `paper-preview/src/scene/paperGeometry.js`

**Step 1: Write the failing geometry test**

Request `createPaperProfile({ seed, segments, jitter })`. Assert identical seeds return identical finite point arrays, a different seed changes the edge, and all radii stay inside the declared jitter bounds.

**Step 2: Run test to verify RED**

Run: `npm test -- tests/paperPreviewState.test.js`
Expected: FAIL because `createPaperProfile` is missing.

**Step 3: Implement deterministic seeded sampling**

Return normalized `{ x, y }` points only. Three.js geometry construction remains in the render layer.

**Step 4: Run test to verify GREEN**

Run: `npm test -- tests/paperPreviewState.test.js`
Expected: all preview tests pass.

**Step 5: Commit**

Commit message: `feat: add deterministic paper silhouettes`

### Task 3: Independent Vite shell and low-chrome UI

**Files:**
- Modify: `package.json`
- Create: `paper-preview/index.html`
- Create: `paper-preview/styles.css`
- Create: `paper-preview/src/ui.js`
- Copy: `public/fonts/fredoka-latin.woff2` → `paper-preview/public/fonts/fredoka-latin.woff2`
- Copy: `public/fonts/nunito-latin.woff2` → `paper-preview/public/fonts/nunito-latin.woff2`

**Step 1: Record the browser-level RED condition**

Start `npm run dev:paper` before files exist and confirm `/` cannot render the required `#paper-stage`, objective, navigation and notebook elements.

**Step 2: Create the semantic shell**

Add one canvas mount, objective label, notebook trigger, previous/current/next command strip and hidden modal notebook. Use real buttons, dialog semantics, visible focus and PT-PT copy.

**Step 3: Implement the approved token system**

Use the exact palette and font roles from the design. Add CSS-only card fibres, torn edges, responsive rules at 720 px, safe-area padding and reduced-motion handling. Do not use glassmorphism, gradients as decoration, emoji controls or permanent corner dashboards.

**Step 4: Browser-check the static layout**

At 1440×900 and 390×844 assert no horizontal overflow, all action targets are at least 44 px, and the center stage is unobstructed.

**Step 5: Commit**

Commit message: `feat: scaffold paper diorama interface`

### Task 4: Layered Three.js paper stage

**Files:**
- Create: `paper-preview/src/scene/paperTextures.js`
- Create: `paper-preview/src/scene/createPaperPlanet.js`
- Create: `paper-preview/src/scene/createPaperScene.js`

**Step 1: Build procedural paper materials**

Create deterministic CanvasTextures for night card, Sun pulp, Earth gouache/continents and Saturn bands. Keep canvas sizes at or below 512 px and set color space/anistropy correctly.

**Step 2: Build layered cutouts**

Construct planets as slightly irregular ShapeGeometry planes separated on Z, with cardboard backing, face, accent and shadow layers. Add Sun rays, Earth paper clouds and Saturn ring layers.

**Step 3: Build the stage adapter**

Create renderer, perspective camera, lighting, punched stars, stitched orbit ribbon, cardboard rocket, resize handling, context-loss state and explicit `setActivePlanet`, `update` and `render` methods.

**Step 4: Run lint/typecheck/build**

Run: `npm run lint && npm run typecheck && npm run build:paper`
Expected: exit 0 and a standalone `dist-paper-preview/`.

**Step 5: Commit**

Commit message: `feat: render layered paper solar system`

### Task 5: Compose navigation, notebook and diagnostics

**Files:**
- Create: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/styles.css`
- Modify: `progress.md`

**Step 1: Connect immutable state to render adapters**

Previous/next buttons and arrow keys update state then request a scene transition. Explore/Enter opens the matching field note; Saturn completion updates the objective. Escape closes the notebook and returns focus. F toggles fullscreen.

**Step 2: Add automation hooks**

Expose `window.render_game_to_text()` with coordinate note, active planet, navigation availability, objective/completion, notebook state and transition state. Expose deterministic `window.advanceTime(ms)` which advances camera/rocket choreography and renders.

**Step 3: Verify browser interactions**

Use short Playwright action bursts to test Sun → Earth → Saturn → Explore → close, both click and keyboard. Confirm text state mirrors the screenshot and console has zero errors.

**Step 4: Commit**

Commit message: `feat: complete paper diorama preview loop`

### Task 6: Visual critique, responsive polish and full verification

**Files:**
- Modify as evidence requires: `paper-preview/styles.css`, `paper-preview/src/scene/*.js`
- Modify: `progress.md`

**Step 1: Capture and inspect desktop screenshots**

Capture Earth, Saturn travel and open notebook states at 1440×900. Open each image and check paper depth, visual hierarchy, contrast and central playfield.

**Step 2: Capture and inspect mobile screenshots**

Capture the same loop at 390×844. Assert no overlaps or overflow and that bottom controls respect safe areas.

**Step 3: Verify reduced motion and fullscreen**

Confirm state changes without choreography under reduced motion, and `F` resizes the stage correctly.

**Step 4: Run full repository verification**

Run: `npm test && npm run lint && npm run typecheck && npm run build && npm run build:paper`
Expected: all exit 0; existing application remains unchanged outside package scripts.

**Step 5: Review**

Run: `git diff --check`, inspect `git status --short`, diff stat, browser console and latest screenshots. Record honest remaining gaps in `progress.md`.
