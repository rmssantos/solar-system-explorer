# Orbital Campaign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a blocker-resilient Paper app and a two-mission orbital campaign whose mobile game uses the full screen with readable, reachable controls.

**Architecture:** Keep the DOM host responsible for mission copy, telemetry, controls and completion, while Phaser renders a mission-profile-driven canvas. Generalize contracts around catalog IDs and select the active contract in `main.js`; the existing immutable progress model remains the persistence boundary.

**Tech Stack:** Vite, vanilla JavaScript, Phaser Canvas, CSS Grid, Vitest, Playwright development client.

---

### Task 1: Make analytics optional to application startup

**Files:**
- Modify: `paper-preview/src/analytics/siteAnalytics.js`
- Move: `paper-preview/src/analytics/eventCatalog.js` to `paper-preview/src/productVocabulary.js`
- Modify: analytics and UI imports
- Test: `tests/paperAnalyticsResilience.test.js`

1. Write a failing test that rejects the optional analytics loader and expects a safe no-op.
2. Verify the failure.
3. Load Application Insights dynamically and catch blocked-module errors.
4. Move non-optional vocabulary helpers out of the blocked analytics URL.
5. Run analytics tests, browser startup, full validation, and commit.

### Task 2: Add a sequential Hubble maintenance contract

**Files:**
- Modify: `paper-preview/src/contracts/contractCatalog.js`
- Modify: `paper-preview/src/contracts/contractState.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperContractState.test.js`
- Test: `tests/paperOrbitalCampaignIntegration.test.js`

1. Write failing tests for the Hubble contract, its ISS-completion prerequisite and generic contract rendering hooks.
2. Verify the failures.
3. Add `unlockContracts` to catalog normalization and contract status evaluation.
4. Replace the single hard-coded contract card with a catalog-driven list and contract-ID callbacks.
5. Run focused tests and commit.

### Task 3: Make docking rendering mission-profile and orientation aware

**Files:**
- Create: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Modify: `paper-preview/src/minigames/dockingSimulation.js`
- Modify: `paper-preview/src/minigames/createDockingGame.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Test: `tests/paperDockingSimulation.test.js`
- Test: `tests/paperDockingGameContract.test.js`
- Test: `tests/paperLocalOrbitHost.test.js`

1. Write failing tests for ISS/Hubble profiles, Hubble drift and portrait mapping.
2. Verify the failures.
3. Pass the active profile through the host into the Phaser adapter.
4. Draw ISS or Hubble and map approach horizontally or vertically from the available aspect ratio.
5. Preserve simulation state across orientation rebuilds.
6. Run focused tests and commit.

### Task 4: Build the mobile fullscreen game shell

**Files:**
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Test: `tests/paperLocalOrbitUi.test.js`

1. Write failing source-contract tests for fullscreen canvas layering, safe-area controls and 56 px preferred touch targets.
2. Verify the failures.
3. Move mobile title and telemetry over the playfield and reserve a reachable control rail.
4. Add portrait, short-landscape, tablet/coarse-pointer and desktop rules without regressing keyboard hints.
5. Run focused tests and commit.

### Task 5: Integrate campaign state and complete device QA

**Files:**
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Modify: `tests/paperOrbitalCampaignIntegration.test.js`

1. Write failing tests for generic accept/start/complete flows and deterministic QA state.
2. Verify the failures.
3. Track the active contract, open its mission profile and persist completion.
4. Run the mandated Playwright client and inspect gameplay screenshots.
5. Exercise keyboard and touch through unsafe contact and completion on phone portrait/landscape, tablet and desktop.
6. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, then integrate the branch.
