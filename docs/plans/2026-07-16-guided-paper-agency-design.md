# Guided Paper Agency Design

## Audience and purpose

The Paper Space Agency is for children aged 8–10. Its single job is to turn one real Solar System question into a short, understandable adventure with a visible discovery at the end. It complements the four orbital mini-missions; it does not replace them.

## Product diagnosis

The current Agency exposes internal systems instead of a child-facing journey. Equipment effects are hidden, the science loop can collapse into three clicks, completion changes a tab behind an open overlay, active probes disappear immediately, and reports do not explain their reward or next action. The four equal-weight tabs split one journey into disconnected database views.

## Guided loop

Every adventure follows one visible route:

`Mission → Equip → Travel → Investigate → Discovery`

The Agency opens on three large adventure cards: Solar Alert, Asteroid Hunter, and Message from Mars. Choosing one opens a briefing with one question, one short scientific idea, a live-data field note, and one primary action.

Equipment choices use illustrations and plain consequences. The recommended tool is identified and explained, but alternatives remain selectable. The first attempt is a no-fail tutorial: incorrect actions pause progression, show a contextual hint, and never reduce a score. Replays remove most guidance, vary the target, and score timing or precision.

## Mission identities

- **Solar Alert:** wait for the scanner to cross a magnetic pulse, then capture three meaningful pulses. Early taps produce a visual hint without counting as readings during the tutorial.
- **Asteroid Hunter:** follow the moving paper asteroid, hold the reticle until focus locks, then photograph it from three changing positions.
- **Message from Mars:** tune toward the strongest signal, then compensate for gentle frequency drift until the radio link stabilizes.

## Completion and replay

Completion never leaves the child in a dead end. A discovery reveal replaces the playfield and shows what was found, one child-readable scientific explanation, mission quality, XP, stamp/mastery progress, and three explicit actions:

- `Try again` starts the same adventure immediately with a variation.
- `Save discovery` archives the best result and opens the album view.
- `Choose another adventure` returns to the mission board.

Attempts are always allowed. The archive stores the best score and attempt count per adventure. Mastery has three stages: Discovered, Investigator, Specialist.

## Information architecture

The four dashboard tabs are removed. Live data appears inside each adventure briefing. Probe status is the animated route step within the current journey. Reports become a visual discovery album accessible from the mission board, not a required workflow tab. External science sources live in a quiet “For curious explorers” footer and are never presented as the reward.

## Visual direction

The existing paper dossier remains, but it unfolds as the journey advances. A stitched route ribbon is always visible. Each mission owns a strong material identity: solar acetate and magnetic thread, asteroid contact-sheet photography, and Mars radio-wave tracing paper. DOM carries instructions and actions; Canvas carries the playfield. Motion is reserved for launch, state changes, hints, and reward. Reduced-motion mode keeps gameplay readable with restrained transitions.

## Responsive and accessibility constraints

Desktop uses the centered dossier; screens at or below 720px use fullscreen. Landscape mobile protects the playfield with a compact side control panel. Every interaction supports touch and keyboard, every action has a 44px target, instructions use short PT/EN sentences, color is never the only signal, and tutorial hints are announced through an ARIA live region.

