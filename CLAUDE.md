# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solar System Explorer - an educational 3D interactive game for kids (target age ~8) to explore the Solar System. Built with Three.js and Vite, featuring bilingual support (Portuguese/English), gamification (XP, missions, achievements), and NASA-based textures.

## Commands

```bash
npm run dev      # Start development server with HMR (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

Alternative: `python server.py` serves on port 8000 (legacy method from README).

## Architecture

### Entry Points
- `index.html` - Main 3D application
- `biblioteca.html` - Solar System Library (encyclopedia page)

### Core Application (`src/main.js`)
The `App` class orchestrates all systems. Key initialization order:
1. `WelcomeScreen` - Player name/ship color selection
2. Three.js scene setup with post-processing (bloom effects)
3. Game systems: `XPSystem`, `MissionSystem`, `QuizSystem`, `AchievementSystem`
4. 3D world: `SolarSystem`, `CameraControls`, `Spaceship`
5. UI modules: `PhotoMode`, `MiniMap`, `PlanetComparator`, `Toolbar`, `ModernUI`
6. `ManualNavigation` - WASD flight controls (toggle with M key)

### Key Modules
- **`solarSystem.js`**: Creates all celestial bodies (planets, moons, asteroids, probes, UFO easter egg). Planet data from `data/objectsInfo.js`
- **`i18n.js`**: Internationalization system. All UI strings use `i18n.t('key')`. Translations defined in `TRANSLATIONS` object
- **`missionSystem.js`**: 20+ guided missions with XP rewards
- **`cameraControls.js`**: Orbit controls, planet selection via raycasting
- **`resourceManager.js`**: Centralized texture/geometry disposal to prevent memory leaks

### Data Files
- `src/data/objectsInfo.js` - Portuguese planet data (descriptions, stats, curiosities)
- `src/data/objectsInfoEN.js` - English planet data
- `src/data/bibliotecaData.js` - Encyclopedia data for biblioteca.html

### Asset Structure
- `public/textures/` - Planet surface textures
- `public/textures/real/` - Real NASA photos for encyclopedia
- `styles/` - CSS files (style.css for main app, biblioteca.css for library)

## Code Patterns

### Event Communication
Custom events for decoupled communication:
```javascript
window.dispatchEvent(new CustomEvent('app:visit', { detail: planetName }));
window.dispatchEvent(new CustomEvent('app:sound', { detail: 'success' }));
```

### Adding Translations
Add keys to both `pt` and `en` objects in `src/i18n.js`, then use `i18n.t('key')`.

### Time-Scaled vs Real-Time Updates
In the animation loop, `scaledDeltaTime` (affected by time controls) is used for orbital movements. Regular `deltaTime` is used for camera, spaceship, and UI updates.

## Writing Style for Content

This is a kids' educational app. Content should be:
- Enthusiastic with emojis in "Wow Facts"
- Use comparisons to everyday objects (e.g., "If the Sun were a soccer ball...")
- Avoid overly technical language
- Simplified numbers when possible

## Git Commits

When making commits:
- Do NOT add "Co-Authored-By" or "Generated with Claude" lines
- Keep commit messages clean and descriptive
