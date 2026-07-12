# Mobile-first Flight Controls Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make free flight practical on touch phones and tablets with two-thumb controls, complete manoeuvre access, safe touch targeting, and no desktop regression.

**Architecture:** Keep `flightSimulation.js` as the single flight-physics authority and adapt only the input/UI layer. `createFlightInput` will combine keyboard, desktop stage-look, a left movement stick, a right look stick, hold controls for vertical/roll/brake, and a latched touch boost; all control surfaces will consume pointer events before the stage selection/autopilot path sees them. Responsive styling will be activated by coarse-pointer capability as well as narrow width, with safe-area-aware phone and tablet layouts.

**Tech Stack:** Vite, vanilla ES modules, Three.js, Vitest, CSS media queries, Playwright browser QA.

---

### Task 1: Specify the dual-stick input contract

**Files:**
- Modify: `tests/paperPreviewFlight.test.js`
- Modify: `paper-preview/src/flightInput.js`

**Step 1: Write the failing tests**

Add real-DOM input tests that require a right joystick to produce bounded yaw/pitch deltas, a second simultaneous pointer to preserve left-stick thrust, and sampling to consume look deltas once.

**Step 2: Run tests to verify RED**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: FAIL because the right-stick elements/API are not accepted or sampled.

**Step 3: Implement the minimal dual-stick input**

Generalize joystick binding inside `createFlightInput`, map the left stick to forward/strafe and the right stick to yaw/pitch, and keep desktop stage drag unchanged for fine mouse control.

**Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: PASS.

### Task 2: Specify complete touch manoeuvre controls

**Files:**
- Modify: `tests/paperPreviewFlight.test.js`
- Modify: `paper-preview/src/flightInput.js`

**Step 1: Write the failing tests**

Require touch buttons for up, down, brake, roll left, and roll right to act only while held; require boost to toggle with `aria-pressed`; require `reset`, blur, and disabled state to clear every touch intent and boost state.

**Step 2: Run tests to verify RED**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: FAIL because brake/roll buttons and latched boost are missing.

**Step 3: Implement the minimal control state**

Add hold bindings for vertical, brake, and roll; add a click/pointer-safe toggle binding for boost; synchronize visual and accessible pressed state; remove all added listeners in `destroy`.

**Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/paperPreviewFlight.test.js`
Expected: PASS.

### Task 3: Make touch controls structurally safe

**Files:**
- Modify: `tests/paperPreviewStructure.test.js`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/main.js`

**Step 1: Write the failing structure tests**

Require labelled left and right sticks, a dedicated touch-actions container, brake and roll buttons, 52px-class targets, and every new selector required by `createPreviewUI`.

**Step 2: Run tests to verify RED**

Run: `npm test -- tests/paperPreviewStructure.test.js`
Expected: FAIL because the new controls do not exist.

**Step 3: Add the semantic control markup and wiring**

Add both stick groups and complete action buttons with Portuguese defaults and i18n hooks. Expose the nodes through `ui.js` and pass them to `createFlightInput` in `main.js`.

**Step 4: Isolate controls from scene selection**

Mark control surfaces with `data-flight-control`; stop pointer propagation in the input bindings; make the stage selection handler ignore any control-origin event. Increase touch-selection tolerance without changing mouse targeting.

**Step 5: Run tests to verify GREEN**

Run: `npm test -- tests/paperPreviewStructure.test.js tests/paperPreviewFlight.test.js`
Expected: PASS.

### Task 4: Build the phone and tablet layout

**Files:**
- Modify: `tests/paperPreviewStructure.test.js`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/i18n/paperI18n.js`

**Step 1: Write the failing responsive-contract tests**

Require coarse-pointer media activation, safe-area variables, minimum touch target sizes, and a top-safe compact route/language cluster that cannot overlap the left joystick.

**Step 2: Run tests to verify RED**

Run: `npm test -- tests/paperPreviewStructure.test.js`
Expected: FAIL on the missing coarse-pointer and dual-stick CSS contract.

**Step 3: Implement mobile-first control styling**

Use `@media (any-pointer: coarse), (max-width: 720px)` for touch controls. Place 120–128px sticks in bottom thumb zones, compact action shoulders around the right stick, move route/language navigation above the bottom controls, respect all four safe-area insets, and retain the existing desktop HUD.

**Step 4: Add bilingual labels and help**

Add concise Portuguese/English labels for direction, look, brake, roll, boost on/off, and touch instructions; hide keyboard-only help for coarse pointers.

**Step 5: Run tests to verify GREEN**

Run: `npm test -- tests/paperPreviewStructure.test.js tests/paperPreviewFlight.test.js`
Expected: PASS.

### Task 5: Browser-playtest real touch behaviour

**Files:**
- Modify: `progress.md`
- Create: `output/playwright/mobile-controls/*.png` (QA evidence, not committed)

**Step 1: Start the paper app**

Run: `npm run dev:paper -- --port 4173`
Expected: local Vite server on port 4173.

**Step 2: Test representative viewports**

Use real browser pointer/touch input at 360×800, 390×844, 430×932, 768×1024, 820×1180, 1024×768 landscape, and 1366×768 desktop. Verify two simultaneous touches can move and look, each manoeuvre control changes telemetry, boost latches/unlatches, dialogs reset input, and control gestures never activate autopilot.

**Step 3: Inspect visual evidence**

Capture and inspect phone portrait, tablet portrait, tablet landscape, and desktop screenshots. Confirm no overlap, horizontal overflow, clipped safe-area control, unreadable target, or obscured central playfield.

**Step 4: Record the verified result**

Update `progress.md` with viewports, interactions, telemetry deltas, console-error count, and evidence paths.

### Task 6: Verify and publish the mobile PR

**Files:**
- Modify: `SELF-IMPROVEMENT.md` if the mobile audit produces a reusable process lesson

**Step 1: Run complete verification**

Run: `npm test -- --run && npm run lint && npm run typecheck && npm run build:paper`
Expected: all tests pass, lint/typecheck exit 0, production build exits 0.

**Step 2: Review scope**

Run: `git status -sb`, `git diff --check`, and `git diff --stat origin/main...HEAD` after commits.
Expected: only mobile/touch implementation, tests, plan, and documentation.

**Step 3: Commit and publish**

Commit the intentional files, push `codex/mobile-first-controls`, and open a ready-for-review PR to `main` with root cause, interaction model, accessibility impact, and QA matrix.

**Step 4: Complete CodeRabbit review**

Wait for the full CodeRabbit review, evaluate every inline comment against the codebase, implement valid feedback one item at a time with tests, reply in-thread, repush, and continue until CodeRabbit approval and all required checks are green.
