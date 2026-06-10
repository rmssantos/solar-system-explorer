/**
 * Manual Navigation System - Fly your spaceship through space!
 * WASD/Arrows for movement, Mouse for looking around
 * Touch controls for mobile/tablet!
 * Features: Warp speeds with real km/s comparisons!
 */

import * as THREE from 'three';
import { i18n } from './i18n.js';
import { getTranslatedObjectData } from './data/objectsInfo.js';
import { WARP_SPEEDS, getWarpName } from './manualNavigation/WarpModel.js';
import './manualNavigation.css';

export class ManualNavigation {
    constructor(app) {
        this.app = app;
        this.camera = app.camera;
        this.enabled = false;
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.boost = false;
        this.rollLeft = false;
        this.rollRight = false;

        // Emergency brake
        this.emergencyBraking = false;

        // Auto-pilot
        this.autoPilotTarget = null;
        this.autoPilotEnabled = false;

        // Planet info panel
        this.infoPanelVisible = false;
        this.nearestPlanet = null;

        // Speed lines effect
        this.speedLines = null;
        this.speedLinesActive = false;

        // Engine trail
        this.engineTrail = null;
        
        // Warp speed system
        this.warpLevel = 1;  // 1-9
        this.maxWarpLevel = 9;
        
        // Speed settings — sourced from extracted WarpModel module.
        this.warpSpeeds = WARP_SPEEDS;
        
        this.currentSpeed = 0;
        this.acceleration = 500;
        this.deceleration = 300;
        
        // Mouse look
        this.mouseSensitivity = 0.002;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.isPointerLocked = false;

        // Fallback mouse look (when pointer lock is blocked by policies)
        this.pointerLockFailed = false;
        this.isMouseDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Direction vectors
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Raycaster for click-to-interact
        this.raycaster = new THREE.Raycaster();
        this.targetedObject = null; // Currently targeted object

        // Touch controls state
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchJoystickActive = false;
        this.touchLookActive = false;
        this.joystickOrigin = { x: 0, y: 0 };
        this.joystickCurrent = { x: 0, y: 0 };
        this.lastTouchLook = { x: 0, y: 0 };
        
        // Spaceship scale storage
        this.originalSpaceshipScale = null;
        this.originalSolarSystemScale = null;
        this.originalCameraPosition = null;
        this.originalObjectScales = new Map(); // Store original scales for each scaled root (uuid -> Vector3)

        // Manual mode tries to be more “realistic” in travel distances.
        // In exploration mode, distances are roughly: 1 unit ≈ 500,000 km (because distance uses: millionKm * 2).
        // Scaling the whole system by 50x gives: 1 manual unit ≈ 10,000 km.
        this.solarSystemScaleMultiplier = 50;
        this.explorationKmPerUnit = 500000;
        this.kmPerUnit = this.explorationKmPerUnit / this.solarSystemScaleMultiplier;
        
        // Realistic size multipliers (manual mode)
        //
        // Base (exploration) scale factors are inconsistent:
        // - Sun radius: radiusKm * 0.25 * 0.0001  → 0.000025
        // - Planets/moons: radiusKm * 0.001       → 0.001
        // So planets end up ~40x too large relative to the Sun.
        //
        // For manual mode we want proportions closer to reality:
        // - Sun ≈ 10x Jupiter radius
        // - Sun ≈ 109x Earth radius
        //
        // Keeping Sun x4 (so Sun ≈ Jupiter *10 when planets are x0.1)
        // and scaling most bodies by x0.1 gives a good near-real ratio
        // while staying visible (system is already scaled up in manual mode).
        this.realisticScales = {
            // Sun base geometry was increased for exploration mode; use a smaller multiplier here
            // so manual-mode proportions remain near-realistic.
            'sun': 0.8,

            // Planets
            'mercury': 0.1,
            'venus': 0.1,
            'earth': 0.1,
            'mars': 0.1,
            'jupiter': 0.1,
            'saturn': 0.1,
            'uranus': 0.1,
            'neptune': 0.1,

            // Major moons (keep aligned to their parent planet sizes)
            'moon': 0.1,
            'io': 0.1,
            'europa': 0.1,
            'ganymede': 0.1,
            'callisto': 0.1,
            'titan': 0.1,
            'mimas': 0.1,
            'enceladus': 0.1,
            'triton': 0.1,
            'phobos': 0.1,
            'deimos': 0.1,

            'default': 0.1
        };
        
        // Create UI
        this.createUI();
        this.initEventListeners();

        // Listen for language changes
        i18n.onLangChange(() => this.updateTranslations());
    }
    
    createUI() {
        // Toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'manual-nav-toggle';
        this.toggleBtn.innerHTML = '🎮';
        this.toggleBtn.title = i18n.t('manual_nav_tooltip') || i18n.t('manual_nav') || 'Navegação Manual (M)';
        this.toggleBtn.setAttribute('aria-label', i18n.t('aria_manual_nav'));
        this.toggleBtn.onclick = () => this.toggle();
        document.body.appendChild(this.toggleBtn);
        
        // HUD for manual mode
        this.hud = document.createElement('div');
        this.hud.className = 'manual-nav-hud hidden';
        this.hud.innerHTML = `
            <div class="nav-warp-display">
                <div class="nav-mode-badge">${i18n.t('manual_mode')}</div>
                <div class="warp-level">
                    <span class="warp-name">IMPULSO</span>
                    <span class="warp-number">1</span>
                </div>
                <div class="warp-bar">
                    <div class="warp-fill"></div>
                </div>
                <div class="warp-speed">
                    <span class="speed-value">0</span>
                    <span class="speed-unit">${i18n.t('speed_unit_approx')}</span>
                </div>
                <div class="speed-comparison"></div>
            </div>

            <!-- Speedometer gauge -->
            <div class="nav-speedometer">
                <svg viewBox="0 0 100 60" class="speedometer-svg">
                    <path class="speedometer-bg" d="M 10 50 A 40 40 0 0 1 90 50" />
                    <path class="speedometer-fill" d="M 10 50 A 40 40 0 0 1 90 50" />
                    <circle class="speedometer-needle" cx="50" cy="50" r="3" />
                </svg>
                <div class="speedometer-label">WARP</div>
            </div>

            <!-- Space compass -->
            <div class="nav-compass">
                <div class="compass-ring">
                    <div class="compass-indicator sun-indicator" title="${i18n.t('sun_label')}">☀️</div>
                </div>
                <div class="compass-center">●</div>
                <div class="compass-label">${i18n.t('sun_compass')}</div>
            </div>

            <!-- Distance to planets -->
            <div class="nav-distances">
                <div class="distance-title">📍 <span class="nearby-label">${i18n.t('nearby')}</span></div>
                <div class="distance-list"></div>
            </div>

            <!-- Auto-pilot panel -->
            <div class="nav-autopilot hidden">
                <div class="autopilot-header">🎯 <span class="autopilot-label">${i18n.t('autopilot')}</span></div>
                <div class="autopilot-target"></div>
                <div class="autopilot-distance"></div>
                <button class="autopilot-cancel">✕ <span class="cancel-label">${i18n.t('cancel')}</span></button>
            </div>

            <!-- Planet info panel -->
            <div class="nav-planet-info hidden">
                <div class="planet-info-header">
                    <span class="planet-info-name"></span>
                    <button class="planet-info-close">✕</button>
                </div>
                <div class="planet-info-type"></div>
                <div class="planet-info-stats"></div>
                <div class="planet-info-curiosity"></div>
            </div>

            <!-- Proximity hint -->
            <div class="nav-proximity-hint hidden">
                <span class="proximity-text"></span>
            </div>

            <!-- Desktop controls help -->
            <div class="nav-controls-help desktop-only">
                <div class="control-row"><span class="key">W/↑</span> <span class="ctrl-forward">${i18n.t('forward')}</span></div>
                <div class="control-row"><span class="key">S/↓</span> <span class="ctrl-backward">${i18n.t('backward')}</span></div>
                <div class="control-row"><span class="key">A/←</span> <span class="ctrl-left">${i18n.t('left')}</span></div>
                <div class="control-row"><span class="key">D/→</span> <span class="ctrl-right">${i18n.t('right')}</span></div>
                <div class="control-row"><span class="key">R/F</span> <span class="ctrl-roll">${i18n.t('roll')}</span></div>
                <div class="control-row"><span class="key">Space</span> <span class="ctrl-up">${i18n.t('up')}</span></div>
                <div class="control-row"><span class="key">X</span> <span class="ctrl-brake">${i18n.t('brake')}</span></div>
                <div class="control-row"><span class="key">1-9</span> Warp</div>
                <div class="control-row"><span class="key">Q/E</span> ±Warp</div>
                <div class="control-row"><span class="key">🖱️</span> <span class="ctrl-info">Info</span></div>
                <div class="control-row"><span class="key">ESC</span> <span class="ctrl-exit">${i18n.t('exit')}</span></div>
            </div>
            
            <!-- Touch Controls (Mobile/Tablet) -->
            <div class="touch-controls mobile-only">
                <!-- Virtual Joystick (left side) -->
                <div class="touch-joystick" id="touch-joystick">
                    <div class="joystick-base">
                        <div class="joystick-stick"></div>
                    </div>
                </div>
                
                <!-- Warp buttons (right side top) -->
                <div class="touch-warp-controls">
                    <button class="touch-warp-btn" data-warp="down">−</button>
                    <span class="touch-warp-level">1</span>
                    <button class="touch-warp-btn" data-warp="up">+</button>
                </div>
                
                <!-- Action buttons (right side) -->
                <div class="touch-action-buttons">
                    <button class="touch-btn touch-info" id="touch-info">ℹ️</button>
                    <button class="touch-btn touch-boost" id="touch-boost">🚀</button>
                    <button class="touch-btn touch-up" id="touch-up">⬆️</button>
                    <button class="touch-btn touch-down" id="touch-down">⬇️</button>
                </div>
                
                <!-- Exit button -->
                <button class="touch-exit-btn" id="touch-exit">✕</button>
            </div>
            
            <div class="nav-crosshair">
                <span class="crosshair-icon">+</span>
                <span class="crosshair-hint"></span>
            </div>
        `;
        document.body.appendChild(this.hud);
        
        this.warpNameDisplay = /** @type {HTMLElement} */ (this.hud.querySelector('.warp-name'));
        this.warpNumberDisplay = /** @type {HTMLElement} */ (this.hud.querySelector('.warp-number'));
        this.warpFill = /** @type {HTMLElement} */ (this.hud.querySelector('.warp-fill'));
        this.speedDisplay = /** @type {HTMLElement} */ (this.hud.querySelector('.speed-value'));
        this.speedComparison = this.hud.querySelector('.speed-comparison');
        this.touchWarpLevel = this.hud.querySelector('.touch-warp-level');
    }

    initEventListeners() {
        // Store bound references so we can remove them later
        this._boundKeyDown = (e) => {
            // Handle M key toggle (with input guard)
            if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                this.toggle();
                return;
            }
            this.onKeyDown(e);
        };
        this._boundKeyUp = (e) => this.onKeyUp(e);
        this._boundMouseMove = (e) => this.onMouseMove(e);
        this._boundPointerLockChange = () => this.onPointerLockChange();
        this._boundPointerLockError = () => this.onPointerLockError();
        this._boundMouseDown = (e) => this.onMouseDown(e);
        this._boundMouseUp = (e) => this.onMouseUp(e);
        this._boundClick = (e) => this.onClickInteract(e);
        this._boundContextMenu = (e) => {
            if (this.enabled && !this.isTouchDevice) {
                e.preventDefault();
            }
        };

        // Keyboard - use capture phase to intercept before other handlers
        document.addEventListener('keydown', this._boundKeyDown, true);
        document.addEventListener('keyup', this._boundKeyUp, true);

        // Mouse
        document.addEventListener('mousemove', this._boundMouseMove);
        document.addEventListener('pointerlockchange', this._boundPointerLockChange);
        document.addEventListener('pointerlockerror', this._boundPointerLockError);

        // Mouse look with left-click drag (consistent with exploration mode)
        document.addEventListener('mousedown', this._boundMouseDown);
        document.addEventListener('mouseup', this._boundMouseUp);

        // Click to close info panel (use "I" key to open info)
        document.addEventListener('click', this._boundClick);

        // Prevent context menu when using fallback mouse look
        document.addEventListener('contextmenu', this._boundContextMenu);

        // Touch event listeners (will be activated when HUD is shown)
        this.initTouchListeners();
    }

    removeEventListeners() {
        if (this._boundKeyDown) {
            document.removeEventListener('keydown', this._boundKeyDown, true);
            document.removeEventListener('keyup', this._boundKeyUp, true);
            document.removeEventListener('mousemove', this._boundMouseMove);
            document.removeEventListener('pointerlockchange', this._boundPointerLockChange);
            document.removeEventListener('pointerlockerror', this._boundPointerLockError);
            document.removeEventListener('mousedown', this._boundMouseDown);
            document.removeEventListener('mouseup', this._boundMouseUp);
            document.removeEventListener('click', this._boundClick);
            document.removeEventListener('contextmenu', this._boundContextMenu);
        }
        if (this._boundTouchStart) {
            document.removeEventListener('touchstart', this._boundTouchStart);
            document.removeEventListener('touchmove', this._boundTouchMove);
            document.removeEventListener('touchend', this._boundTouchEnd);
        }
    }
    
    initTouchListeners() {
        // Get touch elements after they're in DOM
        setTimeout(() => {
            // Floating joystick: spawns at touch point on left half of the screen.
            // No direct listener on the joystick element — routed via document touch handler below.
            this._joystickTouchId = null;
            this._lookTouchId = null;

            // Warp buttons
            const warpBtns = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.touch-warp-btn'));
            warpBtns.forEach(btn => {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const dir = btn.dataset.warp;
                    if (dir === 'up') this.setWarpLevel(this.warpLevel + 1);
                    else if (dir === 'down') this.setWarpLevel(this.warpLevel - 1);
                    if (this.touchWarpLevel) this.touchWarpLevel.textContent = String(this.warpLevel);
                }, { passive: false });
            });
            
            // Boost button
            const boostBtn = document.getElementById('touch-boost');
            if (boostBtn) {
                boostBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.boost = true;
                    boostBtn.classList.add('active');
                }, { passive: false });
                boostBtn.addEventListener('touchend', (e) => {
                    this.boost = false;
                    boostBtn.classList.remove('active');
                });
            }
            
            // Up/Down buttons
            const upBtn = document.getElementById('touch-up');
            const downBtn = document.getElementById('touch-down');

            if (upBtn) {
                upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.moveUp = true; }, { passive: false });
                upBtn.addEventListener('touchend', () => this.moveUp = false);
            }
            if (downBtn) {
                downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.moveDown = true; }, { passive: false });
                downBtn.addEventListener('touchend', () => this.moveDown = false);
            }

            // Info button
            const infoBtn = document.getElementById('touch-info');
            if (infoBtn) {
                infoBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.togglePlanetInfo();
                }, { passive: false });
            }
            
            // Exit button
            const exitBtn = document.getElementById('touch-exit');
            if (exitBtn) {
                exitBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.disable();
                }, { passive: false });
            }
            
            // Touch look (right side of screen for looking around)
            // Store bound references for removal
            this._boundTouchStart = (e) => this.onTouchLookStart(e);
            this._boundTouchMove = (e) => this.onTouchLookMove(e);
            this._boundTouchEnd = (e) => this.onTouchLookEnd(e);
            document.addEventListener('touchstart', this._boundTouchStart, { passive: false });
            document.addEventListener('touchmove', this._boundTouchMove, { passive: false });
            document.addEventListener('touchend', this._boundTouchEnd, { passive: false });
            
        }, 100);
    }
    
    // --- Floating joystick: spawns at first touch on left half of screen ---

    _isOnInteractive(target) {
        return !!(target && target.closest && target.closest(
            '.touch-warp-controls, .touch-action-buttons, .touch-exit-btn, .touch-controls button, .nav-info-overlay, .manual-nav-toggle'
        ));
    }

    _spawnJoystick(x, y) {
        const joystick = document.getElementById('touch-joystick');
        if (!joystick) return;
        joystick.style.left = `${x}px`;
        joystick.style.top = `${y}px`;
        joystick.classList.add('active');
        this.touchJoystickActive = true;
        this.joystickOrigin = { x, y };
        if (!this._joystickStick) this._joystickStick = /** @type {HTMLElement} */ (joystick.querySelector('.joystick-stick'));
        if (this._joystickStick) this._joystickStick.style.transform = 'translate(0, 0)';
        this.moveForward = true; // initial nudge forward — mirrors prior behavior
    }

    _updateJoystick(touch) {
        const dx = touch.clientX - this.joystickOrigin.x;
        const dy = touch.clientY - this.joystickOrigin.y;
        const maxRadius = 50;
        const distance = Math.hypot(dx, dy);
        const clampedDistance = Math.min(distance, maxRadius);
        const angle = Math.atan2(dy, dx);
        const cx = Math.cos(angle) * clampedDistance;
        const cy = Math.sin(angle) * clampedDistance;
        if (this._joystickStick) this._joystickStick.style.transform = `translate(${cx}px, ${cy}px)`;
        const threshold = 15;
        this.moveForward = dy < -threshold;
        this.moveBackward = dy > threshold;
        this.moveLeft = dx < -threshold;
        this.moveRight = dx > threshold;
    }

    _releaseJoystick() {
        const joystick = document.getElementById('touch-joystick');
        if (joystick) joystick.classList.remove('active');
        this.touchJoystickActive = false;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        if (this._joystickStick) this._joystickStick.style.transform = 'translate(0, 0)';
    }

    onTouchLookStart(e) {
        if (!this.enabled) return;

        // Multi-touch aware: first touch on left half spawns joystick; first on right side starts look.
        for (const touch of e.changedTouches) {
            if (this._isOnInteractive(touch.target)) continue;
            const onLeft = touch.clientX < window.innerWidth / 2;
            if (onLeft && this._joystickTouchId === null) {
                this._joystickTouchId = touch.identifier;
                this._spawnJoystick(touch.clientX, touch.clientY);
                e.preventDefault();
            } else if (!onLeft && this._lookTouchId === null) {
                this._lookTouchId = touch.identifier;
                this.touchLookActive = true;
                this.lastTouchLook = { x: touch.clientX, y: touch.clientY };
                e.preventDefault();
            }
        }
    }

    onTouchLookMove(e) {
        if (!this.enabled) return;
        let consumed = false;
        for (const touch of e.changedTouches) {
            if (touch.identifier === this._joystickTouchId) {
                this._updateJoystick(touch);
                consumed = true;
            } else if (touch.identifier === this._lookTouchId && this.touchLookActive) {
                const dx = touch.clientX - this.lastTouchLook.x;
                const dy = touch.clientY - this.lastTouchLook.y;
                this.euler.y -= dx * this.mouseSensitivity * 2;
                this.euler.x -= dy * this.mouseSensitivity * 2;
                this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
                this.camera.quaternion.setFromEuler(this.euler);
                this.lastTouchLook = { x: touch.clientX, y: touch.clientY };
                consumed = true;
            }
        }
        if (consumed) e.preventDefault();
    }

    onTouchLookEnd(e) {
        for (const touch of e.changedTouches) {
            if (touch.identifier === this._joystickTouchId) {
                this._joystickTouchId = null;
                this._releaseJoystick();
            } else if (touch.identifier === this._lookTouchId) {
                this._lookTouchId = null;
                this.touchLookActive = false;
            }
        }
    }
    
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    enable() {
        if (this.enabled) return; // Guard against double-call (prevents 2500x scale)
        this.enabled = true;
        this.toggleBtn.classList.add('active');
        this.hud.classList.remove('hidden');
        document.body.classList.add('manual-nav-active');
        
        // Dispatch event for UI to react (compact passport, etc.)
        window.dispatchEvent(new CustomEvent('manualNavModeChanged', { detail: { active: true } }));
        
        // For desktop: request pointer lock for mouse look
        // For mobile: don't need pointer lock
        if (!this.isTouchDevice) {
            document.body.requestPointerLock();

            // Check if pointer lock worked after a short delay
            // Some browsers silently fail without firing pointerlockerror
            setTimeout(() => {
                if (this.enabled && !this.isPointerLocked && !this.pointerLockFailed) {
                    this.onPointerLockError();
                }
            }, 500);
        }
        
        // Disable orbit controls
        if (this.app.cameraControls) {
            this.app.cameraControls.enabled = false;
        }
        
        // Store initial camera orientation
        this.euler.setFromQuaternion(this.camera.quaternion);
        
        // Update touch warp display
        if (this.touchWarpLevel) {
            this.touchWarpLevel.textContent = String(this.warpLevel);
        }
        
        // Scale UP the entire solar system to make planets feel huge!
        // Keep spaceship at normal size - now it's tiny compared to planets
        if (this.app.solarSystem?.solarSystemGroup) {
            // Find and scale the solar system group
            const solarSystemGroup = this.app.solarSystem.solarSystemGroup;
            this.originalSolarSystemScale = solarSystemGroup.scale.clone();
            solarSystemGroup.scale.multiplyScalar(this.solarSystemScaleMultiplier);
            
            // Also scale camera position to match
            this.originalCameraPosition = this.camera.position.clone();
            this.camera.position.multiplyScalar(this.solarSystemScaleMultiplier);
            
            // Apply realistic scales to individual objects (make Sun HUGE!)
            this.applyRealisticScales();
        }
        
        // Reset to Warp 1
        this.warpLevel = 1;
        this.updateWarpDisplay();
        
        // Play activation sound
        this.app.audioManager?.playSelect();

        // Show mouse controls hint only if pointer lock is blocked (less UI noise)

        // Touch devices: nudge to landscape on small portrait screens.
        if (this.isTouchDevice) this.maybeShowLandscapeHint();
    }

    maybeShowLandscapeHint() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const isSmall = Math.min(window.innerWidth, window.innerHeight) < 600;
        if (!isPortrait || !isSmall) return;
        if (document.getElementById('landscape-toast')) return;
        const toast = document.createElement('div');
        toast.id = 'landscape-toast';
        toast.className = 'landscape-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span class="icon" aria-hidden="true">📱</span>
            <strong>${i18n.t('rotate_device')}</strong><br>
            <span style="opacity:0.85;font-size:0.85rem;">${i18n.t('landscape_hint')}</span>
        `;
        document.body.appendChild(toast);
        const remove = () => { toast.remove(); window.removeEventListener('resize', onResize); };
        const onResize = () => { if (window.innerWidth >= window.innerHeight) remove(); };
        window.addEventListener('resize', onResize);
        setTimeout(remove, 4500);
    }

    showMouseControlsHint() {
        // Show hint for mouse controls (works with or without pointer lock)
        const hint = document.createElement('div');
        hint.className = 'mouse-controls-hint';
        hint.innerHTML = `
            <div class="hint-content">
                <span>🖱️</span>
                <span>${i18n.t('mouse_hint')}</span>
            </div>
        `;
        hint.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: #4a90e2;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            z-index: 10000;
            border: 1px solid #4a90e2;
            animation: hintFadeInOut 5s ease-in-out forwards;
            pointer-events: none;
        `;

        // Add animation style if not exists
        if (!document.getElementById('mouse-hint-style')) {
            const style = document.createElement('style');
            style.id = 'mouse-hint-style';
            style.textContent = `
                @keyframes hintFadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .hint-content { display: flex; align-items: center; gap: 10px; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 5000);
    }
    
    disable() {
        this.enabled = false;
        this.toggleBtn.classList.remove('active');
        this.hud.classList.add('hidden');
        document.body.classList.remove('manual-nav-active');

        // Hide planet info panel if open
        this.hidePlanetInfo();
        
        // Dispatch event for UI to react (restore passport, etc.)
        window.dispatchEvent(new CustomEvent('manualNavModeChanged', { detail: { active: false } }));

        // Map current manual camera position back to exploration coordinates.
        // (In manual mode we scale the whole system + camera by solarSystemScaleMultiplier.)
        const mappedExplorationCameraPos = this.solarSystemScaleMultiplier
            ? this.camera.position.clone().multiplyScalar(1 / this.solarSystemScaleMultiplier)
            : null;
        
        // Exit pointer lock (desktop only)
        if (!this.isTouchDevice) {
            document.exitPointerLock();
        }
        
        // Re-enable orbit controls
        if (this.app.cameraControls) {
            this.app.cameraControls.enabled = true;
        }
        
        // Restore solar system scale
        if (this.app.solarSystem?.solarSystemGroup && this.originalSolarSystemScale) {
            this.app.solarSystem.solarSystemGroup.scale.copy(this.originalSolarSystemScale);
            
            // Restore individual object scales
            this.restoreOriginalScales();
        }
        
        // Restore camera position
        if (mappedExplorationCameraPos) {
            this.camera.position.copy(mappedExplorationCameraPos);
        } else if (this.originalCameraPosition) {
            this.camera.position.copy(this.originalCameraPosition);
        }
        
        // Reset touch states
        this.touchJoystickActive = false;
        this.touchLookActive = false;
        this._joystickTouchId = null;
        this._lookTouchId = null;
        const joystickEl = document.getElementById('touch-joystick');
        if (joystickEl) joystickEl.classList.remove('active');
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.boost = false;
        this.rollLeft = false;
        this.rollRight = false;

        // Reset velocity
        this.velocity.set(0, 0, 0);
        this.currentSpeed = 0;

        // Disable auto-pilot if active
        this.disableAutoPilot();

        // Clean up visual effects
        this.cleanupEffects();

        // Stop spaceship engine loop
        this.app.audioManager?.stopShipEngine();

        // Sync orbit controls to the new camera position to prevent a jump.
        // Keep the target near the nearest major body so the camera doesn't drift back to origin.
        if (this.app.cameraControls && mappedExplorationCameraPos && this.app.solarSystem?.objects) {
            const controls = this.app.cameraControls;

            const candidates = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
            let nearestMesh = null;
            let nearestPos = null;
            let nearestDist = Infinity;

            for (const name of candidates) {
                const mesh = this.app.solarSystem.objects[name];
                if (!mesh) continue;
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                const d = this.camera.position.distanceTo(worldPos);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestMesh = mesh;
                    nearestPos = worldPos;
                }
            }

            if (nearestMesh && nearestPos) {
                controls.followingObject = nearestMesh;
                controls.target.copy(nearestPos);

                const offset = new THREE.Vector3().subVectors(this.camera.position, nearestPos);
                controls.orbitRadius = offset.length();
                if (controls.orbitRadius > 0.0001) {
                    controls.phi = Math.acos(Math.max(-1, Math.min(1, offset.y / controls.orbitRadius)));
                    controls.theta = Math.atan2(offset.z, offset.x);
                }
            }
        }

    }

    cleanupEffects() {
        // Remove speed lines
        const speedLines = document.querySelector('.speed-lines-container');
        if (speedLines) speedLines.remove();

        // Remove warp flash
        const warpFlash = document.querySelector('.warp-flash');
        if (warpFlash) warpFlash.remove();

        // Remove brake effect
        const brakeEffect = document.querySelector('.emergency-brake-effect');
        if (brakeEffect) brakeEffect.remove();
    }
    
    /**
     * Apply realistic scales to celestial objects
     * Makes the Sun MUCH larger and gas giants properly sized
     */
    applyRealisticScales() {
        if (!this.app.solarSystem?.objects) return;
        
        this.originalObjectScales.clear();

        const scaledRoots = new Set();
        
        for (const [name, mesh] of Object.entries(this.app.solarSystem.objects)) {
            if (!mesh?.scale) continue;

            // Some “objects” are actually meshes inside a composite group (probes, UFO).
            // Scale the root group so the whole object stays consistent.
            const root = mesh.userData?.root || mesh;
            if (!root?.scale || scaledRoots.has(root.uuid)) continue;
            scaledRoots.add(root.uuid);

            // Store original scale
            this.originalObjectScales.set(root.uuid, root.scale.clone());
            
            // Get scale multiplier for this object
            const scaleMultiplier = this.realisticScales[name] || this.realisticScales['default'];
            
            // Apply scale
            root.scale.multiplyScalar(scaleMultiplier);
            
            // Special: Also scale any glow effects attached to the Sun
            if (name === 'sun' && mesh.children) {
                mesh.children.forEach(child => {
                    if (child.material?.transparent) {
                        child.scale.setScalar(1); // Reset child scale relative to parent
                    }
                });
            }
        }
        
    }
    
    /**
     * Restore original scales when exiting manual navigation
     */
    restoreOriginalScales() {
        if (!this.app.solarSystem?.objects) return;

        const restoredRoots = new Set();
        
        for (const mesh of Object.values(this.app.solarSystem.objects)) {
            if (!mesh?.scale) continue;

            const root = mesh.userData?.root || mesh;
            if (!root?.scale || restoredRoots.has(root.uuid)) continue;
            restoredRoots.add(root.uuid);

            const originalScale = this.originalObjectScales.get(root.uuid);
            if (originalScale) {
                root.scale.copy(originalScale);
            }
        }
        
        this.originalObjectScales.clear();
    }

    updateWarpDisplay() {
        const warp = this.warpSpeeds[this.warpLevel - 1];
        if (this.warpNameDisplay) {
            // Use translated warp name
            this.warpNameDisplay.textContent = getWarpName(this.warpLevel);
            this.warpNameDisplay.style.color = warp.color;
        }
        if (this.warpNumberDisplay) {
            this.warpNumberDisplay.textContent = String(this.warpLevel);
            this.warpNumberDisplay.style.background = `linear-gradient(135deg, ${warp.color}, ${warp.color}88)`;
        }
    }
    
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;

        // Note: We no longer auto-disable when pointer lock is lost
        // Keyboard controls still work, fallback mouse look available
        // User can manually exit with ESC or M key
    }

    onPointerLockError() {
        // Pointer lock failed (blocked by company policies, etc.)
        this.pointerLockFailed = true;
        this.isPointerLocked = false;

        // Show a hint to the user
        if (this.enabled) {
            this.showPointerLockFallbackHint();
        }
    }

    showPointerLockFallbackHint() {
        // Show hint that user needs to hold right-click to look around
        const hint = document.createElement('div');
        hint.className = 'pointer-lock-hint';
        hint.innerHTML = `
            <div class="hint-content">
                <span>🖱️</span>
                <span>${i18n.t('pointer_hint')}</span>
            </div>
        `;
        hint.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #4a90e2;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            z-index: 10000;
            border: 1px solid #4a90e2;
            animation: fadeInOut 4s ease-in-out forwards;
        `;

        // Add animation style if not exists
        if (!document.getElementById('pointer-lock-hint-style')) {
            const style = document.createElement('style');
            style.id = 'pointer-lock-hint-style';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    85% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .hint-content { display: flex; align-items: center; gap: 10px; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 4000);
    }

    onMouseDown(event) {
        if (!this.enabled) return;
        // Note: Don't check isTouchDevice - mouse should work even on touch-capable devices
        // Many corporate PCs have touch drivers even without actual touch screens

        // LEFT-click (button 0) for mouse look - consistent with exploration mode!
        // Use "I" key to interact with targeted objects
        // This ensures mouse look works on corporate PCs that block pointer lock
        if (event.button === 0) {
            this.isMouseDragging = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            event.preventDefault(); // Prevent text selection
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.isMouseDragging = false;
        }
    }
    
    onKeyDown(event) {
        if (!this.enabled) return;
        
        // Warp level keys 1-9
        if (event.code.startsWith('Digit') || event.code.startsWith('Numpad')) {
            const num = parseInt(event.key);
            if (num >= 1 && num <= 9) {
                this.setWarpLevel(num);
                return;
            }
        }
        
        // Q/E for warp up/down
        if (event.code === 'KeyQ') {
            this.setWarpLevel(this.warpLevel - 1);
            return;
        }
        if (event.code === 'KeyE') {
            this.setWarpLevel(this.warpLevel + 1);
            return;
        }
        
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
            case 'Space':
                this.moveUp = true;
                event.preventDefault();
                event.stopPropagation(); // Prevent triggering time control pause
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.moveDown = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.boost = true;
                break;
            case 'KeyR':
                this.rollLeft = true;
                break;
            case 'KeyF':
                this.rollRight = true;
                break;
            case 'KeyX':
                this.emergencyBrake();
                break;
            case 'KeyI':
                this.togglePlanetInfo();
                break;
            case 'Escape':
                if (this.infoPanelVisible) {
                    this.hidePlanetInfo();
                } else {
                    this.disable();
                }
                break;
        }
    }

    onKeyUp(event) {
        if (!this.enabled) return;

        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
            case 'Space':
                this.moveUp = false;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.moveDown = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.boost = false;
                break;
            case 'KeyR':
                this.rollLeft = false;
                break;
            case 'KeyF':
                this.rollRight = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (!this.enabled) return;

        // Pointer lock mode (normal operation)
        if (this.isPointerLocked) {
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;

            this.euler.y -= movementX * this.mouseSensitivity;
            this.euler.x -= movementY * this.mouseSensitivity;

            // Clamp vertical rotation
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);
        }
        // Fallback mode: drag to look (when pointer lock is blocked)
        else if (this.isMouseDragging) {
            const movementX = event.clientX - this.lastMouseX;
            const movementY = event.clientY - this.lastMouseY;

            this.euler.y -= movementX * this.mouseSensitivity;
            this.euler.x -= movementY * this.mouseSensitivity;

            // Clamp vertical rotation
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);

            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }
    
    update(deltaTime) {
        if (!this.enabled) return;

        // Handle auto-pilot
        if (this.autoPilotEnabled && this.autoPilotTarget) {
            this.updateAutoPilot(deltaTime);
            return;
        }

        // Calculate movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.y = Number(this.moveUp) - Number(this.moveDown);
        this.direction.normalize();

        // Apply roll rotation
        if (this.rollLeft || this.rollRight) {
            const rollSpeed = 1.5 * deltaTime;
            const rollAmount = (Number(this.rollLeft) - Number(this.rollRight)) * rollSpeed;
            this.euler.z += rollAmount;
            this.camera.quaternion.setFromEuler(this.euler);
        }

        // Get current warp settings
        const warp = this.warpSpeeds[this.warpLevel - 1];
        const baseWarpSpeed = warp.speed;

        // Calculate target speed (boost doubles speed within warp level)
        const isMoving = this.direction.length() > 0;
        const boostMultiplier = this.boost ? 2 : 1;
        let targetSpeed = isMoving ? baseWarpSpeed * boostMultiplier : 0;

        // Emergency brake override
        if (this.emergencyBraking) {
            targetSpeed = 0;
        }

        // Smooth acceleration/deceleration (faster at higher warp)
        const accelMultiplier = Math.max(1, this.warpLevel / 2);
        const brakeMultiplier = this.emergencyBraking ? 10 : 1;
        if (this.currentSpeed < targetSpeed) {
            this.currentSpeed = Math.min(targetSpeed, this.currentSpeed + this.acceleration * accelMultiplier * deltaTime);
        } else if (this.currentSpeed > targetSpeed) {
            this.currentSpeed = Math.max(targetSpeed, this.currentSpeed - this.deceleration * accelMultiplier * brakeMultiplier * deltaTime);
        }

        // Check if emergency braking complete
        if (this.emergencyBraking && this.currentSpeed < 1) {
            this.emergencyBraking = false;
            this.hideBrakeEffect();
        }

        // Apply movement
        if (this.currentSpeed > 0.1) {
            // Get camera direction vectors
            // Reuse pre-allocated vectors (avoid per-frame allocation)
            if (!this._moveVecs) {
                this._moveVecs = { forward: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) };
            }
            const forward = this._moveVecs.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const right = this._moveVecs.right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
            const up = this._moveVecs.up;

            // Calculate velocity
            this.velocity.set(0, 0, 0);

            if (this.direction.z !== 0) {
                this.velocity.addScaledVector(forward, this.direction.z);
            }
            if (this.direction.x !== 0) {
                this.velocity.addScaledVector(right, this.direction.x);
            }
            if (this.direction.y !== 0) {
                this.velocity.addScaledVector(up, this.direction.y);
            }

            this.velocity.normalize().multiplyScalar(this.currentSpeed * deltaTime);

            // Move camera
            this.camera.position.add(this.velocity);
        }

        // Update speed lines based on warp level
        this.updateSpeedLines();

        // Update spaceship engine audio (procedural)
        const maxSpeed = baseWarpSpeed * 2; // includes boost
        const throttle = maxSpeed > 0 ? (this.currentSpeed / maxSpeed) : 0;
        this.app.audioManager?.updateShipEngine({
            throttle,
            warpLevel: this.warpLevel,
            boosting: this.boost,
            braking: this.emergencyBraking
        });

        // Update HUD elements
        this.updateHUD();
        this.updateCompass();
        this.updateDistances();
        this.updateSpeedometer();
        this.updateProximityHint();
    }
    
    formatSpeed(kmPerSec) {
        if (kmPerSec >= 299792) {
            return i18n.t('speed_light');
        } else if (kmPerSec >= 1000000) {
            return i18n.t('speed_million').replace('{n}', (kmPerSec / 1000000).toFixed(1));
        } else if (kmPerSec >= 1000) {
            return i18n.t('speed_thousand').replace('{n}', (kmPerSec / 1000).toFixed(0));
        }
        return `${kmPerSec.toLocaleString()} km/s`;
    }

    getSpeedComparison(kmPerSec) {
        // Fun comparisons for kids!
        if (kmPerSec >= 299792) {
            return i18n.t('comp_universe');
        } else if (kmPerSec >= 50000000) {
            return i18n.t('comp_earth_mars');
        } else if (kmPerSec >= 20000000) {
            return i18n.t('comp_around_world');
        } else if (kmPerSec >= 5000000) {
            return i18n.t('comp_sun_earth');
        } else if (kmPerSec >= 1000000) {
            return i18n.t('comp_voyager');
        } else if (kmPerSec >= 500000) {
            return i18n.t('comp_lightning');
        } else if (kmPerSec >= 100000) {
            return i18n.t('comp_f1');
        } else if (kmPerSec >= 50000) {
            return i18n.t('comp_plane');
        } else {
            return i18n.t('comp_car');
        }
    }
    
    updateHUD() {
        const warp = this.warpSpeeds[this.warpLevel - 1];
        
        // Calculate "real" speed based on warp level
        const speedPercent = this.currentSpeed / warp.speed;
        const realKmS = Math.round(warp.realKmS * speedPercent);

        if (this.speedDisplay) {
            this.speedDisplay.textContent = this.formatSpeed(realKmS);
            this.speedDisplay.style.color = warp.color;
        }
        
        if (this.warpFill) {
            this.warpFill.style.width = `${speedPercent * 100}%`;
            this.warpFill.style.background = `linear-gradient(90deg, ${warp.color}, ${warp.color}88)`;
        }
        
        if (this.speedComparison) {
            if (this.currentSpeed > 0.1) {
                this.speedComparison.textContent = this.getSpeedComparison(realKmS);
            } else {
                this.speedComparison.textContent = i18n.t('press_w');
            }
        }
    }

    // ==================== NEW FEATURES ====================

    emergencyBrake() {
        if (this.currentSpeed < 1) return;

        this.emergencyBraking = true;
        this.showBrakeEffect();
        this.app.audioManager?.playSelect();
    }

    showBrakeEffect() {
        if (!this._brakeEffect) {
            this._brakeEffect = document.querySelector('.emergency-brake-effect');
        }
        if (!this._brakeEffect) {
            this._brakeEffect = document.createElement('div');
            this._brakeEffect.className = 'emergency-brake-effect';
            document.body.appendChild(this._brakeEffect);
        }
        this._brakeEffect.classList.add('active');
    }

    hideBrakeEffect() {
        if (this._brakeEffect) {
            this._brakeEffect.classList.remove('active');
        }
    }

    updateCompass() {
        // Cache DOM reference
        if (!this._sunIndicator) {
            this._sunIndicator = /** @type {HTMLElement} */ (this.hud?.querySelector('.sun-indicator'));
        }
        if (!this._sunIndicator) return;
        const sunIndicator = this._sunIndicator;

        // Reuse pre-allocated vectors (avoid new THREE.Vector3 per frame)
        if (!this._compassVecs) {
            this._compassVecs = {
                toSun: new THREE.Vector3(),
                forward: new THREE.Vector3(),
                right: new THREE.Vector3(),
                up: new THREE.Vector3()
            };
        }
        const { toSun, forward, right, up } = this._compassVecs;
        toSun.set(0, 0, 0).sub(this.camera.position);
        forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
        right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
        up.set(0, 1, 0).applyQuaternion(this.camera.quaternion);

        // Calculate angle on compass
        const dotRight = toSun.dot(right);
        const dotUp = toSun.dot(up);
        const dotForward = toSun.dot(forward);

        // Position on compass ring (radius 30px from center)
        const angle = Math.atan2(dotRight, dotUp);
        const radius = 30;
        const x = 40 + Math.sin(angle) * radius;
        const y = 40 - Math.cos(angle) * radius;

        sunIndicator.style.left = `${x}px`;
        sunIndicator.style.top = `${y}px`;

        // Dim if sun is behind
        sunIndicator.style.opacity = dotForward > 0 ? '1' : '0.4';
    }

    updateDistances() {
        // Cache DOM reference
        if (!this._distanceList) {
            this._distanceList = this.hud?.querySelector('.distance-list');
        }
        const distanceList = this._distanceList;
        if (!distanceList || !this.app.solarSystem?.objects) return;

        // Reuse worldPos vector (avoid allocation per frame)
        if (!this._worldPos) this._worldPos = new THREE.Vector3();

        // Calculate distances to all major objects
        const distances = [];
        const mainObjects = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

        for (const name of mainObjects) {
            const mesh = this.app.solarSystem.objects[name];
            if (mesh) {
                mesh.getWorldPosition(this._worldPos);
                const dist = this.camera.position.distanceTo(this._worldPos);
                distances.push({ name, dist });
            }
        }

        // Sort by distance and take top 4 for horizontal display
        distances.sort((a, b) => a.dist - b.dist);
        const closest = distances.slice(0, 4);

        // Short planet names for compact display - using i18n
        const shortNameKeys = {
            'sun': 'short_sun', 'mercury': 'short_mercury', 'venus': 'short_venus',
            'earth': 'short_earth', 'mars': 'short_mars', 'jupiter': 'short_jupiter',
            'saturn': 'short_saturn', 'uranus': 'short_uranus', 'neptune': 'short_neptune'
        };

        // Create persistent DOM nodes on first call (avoid innerHTML per frame)
        if (!this._distanceItems || this._distanceItems.length === 0) {
            this._distanceItems = [];
            distanceList.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                const div = document.createElement('div');
                div.className = 'distance-item';
                const nameSpan = document.createElement('span');
                nameSpan.className = 'planet-name';
                const distSpan = document.createElement('span');
                distSpan.className = 'planet-dist';
                div.appendChild(nameSpan);
                div.appendChild(distSpan);
                div.addEventListener('click', () => {
                    const planetName = div.dataset.planet;
                    if (planetName) this.enableAutoPilot(planetName);
                });
                distanceList.appendChild(div);
                this._distanceItems.push({ div, nameSpan, distSpan });
            }
        }

        const goToText = i18n.t('go_to');

        // Update existing DOM nodes (no innerHTML rebuild)
        for (let i = 0; i < 4; i++) {
            const item = this._distanceItems[i];
            if (i < closest.length) {
                const { name, dist } = closest[i];
                const shortName = i18n.t(shortNameKeys[name]) || name;
                item.nameSpan.textContent = shortName;
                item.distSpan.textContent = this.formatDistance(dist);
                item.div.dataset.planet = name;
                item.div.title = `${goToText} ${name}`;
                item.div.style.display = '';
            } else {
                item.div.style.display = 'none';
            }
        }
    }

    formatDistance(units) {
        // Convert units to readable distance
        // Uses the manual-mode unit conversion derived from the current scale multiplier.
        const km = units * this.kmPerUnit;

        if (km >= 1000000) {
            return `${(km / 1000000).toFixed(1)}M km`;
        } else if (km >= 1000) {
            return `${(km / 1000).toFixed(0)}k km`;
        }
        return `${km.toFixed(0)} km`;
    }

    updateSpeedometer() {
        // Cache DOM references
        if (!this._speedoFill) {
            this._speedoFill = /** @type {SVGPathElement} */ (this.hud?.querySelector('.speedometer-fill'));
            this._speedoNeedle = this.hud?.querySelector('.speedometer-needle');
        }
        const fill = this._speedoFill;
        const needle = this._speedoNeedle;
        if (!fill) return;

        const warp = this.warpSpeeds[this.warpLevel - 1];
        const maxSpeed = warp.speed * 2; // Including boost
        const speedPercent = Math.min(this.currentSpeed / maxSpeed, 1);

        // Arc length is 126 units (half circle)
        const offset = 126 - (speedPercent * 126);
        fill.style.strokeDashoffset = String(offset);
        fill.style.stroke = warp.color;

        // Move needle
        if (needle) {
            const angle = -90 + (speedPercent * 180); // -90 to 90 degrees
            const radian = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(radian) * 35;
            const cy = 50 + Math.sin(radian) * 35;
            needle.setAttribute('cx', String(cx));
            needle.setAttribute('cy', String(cy));
        }
    }

    updateSpeedLines() {
        // Only show speed lines at warp 5+
        const shouldShow = this.warpLevel >= 5 && this.currentSpeed > 100;

        // Cache speed lines container reference
        if (!this._speedLinesContainer) {
            this._speedLinesContainer = document.querySelector('.speed-lines-container');
        }
        let container = this._speedLinesContainer;

        if (shouldShow && !container) {
            container = document.createElement('div');
            container.className = 'speed-lines-container';

            // Create speed lines
            const lineCount = Math.min((this.warpLevel - 4) * 10, 50);
            for (let i = 0; i < lineCount; i++) {
                const line = document.createElement('div');
                line.className = 'speed-line';
                line.style.top = `${Math.random() * 100}%`;
                line.style.width = `${50 + Math.random() * 100}px`;
                line.style.animationDuration = `${0.1 + Math.random() * 0.3}s`;
                line.style.animationDelay = `${Math.random() * 0.3}s`;
                container.appendChild(line);
            }

            document.body.appendChild(container);
        } else if (!shouldShow && container) {
            container.remove();
            this._speedLinesContainer = null; // Invalidate cache so it's recreated next time
        }
    }

    showWarpFlash() {
        let flash = document.querySelector('.warp-flash');
        if (!flash) {
            flash = document.createElement('div');
            flash.className = 'warp-flash';
            document.body.appendChild(flash);
        }

        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 150);
    }

    setWarpLevel(level) {
        const oldLevel = this.warpLevel;
        this.warpLevel = Math.max(1, Math.min(this.maxWarpLevel, level));

        if (oldLevel !== this.warpLevel) {
            this.showWarpFlash();
            this.app.audioManager?.playWarp();
        } else {
            this.app.audioManager?.playSelect();
        }

        this.updateWarpDisplay();
    }

    enableAutoPilot(planetName) {
        const mesh = this.app.solarSystem?.objects[planetName];
        if (!mesh) return;

        this.autoPilotTarget = planetName;
        this.autoPilotEnabled = true;

        // Show auto-pilot panel
        const panel = this.hud?.querySelector('.nav-autopilot');
        if (panel) {
            panel.classList.remove('hidden');
            panel.querySelector('.autopilot-target').textContent = planetName;

            // Add cancel handler
            const cancelBtn = /** @type {HTMLElement} */ (panel.querySelector('.autopilot-cancel'));
            cancelBtn.onclick = () => this.disableAutoPilot();
        }

        this.app.audioManager?.playSelect();
    }

    disableAutoPilot() {
        this.autoPilotEnabled = false;
        this.autoPilotTarget = null;

        const panel = this.hud?.querySelector('.nav-autopilot');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    updateAutoPilot(deltaTime) {
        const mesh = this.app.solarSystem?.objects[this.autoPilotTarget];
        if (!mesh) {
            this.disableAutoPilot();
            return;
        }

        // Get target position (pre-allocated vectors)
        if (!this._apVecs) {
            this._apVecs = {
                targetPos: new THREE.Vector3(),
                direction: new THREE.Vector3(),
                quat: new THREE.Quaternion(),
                matrix: new THREE.Matrix4(),
                up: new THREE.Vector3(0, 1, 0)
            };
        }
        const targetPos = this._apVecs.targetPos;
        mesh.getWorldPosition(targetPos);

        const distance = this.camera.position.distanceTo(targetPos);

        // Update panel
        const panel = this.hud?.querySelector('.nav-autopilot');
        if (panel) {
            panel.querySelector('.autopilot-distance').textContent = this.formatDistance(distance);
        }

        // If close enough, disable auto-pilot
        if (distance < 500) {
            this.disableAutoPilot();
            this.currentSpeed = 0;
            return;
        }

        // Calculate direction to target (reuse pre-allocated vectors)
        const direction = this._apVecs.direction.copy(targetPos).sub(this.camera.position).normalize();

        // Smoothly rotate towards target
        const targetQuaternion = this._apVecs.quat;
        const lookMatrix = this._apVecs.matrix.lookAt(
            this.camera.position,
            targetPos,
            this._apVecs.up
        );
        targetQuaternion.setFromRotationMatrix(lookMatrix);

        this.camera.quaternion.slerp(targetQuaternion, deltaTime * 2);
        this.euler.setFromQuaternion(this.camera.quaternion);

        // Auto-adjust warp based on distance
        if (distance > 100000) {
            this.warpLevel = 9;
        } else if (distance > 50000) {
            this.warpLevel = 7;
        } else if (distance > 10000) {
            this.warpLevel = 5;
        } else if (distance > 2000) {
            this.warpLevel = 3;
        } else {
            this.warpLevel = 1;
        }
        this.updateWarpDisplay();
        // Also update mobile touch warp display during autopilot
        if (this.touchWarpLevel) {
            this.touchWarpLevel.textContent = String(this.warpLevel);
        }

        // Move towards target
        const warp = this.warpSpeeds[this.warpLevel - 1];
        this.currentSpeed = warp.speed;

        this.camera.position.addScaledVector(direction, this.currentSpeed * deltaTime);

        // Update HUD
        this.updateHUD();
        this.updateCompass();
        this.updateSpeedometer();
    }

    /**
     * Update all translatable UI elements when language changes
     */
    updateTranslations() {
        if (!this.hud) return;

        // Update toggle button tooltip
        if (this.toggleBtn) {
            this.toggleBtn.title = i18n.t('manual_nav_tooltip') || i18n.t('manual_nav');
        }

        // Update manual-mode badge
        const modeBadge = this.hud.querySelector('.nav-mode-badge');
        if (modeBadge) modeBadge.textContent = i18n.t('manual_mode');

        // Update speed unit label
        const speedUnit = this.hud.querySelector('.speed-unit');
        if (speedUnit) speedUnit.textContent = i18n.t('speed_unit_approx');

        // Update controls help panel
        const ctrlForward = this.hud.querySelector('.ctrl-forward');
        const ctrlBackward = this.hud.querySelector('.ctrl-backward');
        const ctrlLeft = this.hud.querySelector('.ctrl-left');
        const ctrlRight = this.hud.querySelector('.ctrl-right');
        const ctrlRoll = this.hud.querySelector('.ctrl-roll');
        const ctrlUp = this.hud.querySelector('.ctrl-up');
        const ctrlBrake = this.hud.querySelector('.ctrl-brake');
        const ctrlExit = this.hud.querySelector('.ctrl-exit');

        if (ctrlForward) ctrlForward.textContent = i18n.t('forward');
        if (ctrlBackward) ctrlBackward.textContent = i18n.t('backward');
        if (ctrlLeft) ctrlLeft.textContent = i18n.t('left');
        if (ctrlRight) ctrlRight.textContent = i18n.t('right');
        if (ctrlRoll) ctrlRoll.textContent = i18n.t('roll');
        if (ctrlUp) ctrlUp.textContent = i18n.t('up');
        if (ctrlBrake) ctrlBrake.textContent = i18n.t('brake');
        if (ctrlExit) ctrlExit.textContent = i18n.t('exit');

        // Update nearby label
        const nearbyLabel = this.hud.querySelector('.nearby-label');
        if (nearbyLabel) nearbyLabel.textContent = i18n.t('nearby');

        // Update autopilot labels
        const autopilotLabel = this.hud.querySelector('.autopilot-label');
        const cancelLabel = this.hud.querySelector('.cancel-label');
        if (autopilotLabel) autopilotLabel.textContent = i18n.t('autopilot');
        if (cancelLabel) cancelLabel.textContent = i18n.t('cancel');

        // Update compass label based on language
        const compassLabel = this.hud.querySelector('.compass-label');
        if (compassLabel) {
            compassLabel.textContent = i18n.t('sun_compass');
        }

        // Update info label
        const ctrlInfo = this.hud.querySelector('.ctrl-info');
        if (ctrlInfo) ctrlInfo.textContent = 'Info';
    }

    /**
     * Find the nearest planet to the camera
     */
    findNearestPlanet() {
        if (!this.app.solarSystem?.objects) return null;

        const mainObjects = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        let nearest = null;
        let nearestDist = Infinity;

        for (const name of mainObjects) {
            const mesh = this.app.solarSystem.objects[name];
            if (mesh) {
                if (!this._nearestWorldPos) this._nearestWorldPos = new THREE.Vector3();
                mesh.getWorldPosition(this._nearestWorldPos);
                const dist = this.camera.position.distanceTo(this._nearestWorldPos);

                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = { name, dist, mesh };
                }
            }
        }

        return nearest;
    }

    /**
     * Toggle planet info panel
     */
    togglePlanetInfo() {
        if (this.infoPanelVisible) {
            this.hidePlanetInfo();
        } else {
            this.showPlanetInfo();
        }
    }

    /**
     * Show info for the nearest planet
     */
    showPlanetInfo() {
        const nearest = this.findNearestPlanet();
        if (!nearest) return;
        this._renderPlanetInfoPanel(nearest.name);
    }

    /**
     * Hide planet info panel
     */
    hidePlanetInfo() {
        this.infoPanelVisible = false;
        this.nearestPlanet = null;

        const panel = this.hud?.querySelector('.nav-planet-info');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    /**
     * Update proximity hint and crosshair based on targeted object
     */
    updateProximityHint() {
        const crosshair = this.hud?.querySelector('.nav-crosshair');
        const crosshairHint = crosshair?.querySelector('.crosshair-hint');
        const hint = this.hud?.querySelector('.nav-proximity-hint');

        // Always hide old proximity hint (we use crosshair now)
        if (hint) hint.classList.add('hidden');

        // Get targeted object via raycasting
        this.targetedObject = this.getTargetedObject();

        if (!crosshair) return;

        if (this.targetedObject && !this.infoPanelVisible) {
            const planetName = this.targetedObject.name === 'sun'
                ? i18n.t('sun_label')
                : this.targetedObject.name;

            crosshair.classList.add('targeting');
            if (crosshairHint) {
                crosshairHint.textContent = `[I] ${planetName}`;
            }
        } else {
            crosshair.classList.remove('targeting');
            if (crosshairHint) crosshairHint.textContent = '';
        }
    }

    /**
     * Get object being targeted by crosshair (raycasting from screen center)
     */
    getTargetedObject() {
        if (!this.app.solarSystem?.objects) return null;

        // Raycast from screen center (where crosshair is)
        if (!this._screenCenter) this._screenCenter = new THREE.Vector2(0, 0);
        this.raycaster.setFromCamera(this._screenCenter, this.camera);

        // Collect all planet meshes
        const mainObjects = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        const meshes = [];

        for (const name of mainObjects) {
            const mesh = this.app.solarSystem.objects[name];
            if (mesh) {
                mesh.userData.planetName = name;
                meshes.push(mesh);
            }
        }

        // Check intersections
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            // Find the root planet mesh from the intersection
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.planetName) {
                obj = obj.parent;
            }

            if (obj.userData.planetName) {
                return {
                    name: obj.userData.planetName,
                    mesh: obj,
                    dist: intersects[0].distance
                };
            }
        }

        // Fallback: check if we're close and looking roughly at a planet
        const nearest = this.findNearestPlanet();
        if (nearest && nearest.dist < 2000) {
            // Check if planet is roughly in front of camera
            if (!this._targetVecs) this._targetVecs = { dir: new THREE.Vector3(), toplanet: new THREE.Vector3() };
            this.camera.getWorldDirection(this._targetVecs.dir);
            const dir = this._targetVecs.dir;

            nearest.mesh.getWorldPosition(this._targetVecs.toplanet);
            const toplanet = this._targetVecs.toplanet;
            toplanet.sub(this.camera.position).normalize();

            const dot = dir.dot(toplanet);
            if (dot > 0.85) { // Looking mostly at the planet (within ~30 degrees)
                return nearest;
            }
        }

        return null;
    }

    /**
     * Handle click - only to close info panel
     * Use "I" key to open info for targeted objects
     */
    onClickInteract(e) {
        // Only handle when manual nav is enabled
        if (!this.enabled) return;

        // Only handle left-clicks
        if (e.button !== 0) return;

        // If showing info, close it on click
        if (this.infoPanelVisible) {
            this.hidePlanetInfo();
        }
    }

    /**
     * Show info for a specific planet by name
     */
    showPlanetInfoFor(planetName) {
        this._renderPlanetInfoPanel(planetName);
    }

    /**
     * Shared helper: render planet info into the HUD panel
     */
    _renderPlanetInfoPanel(planetName) {
        this.nearestPlanet = planetName;
        this.infoPanelVisible = true;

        const planetData = getTranslatedObjectData(planetName);
        if (!planetData) return;

        const panel = this.hud?.querySelector('.nav-planet-info');
        if (!panel) return;

        const nameEl = panel.querySelector('.planet-info-name');
        const typeEl = panel.querySelector('.planet-info-type');
        const statsEl = panel.querySelector('.planet-info-stats');
        const curiosityEl = /** @type {HTMLElement} */ (panel.querySelector('.planet-info-curiosity'));

        if (nameEl) nameEl.textContent = planetData.name || planetName;
        if (typeEl) typeEl.textContent = planetData.type || '';

        if (statsEl) {
            const stats = [
                { key: 'info_distance', val: planetData.avgDistanceFromSun, suffix: ' M km' },
                { key: 'info_temp', val: planetData.avgTemperature },
                { key: 'info_day', val: planetData.dayLength },
                { key: 'info_year', val: planetData.yearLength },
                { key: 'info_moons', val: planetData.knownMoonCount },
                { key: 'radius', val: planetData.radiusKm, fmt: v => v.toLocaleString() + ' km' },
            ];
            statsEl.innerHTML = stats
                .filter(s => s.val !== undefined && s.val !== null)
                .map(s => `<div class="planet-info-stat">
                    <div class="planet-info-stat-label">${i18n.t(s.key)}</div>
                    <div class="planet-info-stat-value">${s.fmt ? s.fmt(s.val) : s.val + (s.suffix || '')}</div>
                </div>`).join('');
        }

        if (curiosityEl && planetData.trivia?.length > 0) {
            const randomCuriosity = planetData.trivia[Math.floor(Math.random() * planetData.trivia.length)];
            curiosityEl.innerHTML = `<div class="planet-info-curiosity-title">${i18n.t('info_wow_facts')}</div>${randomCuriosity}`;
            curiosityEl.style.display = 'block';
        } else if (curiosityEl) {
            curiosityEl.style.display = 'none';
        }

        panel.classList.remove('hidden');
        const closeBtn = /** @type {HTMLElement} */ (panel.querySelector('.planet-info-close'));
        if (closeBtn) closeBtn.onclick = () => this.hidePlanetInfo();
        this.app.audioManager?.playSelect();
    }
}
