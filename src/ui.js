/**
 * Manages User Interface elements: Window, Panels, HUD.
 * Delegates to focused sub-classes for passport, celebration, and info panel.
 */
import { SOLAR_SYSTEM_DATA, getTranslatedObjectData } from './data/objectsInfo.js';
import { i18n } from './i18n.js';
import { PassportUI } from './passportUI.js';
import { CelebrationUI } from './celebrationUI.js';
import { InfoPanelUI } from './infoPanelUI.js';

export class UIManager {
    constructor(app) {
        this.app = app;

        // Window Controls
        this.windowContainer = document.getElementById('app-window');
        this.windowBody = document.getElementById('window-body');

        // Panels
        this.infoPanel = document.getElementById('info-panel');
        this.btnCloseInfo = document.getElementById('close-info');
        this.infoTitle = document.getElementById('info-title');
        this.infoContent = document.getElementById('info-content');

        this.btnRecenter = document.getElementById('btn-recenter');

        // Sub-UI modules
        this.passport = new PassportUI(app);
        this.celebration = new CelebrationUI(app);
        this.infoPanelUI = new InfoPanelUI(app);

        // Navigation
        this.navigationList = []; // Flattened list of [name, data]
        this.currentIndex = -1;
        this.buildNavigationList();
        this.injectNavigationButtons();

        this.initListeners();

        // Listen for language changes to update passport
        i18n.onLangChange(() => this.updatePassportLanguage());
    }

    buildNavigationList() {
        // Flatten the hierarchy: Sun -> Planet -> Its Moons -> Next Planet
        const processObject = (key, data) => {
            this.navigationList.push({ name: key, data: data });

            if (data.moons) {
                data.moons.forEach(moon => {
                    // Use moon.id if available (new format), otherwise fall back to nome
                    const moonId = moon.id || moon.nome;
                    this.navigationList.push({ name: moonId, data: moon });
                });
            }
        };

        // Assume SOLAR_SYSTEM_DATA keys are in order
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            // Skip space probes and easter eggs (add probes at the end)
            if (data.tipo === 'Sonda Espacial') continue;
            if (data.isEasterEgg) continue; // Hide easter eggs from navigation
            processObject(key, data);
        }

        // Add space probes at the end
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            if (data.tipo === 'Sonda Espacial') {
                this.navigationList.push({ name: key, data: data });
            }
        }
    }

    injectNavigationButtons() {
        const hudPanel = document.getElementById('hud-panel');

        const navContainer = document.createElement('div');
        navContainer.className = 'nav-controls';

        // AudioManager trigger
        const playClick = () => {
            const event = new CustomEvent('app:sound', { detail: 'select' });
            window.dispatchEvent(event);
        };

        const btnPrev = document.createElement('button');
        btnPrev.className = 'nav-arrow';
        btnPrev.innerText = '\u25C0';
        btnPrev.onclick = () => { playClick(); this.navigate(-1); };

        const btnNext = document.createElement('button');
        btnNext.className = 'nav-arrow';
        btnNext.innerText = '\u25B6';
        btnNext.onclick = () => { playClick(); this.navigate(1); };

        const label = document.createElement('span');
        label.innerText = i18n.t('explore');

        navContainer.appendChild(btnPrev);
        navContainer.appendChild(label); // Just space
        navContainer.appendChild(btnNext);

        // Insert before "Recentrar" button
        hudPanel.insertBefore(navContainer, this.btnRecenter);

        // CREATE PASSPORT BAR (delegated)
        this.passport.create();
    }

    // --- Passport delegation (public API preserved) ---

    updatePassport(name, forceUnlock = false) {
        this.passport.update(name, forceUnlock);
    }

    updatePassportLanguage() {
        this.passport.updateLanguage();
    }

    // --- Celebration delegation (public API preserved) ---

    showCelebration(name) {
        this.celebration.show(name);
    }

    // --- Info Panel delegation (public API preserved) ---

    showInfo(objectName) {
        const data = this.findData(objectName);
        if (!data) return;

        // Update navigation index
        const idx = this.navigationList.findIndex(x => x.name === objectName);
        if (idx !== -1) this.currentIndex = idx;

        // Delegate to InfoPanelUI
        this.infoPanelUI.show(objectName, data, this.navigationList);

        // Check if this completes any mission (even if previously visited)
        this.checkMissionForPlanet(objectName);
    }

    closeInfoPanel() {
        this.infoPanelUI.close();
    }

    // --- Listeners ---

    initListeners() {
        // Info Panel close button
        this.btnCloseInfo.addEventListener('click', () => {
            this.closeInfoPanel();
        });

        // Click outside info panel to close (use mousedown to not interfere with orbit controls)
        document.addEventListener('mousedown', (e) => {
            if (!this.infoPanel.classList.contains('hidden')) {
                // Only close if clicking on the canvas background
                if (e.target.tagName === 'CANVAS') {
                    this.closeInfoPanel();
                }
            }
        });

        // Recenter
        this.btnRecenter.addEventListener('click', () => {
            this.app.cameraControls.resetView();
            this.closeInfoPanel();
            this.currentIndex = -1;
        });
    }

    // --- Data helpers ---

    findData(name) {
        // First try to get translated data for main objects (planets, probes, etc.)
        const translated = getTranslatedObjectData(name);
        if (translated) return translated;

        // Fallback for moons - find parent planet, then get translated moon data
        const item = this.navigationList.find(x => x.name === name);
        if (item && item.data) {
            const parentPlanet = this.findParentPlanet(name, item.data);
            if (parentPlanet) {
                const parentData = getTranslatedObjectData(parentPlanet);
                if (parentData && parentData.moons) {
                    // Match by id (e.g. "enceladus") or by nome
                    const moonData = parentData.moons.find(m =>
                        m.id === name ||
                        m.nome === name ||
                        m.nome === item.data.nome
                    );
                    if (moonData) return { ...item.data, ...moonData };
                }
            }
            return item.data;
        }
        return null;
    }

    findParentPlanet(moonName, moonData) {
        // Find which planet this moon belongs to (search by id and nome)
        for (const [planetKey, planetData] of Object.entries(SOLAR_SYSTEM_DATA)) {
            if (planetData.moons) {
                const moon = planetData.moons.find(m =>
                    m.id === moonName ||
                    m.nome === moonName ||
                    (moonData && m.nome === moonData.nome)
                );
                if (moon) return planetKey;
            }
        }
        return null;
    }

    // --- Navigation ---

    navigate(direction) {
        // If nothing selected, start at Sun (index 0)
        if (this.currentIndex === -1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex += direction;
        }

        // Loop
        if (this.currentIndex < 0) this.currentIndex = this.navigationList.length - 1;
        if (this.currentIndex >= this.navigationList.length) this.currentIndex = 0;

        const target = this.navigationList[this.currentIndex];
        this.selectObject(target.name);
    }

    selectObject(name) {
        // Logic to select object in 3D scene + Show Info
        const mesh = this.app.solarSystem.objects[name];
        if (mesh) {
            // Highlight the object
            this.app.solarSystem.highlightObject(mesh);

            // Use fly-to animation if available, otherwise fallback
            if (this.app.cameraControls.flyToObject) {
                this.app.cameraControls.flyToObject(mesh, name);
            } else {
                this.app.cameraControls.setTarget(mesh);
                this.showInfo(name);
            }

            this.updatePassport(name); // Gamification Trigger (Just visual sync here)

            // Play planet-specific ambient sound
            this.app.audioManager?.startPlanetAmbient(name);
        }
    }

    // --- Mission check ---

    checkMissionForPlanet(planetName) {
        // Mission completion is now handled centrally via app:visit event in main.js
        // This avoids duplicate XP awards. Just notify the mission system for tracking.
        if (this.app.missionSystem) {
            this.app.missionSystem.onPlanetInfoViewed(planetName);
        }
    }
}
