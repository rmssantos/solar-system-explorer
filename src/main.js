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
import { MissionOverlay } from './missionOverlay.js';
import { MissionIndicator } from './missionIndicator.js';

import { CertificateGenerator } from './certificateGenerator.js';
import { ShareManager } from './shareManager.js';
import { CanvasMirror } from './canvasMirror.js';
import { PWAUI } from './pwaUI.js';
import { FtueOrchestrator } from './ftueOrchestrator.js';

import { i18n } from './i18n.js';
import * as storage from './utils/storage.js';
import { showOverlay } from './overlay.js';


export class App {
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
        this.missionOverlay = null;
        this.missionIndicator = null;
        this.certificateGenerator = null;
        this.shareManager = null;
        this.playerName = '';
        this.shipColor = '#ff4444';

        this.clock = new THREE.Clock();
        this._quizTimeout = null;

        // Adaptive performance / quality (no UI; automatic)
        // Touch devices start at medium; adaptive system promotes to high if FPS allows.
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.qualityLevel = isTouchDevice ? 1 : 2; // 0=low, 1=medium, 2=high
        this.postFxScale = 1.0;
        this.bloomPass = null;
        this.sunLight = null;
        this._fpsWindowTime = 0;
        this._fpsWindowFrames = 0;
        this._fpsSmoothed = 60;
        this._qualityCooldown = 0;
        
        // Resource manager for memory cleanup
        this.resourceManager = resourceManager;

        // One controller tears down every window/document listener this App
        // registers. Critical for bfcache restores: a second App is created on
        // pageshow and the old one's app:visit handler would otherwise keep
        // awarding XP and racing localStorage writes forever.
        this._abort = new AbortController();

        // Show welcome screen first
        this.showWelcome();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.dispose(), { signal: this._abort.signal });
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
        // Show loading overlay
        this.showLoadingOverlay();

        // Game systems load persisted state first. A corrupt save must reset
        // cleanly instead of bricking the app on every subsequent launch —
        // losing progress beats a permanently dead app.
        try {
            storage.migrateSchema();
            this.xpSystem = new XPSystem();
            this.missionSystem = new MissionSystem(this.gameManager);
            this.quizSystem = new QuizSystem(this.xpSystem, this.audioManager);
            this.achievementSystem = new AchievementSystem(this.xpSystem, this.audioManager);
        } catch (e) {
            console.error('[App] Failed to load save data, resetting:', e);
            this.recoverFromCorruptSave(e);
            return;
        }

        // Core: scene, renderer, world. A failure here is genuinely fatal.
        try {
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

            // Hide loading overlay (textures may still be loading async)
            this.hideLoadingOverlay();

            // 4. Start Animation Loop
            this.animate();

            // 5. Setup Event Listeners
            window.addEventListener('resize', () => this.onWindowResize(), { signal: this._abort.signal });
        } catch (e) {
            console.error('CRITICAL APP ERROR:', e);
            this.showFatalErrorScreen(e);
            return;
        }

        // Optional UI/cosmetic systems: a failure in any of these must log and
        // move on — it must NOT take down the working 3D app, the FTUE, or
        // keyboard accessibility (a single try/catch around all of init used
        // to do exactly that, ending in an untranslated alert()).
        const optional = (label, fn) => {
            try {
                fn();
            } catch (e) {
                console.warn(`[App] Optional init step "${label}" failed:`, e);
            }
        };

        // 5.5. Game-system UI panels (XP, mission, achievements). Their
        //      constructors no longer create DOM, so the progression logic
        //      stays unit-testable; the panels are built here instead.
        optional('gameSystemsUI', () => {
            this.xpSystem.createUI();
            this.missionSystem.createUI();
            this.achievementSystem.createUI();
        });

        // 6. Start ambient music after first interaction
        optional('audio', () => this.setupAudioStart());

        // 7. Create settings button
        optional('settings', () => this.createSettingsUI());

        // 8. Restore passport progress from localStorage. Done before the FTUE
        //    orchestrator runs so it can tell first-time vs returning users.
        optional('passport', () => this.restorePassportProgress());

        // 10. Photo Mode
        optional('photoMode', () => { this.photoMode = new PhotoMode(this); });

        // 11. Mini Map
        optional('miniMap', () => { this.miniMap = new MiniMap(this); });

        // 12. Planet Comparator
        optional('planetComparator', () => { this.planetComparator = new PlanetComparator(this); });

        // 13. Collectibles System
        optional('collectibles', () => { this.collectibles = new CollectiblesSystem(this); });

        // 14. Time Control (compact version)
        optional('timeControl', () => { this.timeControl = new TimeControlCompact(this); });

        // 15. Modern UI (reorganizes all UI elements)
        optional('modernUI', () => { this.modernUI = new ModernUI(this); });

        // 16. Toolbar (unified buttons with auto-hide)
        optional('toolbar', () => { this.toolbar = new Toolbar(this); });

        // 17. Manual Navigation (fly your spaceship!)
        optional('manualNavigation', () => { this.manualNavigation = new ManualNavigation(this); });

        // 18. UI Settings (panel visibility controls)
        optional('uiSettings', () => { this.uiSettings = new UISettings(this); });

        // 19. Mascot (Astro the space guide). The FTUE orchestrator decides
        //     when (and whether) to show the first-visit greeting.
        optional('mascot', () => { this.mascot = new Mascot(this); });

        // 20. Global keyboard accessibility (Enter/Space on role="button")
        optional('accessibilityKeyboard', () => this.setupAccessibilityKeyboard());

        // 21. Mission Overlay instance (shown by FTUE orchestrator).
        optional('missionOverlay', () => { this.missionOverlay = new MissionOverlay(); });

        // 23. Mission Indicator - 3D arrow pointing to target planet
        optional('missionIndicator', () => {
            this.missionIndicator = new MissionIndicator(
                this.camera,
                this.solarSystem.objects,
                this.missionSystem
            );
        });

        // 24. Certificate Generator & Share Manager
        optional('certificate', () => { this.certificateGenerator = new CertificateGenerator(); });
        optional('share', () => { this.shareManager = new ShareManager(); });

        // 25. Accessibility mirror tree for the 3D canvas (screen reader / keyboard).
        optional('canvasMirror', () => { this.canvasMirror = new CanvasMirror(this); });

        // 26. PWA UI: install prompt button + SW update banner.
        optional('pwaUI', () => { this.pwaUI = new PWAUI(); });

        // 27. Endgame listener: certificate screen after all missions complete.
        window.addEventListener('app:all-missions-complete', () => {
            setTimeout(() => this.showCompletionScreen(), 2000);
        }, { signal: this._abort.signal });

        // 28. FTUE orchestrator — sequences welcome / mascot intro / tutorial /
        //     mission overlay so they never stack. Replaces 4 parallel setTimeouts.
        optional('ftue', () => {
            this.ftue = new FtueOrchestrator(this);
            // Fire-and-forget; the orchestrator awaits each step internally.
            this.ftue.run().then(() => {
                // 29. Daily Challenge — only if all missions already complete. Deferred
                //     until after the FTUE so it never lands on top of onboarding popups.
                if (this.missionSystem.completedMissions.size === this.missionSystem.missions.length) {
                    this.showDailyChallenge();
                }
            }).catch((e) => console.warn('[FTUE] run failed:', e));
        });

        // Successful boot: clear the corrupt-save recovery guard and tell the
        // pre-boot error handler (public/init.js) to stand down.
        window.__appBooted = true;
        try {
            sessionStorage.removeItem('spaceExplorer_recovering');
        } catch {
            // Ignore
        }
    }

    /**
     * A save-data load threw: wipe app storage and reload once. The
     * sessionStorage flag prevents an infinite reload loop if wiping
     * does not help.
     */
    recoverFromCorruptSave(error) {
        let alreadyTried;
        try {
            alreadyTried = sessionStorage.getItem('spaceExplorer_recovering') === '1';
            sessionStorage.setItem('spaceExplorer_recovering', '1');
        } catch {
            // sessionStorage unavailable: fall through to error screen
            alreadyTried = true;
        }

        try {
            storage.clearAll();
        } catch {
            // Ignore
        }

        if (!alreadyTried) {
            location.reload();
        } else {
            this.showFatalErrorScreen(error);
        }
    }

    /**
     * Kid-friendly fatal error screen. Bilingual on purpose: it must work
     * even when i18n (or anything else) is part of the failure.
     */
    showFatalErrorScreen(error) {
        this.hideLoadingOverlay();
        if (document.getElementById('fatal-error-screen')) return;

        const overlay = document.createElement('div');
        overlay.id = 'fatal-error-screen';
        overlay.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;text-align:center;padding:24px;font-family:system-ui,sans-serif;color:#e2e8f0;';

        const emoji = document.createElement('div');
        emoji.style.cssText = 'font-size:4rem;margin-bottom:16px;';
        emoji.textContent = '🚀💥';
        overlay.appendChild(emoji);

        const title = document.createElement('h1');
        title.style.cssText = 'font-size:1.5rem;margin:0 0 8px;color:#ffd700;';
        title.textContent = 'Houston, temos um problema!';
        overlay.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'margin:0 0 20px;color:#94a3b8;';
        subtitle.textContent = 'Houston, we have a problem!';
        overlay.appendChild(subtitle);

        const detail = document.createElement('p');
        detail.style.cssText = 'font-size:0.75rem;color:#64748b;max-width:480px;word-break:break-word;margin:0 0 24px;';
        detail.textContent = String(error?.message || error || 'Unknown error');
        overlay.appendChild(detail);

        const reloadBtn = document.createElement('button');
        reloadBtn.style.cssText = 'background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:8px;padding:12px 32px;color:white;font-size:1.1rem;cursor:pointer;font-weight:bold;';
        reloadBtn.textContent = '🔄 Recarregar / Reload';
        reloadBtn.addEventListener('click', () => location.reload());
        overlay.appendChild(reloadBtn);

        document.body.appendChild(overlay);
    }

    setupGameEventListeners() {
        const signal = this._abort.signal;

        // Listen for Sound Events from UI
        window.addEventListener('app:sound', (/** @type {CustomEvent} */ e) => {
            const type = e.detail;
            if (type === 'select') this.audioManager.playSelect();
            if (type === 'success') this.audioManager.playSuccess();
            if (type === 'mission') this.audioManager.playMissionComplete();
            if (type === 'levelup') this.audioManager.playLevelUp();
            if (type === 'achievement') this.audioManager.playAchievement();
        }, { signal });

        // Listen for Planet Discovery
        window.addEventListener('app:visit', (/** @type {CustomEvent} */ e) => {
            const planetName = e.detail;
            this.handlePlanetDiscovery(planetName);
        }, { signal });

        // Unlock Audio Context on first interaction
        window.addEventListener('click', () => {
            if (this.audioManager.ctx?.state === 'suspended') {
                this.audioManager.ctx.resume();
            }
        }, { once: true, signal });

        // Duck music slightly during manual navigation for clarity
        window.addEventListener('manualNavModeChanged', (/** @type {CustomEvent} */ e) => {
            this.audioManager?.setManualMode?.(e.detail?.active);
        }, { signal });
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

        // Refresh accessible mirror tree so visited state updates for AT users.
        this.canvasMirror?.refresh();

        // Quiz is now integrated into the info panel slides (quiz slide).
        // The old delayed overlay is no longer triggered here.
    }

    setupAudioStart() {
        const startAudio = () => {
            this.audioManager._initContext();
            if (this.audioManager.ctx?.state === 'suspended') {
                this.audioManager.ctx.resume();
            }
            this.audioManager.startAmbientMusic();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };

        document.addEventListener('click', startAudio, { signal: this._abort.signal });
        document.addEventListener('keydown', startAudio, { signal: this._abort.signal });
    }

    createSettingsUI() {
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'settings-btn';
        settingsBtn.className = 'settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Definições';
        settingsBtn.setAttribute('aria-label', i18n.t('aria_settings'));

        settingsBtn.addEventListener('click', () => this.showSettings());
        document.body.appendChild(settingsBtn);
    }

    showSettings() {
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
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
                    <p class="captain-name"></p>
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

                    <div class="settings-sliders">
                        <div class="settings-slider-row">
                            <div class="settings-slider-label">${i18n.t('master')} ${i18n.t('volume')}</div>
                            <input type="range" id="vol-master" min="0" max="100" value="${Math.round((this.audioManager.getMasterVolume?.() ?? 0.3) * 100)}" />
                        </div>
                        <div class="settings-slider-row">
                            <div class="settings-slider-label">🎵 ${i18n.t('music')} ${i18n.t('volume')}</div>
                            <input type="range" id="vol-music" min="0" max="100" value="${Math.round((this.audioManager.getMusicVolume?.() ?? 0.15) * 100)}" />
                        </div>
                        <div class="settings-slider-row">
                            <div class="settings-slider-label">🔔 ${i18n.t('sfx')} ${i18n.t('volume')}</div>
                            <input type="range" id="vol-sfx" min="0" max="100" value="${Math.round((this.audioManager.getSFXVolume?.() ?? 0.4) * 100)}" />
                        </div>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>🔊 ${i18n.t('tts_settings')}</h3>
                    <div class="settings-slider-row">
                        <div class="settings-slider-label">${i18n.t('tts_voice')}</div>
                        <select id="tts-voice-select" class="settings-select"></select>
                    </div>
                    <div class="settings-slider-row">
                        <div class="settings-slider-label">${i18n.t('tts_speed')}</div>
                        <input type="range" id="tts-rate" min="50" max="150" value="${Math.round((this.uiManager?.infoPanelUI?.tts?.rate ?? 0.9) * 100)}" />
                    </div>
                    <button class="modern-btn" id="tts-test-btn" style="margin-top:8px;font-size:0.85rem;">🔊 ${i18n.t('tts_test')}</button>
                </div>

                <div class="settings-group">
                    <h3>♿ ${i18n.t('settings_high_contrast')}</h3>
                    <label class="settings-toggle">
                        <span>🔲 ${i18n.t('settings_high_contrast')}</span>
                        <input type="checkbox" id="toggle-high-contrast" ${document.body.classList.contains('high-contrast') ? 'checked' : ''}>
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
        `;

        // Shared helper: dialog semantics, focus trap, Esc + backdrop close.
        const { overlay, close } = showOverlay(panel, { className: 'settings-overlay' });

        // Safely set player name (avoid XSS via innerHTML)
        const captainNameEl = overlay.querySelector('.captain-name');
        if (captainNameEl) captainNameEl.textContent = this.playerName;

        // TTS voice selector
        const ttsSelect = /** @type {HTMLSelectElement} */ (overlay.querySelector('#tts-voice-select'));
        const ttsManager = this.uiManager?.infoPanelUI?.tts;
        if (ttsSelect && ttsManager) {
            const voices = ttsManager.getVoicesForCurrentLang();
            const currentVoiceName = ttsManager.selectedVoiceName;
            if (voices.length === 0) {
                const opt = document.createElement('option');
                opt.textContent = i18n.t('tts_not_supported');
                ttsSelect.appendChild(opt);
                ttsSelect.disabled = true;
            } else {
                voices.forEach(voice => {
                    const opt = document.createElement('option');
                    opt.value = voice.name;
                    opt.textContent = `${voice.name} (${voice.lang})`;
                    if (voice.name === currentVoiceName) opt.selected = true;
                    ttsSelect.appendChild(opt);
                });
                ttsSelect.addEventListener('change', () => ttsManager.setVoice(ttsSelect.value));
            }
        }
        const ttsRateSlider = /** @type {HTMLInputElement} */ (overlay.querySelector('#tts-rate'));
        if (ttsRateSlider && ttsManager) {
            ttsRateSlider.addEventListener('input', () => ttsManager.setRate(Number(ttsRateSlider.value) / 100));
        }
        const ttsTestBtn = overlay.querySelector('#tts-test-btn');
        if (ttsTestBtn && ttsManager) {
            ttsTestBtn.addEventListener('click', () => {
                ttsManager.speak(i18n.t('tts_test_phrase'));
            });
        }

        // Language selector
        overlay.querySelectorAll('.lang-btn').forEach((/** @type {HTMLElement} */ btn) => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                i18n.setLang(lang);
                close();
                this.showSettings(); // Re-render with new language
            });
        });

        // Event listeners
        overlay.querySelector('#toggle-music').addEventListener('change', () => {
            this.audioManager.toggleMusic();
        });

        overlay.querySelector('#toggle-sfx').addEventListener('change', () => {
            this.audioManager.toggleSFX();
        });

        // High contrast toggle
        const highContrastToggle = /** @type {HTMLInputElement} */ (overlay.querySelector('#toggle-high-contrast'));
        highContrastToggle.addEventListener('change', () => {
            document.body.classList.toggle('high-contrast', highContrastToggle.checked);
            try {
                localStorage.setItem('spaceExplorer_highContrast', highContrastToggle.checked ? 'true' : 'false');
            } catch (err) {
                // Ignore storage errors
            }
        });

        // Volume sliders
        const masterSlider = /** @type {HTMLInputElement} */ (overlay.querySelector('#vol-master'));
        const musicSlider = /** @type {HTMLInputElement} */ (overlay.querySelector('#vol-music'));
        const sfxSlider = /** @type {HTMLInputElement} */ (overlay.querySelector('#vol-sfx'));

        if (masterSlider) {
            masterSlider.addEventListener('input', () => {
                this.audioManager.setMasterVolume(Number(masterSlider.value) / 100);
            });
        }
        if (musicSlider) {
            musicSlider.addEventListener('input', () => {
                this.audioManager.setMusicVolume(Number(musicSlider.value) / 100);
            });
        }
        if (sfxSlider) {
            sfxSlider.addEventListener('input', () => {
                this.audioManager.setSFXVolume(Number(sfxSlider.value) / 100);
            });
        }

        overlay.querySelector('.settings-close-btn').addEventListener('click', () => close());

        overlay.querySelector('.settings-reset-btn').addEventListener('click', () => {
            if (confirm(i18n.t('confirm_reset'))) {
                try {
                    storage.clearAll();
                } catch (e) {
                    console.warn('[App] Failed to clear storage:', e.message);
                }
                location.reload();
            }
        });
    }

    restorePassportProgress() {
        // Load saved visited planets from localStorage
        this.gameManager.loadProgress();
        
        // Sync UI badges with saved state
        const visitedPlanets = this.gameManager.getVisitedList();
        visitedPlanets.forEach(planetName => {
            this.uiManager.updatePassport(planetName);
        });
        
    }

    showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0e1a;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10000;transition:opacity 0.5s;';
        overlay.innerHTML = `
            <div style="font-size:3rem;margin-bottom:1rem;">🚀</div>
            <div id="loading-message" style="color:#e2e8f0;font-family:system-ui;font-size:1.2rem;margin-bottom:1.5rem;"></div>
            <div style="width:200px;height:4px;background:#1a2237;border-radius:2px;overflow:hidden;">
                <div id="loading-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#6366f1,#a855f7);border-radius:2px;transition:width 0.3s;"></div>
            </div>
            <div id="loading-text" style="color:#94a3b8;font-size:0.8rem;margin-top:0.5rem;">0%</div>
        `;
        document.body.appendChild(overlay);
        // Set loading text via i18n (after DOM creation)
        const msgEl = overlay.querySelector('#loading-message');
        if (msgEl) msgEl.textContent = i18n.t('loading_solar_system');
        this._loadingOverlay = overlay;

        // Listen for texture loading progress
        this._onLoadProgress = (e) => {
            const bar = document.getElementById('loading-bar');
            const text = document.getElementById('loading-text');
            if (bar) bar.style.width = `${Math.round(e.detail.progress * 100)}%`;
            if (text) text.textContent = `${Math.round(e.detail.progress * 100)}%`;
        };
        window.addEventListener('loading:progress', this._onLoadProgress, { signal: this._abort.signal });
    }

    hideLoadingOverlay() {
        window.removeEventListener('loading:progress', this._onLoadProgress);
        if (this._loadingOverlay) {
            this._loadingOverlay.style.opacity = '0';
            setTimeout(() => this._loadingOverlay?.remove(), 500);
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();

        const fov = 45;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const near = 0.1;
        const far = 5000000; // Extended for manual navigation (system is scaled up in manual mode)
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 400, 800);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            // preserveDrawingBuffer was true for PhotoMode screenshots, paid per-frame
            // GPU cost. PhotoMode now renders + toDataURL synchronously in the same
            // task, which captures the just-drawn buffer without the permanent flag.
            preserveDrawingBuffer: false,
            // Mitigates z-fighting in manual mode where camera.far reaches 5,000,000
            // and the scaled solar system spans orders of magnitude. Slight per-fragment
            // cost on mid-tier GPUs but the depth precision win at scale is decisive.
            logarithmicDepthBuffer: true,
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        // Cap DPR for performance on HiDPI screens (especially mobile)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ReinhardToneMapping; // Better for bloom

        // No shadow maps: at this scene scale a whole planet's shadow fell
        // under one shadow-map texel (invisible), while the depth pass + PCF
        // sampling were among the largest recurring GPU costs on tablets.
        // The day/night look comes from the PointLight at the origin.

        this.container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Reduced ambient to make shadows visible (night side dark)
        this.scene.add(ambientLight);

        // Directional fill from above the orbital plane
        const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
        sunLight.position.set(0, 500, 0); // Above the solar system

        // PointLight at origin for correct radial lighting from sun
        const sunPointLight = new THREE.PointLight(0xffffff, 2.0, 0, 0.5);
        sunPointLight.position.set(0, 0, 0);
        this.scene.add(sunPointLight);

        this.scene.add(sunLight);
        this.sunLight = sunLight;

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

        this.bloomPass = bloomPass;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // Apply current quality settings (handles post-fx scale)
        this.applyQualitySettings(this.qualityLevel);
    }

    applyQualitySettings(level) {
        this.qualityLevel = Math.max(0, Math.min(2, level));

        // Post-processing resolution scale (render smaller, upscale)
        this.postFxScale = this.qualityLevel === 2 ? 1.0 : (this.qualityLevel === 1 ? 0.75 : 0.6);

        // Bloom tuning
        if (this.bloomPass) {
            // Keep bloom on for medium/high, disable on low
            this.bloomPass.enabled = this.qualityLevel >= 1;
            if (this.qualityLevel === 2) {
                this.bloomPass.strength = 1.7;
                this.bloomPass.radius = 0.45;
                this.bloomPass.threshold = 0.8;
            } else if (this.qualityLevel === 1) {
                this.bloomPass.strength = 1.2;
                this.bloomPass.radius = 0.4;
                this.bloomPass.threshold = 0.85;
            }
        }

        // Update composer resolution scale
        if (this.composer) {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.composer.setSize(Math.max(1, Math.floor(width * this.postFxScale)), Math.max(1, Math.floor(height * this.postFxScale)));
        }
    }

    updateAdaptiveQuality(deltaTime) {
        // Evaluate FPS over a 1s window, then adjust with hysteresis + cooldown
        this._fpsWindowTime += deltaTime;
        this._fpsWindowFrames += 1;
        this._qualityCooldown -= deltaTime;

        if (this._fpsWindowTime < 1.0) return;

        const fps = this._fpsWindowFrames / this._fpsWindowTime;
        // Exponential smoothing to avoid oscillation
        this._fpsSmoothed = this._fpsSmoothed * 0.7 + fps * 0.3;

        this._fpsWindowTime = 0;
        this._fpsWindowFrames = 0;

        if (this._qualityCooldown > 0) return;

        // Thresholds tuned for typical 60fps targets
        const lowerThreshold = 40;
        const raiseThreshold = 55;

        if (this._fpsSmoothed < lowerThreshold && this.qualityLevel > 0) {
            this.applyQualitySettings(this.qualityLevel - 1);
            this._qualityCooldown = 3.0;
        } else if (this._fpsSmoothed > raiseThreshold && this.qualityLevel < 2) {
            this.applyQualitySettings(this.qualityLevel + 1);
            this._qualityCooldown = 5.0;
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (this.composer) {
            // Keep post-fx scaled resolution in sync
            const scaledW = Math.max(1, Math.floor(width * this.postFxScale));
            const scaledH = Math.max(1, Math.floor(height * this.postFxScale));
            this.composer.setSize(scaledW, scaledH);

            // Also update bloom pass internal resolution
            if (this.bloomPass) {
                this.bloomPass.resolution.set(scaledW, scaledH);
            }
        }
    }

    animate() {
        // Stop animation if disposed
        if (this.isDisposed) return;
        
        requestAnimationFrame(() => this.animate());

        let deltaTime = this.clock.getDelta();

        // Apply time scale from TimeControl
        const timeScale = this.timeControl ? this.timeControl.getTimeScale() : 1;

        // Render-on-demand: when fully idle (paused + no drag/fly/manual + no
        // live particles) throttle EVERYTHING — updates, minimap canvas
        // repaint, DOM writes and the render — to ~10 Hz. The gate sits above
        // the update calls on purpose: skipping only the GPU render kept the
        // CPU busy at 60 Hz (minimap shadowBlur raster was the worst), which
        // halved the battery win on tablets.
        const cc = this.cameraControls;
        const mn = this.manualNavigation;
        const idle = (
            timeScale === 0 &&
            !mn?.enabled &&
            !cc?.isDragging &&
            !cc?.isFlying &&
            (!this.particleEffects || this.particleEffects.particles.length === 0)
        );

        // Quality controller freezes while idle: rAF keeps ticking at display
        // rate when work is skipped, which used to read as ~60 FPS and promote
        // quality the device cannot sustain — then stutter on unpause.
        if (!idle) this.updateAdaptiveQuality(deltaTime);

        if (idle) {
            this._idleAccum = (this._idleAccum || 0) + deltaTime;
            if (this._idleAccum < 0.1) return; // skip this frame entirely
            // Run this 10 Hz tick with the accumulated time so animations
            // advance at real speed, just at a lower tick rate.
            deltaTime = this._idleAccum;
            this._idleAccum = 0;
        } else {
            this._idleAccum = 0;
        }

        const scaledDeltaTime = deltaTime * timeScale;

        // Systems that should respect time scale (orbital movements, etc.)
        if (this.solarSystem) this.solarSystem.update(scaledDeltaTime, this.camera);

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

        // Update minimap (driven by main loop, not its own rAF)
        if (this.miniMap) this.miniMap.externalUpdate();

        // Update mission indicator arrow
        if (this.missionIndicator) this.missionIndicator.update();

        // Render via Composer for Bloom
        if (this.composer && !this.isDisposed) {
            this.composer.render();
        } else if (this.renderer && !this.isDisposed) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Setup global keyboard accessibility
     * Enter/Space triggers click on elements with role="button"
     */
    setupAccessibilityKeyboard() {
        // Restore high-contrast preference
        try {
            if (localStorage.getItem('spaceExplorer_highContrast') === 'true') {
                document.body.classList.add('high-contrast');
            }
        } catch {
            // Ignore
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const el = document.activeElement;
                if (el && el.getAttribute('role') === 'button' && el instanceof HTMLElement) {
                    e.preventDefault();
                    el.click();
                }
            }
        }, { signal: this._abort.signal });
    }

    /**
     * Show endgame completion screen with certificate
     */
    showCompletionScreen() {
        const stats = {
            planetsVisited: this.gameManager.visited.size,
            missionsCompleted: this.missionSystem.completedMissions.size,
            xpTotal: this.xpSystem.xp,
            quizStreak: this.quizSystem?.streak || 0
        };

        const certDataUrl = this.certificateGenerator.generate(this.playerName, stats);

        const content = document.createElement('div');
        content.style.cssText = 'display:flex;flex-direction:column;align-items:center;max-width:100%;';

        const certImg = document.createElement('img');
        certImg.src = certDataUrl;
        certImg.alt = i18n.t('cert_title');
        certImg.style.cssText = 'max-width: 90%; max-height: 55vh; border-radius: 12px; box-shadow: 0 0 40px rgba(212, 165, 55, 0.4);';
        content.appendChild(certImg);

        const msgEl = document.createElement('p');
        msgEl.style.cssText = 'color: #ffd700; font-size: 1.3rem; text-align: center; margin: 20px 20px 0; font-family: "Segoe UI", Arial, sans-serif; font-weight: bold;';
        msgEl.textContent = i18n.t('endgame_congrats');
        content.appendChild(msgEl);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; gap: 16px; margin-top: 20px;';

        const downloadBtn = document.createElement('button');
        downloadBtn.style.cssText = `
            background: linear-gradient(135deg, #d4a537, #b8860b);
            border: none; border-radius: 8px; padding: 12px 24px;
            color: white; font-size: 1rem; cursor: pointer; font-weight: bold;
            font-family: "Segoe UI", Arial, sans-serif;
        `;
        downloadBtn.textContent = i18n.t('cert_download');
        downloadBtn.addEventListener('click', () => {
            this.certificateGenerator.download(this.playerName, stats);
        });
        btnRow.appendChild(downloadBtn);

        const continueBtn = document.createElement('button');
        continueBtn.style.cssText = `
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border: none; border-radius: 8px; padding: 12px 24px;
            color: white; font-size: 1rem; cursor: pointer; font-weight: bold;
            font-family: "Segoe UI", Arial, sans-serif;
        `;
        continueBtn.textContent = i18n.t('endgame_continue');
        continueBtn.addEventListener('click', () => close());
        btnRow.appendChild(continueBtn);

        content.appendChild(btnRow);
        const { close } = showOverlay(content, { className: 'endgame-overlay' });
    }

    /**
     * Show daily challenge card if all missions are complete
     * and the player hasn't completed today's challenge yet.
     */
    showDailyChallenge() {
        // Local date, not UTC: with toISOString a kid in Lisbon (UTC+1 in
        // summer) would get the new daily challenge at 01:00, and a "same
        // day" streak check could span two local days.
        const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const today = localDate(new Date());
        const dailyData = storage.getItem('dailyChallenge', null);

        // Skip if already completed today
        if (dailyData && dailyData.date === today && dailyData.completed) return;

        // Get all available quiz planets
        const quizzes = this.quizSystem?.getQuizzesForLang?.();
        if (!quizzes) return;

        const planetKeys = Object.keys(quizzes).filter(k => quizzes[k] && quizzes[k].length > 0);
        if (planetKeys.length === 0) return;

        // Use date as seed for consistent daily selection
        const dateNum = parseInt(today.replace(/-/g, ''), 10);
        const planetIdx = dateNum % planetKeys.length;
        const planet = planetKeys[planetIdx];
        const questions = quizzes[planet];
        const questionIdx = dateNum % questions.length;
        const quiz = questions[questionIdx];

        // Calculate streak
        const streak = dailyData?.streak || 0;

        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #1a1a3e, #0a0e2a);
            border: 2px solid rgba(255, 165, 0, 0.5);
            border-radius: 16px; padding: 32px; text-align: center;
            max-width: 450px; width: 90%; color: #e2e8f0;
            font-family: "Segoe UI", Arial, sans-serif;
        `;

        const title = document.createElement('h2');
        title.style.cssText = 'color: #ffa500; margin: 0 0 8px; font-size: 1.4rem;';
        title.textContent = `\u2B50 ${i18n.t('daily_title')}`;
        card.appendChild(title);

        if (streak > 0) {
            const streakEl = document.createElement('p');
            streakEl.style.cssText = 'color: #ff6b6b; font-size: 0.9rem; margin: 0 0 12px;';
            streakEl.textContent = `\uD83D\uDD25 ${i18n.t('daily_streak')}: ${streak}`;
            card.appendChild(streakEl);
        }

        const questionLabel = document.createElement('p');
        questionLabel.style.cssText = 'color: #94a3b8; font-size: 0.85rem; margin: 0 0 4px;';
        questionLabel.textContent = i18n.t('daily_question');
        card.appendChild(questionLabel);

        const questionEl = document.createElement('p');
        questionEl.style.cssText = 'color: #fff; font-size: 1.1rem; margin: 0 0 20px; font-weight: bold;';
        questionEl.textContent = quiz.question;
        card.appendChild(questionEl);

        // Shuffle options
        const correct = quiz.options[quiz.correct];
        const shuffled = [...quiz.options].sort(() => Math.random() - 0.5);
        const correctIdx = shuffled.indexOf(correct);

        const optionsDiv = document.createElement('div');
        optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        shuffled.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px; padding: 10px 16px; color: #e2e8f0;
                font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
                font-family: "Segoe UI", Arial, sans-serif;
            `;
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                // Disable all buttons
                optionsDiv.querySelectorAll('button').forEach(b => { b.disabled = true; b.style.cursor = 'default'; });

                const isCorrect = i === correctIdx;
                btn.style.background = isCorrect ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)';
                btn.style.borderColor = isCorrect ? '#4ade80' : '#f87171';

                if (!isCorrect) {
                    // Highlight correct
                    optionsDiv.querySelectorAll('button')[correctIdx].style.background = 'rgba(74, 222, 128, 0.3)';
                    optionsDiv.querySelectorAll('button')[correctIdx].style.borderColor = '#4ade80';
                }

                // Save completion
                const prevData = storage.getItem('dailyChallenge', null);
                const prevDate = prevData?.date;
                const yesterday = localDate(new Date(Date.now() - 86400000));
                let newStreak = isCorrect ? ((prevDate === yesterday ? (prevData?.streak || 0) : 0) + 1) : 0;

                storage.setItem('dailyChallenge', {
                    date: today,
                    completed: true,
                    correct: isCorrect,
                    streak: newStreak
                });

                // Show result
                setTimeout(() => {
                    const resultEl = document.createElement('p');
                    resultEl.style.cssText = `color: ${isCorrect ? '#4ade80' : '#f87171'}; font-weight: bold; margin: 12px 0 0;`;
                    resultEl.textContent = i18n.t('daily_completed');
                    card.appendChild(resultEl);

                    if (isCorrect && this.xpSystem) {
                        this.xpSystem.addXP(30, i18n.t('daily_title'));
                    }

                    setTimeout(() => close(), 1500);
                }, 800);
            });
            optionsDiv.appendChild(btn);
        });

        card.appendChild(optionsDiv);

        // Close/skip button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: none; border: none; color: #64748b;
            font-size: 0.85rem; margin-top: 16px; cursor: pointer;
            font-family: "Segoe UI", Arial, sans-serif;
        `;
        closeBtn.textContent = i18n.t('close');
        closeBtn.addEventListener('click', () => close());
        card.appendChild(closeBtn);

        // No backdrop-close: a kid mid-question should not lose the daily
        // challenge to a stray tap outside the card.
        const { close } = showOverlay(card, { className: 'daily-challenge-overlay', closeOnBackdrop: false });
    }

    /**
     * Show share progress panel (called from toolbar)
     */
    showShareProgress() {
        const cardDataUrl = this.shareManager.generateProgressCard(this);
        const shareUrl = this.shareManager.shareURL(this);

        const content = document.createElement('div');
        content.style.cssText = 'display:flex;flex-direction:column;align-items:center;max-width:100%;';

        const cardImg = document.createElement('img');
        cardImg.src = cardDataUrl;
        cardImg.alt = i18n.t('share_card_title');
        cardImg.style.cssText = 'max-width: 90%; max-height: 50vh; border-radius: 12px; box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);';
        content.appendChild(cardImg);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; gap: 12px; margin-top: 20px;';

        const copyBtn = document.createElement('button');
        copyBtn.style.cssText = `
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border: none; border-radius: 8px; padding: 10px 24px;
            color: white; font-size: 0.95rem; cursor: pointer; font-weight: bold;
            font-family: "Segoe UI", Arial, sans-serif;
        `;
        copyBtn.textContent = i18n.t('share_progress');
        copyBtn.addEventListener('click', async () => {
            const ok = await this.shareManager.copyToClipboard(shareUrl);
            if (ok) {
                copyBtn.textContent = i18n.t('share_copied');
                copyBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            }
        });
        btnRow.appendChild(copyBtn);

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px; padding: 10px 24px;
            color: #e2e8f0; font-size: 0.95rem; cursor: pointer;
            font-family: "Segoe UI", Arial, sans-serif;
        `;
        closeBtn.textContent = i18n.t('close');
        closeBtn.addEventListener('click', () => close());
        btnRow.appendChild(closeBtn);

        content.appendChild(btnRow);
        const { close } = showOverlay(content, { className: 'share-overlay' });
    }

    /**
     * Dispose all resources to prevent memory leaks
     * Called on page unload or when app is destroyed
     */
    dispose() {

        // Mark as disposed to stop animation loop
        this.isDisposed = true;

        // Remove every window/document listener this App registered
        // (app:visit, app:sound, resize, endgame, audio unlock, ...).
        this._abort.abort();

        // Clear pending quiz timeout
        if (this._quizTimeout) clearTimeout(this._quizTimeout);

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

        // Remove manual navigation event listeners
        if (this.manualNavigation) {
            this.manualNavigation.removeEventListeners();
        }

        // Clear i18n listeners to prevent accumulation on reinit
        i18n.clearListeners();

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
        'lang-selector',
        'mascot-container',
        'fatal-error-screen'
    ];

    dynamicElementIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
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
        'quiz-overlay',
        'photo-flash',
        'photo-toast',
        'gallery-overlay',
        'level-up-overlay',
        'collectibles-counter',
        'collectibles-modal',
        'collectible-notification',
        'manual-nav-toggle',
        'manual-nav-hud',
        'tutorial-overlay',
        'mission-indicator',
        'mission-overlay',
        'canvas-mirror'
    ];

    dynamicClasses.forEach(className => {
        const elements = document.querySelectorAll('.' + className);
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

}

// Module-scoped ref for dispose on re-init (not exposed on window)
let _currentApp = null;

function initApp() {
    // Clean up any existing app instance (prevents issues on navigation)
    if (_currentApp && typeof _currentApp.dispose === 'function') {
        try {
            _currentApp.dispose();
        } catch (e) {
            // Ignore dispose errors
        }
    }

    // Clean up all dynamic UI elements
    cleanupDynamicUI();

    _currentApp = new App();
    // Only expose globally in development for debugging
    if (import.meta.env?.DEV) {
        window.app = _currentApp;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check for shared progress URL before starting
    ShareManager.checkSharedProgress();
    initApp();
});

// Handle bfcache (back-forward cache) - reinitialize when page is restored from cache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initApp();
    }
});
