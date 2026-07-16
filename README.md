# Solar System Explorer

A mobile-first, bilingual 3D paper-diorama journey through the Solar System, designed for curious children and families.

**Play now:** <https://green-smoke-09dea4a03.3.azurestaticapps.net/>

## What ships today

- **Free 3D flight** through a handcrafted paper Solar System with moving orbits and intentionally compressed exploration distances.
- **Touch-first controls** for phones and tablets, with responsive portrait and landscape layouts.
- **Paper pilot autopilot:** tap a world to travel towards it, or fly the ship yourself.
- **Chase and cockpit cameras**, orbital-path controls, radar, flight telemetry, and fullscreen mode.
- **Pocket missions and progression** with XP, explorer ranks, awards, discoveries, and device-local saves.
- **Paper Space Agency:** configure and launch persistent science probes, follow their journeys, and archive reports for XP.
- **Living Solar System:** daily operations driven by NASA solar-weather, near-Earth-object, and planetary-position data, with cache and resilient offline fallbacks.
- **Field notebook and quizzes** with measurements, scientific references, NASA imagery, and live-data fallbacks.
- **Solar System Library** for browsing planets, moons, dwarf planets, comets, asteroids, and human-made objects.
- **Reactive soundscape** for flight, autopilot, discoveries, quizzes, and rewards.
- **Portuguese and English** across the homepage, game, library, and privacy experience.
- **Privacy-first optional analytics** that remain disabled until the visitor makes a choice.

The deployed experience is the Paper Solar Explorer under `paper-preview/`. Diorama sizes and distances are adjusted for playability; the UI labels those values rather than presenting them as a scale model.

## Controls

### Phone and tablet

- **Move:** use the lower-left movement joystick.
- **Look:** drag anywhere on the scene to look while continuing to move.
- Pinch: zoom.
- Tap a visible world: start the paper pilot.
- Tap **Explore** when it appears: open that object's field notebook.

The right side of the playfield is deliberately free of a second joystick. One finger controls looking; a two-finger pinch controls zoom without rotating the camera.

### Mouse

- Left-drag the scene: look around.
- Mouse wheel: zoom.
- Click a world: start the paper pilot.

### Keyboard

- `W` / `S` or `↑` / `↓`: forward / backward.
- `A` / `D` or `←` / `→`: strafe left / right.
- `Space` / `Ctrl`: climb / descend.
- `R` / `F`: roll left / right.
- `Shift`: boost; `X`: brake.
- `V`: switch between chase and cockpit camera.
- `+` / `-`: zoom in / out.
- `G`: toggle fullscreen; `Esc`: close the open notebook.

## Development

Requires Node.js 22.

```bash
npm ci
npm run dev          # local Paper experience
npm run dev:archive  # archived legacy experience
npm test              # Vitest suite
npm run lint          # ESLint
npm run typecheck     # TypeScript checkJs validation
npm run build         # primary production build in dist/
npm run preview:paper
```

Human-authored product pull requests run tests, lint, type checking, a production build, and an Azure preview deployment. Dependency pull requests run the validation checks without receiving deployment secrets or a preview environment.

## Versioning and production

The repository uses Conventional Commits, Semantic Versioning, Release Please, immutable `vX.Y.Z` tags, and GitHub Releases. Merging a feature PR updates the release PR; only publishing that release deploys production.

See [docs/releases.md](docs/releases.md) for the release, rollback, and deployment-token runbook.

## Project structure

- `paper-preview/index.html`: public landing page.
- `paper-preview/jogo/index.html`: 3D flight experience and HUD.
- `paper-preview/biblioteca/index.html`: object library.
- `paper-preview/privacidade/index.html`: privacy notice and analytics controls.
- `paper-preview/src/main.js`: production game entry point and integration loop.
- `paper-preview/src/flightInput.js` / `flightSimulation.js`: input and deterministic flight model.
- `paper-preview/src/scene/`: Three.js paper world, ship, cameras, and rendering.
- `paper-preview/src/missions/` / `progression/`: missions, ranks, discoveries, and awards.
- `paper-preview/src/agency/`: live-operation direction, probe configuration, persistence, reports, and presentation.
- `paper-preview/src/learning/` / `data/`: learning content and scientific data adapters.
- `paper-preview/public/`: shipped fonts, artwork, sound effects, and static-web-app configuration.
- `tests/`: unit, integration, UI-contract, privacy, and release-governance tests.

The older HTML entry points live under `arquivo/jogo-antigo/`. Some root-level `src/`, `styles/`, and `public/` modules remain shared with the Paper experience and its historical test suite, but they are no longer the default application entry.

## Legacy ideas under evaluation: not shipped

The older prototype contains concepts that may be redesigned and integrated later: offline/PWA support, text-to-speech, a standalone comparator, photo mode, daily challenges, a minimap, certificates, and a guided first-run tutorial. They are roadmap candidates, not current product features.

## Tech stack

Three.js · Vite · Vanilla JavaScript modules · TypeScript `checkJs` · Vitest · ESLint · Azure Static Web Apps

## License

MIT: created for Gonçalo.
