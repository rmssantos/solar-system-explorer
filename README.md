# 🚀 Solar System Explorer

A 3D educational interactive journey through the Solar System, designed for kids!

## 🌟 Features

- **Interactive 3D Solar System**: Accurate orbits, rotation, and relative sizes.
- **Mission System**: 20+ guided missions to discover planets, moons, and stars.
- **XP & Ranking**: Earn XP, level up from "Space Cadet" to "Space Legend".
- **Bilingual**: Fully supports Portuguese (PT) and English (EN).
- **Planet Comparator**: Compare the size, temperature, and distance of celestial bodies.
- **Photo Mode**: Take snapshots of your discoveries.
- **Collectibles**: Find hidden alien artifacts, stars, and probes.
- **Mini-Map**: Easy navigation radar.
- **Real Data**: Educational facts, "Wow!" facts for kids, and realistic textures (NASA based).
- **PWA Support**: Works offline and can be installed as an App.

## 🎮 Controls

### Mouse / Touch
- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Click Planet**: Select and view info

### Keyboard
- **M**: Toggle Manual Flight Mode
- **Space**: Pause/Resume Orbit Time
- **+ / -**: Speed up / Slow down time
- **W / A / S / D**: Fly spaceship (in Manual Mode)
- **Shift**: Boost Speed
- **Esc**: Recentera view / Close panels

## 🛠️ Installation & Run

1. **Prerequisites**: Python installed (for the simple server).
2. **Start Server**:
   ```bash
   python server.py
   ```
3. **Open Browser**: Go to `http://localhost:8000`

## 📚 Project Structure

- `src/main.js`: Entry point, manages the 3D scene loop.
- `src/solarSystem.js`: Creates planets, moons, orbits, and comets.
- `src/missionSystem.js`: Manages quests and progression.
- `src/ui.js`: Handles the information panel and HUD.
- `src/i18n.js`: Internationalization (PT/EN).
- `src/data/objectsInfo.js`: Planet data and descriptions.

## 🐛 Troubleshooting

- **Missions not completing?** Try exploring the planet info panel fully.
- **Duplicate missions?** Open console (F12) and run `resetMissions()` to reset progress.
- **Textures missing?** Ensure `download_textures.py` was run or you have internet connection for the first load.

---
Created for Gonçalo 🚀✨
