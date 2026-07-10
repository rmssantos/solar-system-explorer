# Paper Diorama Preview — Design

## Purpose

Build a separate visual concept for children aged roughly 8–12 whose single job is to prove that Solar System Explorer can feel like a handcrafted science book instead of a realistic cockpit. The preview must not import the current HUD, application state, textures or CSS.

## Experience

The player opens directly on a small tabletop Solar System. Sun, Earth and Saturn are layered paper cutouts positioned in a shallow Three.js stage. Previous/next navigation moves the camera as if a pop-up book is sliding beneath it. The objective is “Chega a Saturno”; exploring Saturn opens a field-note page and completes the miniature mission.

There is no onboarding sequence, XP, library, settings, map or account state. The useful loop must be understood in under three seconds and completed in under one minute.

## Visual system

- Night card: `#101936`
- Ink blue: `#23345F`
- Notebook paper: `#F3E6BE`
- Sun pulp: `#F5B83D`
- Ocean gouache: `#4388B8`
- Leaf cutout: `#6B985B`
- Coral pencil: `#D85D4A`
- Graphite: `#2B2F3A`

Fredoka is used only for planet names and the short objective. Nunito carries actions and educational copy. Utility labels use uppercase Nunito with generous tracking, like annotations in a school field notebook.

The canvas background is dark fibrous card with punched and pencilled stars. Planet faces use deterministic CanvasTexture paper grain. Their silhouettes are intentionally slightly irregular and built from multiple planes separated in depth so real shadows reveal the physical layers.

## Signature moment

Travel is represented by a stitched orbital ribbon. When the player changes target, a small cardboard rocket crosses the lower scene, the destination layers lift slightly, and the camera settles with a soft paper wobble. Motion is concentrated here; the rest of the scene remains calm.

## Layout

```text
[ MISSÃO · CHEGA A SATURNO ]                  [CADERNO]

                    PAPER STAGE
                  active planet

        [ ‹ ] [ TERRA · EXPLORAR ] [ › ]
```

Desktop keeps one objective label and one bottom command strip. Mobile uses the same hierarchy with larger edge buttons and a two-line central action. The center of the stage stays clear. The notebook is a modal sheet and suspends navigation input while open.

## Architecture

The preview lives under `paper-preview/` and has its own HTML, CSS and JavaScript modules. It uses the repository's installed Vite and Three.js packages only as tooling; it does not import production-game modules.

- `state.js`: pure selection, mission and notebook state.
- `scene/`: renderer, layered paper object factories and camera/rocket transitions.
- `ui.js`: DOM objective, navigation and notebook adapter.
- `main.js`: thin composition root, input and render loop.

It exposes `window.render_game_to_text()` and deterministic `window.advanceTime(ms)` for browser automation. Fullscreen is available through `F`.

## Accessibility and resilience

- Buttons have text alternatives and at least 44 px targets.
- Keyboard: arrows navigate, Enter explores, Escape closes, F toggles fullscreen.
- Focus remains visible; notebook focus is returned to the triggering action.
- Reduced-motion skips travel choreography but preserves state changes.
- Resize and WebGL context loss receive explicit handling.
- No network request or external image is required for the preview.

## Deliberate exclusions

No live NASA/JPL integration, full planet set, save system, quizzes, physics, free flight or asset pipeline. The preview answers one question only: is this graphical and interaction direction worth carrying into the main product?

## Approved evolution: free 2.5D paper flight

The first rail-navigation build proved the material language but felt like sliding a book beneath the camera. The approved second interaction model keeps the same assets and replaces previous/next travel with direct ship control.

The ship moves freely across the paper stage in X/Y and through a deliberately shallow Z range. Camera drag adds a restrained yaw/pitch orbit around the ship; the angle is capped so the diorama never collapses into edge-on coins. This reveals cardboard backs, separated paper layers and parallax without pretending to be a realistic 3D simulator.

Desktop controls:

- WASD or arrows: camera-relative movement across the stage.
- Q/E: move between back, middle and front paper depth.
- Pointer drag: orbit the follow camera within the safe angle.
- Enter: explore the nearby planet.
- F: fullscreen.

Mobile controls:

- One left virtual joystick for X/Y movement.
- Drag on empty stage to move the camera.
- One “Camada” button cycles three depth layers.
- One contextual Explore button appears only inside a planet's discovery radius.

The camera follows with damping and looks slightly ahead of velocity. Stars, stitched orbit and planet layers occupy different Z planes, creating parallax. Planet cutouts remain fixed in the diorama rather than always billboarding; limited camera movement is what exposes their physical construction.

Simulation remains independent of Three.js. A pure flight state owns position, velocity, input, bounds, depth and nearby-object detection. The scene consumes snapshots to move the ship/camera. UI consumes the same state to show only an objective and contextual action. There is no collision engine in this preview; world bounds and a soft minimum approach distance are sufficient.
