# Solar System Explorer

An interactive 3D educational journey through the Solar System, built for kids.

**Play now:** <https://green-smoke-09dea4a03.3.azurestaticapps.net/>

## Features

- **Interactive 3D Solar System** with accurate orbits, rotation, and relative scales
- **Cinematic intro** with cockpit HUD overlay
- **20+ guided missions** with XP, level progression, achievements, and quizzes
- **Daily Challenge** and endgame certificate with themed frames
- **In-app Biblioteca** (encyclopedia) with NASA photos and detailed facts
- **Planet Comparator** — compare size, temperature, and distance
- **Photo Mode** with social sharing
- **Mini-Map** radar and collectibles to discover
- **Manual flight mode** with WASD spaceship controls
- **Text-to-Speech** with voice selection and speed control
- **First-time user tutorial** with smart card positioning
- **Bilingual:** Portuguese and English
- **PWA support** — installable, works offline
- **Mobile-friendly** with touch controls

## Controls

### Mouse / Touch

- Left click + drag — rotate camera
- Right click + drag — pan camera
- Scroll wheel — zoom
- Click a planet — select and view info

### Keyboard

- `M` — toggle manual flight mode
- `Space` — pause / resume orbits
- `+` / `-` — speed up / slow down time
- `Esc` — close open dialogs/panels

### Manual flight mode (`M`)

- `W A S D` — fly spaceship
- `Space` / `Ctrl` — ascend / descend (Space does not pause while flying)
- `R` / `F` — roll left / right
- `Shift` — boost
- `X` — brake
- `I` — show info for the nearest planet
- `Esc` — close info panel, then exit flight mode

## Development

```bash
npm install
npm run dev:paper # Paper experience on a local Vite server
npm run build:paper # production build to dist-paper-preview/
npm run preview  # preview the production build
npm test         # run tests
npm run lint     # ESLint
npm run typecheck # TypeScript checkJs over the JS sources
```

CI runs tests, lint, and typecheck for pull requests before creating an Azure preview.

## Deployment

Production is deployed to Azure Static Web Apps only from a reviewed Semantic Version release.
Release Please maintains the release PR, changelog, `vX.Y.Z` tag and GitHub Release; merging an
ordinary feature PR into `main` does not deploy production. See [docs/releases.md](docs/releases.md)
for Conventional Commits, repository setup and immutable-tag rollback.

## Project Structure

- `index.html` — main 3D app
- `biblioteca.html` — Solar System Library
- `src/main.js` — App entry point and scene loop
- `src/solarSystem.js` — planets, moons, orbits, comets, probes
- `src/missionSystem.js` — quests and progression
- `src/i18n.js` — Portuguese / English translations
- `src/data/` — planet and library content
- `public/textures/` — planet textures and NASA photos

## Tech Stack

Three.js · Vite · Vanilla JavaScript (ES modules) · TypeScript (`checkJs` type-checking, no compile step) · Vitest · ESLint

## License

MIT — Created for Gonçalo.
