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
- `W A S D` — fly spaceship (manual mode)
- `Shift` — boost
- `Esc` — recenter / close panels

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
npm test         # run tests
```

## Deployment

Deployed automatically to Azure Static Web Apps on push to `main` via GitHub Actions
(see [.github/workflows](.github/workflows/)). Build output (`dist/`) is served with the
configuration in [staticwebapp.config.json](staticwebapp.config.json).

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

Three.js · Vite · Vanilla JavaScript (ES modules) · TypeScript (type checking only) · Vitest

## License

MIT — Created for Gonçalo.
