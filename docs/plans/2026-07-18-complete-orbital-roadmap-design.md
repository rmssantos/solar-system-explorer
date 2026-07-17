# Complete Orbital Roadmap — Design

## Product direction

This sprint turns the orbital contracts into one continuous expedition for children aged 8–10. Accepting a contract starts a clear journey: prepare, travel with the Paper Pilot, arrive, learn the controls, play, celebrate, and keep a unique physical-looking stamp. The existing four missions remain intact and gain clearer controls, richer feedback, resumable attempts, training, and distinct rewards. A fifth mission, **Jupiter Slingshot**, teaches gravitational assistance through a playful approach corridor and launch window.

The experience remains bilingual in Portuguese and English, local-first, privacy-preserving, keyboard/touch friendly, and robust across desktop, tablet, phone portrait, and short landscape layouts. Browser emulation covers the device matrix available in automation; real-device gaps are recorded honestly rather than inferred.

## Journey and state

Accepted contracts expose a primary travel action that resolves the destination from the contract catalog and starts the existing 3D autopilot. Arrival produces a compact paper arrival card and makes the mission launch action immediately available. The player can cancel autopilot without losing the contract.

Each orbital attempt stores a versioned, sanitized simulation snapshot keyed by contract ID. Closing an incomplete mission opens a leave sheet with Continue, Save and leave, and Restart choices. Completing a contract clears its attempt. Training sessions use the same mechanics but never mutate contract completion, XP, or rewards.

## Mission language and feedback

Mission profiles own semantic control labels and accessible names rather than inheriting generic flight verbs. First entry into each gameplay family shows a short interactive tutorial that can later be replayed from the Mission Centre. Feedback cues are event-driven: transmitter pickup, shield impact, signal window entry/exit, signal lock, safe docking, slingshot corridor, and celebration.

Audio remains opt-in and uses shipped assets generated offline. No ElevenLabs credential or network request reaches the browser. Copy and any spoken content must exist in PT and EN; this sprint prefers language-neutral effects so the game does not double its audio weight without educational benefit.

## Visual direction

The Paper Courier is rebuilt as a readable hero object rather than a flat collection of primitives. Every major part receives its own dark ink silhouette, cardboard rim, faceted paper surface, and clean palette. Layered wings, a framed blue canopy, panel seams, engine collars, postal insignia, and multi-layer paper exhaust create a strong silhouette at chase-camera distance. Lighting and material colors stay neutral and saturated; there is no sepia overlay or yellow “piss filter”.

Jupiter receives a new paper mission postcard and slingshot playfield art consistent with the existing cream, coral, navy, radio-green, and signal-yellow system. Assets are optimized WebP/MP3 and validated in the final responsive layouts.

## Fifth mission

Jupiter Slingshot unlocks after Mars Relay is complete and Jupiter is discovered. The player adjusts the approach vector, enters a safe periapsis corridor, and holds the launch control through the gravity-assist window. Too shallow misses the boost; too deep triggers Lumi’s safe retry. The deterministic simulation exposes approach angle, corridor safety, heat, speed gain, and launch progress for tests and HUD telemetry.

## Performance and verification

Phaser remains isolated behind dynamic imports. Accepting a contract may prefetch only its gameplay adapter during idle time and only on connections that do not request reduced data. The loading sheet reports progress and retry state. A performance contract verifies that Phaser is absent from the initial application chunk and only one mission adapter is requested for a selected gameplay family.

Verification includes deterministic unit tests, host and persistence integration tests, full campaign E2E, PT/EN checks, keyboard/touch paths, reduced-motion behavior, Chrome and Firefox, and screenshots at desktop, tablet, 390×844, and 844×390. Build size and first-minigame loading are recorded before the PR.

