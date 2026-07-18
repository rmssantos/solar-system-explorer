# Complete Orbital Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete roadmap items 1–10 with a cohesive contract journey, upgraded Paper Courier, richer and resumable missions, Jupiter Slingshot, responsive bilingual UX, and measured lazy loading.

**Architecture:** Extend the catalog/profile-driven campaign instead of adding per-mission conditionals to the UI. Keep all gameplay state deterministic and serializable, route presentation through `localOrbitHost`, and preserve the existing dynamic adapter boundary so Phaser never enters the initial bundle.

**Tech Stack:** JavaScript ES modules, Three.js, Phaser 3, Vitest, Vite, Playwright/browser QA, WebP, MP3.

---

## Implementation tasks

### Task 1: Contract travel journey

**Files:**
- Create: `paper-preview/src/contracts/contractJourney.js`
- Modify: `paper-preview/src/contracts/contractCatalog.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Test: `tests/paperContractJourney.test.js`
- Test: `tests/paperOrbitalCampaignIntegration.test.js`

1. Write failing tests for destination resolution, travel CTA states, cancel, and arrival readiness.
2. Run `npm test -- tests/paperContractJourney.test.js tests/paperOrbitalCampaignIntegration.test.js` and confirm the missing journey behavior fails.
3. Implement a pure journey model and wire accepted contracts to the existing autopilot.
4. Re-run the focused tests and commit.

### Task 2: Versioned resumable attempts

**Files:**
- Create: `paper-preview/src/contracts/contractAttemptState.js`
- Modify: `paper-preview/src/missions/progressStore.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Test: `tests/paperContractAttemptState.test.js`
- Test: `tests/paperProgressStore.test.js`
- Test: `tests/paperLocalOrbitHost.test.js`

1. Write failing tests for sanitized snapshots, schema fallback, save/continue/restart, completion cleanup, and idempotence.
2. Run the focused tests and verify RED.
3. Implement the attempt domain, storage fields, host restore hook, and leave sheet.
4. Run focused tests and commit.

### Task 3: Semantic controls and mission tutorials

**Files:**
- Create: `paper-preview/src/contracts/missionTrainingState.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperMissionTraining.test.js`
- Test: `tests/paperLocalOrbitHost.test.js`
- Test: `tests/paperI18nCoverage.test.js`

1. Write failing tests for mission-specific button labels, first-play tutorial state, replayable training, and no progression mutation.
2. Verify RED with the focused Vitest files.
3. Add profile-owned labels/instructions and the training entry point in the Mission Centre.
4. Verify focused tests and commit.

### Task 4: Unique stamps and rewards

**Files:**
- Create: `paper-preview/src/contracts/contractRewards.js`
- Modify: `paper-preview/src/contracts/contractCatalog.js`
- Modify: `paper-preview/src/progression/expeditionProgress.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Create: `paper-preview/public/art/awards/contract-*.webp`
- Test: `tests/paperContractRewards.test.js`
- Test: `tests/paperExpeditionProgress.test.js`

1. Write failing tests for one unique reward per contract and one-time award semantics.
2. Verify RED.
3. Implement catalog metadata, reward presentation, and five paper stamp assets.
4. Verify tests and visual asset dimensions/weight; commit.

### Task 5: Event-driven mission audio

**Files:**
- Modify: `paper-preview/src/audio/audioDirector.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Modify: `scripts/generate-paper-audio.mjs`
- Create: `paper-preview/public/audio/mission-*.mp3`
- Test: `tests/paperMissionAudio.test.js`
- Test: `tests/paperAudioAssets.test.js`

1. Write failing tests for semantic cues, mute behavior, no duplicate cue spam, and shipped assets.
2. Verify RED.
3. Generate language-neutral effects through the offline ElevenLabs script without exposing `.env`, optimize them, and wire event cues.
4. Verify tests, duration, file size, and commit.

### Task 6: Paper Courier 2.0

**Files:**
- Modify: `paper-preview/src/scene/createPaperShip.js`
- Modify: `paper-preview/src/scene/createPaperScene.js`
- Create: `paper-preview/public/art/textures/paper-courier-panels.webp`
- Test: `tests/paperShipStyle.test.js`
- Test: `tests/paperObjectTextures.test.js`

1. Write failing structural tests for outlined parts, canopy frame/highlight, panel layers, engine collars, insignia, and layered thrust.
2. Verify RED.
3. Rebuild the ship geometry/material hierarchy and thrust animation with a neutral paper texture.
4. Run unit tests and browser screenshots against planets at chase distance; commit.

### Task 7: Jupiter Slingshot simulation

**Files:**
- Create: `paper-preview/src/minigames/slingshotSimulation.js`
- Modify: `paper-preview/src/contracts/contractCatalog.js`
- Modify: `paper-preview/src/contracts/contractState.js`
- Modify: `paper-preview/src/minigames/orbitalMissionProfiles.js`
- Test: `tests/paperSlingshotSimulation.test.js`
- Test: `tests/paperContractState.test.js`

1. Write failing deterministic tests for unlocks, safe corridor, miss, heat retry, gravity boost, and completion.
2. Verify RED.
3. Implement the immutable simulation and fifth catalog/profile entry with PT/EN copy.
4. Verify focused tests and commit.

### Task 8: Jupiter Slingshot renderer and postcard

**Files:**
- Create: `paper-preview/src/minigames/createSlingshotGame.js`
- Modify: `paper-preview/src/minigames/createOrbitalMissionGame.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Create: `paper-preview/public/art/missions/mission-jupiter-slingshot.webp`
- Modify: `paper-preview/styles.css`
- Test: `tests/paperSlingshotGame.test.js`
- Test: `tests/paperOrbitalMissionRouter.test.js`

1. Write failing adapter/router/telemetry tests.
2. Verify RED.
3. Implement the responsive paper playfield, keyboard/touch actions, telemetry, retry, completion, and optimized postcard.
4. Playtest portrait, landscape, desktop, reduced motion, PT and EN; commit.

### Task 9: Prefetch and loading performance

**Files:**
- Create: `paper-preview/src/minigames/missionPrefetch.js`
- Modify: `paper-preview/src/minigames/createOrbitalMissionGame.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/minigames/localOrbitHost.js`
- Test: `tests/paperMissionPrefetch.test.js`
- Test: `tests/paperBuildPerformance.test.js`

1. Write failing tests for idle prefetch, save-data opt-out, selected-adapter-only loading, and loading/retry UI.
2. Verify RED.
3. Implement guarded prefetch and a build manifest performance assertion proving Phaser is absent from initial chunks.
4. Run build, record chunk sizes, and commit.

### Task 10: Full campaign E2E and device matrix

**Files:**
- Create: `tests/e2e/paperOrbitalCampaign.spec.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/styles.css`
- Modify: `docs/HANDOFF.md`

1. Add executable campaign coverage for accept → travel → arrive → train/play → save/reload → complete → reward → language switch through all five contracts.
2. Run browser tests in Chromium and Firefox at 1440×900, 820×1180, 390×844, and 844×390.
3. Fix only observed accessibility, timing, collision, and responsive failures, adding a regression before each behavior change.
4. Update the handoff with measured QA and remaining real-device limitations; commit.

### Task 11: Final verification and review loop

**Files:**
- Modify only files required by verified failures or review findings.

1. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build:paper`, and `git diff --check`.
2. Run final browser playtests and inspect screenshots plus console output.
3. Publish the branch and open a ready-for-review PR with the complete validation evidence.
4. Wait for CodeRabbit, validate every actionable comment against the code, add RED regressions before fixes, reply in-thread, and resolve.
5. Repeat verification and review cycles until CodeRabbit is successful and no actionable thread remains.
