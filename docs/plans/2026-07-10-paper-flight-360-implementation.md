# Full 360 Paper Flight Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve the original game's unrestricted 3D manual-navigation feel while rendering the world as handmade paper sculpture.

**Architecture:** Upgrade the pure simulation from shallow X/Y plus layers to full 3D position, velocity and Euler orientation. Desktop/mobile input maps to forward, strafe, vertical, look, roll and boost intent. Three.js consumes snapshots through a chase-camera adapter; paper planets become crossed-slice sculptures readable from every angle.

**Tech Stack:** Vanilla ES modules, Three.js, Vite, Vitest, Pointer Events, Playwright game client.

---

### Task 1: Full 3D flight mathematics

**Files:**
- Modify: `tests/paperPreviewFlight.test.js`
- Modify: `paper-preview/src/flightSimulation.js`

**Step 1: Write failing 3D tests**

Change the wished state/API so:

- state owns `position {x,y,z}`, `velocity {x,y,z}`, `orientation {yaw,pitch,roll}`;
- forward input at yaw/pitch zero moves toward negative Z;
- yaw 90° turns forward thrust toward positive X;
- pitch changes forward Y and vertical input always follows world Y;
- strafe follows camera right;
- boost raises the speed cap; idle damps all three velocity axes;
- yaw wraps, pitch clamps, roll changes and 3D bounds cancel outward velocity;
- proximity uses real 3D anchor distance.

**Step 2: Verify RED**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: FAIL against the shallow simulation.

**Step 3: Implement 3D vector math**

Keep the module free of Three.js. Use explicit trigonometry for forward/right vectors and immutable returns. Remove depth-layer behavior after callers migrate.

**Step 4: Verify GREEN and commit**

Run both preview test files. Commit: `feat: upgrade paper flight to full 3d`

### Task 2: Original-style desktop and mobile controls

**Files:**
- Modify: `paper-preview/src/flightInput.js`
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/ui.js`

**Step 1: Map desktop controls**

- W/S or arrows: forward/back.
- A/D: strafe.
- Space/Ctrl: world up/down.
- mouse drag: yaw/pitch look with pitch clamp and unlimited yaw wrap.
- Shift: boost.
- R/F: roll.
- X: brake.
- G: fullscreen.
- Enter: contextual Explore.

**Step 2: Map mobile controls**

Left joystick maps strafe/forward. Right-side stage drag controls look. Add compact paper up, down and boost buttons; remove “Camada”. Preserve contextual Explore above controls.

**Step 3: Verify responsive shell**

At 390×844, assert joystick/action buttons/context action do not overlap and all remain within safe areas. Lint/typecheck.

**Step 4: Commit**

Commit: `feat: add full paper flight controls`

### Task 3: Paper-sculpture planets

**Files:**
- Modify: `paper-preview/src/scene/createPaperPlanet.js`

**Step 1: Add crossed meridian slices**

For each planet, preserve the illustrated front cutout and add 5–7 circular slices rotated around Y. Alternate face and cardboard materials so construction remains legible.

**Step 2: Add horizontal contour slices**

Add three XZ paper discs at proportional Y offsets/radii. Keep draw calls and transparency modest.

**Step 3: Give Saturn's ring thickness**

Replace/augment the flat annulus with a thin `ExtrudeGeometry` ring shape and cardboard edge material.

**Step 4: Browser orbit inspection and commit**

Capture front, side, rear and elevated views. Planet must never collapse to a line. Commit: `feat: sculpt planets from crossed paper slices`

### Task 4: Chase camera and render bridge

**Files:**
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`

**Step 1: Place a real 3D route**

Move the Sun, Earth and Saturn to separated X/Y/Z anchors and expand world/background/star depth.

**Step 2: Render orientation and movement**

Use simulation yaw/pitch/roll to orient the paper ship. Position a damped chase camera behind/up from its quaternion and look ahead along forward velocity.

**Step 3: Integrate input and proximity**

Replace shallow inputs/depth state in main. Notebook freezes flight, Enter explores only nearby objects, G toggles fullscreen and `render_game_to_text()` exposes complete 3D state.

**Step 4: Verify and commit**

Run tests, lint, typecheck, build. Commit: `feat: connect 360 paper flight loop`

### Task 5: Exhaustive 360 playtest

**Files:**
- Modify as evidence requires: `paper-preview/src/**`, `paper-preview/styles.css`
- Modify: `progress.md`

**Step 1: Desktop chains**

Test forward/back, strafe, rise/descend, yaw, pitch, roll, boost, brake, coast, bounds, Earth/Saturn approach, Explore, close and resume.

**Step 2: Mobile chains**

Test joystick, right-side look, up/down, boost and Explore at 390×844.

**Step 3: Visual truth**

Inspect screenshots from multiple camera angles. Confirm paper volume, ship readability, useful parallax, no clipping/edge collapse, no HUD overlap and matching text state.

**Step 4: Full verification**

Run: `npm test && npm run lint && npm run typecheck && npm run build && npm run build:paper && git diff --check`.

**Step 5: Handoff**

Record controls, evidence, remaining limitations and recommendation in `progress.md`, then follow branch-finishing workflow.
