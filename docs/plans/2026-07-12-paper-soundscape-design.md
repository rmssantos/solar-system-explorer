# Paper Solar Explorer soundscape design

## Outcome

The expedition gains an optional, reactive soundscape that makes flight and discovery feel tactile without turning the calm diorama into an arcade game. Audio starts only after a user gesture, follows a persisted sound choice, pauses with the hidden tab, and never sends the ElevenLabs key to browser code.

## Direction

The sound world is a handmade observatory radio: a soft, seamless cosmic bed; a warm paper-spacecraft engine that rises with speed and boost; and short paper, glass and radio gestures for opening the notebook, starting or arriving with the paper pilot, quiz results, Lumi transmissions and meaningful rewards. There are no literal explosions, loud trailer impacts, voices, continuous UI beeps or hover sounds.

Three approaches were considered:

1. One continuous music track: simple, but detached from flight and prone to a visible loop seam.
2. Many one-shot clips for every input: responsive, but noisy, asset-heavy and unsuitable for a relaxing experience.
3. **Recommended hybrid:** two seamless loops plus a small, restrained one-shot vocabulary, mixed from live game state.

The hybrid provides a real background sound while keeping the engine, autopilot and learning loop legible. ElevenLabs generation runs only from a local Node script. Generated MP3 files are committed as static assets; the `.env` and key remain ignored.

## Runtime architecture

`audio/audioState.js` is pure. It normalizes speed and produces target ambience, engine volume and engine playback rate for enabled/unlocked, boost, autopilot, dialog and page-visibility states.

`audio/audioDirector.js` owns browser `Audio` elements. It unlocks both looping beds from a user gesture, eases volumes toward pure-state targets, plays bounded one-shots, persists sound on/off, pauses on document visibility changes and exposes a small state snapshot for `render_game_to_text`.

`main.js` is the event router. It sends flight snapshots every simulation step and triggers semantic cues only at state transitions. UI code receives an `onSoundToggle` callback and renders one compact paper-radio button alongside zoom/orbit controls. The button uses `aria-pressed`, a localized label and visible muted/active states.

## Sound map

- `cosmic-ambience.mp3`: 30-second seamless background bed, low volume.
- `paper-engine.mp3`: 12-second seamless propulsion texture, shaped by speed and boost.
- `paper-fold.mp3`: notebook/passport open and close.
- `autopilot-start.mp3`: short rising paper-radio navigation signal.
- `autopilot-arrive.mp3`: gentle arrival resolve.
- `quiz-correct.mp3` / `quiz-wrong.mp3`: distinct but soft educational feedback.
- `reward-chime.mp3`: XP, level and award receipt, only when the receipt is meaningful.
- `lumi-signal.mp3`: restrained incoming-transmission cue.

Repeated high-frequency actions such as camera drag, hover, ordinary movement keys and zoom do not fire one-shots. Boost is expressed by the continuous engine mix.

## Failure handling and accessibility

Missing or blocked audio never blocks the game. `play()` rejections are caught; an unavailable clip is skipped. Sound defaults to enabled but locked until the first pointer or keyboard gesture, satisfying browser autoplay rules. The explicit control persists the choice in local storage and works in PT/EN. Visual feedback remains authoritative, so no mission, quiz or navigation information depends on hearing.

## Verification

Vitest covers pure mixing, persistence, unlock, toggle, one-shot gating and structural UI/i18n integration. Browser QA checks initial locked state, gesture unlock, mute/unmute, movement/boost response, autopilot start/arrival, notebook and quiz/reward cues, tab visibility, console errors, desktop and 390×844 layout. `render_game_to_text` includes the current audio state for deterministic inspection.
