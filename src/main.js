/**
 * Main application entry point.
 * Orchestrates Three.js scene, UI, and inputs.
 * Enhanced with gamification for kids!
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { SolarSystem } from './solarSystem.js';
import { CameraControls } from './cameraControls.js';
import { UIManager } from './ui.js';
import { Spaceship } from './spaceship.js';
import { AudioManager } from './audioManager.js';
import { GameManager } from './gameManager.js';
import { WelcomeScreen } from './welcomeScreen.js';
import { MissionSystem } from './missionSystem.js';
import { XPSystem } from './xpSystem.js';
import { QuizSystem } from './quizSystem.js';
import { AchievementSystem } from './achievementSystem.js';
import { PhotoMode } from './photoMode.js';
import { MiniMap } from './miniMap.js';
import { ParticleEffects } from './particleEffects.js';
import { PlanetComparator } from './planetComparator.js';
import { CollectiblesSystem } from './collectibles.js';
import { TimeControlCompact } from './timeControlCompact.js';
import { ModernUI } from './modernUI.js';
import { Toolbar } from './toolbar.js';
import { ManualNavigation } from './manualNavigation.js';
import { UISettings } from './uiSettings.js';
import { resourceManager } from './resourceManager.js';
import { Mascot } from './mascot.js';

import { i18n } from './i18n.js';

// Suppress Three.js NaN warnings (cosmetic issue, doesn't affect rendering)
const originalWarn = console.warn;
console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('computeBoundingSphere')) {
        return; // Silently ignore bounding sphere NaN warnings
    }
    originalWarn.apply(console, args);
};

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;

        this.solarSystem = null;
        this.cameraControls = null;
        this.uiManager = null;
        this.spaceship = null;
        this.audioManager = new AudioManager();
        this.gameManager = new GameManager();
        
        // New game systems
        this.xpSystem = null;
        this.missionSystem = null;
        this.quizSystem = null;
        this.achievementSystem = null;
        this.photoMode = null;
        this.miniMap = null;
        this.particleEffects = null;
        this.planetComparator = null;
        this.collectibles = null;
        this.timeControl = null;
        this.modernUI = null;
        this.toolbar = null;
        this.manualNavigation = null;
        this.mascot = null;
        this.playerName = '';
        this.shipColor = '#ff4444';

        this.clock = new THREE.Clock();
        
        // Resource manager for memory cleanup
        this.resourceManager = resourceManager;

        // Show welcome screen first
        this.showWelcome();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.dispose());
    }

    showWelcome() {
        const welcome = new WelcomeScreen((name, color) => {
            this.playerName = name;
            this.shipColor = color;
            this.init();
        });
        welcome.show();
    }

    async init() {
        console.log(`🚀 Bem-vindo, Capitão ${this.playerName}!`);
        
        try {
            // Initialize game systems
            this.xpSystem = new XPSystem();
            this.missionSystem = new MissionSystem(this.gameManager);
            this.quizSystem = new QuizSystem(this.xpSystem, this.audioManager);
            this.achievementSystem = new AchievementSystem(this.xpSystem, this.audioManager);

            // Setup event listeners for game events
            this.setupGameEventListeners();

            // 1. Setup Basic Scene & Renderer
            this.setupScene();

            // 2. Setup Post-Processing (Bloom)
            this.setupPostProcessing();

            // 2.5. Initialize Particle Effects (needs scene)
            this.particleEffects = new ParticleEffects(this.scene);

            // 3. Initialize Modules
            this.uiManager = new UIManager(this);
            this.cameraControls = new CameraControls(this.camera, this.renderer.domElement, this);
            this.solarSystem = new SolarSystem(this.scene, this.uiManager, this.cameraControls);

            this.cameraControls.setSolarSystem(this.solarSystem);

            // Create Spaceship with custom color
            this.spaceship = new Spaceship(this.scene, this.shipColor);

            // Create 3D world
            await this.solarSystem.createSolarSystem();

            // Initialize comet positions before first render to prevent NaN errors
            if (this.solarSystem.comets) {
                this.solarSystem.updateComets(0.016); // One frame worth of update
            }

            // Force initial render to ensure scene is visible
            if (this.composer) {
                this.composer.render();
            } else if (this.renderer) {
                this.renderer.render(this.scene, this.camera);
            }

            // 4. Start Animation Loop
            this.animate();

            // 5. Setup Event Listeners
            window.addEventListener('resize', () => this.onWindowResize());

            // 6. Start ambient music after first interaction
            this.setupAudioStart();

            // 7. Create settings button
            this.createSettingsUI();

            // 8. Show welcome message
            this.showWelcomeMessage();

            // 9. Restore passport progress from localStorage
            this.restorePassportProgress();

            // 10. Initialize Photo Mode
            this.photoMode = new PhotoMode(this);

            // 11. Initialize Mini Map
            this.miniMap = new MiniMap(this);

            // 12. Initialize Planet Comparator
            this.planetComparator = new PlanetComparator(this);

            // 13. Initialize Collectibles System
            this.collectibles = new CollectiblesSystem(this);

            // 14. Initialize Time Control (compact version)
            this.timeControl = new TimeControlCompact(this);

            // 15. Initialize Modern UI (reorganizes all UI elements)
            this.modernUI = new ModernUI(this);

            // 16. Initialize Toolbar (unified buttons with auto-hide)
            this.toolbar = new Toolbar(this);
            
            // 17. Initialize Manual Navigation (fly your spaceship!)
            this.manualNavigation = new ManualNavigation(this);
            
            // 18. Initialize UI Settings (panel visibility controls)
            this.uiSettings = new UISettings(this);

            // 19. Initialize Mascot (Astro the space guide)
            this.mascot = new Mascot(this);

            // Show welcome message from Astro on first visit
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('app:first-visit'));
            }, 2000);

        } catch (e) {
            console.error("CRITICAL APP ERROR:", e);
            alert("Erro fatal na aplicação. Verifica a consola.");
        }
    }

    setupGameEventListeners() {
        // Listen for Sound Events from UI
        window.addEventListener('app:sound', (e) => {
            const type = e.detail;
            if (type === 'select') this.audioManager.playSelect();
            if (type === 'success') this.audioManager.playSuccess();
            if (type === 'mission') this.audioManager.playMissionComplete();
            if (type === 'levelup') this.audioManager.playLevelUp();
            if (type === 'achievement') this.audioManager.playAchievement();
        });

        // Listen for Planet Discovery
        window.addEventListener('app:visit', (e) => {
            const planetName = e.detail;
            this.handlePlanetDiscovery(planetName);
        });

        // Unlock Audio Context on first interaction
        window.addEventListener('click', () => {
            if (this.audioManager.ctx.state === 'suspended') {
                this.audioManager.ctx.resume();
            }
        }, { once: true });
    }

    handlePlanetDiscovery(planetName) {
        // Play success sound
        this.audioManager.playSuccess();

        // Trigger particle celebration at planet position
        if (this.particleEffects && this.solarSystem) {
            const planetMesh = this.solarSystem.objects[planetName];
            if (planetMesh) {
                const worldPos = new THREE.Vector3();
                planetMesh.getWorldPosition(worldPos);
                this.particleEffects.celebrateDiscovery(worldPos);
            }
        }

        // Check if mission completed
        const completedMission = this.missionSystem.checkMissionComplete(planetName);
        if (completedMission) {
            // Award XP for mission
            setTimeout(() => {
                const result = this.xpSystem.addXP(completedMission.xpReward, `Missão: ${completedMission.title}`);
                
                // Check for level up
                if (result.leveledUp) {
                    this.audioManager.playLevelUp();
                    this.xpSystem.showLevelUp(result.newRank);
                    this.achievementSystem.checkLevel(result.newLevel);
                }
            }, 500);

            // Play mission complete sound
            setTimeout(() => {
                this.audioManager.playMissionComplete();
            }, 1000);
        }

        // Check achievements
        this.achievementSystem.checkPlanetVisit(planetName, this.gameManager.visited);

        // Show quiz after a delay (if available)
        if (this.quizSystem.hasQuiz(planetName)) {
            setTimeout(() => {
                this.quizSystem.showQuiz(planetName, (answered) => {
                    if (answered) {
                        // Check quiz achievements
                        const quizCount = this.quizSystem.answeredQuizzes.size;
                        this.achievementSystem.checkQuizCount(quizCount);
                    }
                });
            }, 4500); // After celebration ends
        }
    }

    setupAudioStart() {
        const startAudio = () => {
            if (this.audioManager.ctx.state === 'suspended') {
                this.audioManager.ctx.resume();
            }
            this.audioManager.startAmbientMusic();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };

        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
    }

    createSettingsUI() {
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'settings-btn';
        settingsBtn.className = 'settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Definições';
        
        settingsBtn.addEventListener('click', () => this.showSettings());
        document.body.appendChild(settingsBtn);
    }

    showSettings() {
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        
        overlay.innerHTML = `
            <div class="settings-panel">
                <h2>⚙️ ${i18n.t('settings')}</h2>
                
                <div class="settings-group">
                    <h3>🌍 ${i18n.t('language')}</h3>
                    <div class="language-selector">
                        <button class="lang-btn ${i18n.lang === 'pt' ? 'active' : ''}" data-lang="pt">🇵🇹 ${i18n.t('lang_pt')}</button>
                        <button class="lang-btn ${i18n.lang === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 ${i18n.t('lang_en')}</button>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>👨‍🚀 ${i18n.t('captain')}</h3>
                    <p class="captain-name">${this.playerName}</p>
                </div>
                
                <div class="settings-group">
                    <h3>🔊 ${i18n.t('sound')}</h3>
                    <label class="settings-toggle">
                        <span>🎵 ${i18n.t('music')}</span>
                        <input type="checkbox" id="toggle-music" ${this.audioManager.musicEnabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <label class="settings-toggle">
                        <span>🔔 ${i18n.t('sfx')}</span>
                        <input type="checkbox" id="toggle-sfx" ${this.audioManager.sfxEnabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="settings-group">
                    <h3>📊 ${i18n.t('progress')}</h3>
                    <p>${i18n.t('planets_discovered')}: ${this.gameManager.visited.size}</p>
                    <p>XP Total: ${this.xpSystem.xp}</p>
                    <p>${i18n.t('level')}: ${this.xpSystem.level}</p>
                    <p>${i18n.t('missions_complete')}: ${this.missionSystem.completedMissions.size}/${this.missionSystem.missions.length}</p>
                </div>
                
                <div class="settings-buttons">
                    <button class="settings-close-btn">${i18n.t('close')}</button>
                    <button class="settings-reset-btn">🗑️ ${i18n.t('reset_progress')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        // Language selector
        overlay.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                i18n.setLang(lang);
                overlay.remove();
                this.showSettings(); // Re-render with new language
            });
        });

        // Event listeners
        overlay.querySelector('#toggle-music').addEventListener('change', (e) => {
            this.audioManager.toggleMusic();
        });

        overlay.querySelector('#toggle-sfx').addEventListener('change', (e) => {
            this.audioManager.toggleSFX();
        });

        overlay.querySelector('.settings-close-btn').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        });

        overlay.querySelector('.settings-reset-btn').addEventListener('click', () => {
            if (confirm(i18n.t('confirm_reset'))) {
                try {
                    localStorage.clear();
                } catch (e) {
                    console.warn('[App] Failed to clear storage:', e.message);
                }
                location.reload();
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.remove(), 300);
            }
        });
    }

    showWelcomeMessage() {
        const rank = this.xpSystem.getCurrentRank();
        const rankName = this.xpSystem.getRankName(rank);
        const toast = document.createElement('div');
        toast.className = 'welcome-toast';
        toast.innerHTML = `
            <span class="toast-icon">🚀</span>
            <span class="toast-text">${i18n.t('welcome_back')}, ${rank.icon} ${rankName} ${this.playerName}!</span>
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    restorePassportProgress() {
        // Load saved visited planets from localStorage
        this.gameManager.loadProgress();
        
        // Sync UI badges with saved state
        const visitedPlanets = this.gameManager.getVisitedList();
        visitedPlanets.forEach(planetName => {
            this.uiManager.updatePassport(planetName);
        });
        
        console.log(`📛 Passaporte restaurado: ${visitedPlanets.length} planetas visitados`);
    }

    setupScene() {
        this.scene = new THREE.Scene();

        const fov = 45;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const near = 0.1;
        const far = 5000000; // Extended for manual navigation with 150x scale (Neptune at ~1.3M units)
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 400, 800);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: true // Required for screenshots
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ReinhardToneMapping; // Better for bloom

        // SHADOWS ENABLED
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Reduced ambient to make shadows visible (night side dark)
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 3.0, 0, 0.5); // Sun decay logic
        sunLight.position.set(0, 0, 0);

        // SUN CASTS SHADOWS
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048; // Balanced quality/performance
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 100;
        sunLight.shadow.camera.far = 20000;
        sunLight.shadow.bias = -0.0001;

        this.scene.add(sunLight);

        // Ship Light (fill light for the ship itself)
        const shipLight = new THREE.PointLight(0xccddff, 0.8, 50);
        this.camera.add(shipLight); // Add to camera so it lights up whatever we are near (ship)
        this.scene.add(this.camera);
    }

    setupPostProcessing() {
        const renderScene = new RenderPass(this.scene, this.camera);

        // Resolution, Strength, Radius, Threshold
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
            1.5, // Strength (Glow intensity)
            0.4, // Radius
            0.85 // Threshold (High threshold so only bright things glow)
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    animate() {
        // Stop animation if disposed
        if (this.isDisposed) return;
        
        requestAnimationFrame(() => this.animate());

        let deltaTime = this.clock.getDelta();
        
        // Apply time scale from TimeControl
        const timeScale = this.timeControl ? this.timeControl.getTimeScale() : 1;
        const scaledDeltaTime = deltaTime * timeScale;

        // Systems that should respect time scale (orbital movements, etc.)
        if (this.solarSystem) this.solarSystem.update(scaledDeltaTime);
        
        // Spaceship follows camera - check if moving fast in manual navigation
        const isMovingFast = this.manualNavigation?.enabled && this.manualNavigation?.currentSpeed > 100;
        if (this.spaceship) this.spaceship.update(deltaTime, this.camera, isMovingFast);
        
        // Systems that should always run at normal speed
        if (this.cameraControls && !this.manualNavigation?.enabled) {
            this.cameraControls.update(deltaTime);
        }
        if (this.manualNavigation) this.manualNavigation.update(deltaTime);
        if (this.particleEffects) this.particleEffects.update(deltaTime);
        if (this.collectibles) this.collectibles.update(deltaTime);

        // Render via Composer for Bloom
        if (this.composer && !this.isDisposed) {
            this.composer.render();
        } else if (this.renderer && !this.isDisposed) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Dispose all resources to prevent memory leaks
     * Called on page unload or when app is destroyed
     */
    dispose() {
        console.log('🧹 Cleaning up app resources...');

        // Mark as disposed to stop animation loop
        this.isDisposed = true;

        // Stop animation loop
        this.clock.stop();

        // Dispose resource manager (textures, geometries, materials)
        if (this.resourceManager) {
            this.resourceManager.logStats();
            this.resourceManager.disposeAll();
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            // Note: forceContextLoss removed - was causing issues on page navigation
        }

        // Dispose composer
        if (this.composer) {
            this.composer.dispose();
        }

        // Close audio context
        if (this.audioManager && this.audioManager.ctx) {
            this.audioManager.ctx.close();
        }

        console.log('✅ App cleanup complete');
    }
}

function cleanupDynamicUI() {
    // ONLY remove dynamically created elements - NOT original HTML elements!
    // These are elements created by JavaScript modules, not in index.html

    const dynamicElementIds = [
        'settings-btn',
        'achievements-btn',
        'minimap-container',
        'manual-nav-styles',
        'modern-ui-styles',
        'toolbar-styles',
        'ui-settings-styles',
        'xp-panel',
        'passport-panel',
        'mission-panel',
        'time-control-compact',
        'main-toolbar',
        'photo-btn',
        'gallery-btn',
        'compare-btn',
        'comparator-overlay',
        'lang-selector'
    ];

    dynamicElementIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`🗑️ Removing element with ID: ${id}`);
            el.remove();
        }
    });

    // Remove overlay/notification elements by class
    const dynamicClasses = [
        'settings-overlay',
        'welcome-overlay',
        'welcome-toast',
        'achievement-notification',
        'achievements-panel-overlay',
        'xp-notification',
        'mission-complete-overlay',
        'quiz-overlay',
        'photo-flash',
        'photo-toast',
        'gallery-overlay',
        'level-up-overlay',
        'collectibles-counter',
        'collectibles-modal',
        'collectible-notification',
        'manual-nav-toggle',
        'manual-nav-hud'
    ];

    dynamicClasses.forEach(className => {
        const elements = document.querySelectorAll('.' + className);
        if (elements.length > 0) {
            console.log(`🗑️ Removing ${elements.length} elements with class: ${className}`);
        }
        elements.forEach(el => el.remove());
    });

    // Remove manual-nav class from body
    document.body.classList.remove('manual-nav-active');

    // Remove old canvas
    const container = document.getElementById('canvas-container');
    if (container) {
        const canvas = container.querySelector('canvas');
        if (canvas) canvas.remove();
    }

    // Reset info-panel to hidden (it's in original HTML, don't remove!)
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        infoPanel.classList.add('hidden');
    }

    console.log('🧹 Dynamic UI elements cleaned up');
}

function initApp() {
    // Clean up any existing app instance (prevents issues on navigation)
    if (window.app && typeof window.app.dispose === 'function') {
        try {
            window.app.dispose();
        } catch (e) {
            console.warn('Error disposing previous app:', e);
        }
    }

    // Clean up all dynamic UI elements
    cleanupDynamicUI();

    window.app = new App();
}

document.addEventListener('DOMContentLoaded', initApp);

// Handle bfcache (back-forward cache) - reinitialize when page is restored from cache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        console.log('📦 Page restored from bfcache, reinitializing...');
        initApp();
    }
});
