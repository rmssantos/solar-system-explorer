# Paper Solar Explorer Soundscape Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add generated background ambience, reactive flight audio and restrained SFX to the Paper Solar Explorer without exposing the ElevenLabs key or violating autoplay/accessibility expectations.

**Architecture:** A pure mixer computes target levels from game state; a browser audio director owns looping and one-shot elements; `main.js` routes semantic game events. A local Node script reads the ignored key, generates static ElevenLabs assets and never ships credentials to the client.

**Tech Stack:** Vanilla ES modules, HTMLAudioElement, Vite, Vitest, ElevenLabs Sound Generation REST API, Playwright web-game client.

---

### Task 1: Secret hygiene and reproducible asset generation

**Files:**
- Modify: `.gitignore`
- Create: `scripts/generate-paper-audio.mjs`
- Create: `paper-preview/public/audio/README.md`
- Test: `tests/paperAudioAssets.test.js`

1. Add a structural test requiring `.env` ignores, the approved asset names and a generation script that uses `xi-api-key` only server-side.
2. Run `npx vitest run tests/paperAudioAssets.test.js` and confirm RED for the missing pipeline/assets.
3. Implement prompt definitions, safe `.env` discovery, `POST /v1/sound-generation`, skip-existing behavior and atomic file writes.
4. Generate the nine MP3 assets using `eleven_text_to_sound_v2`, with looping only for ambience and engine.
5. Re-run the focused test and inspect file sizes/types.

### Task 2: Pure sound mix

**Files:**
- Create: `paper-preview/src/audio/audioState.js`
- Test: `tests/paperAudioState.test.js`

1. Write tests for locked, muted, idle, moving, boost, autopilot, dialog-ducked and hidden-page mixes.
2. Run the focused test and confirm failure because the module is absent.
3. Implement clamped speed normalization and target ambience/engine volume/playback-rate calculations.
4. Re-run the focused test and refactor only while green.

### Task 3: Browser audio director

**Files:**
- Create: `paper-preview/src/audio/audioDirector.js`
- Test: `tests/paperAudioDirector.test.js`

1. Write fake-audio tests for persisted preference, gesture unlock, loop startup, mute/unmute, easing updates, one-shot playback, rejected play promises and destruction.
2. Confirm RED for the missing director.
3. Implement injected audio/storage/document dependencies and the public API: `unlock()`, `toggle()`, `update(snapshot, dt)`, `play(cue)`, `getState()`, `destroy()`.
4. Re-run tests and keep all failures non-fatal.

### Task 4: Game and UI integration

**Files:**
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Test: `tests/paperAudioUi.test.js`

1. Write structural tests for the paper-radio button, `aria-pressed`, PT/EN labels, director lifecycle and semantic cue hooks.
2. Confirm RED.
3. Add the compact control to the zoom stack and connect state rendering without adding a new panel.
4. Unlock on the first pointer/key gesture; mix speed/boost/autopilot/dialog state each step.
5. Trigger cues for explore/fold, quiz result, progress receipt, Lumi, autopilot start/arrival/cancel; add audio state to `render_game_to_text`.
6. Re-run focused audio tests.

### Task 5: Full verification and handoff

**Files:**
- Modify: `progress.md`

1. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build:paper` and `git diff --check`.
2. Run the official web-game client against `/jogo/`; inspect text state, screenshot and console.
3. Verify desktop and 390×844 initial, active and muted control states; exercise flight, boost, notebook, quiz and autopilot transitions.
4. Inspect generated screenshots, verify route HTTP responses and append decisions/evidence/TODOs to `progress.md`.
