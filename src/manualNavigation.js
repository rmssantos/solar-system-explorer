/**
 * Manual Navigation System - Fly your spaceship through space!
 * WASD/Arrows for movement, Mouse for looking around
 * Touch controls for mobile/tablet!
 * Features: Warp speeds with real km/s comparisons!
 */

import * as THREE from 'three';
import { i18n } from './i18n.js';
import { SOLAR_SYSTEM_DATA as SOLAR_SYSTEM_DATA_PT } from './data/objectsInfo.js';
import { SOLAR_SYSTEM_DATA_EN } from './data/objectsInfoEN.js';

// Get correct planet data based on language
function getPlanetData() {
    return i18n.lang === 'en' ? SOLAR_SYSTEM_DATA_EN : SOLAR_SYSTEM_DATA_PT;
}

// Get translated warp speed name
function getWarpName(level) {
    const lang = i18n.lang || 'pt';
    const names = {
        en: ['Impulse', 'Warp 1', 'Warp 2', 'Warp 3', 'Warp 4', 'Warp 5', 'Warp 6', 'Warp 7', 'Warp 9 (Light!)'],
        pt: ['Impulso', 'Warp 1', 'Warp 2', 'Warp 3', 'Warp 4', 'Warp 5', 'Warp 6', 'Warp 7', 'Warp 9 (Luz!)']
    };
    return names[lang]?.[level - 1] || names.pt[level - 1];
}

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
        
        // Speed settings - much faster for space travel!
        // In our scale: 1 unit ≈ 10,000 km (approximately)
        // With 150x scale multiplier, distances are HUGE - speeds adjusted accordingly
        this.warpSpeeds = [
            { level: 1, speed: 500,     realKmS: 10000,     name: 'Impulso',       color: '#4a90e2' },
            { level: 2, speed: 1500,    realKmS: 50000,     name: 'Warp 1',        color: '#5a9df2' },
            { level: 3, speed: 4000,    realKmS: 100000,    name: 'Warp 2',        color: '#6ab0ff' },
            { level: 4, speed: 10000,   realKmS: 500000,    name: 'Warp 3',        color: '#7ac3ff' },
            { level: 5, speed: 25000,   realKmS: 1000000,   name: 'Warp 4',        color: '#8ad6ff' },
            { level: 6, speed: 60000,   realKmS: 5000000,   name: 'Warp 5',        color: '#ffa500' },
            { level: 7, speed: 150000,  realKmS: 20000000,  name: 'Warp 6',        color: '#ff8c00' },
            { level: 8, speed: 350000,  realKmS: 50000000,  name: 'Warp 7',        color: '#ff6347' },
            { level: 9, speed: 800000,  realKmS: 299792,    name: 'Warp 9 (Luz!)', color: '#ff00ff' }  // Speed of light! (299,792 km/s)
        ];
        
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
        this.originalObjectScales = new Map(); // Store original scales for each object
        this.solarSystemScaleMultiplier = 150; // Make everything 150x bigger for truly vast distances
        
        // Realistic size multipliers to fix visual scale problems
        // 
        // THE CORE PROBLEM:
        // - Sun uses: raioKm * 0.25 * 0.0001 = 0.000025 factor
        // - Planets use: raioKm * 0.001 = 0.001 factor
        // - This means planets are 40x BIGGER relative to the Sun than reality!
        //
        // REAL PROPORTIONS (radius in km):
        // - Sol: 696,340 (reference)
        // - Jupiter: 69,911 → Sol is 10x bigger
        // - Saturn: 58,232 → Sol is 12x bigger
        // - Uranus: 25,362 → Sol is 27x bigger
        // - Neptune: 24,622 → Sol is 28x bigger
        // - Earth: 6,371 → Sol is 109x bigger
        // - Venus: 6,051 → Sol is 115x bigger
        // - Mars: 3,389 → Sol is 205x bigger
        // - Mercury: 2,439 → Sol is 285x bigger
        //
        // To fix: multiply Sun by 40 to compensate, OR divide planets by 40
        // We'll do a mix: Sun x4, and reduce gas giants significantly
        this.realisticScales = {
            'sun': 4.0,        // Boost sun 4x (was artificially shrunk)
            'jupiter': 0.1,    // 69911*0.001=70 → 70*0.1=7 (Sol will be ~100, so Sol is ~14x bigger)
            'saturn': 0.1,    // 58232*0.001=58 → 58*0.1=5.8
            'uranus': 0.15,     // 25362*0.001=25 → 25*0.15=3.8
            'neptune': 0.15,   // 24622*0.001=25 → 25*0.15=3.8
            'earth': 0.5,      // 6371*0.001=6.4 → 6.4*0.5=3.2
            'venus': 0.5,      // Similar to Earth
            'mars': 0.6,      // 3389*0.001=3.4 → 3.4*0.6=2.0
            'mercury': 0.8,   // 2439*0.001=2.4 → 2.4*0.8=1.9
            'moon': 0.5,
            'io': 0.15,
            'europa': 0.15,
            'ganymede': 0.12,
            'callisto': 0.12,
            'titan': 0.15,
            'mimas': 0.3,
            'enceladus': 0.3,
            'triton': 0.2,
            'phobos': 0.5,
            'deimos': 0.5,
            'default': 0.5
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
        this.toggleBtn.title = i18n.t('manual_nav') || 'Navegação Manual (M)';
        this.toggleBtn.onclick = () => this.toggle();
        document.body.appendChild(this.toggleBtn);
        
        // Determine if touch device
        const isMobile = this.isTouchDevice;
        
        // HUD for manual mode
        this.hud = document.createElement('div');
        this.hud.className = 'manual-nav-hud hidden';
        this.hud.innerHTML = `
            <div class="nav-warp-display">
                <div class="warp-level">
                    <span class="warp-name">IMPULSO</span>
                    <span class="warp-number">1</span>
                </div>
                <div class="warp-bar">
                    <div class="warp-fill"></div>
                </div>
                <div class="warp-speed">
                    <span class="speed-value">0</span>
                    <span class="speed-unit">km/s</span>
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
                    <div class="compass-indicator sun-indicator" title="${i18n.lang === 'en' ? 'Sun' : 'Sol'}">☀️</div>
                </div>
                <div class="compass-center">●</div>
                <div class="compass-label">${i18n.lang === 'en' ? 'SUN' : 'SOL'}</div>
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
        
        this.warpNameDisplay = this.hud.querySelector('.warp-name');
        this.warpNumberDisplay = this.hud.querySelector('.warp-number');
        this.warpFill = this.hud.querySelector('.warp-fill');
        this.speedDisplay = this.hud.querySelector('.speed-value');
        this.speedComparison = this.hud.querySelector('.speed-comparison');
        this.touchWarpLevel = this.hud.querySelector('.touch-warp-level');
        
        // Add styles
        this.addStyles();
    }
    
    addStyles() {
        if (document.getElementById('manual-nav-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'manual-nav-styles';
        style.textContent = `
            .manual-nav-toggle {
                position: fixed;
                bottom: 130px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #4a90e2;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.3);
            }
            
            /* Mobile adjustments for toggle button */
            @media (hover: none) and (pointer: coarse) {
                .manual-nav-toggle {
                    bottom: 200px;
                    right: 15px;
                    width: 45px;
                    height: 45px;
                    font-size: 20px;
                }
            }
            
            @media (max-height: 500px) and (hover: none) and (pointer: coarse) {
                .manual-nav-toggle {
                    bottom: 80px;
                    right: 15px;
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                }
            }
            
            .manual-nav-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 0 25px rgba(74, 144, 226, 0.6);
            }
            
            .manual-nav-toggle.active {
                background: linear-gradient(135deg, #4a90e2, #357abd);
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 15px rgba(74, 144, 226, 0.5); }
                50% { box-shadow: 0 0 30px rgba(74, 144, 226, 0.8); }
            }
            
            .manual-nav-hud {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 999;
            }
            
            .manual-nav-hud.hidden {
                display: none;
            }
            
            .nav-warp-display {
                position: absolute;
                top: 15px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                padding: 8px 20px;
                border-radius: 20px;
                border: 1px solid rgba(74, 144, 226, 0.5);
                font-family: 'Orbitron', monospace, sans-serif;
                text-align: center;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .warp-level {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .warp-name {
                color: #4a90e2;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .warp-number {
                background: linear-gradient(135deg, #4a90e2, #357abd);
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
            }
            
            .warp-bar {
                width: 80px;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .warp-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #4a90e2, #00ff88);
                border-radius: 3px;
                transition: width 0.2s ease, background 0.3s ease;
            }
            
            .warp-speed {
                display: flex;
                align-items: baseline;
                gap: 3px;
            }
            
            .speed-value {
                color: #4a90e2;
                font-size: 16px;
                font-weight: bold;
            }
            
            .speed-unit {
                color: #666;
                font-size: 10px;
            }
            
            .speed-comparison {
                font-size: 10px;
                color: #888;
                max-width: 150px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .nav-controls-help {
                position: absolute;
                bottom: 100px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                padding: 15px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                font-size: 12px;
            }
            
            .control-row {
                display: flex;
                gap: 10px;
                margin: 5px 0;
                color: #aaa;
            }
            
            .control-row .key {
                background: rgba(74, 144, 226, 0.3);
                padding: 2px 8px;
                border-radius: 4px;
                color: #4a90e2;
                font-family: monospace;
                min-width: 50px;
                text-align: center;
            }
            
            .nav-crosshair {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 30px;
                color: rgba(74, 144, 226, 0.5);
                font-weight: 100;
                text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
                pointer-events: none;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .nav-crosshair.targeting {
                color: #4ade80;
                text-shadow: 0 0 15px rgba(74, 222, 128, 0.8);
                transform: translate(-50%, -50%) scale(1.2);
            }

            .crosshair-hint {
                font-size: 12px;
                color: #4ade80;
                background: rgba(0, 0, 0, 0.7);
                padding: 4px 10px;
                border-radius: 12px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .nav-crosshair.targeting .crosshair-hint {
                opacity: 1;
            }
            
            /* Hide other UI elements when in manual mode */
            body.manual-nav-active #hud-panel,
            body.manual-nav-active #passport-panel,
            body.manual-nav-active .mission-panel,
            body.manual-nav-active .xp-bar-container,
            body.manual-nav-active .comparator-button,
            body.manual-nav-active .settings-btn,
            body.manual-nav-active .manual-nav-toggle,
            body.manual-nav-active .toolbar,
            body.manual-nav-active .toolbar-main,
            body.manual-nav-active .time-compact,
            body.manual-nav-active .time-control-panel,
            body.manual-nav-active .photo-btn,
            body.manual-nav-active .gallery-btn,
            body.manual-nav-active .planet-info-panel,
            body.manual-nav-active .info-panel,
            body.manual-nav-active .quiz-panel,
            body.manual-nav-active .celebration-overlay,
            body.manual-nav-active .collectibles-panel,
            body.manual-nav-active .achievements-panel,
            body.manual-nav-active .level-up-modal,
            body.manual-nav-active #navigation-hint {
                opacity: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
            }
            
            /* ========== TOUCH CONTROLS (Mobile/Tablet) ========== */
            .desktop-only {
                display: block;
            }
            .mobile-only {
                display: none;
            }
            
            @media (hover: none) and (pointer: coarse) {
                .desktop-only { display: none !important; }
                .mobile-only { display: flex !important; }
                .nav-crosshair { font-size: 24px; }
                .nav-warp-display { 
                    top: 80px; 
                    transform: translateX(-50%) scale(0.9);
                }
            }
            
            .touch-controls {
                pointer-events: auto;
                display: none;
                flex-direction: column;
            }
            
            /* Virtual Joystick - Left side, bottom */
            .touch-joystick {
                position: absolute;
                bottom: 40px;
                left: 20px;
                width: 130px;
                height: 130px;
            }
            
            .joystick-base {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                border: 3px solid rgba(74, 144, 226, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
            }
            
            .joystick-stick {
                width: 55px;
                height: 55px;
                background: linear-gradient(135deg, #4a90e2, #357abd);
                border-radius: 50%;
                box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
                transition: transform 0.05s ease-out;
            }
            
            /* Warp controls - Horizontal bar at bottom center */
            .touch-warp-controls {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.8);
                padding: 6px 12px;
                border-radius: 25px;
                border: 2px solid rgba(74, 144, 226, 0.5);
            }
            
            .touch-warp-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 2px solid #4a90e2;
                background: rgba(74, 144, 226, 0.3);
                color: white;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                touch-action: manipulation;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .touch-warp-btn:active {
                background: #4a90e2;
                transform: scale(0.95);
            }
            
            .touch-warp-level {
                font-size: 20px;
                font-weight: bold;
                color: #4a90e2;
                min-width: 28px;
                text-align: center;
                font-family: 'Orbitron', monospace;
            }
            
            /* Action buttons - Right side, organized vertically with spacing */
            .touch-action-buttons {
                position: absolute;
                bottom: 40px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: center;
            }
            
            .touch-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 3px solid rgba(74, 144, 226, 0.6);
                background: rgba(0, 0, 0, 0.7);
                font-size: 24px;
                cursor: pointer;
                touch-action: manipulation;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .touch-btn:active, .touch-btn.active {
                background: rgba(74, 144, 226, 0.5);
                transform: scale(0.95);
            }
            
            .touch-boost {
                border-color: #ffa500;
                order: 2; /* Middle */
            }
            .touch-boost.active {
                background: rgba(255, 165, 0, 0.5);
                box-shadow: 0 0 20px rgba(255, 165, 0, 0.7);
            }
            
            .touch-up {
                border-color: #00ff88;
                order: 1; /* Top */
            }
            
            .touch-down {
                border-color: #ff6b6b;
                order: 3; /* Bottom */
            }
            
            /* Exit button - Top left corner to avoid conflict with warp display */
            .touch-exit-btn {
                position: absolute;
                top: 15px;
                left: 15px;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid #ff6b6b;
                background: rgba(255, 50, 50, 0.8);
                color: white;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                touch-action: manipulation;
                z-index: 1001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .touch-exit-btn:active {
                transform: scale(0.9);
            }
            
            /* Tablet-specific adjustments */
            @media (min-width: 768px) and (hover: none) and (pointer: coarse) {
                .touch-joystick {
                    width: 150px;
                    height: 150px;
                    bottom: 50px;
                    left: 30px;
                }
                .joystick-stick {
                    width: 65px;
                    height: 65px;
                }
                .touch-btn {
                    width: 70px;
                    height: 70px;
                    font-size: 28px;
                }
                .touch-action-buttons {
                    gap: 15px;
                    right: 30px;
                    bottom: 50px;
                }
                .touch-warp-controls {
                    padding: 10px 18px;
                    gap: 12px;
                    bottom: 50px;
                }
                .touch-warp-btn {
                    width: 44px;
                    height: 44px;
                    font-size: 24px;
                }
                .touch-warp-level {
                    font-size: 24px;
                    min-width: 35px;
                }
                .touch-exit-btn {
                    width: 50px;
                    height: 50px;
                    font-size: 22px;
                }
                .nav-warp-display {
                    transform: translateX(-50%) scale(1);
                }
            }
            
            /* Landscape phone adjustments */
            @media (max-height: 500px) and (hover: none) and (pointer: coarse) {
                .touch-joystick {
                    width: 100px;
                    height: 100px;
                    bottom: 20px;
                    left: 15px;
                }
                .joystick-stick {
                    width: 45px;
                    height: 45px;
                }
                .touch-btn {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
                .touch-action-buttons {
                    gap: 8px;
                    right: 15px;
                    bottom: 20px;
                }
                .touch-warp-controls {
                    padding: 5px 10px;
                    gap: 6px;
                    bottom: 20px;
                }
                .touch-warp-btn {
                    width: 32px;
                    height: 32px;
                    font-size: 18px;
                }
                .touch-warp-level {
                    font-size: 18px;
                    min-width: 24px;
                }
                .touch-exit-btn {
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                    top: 10px;
                    left: 10px;
                }
                .nav-warp-display {
                    top: 10px;
                    padding: 5px 15px;
                    gap: 10px;
                }
                .nav-warp-display .warp-name { font-size: 10px; }
                .nav-warp-display .warp-number { width: 20px; height: 20px; font-size: 12px; }
                .nav-warp-display .speed-value { font-size: 14px; }
            }

            /* Speedometer gauge */
            .nav-speedometer {
                position: fixed;
                top: 100px;
                left: 20px;
                width: 120px;
                background: rgba(10, 15, 30, 0.85);
                border: 1px solid rgba(100, 150, 255, 0.3);
                border-radius: 10px;
                padding: 10px;
                backdrop-filter: blur(8px);
            }
            .speedometer-svg {
                width: 100%;
                height: 60px;
            }
            .speedometer-bg {
                fill: none;
                stroke: rgba(100, 150, 255, 0.2);
                stroke-width: 8;
                stroke-linecap: round;
            }
            .speedometer-fill {
                fill: none;
                stroke: #4a90e2;
                stroke-width: 8;
                stroke-linecap: round;
                stroke-dasharray: 126;
                stroke-dashoffset: 126;
                transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
            }
            .speedometer-needle {
                fill: #fff;
                filter: drop-shadow(0 0 3px #fff);
            }
            .speedometer-label {
                text-align: center;
                color: rgba(150, 180, 255, 0.8);
                font-size: 10px;
                margin-top: 5px;
                letter-spacing: 2px;
            }

            /* Space compass - positioned on left side below speedometer */
            .nav-compass {
                position: fixed;
                top: 220px;
                left: 20px;
                width: 80px;
                height: 80px;
                background: rgba(10, 15, 30, 0.85);
                border: 1px solid rgba(100, 150, 255, 0.3);
                border-radius: 50%;
                backdrop-filter: blur(8px);
            }
            .compass-ring {
                position: absolute;
                inset: 5px;
                border: 2px solid rgba(100, 150, 255, 0.3);
                border-radius: 50%;
            }
            .compass-indicator {
                position: absolute;
                font-size: 16px;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
                text-shadow: 0 0 10px rgba(255, 200, 50, 0.8);
            }
            .compass-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: rgba(150, 180, 255, 0.6);
                font-size: 8px;
            }
            .compass-label {
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                color: rgba(150, 180, 255, 0.7);
                font-size: 9px;
                letter-spacing: 1px;
                white-space: nowrap;
            }

            /* Distance display - horizontal bar at bottom */
            .nav-distances {
                position: fixed;
                bottom: 15px;
                right: 80px;
                background: rgba(10, 15, 30, 0.9);
                border: 1px solid rgba(100, 150, 255, 0.3);
                border-radius: 20px;
                padding: 6px 12px;
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .distance-title {
                color: rgba(150, 180, 255, 0.8);
                font-size: 9px;
                letter-spacing: 1px;
            }
            .distance-list {
                display: flex;
                gap: 5px;
            }
            .distance-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                padding: 3px 8px;
                border-radius: 8px;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .distance-item:hover {
                background: rgba(74, 144, 226, 0.3);
                border-color: rgba(74, 144, 226, 0.5);
            }
            .distance-item .planet-name {
                color: #fff;
                font-size: 9px;
                font-weight: bold;
            }
            .distance-item .planet-dist {
                color: rgba(150, 180, 255, 0.6);
                font-size: 8px;
            }

            /* Auto-pilot panel */
            .nav-autopilot {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(10, 20, 40, 0.95);
                border: 2px solid #4a90e2;
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                z-index: 1002;
                min-width: 200px;
            }
            .nav-autopilot.hidden { display: none; }
            .autopilot-header {
                color: #4a90e2;
                font-size: 14px;
                margin-bottom: 10px;
                letter-spacing: 2px;
            }
            .autopilot-target {
                color: #fff;
                font-size: 18px;
                margin-bottom: 5px;
            }
            .autopilot-distance {
                color: rgba(150, 180, 255, 0.8);
                font-size: 12px;
                margin-bottom: 15px;
            }
            .autopilot-cancel {
                background: rgba(255, 100, 100, 0.3);
                border: 1px solid #ff6b6b;
                color: #ff6b6b;
                padding: 8px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            .autopilot-cancel:hover {
                background: rgba(255, 100, 100, 0.5);
            }

            /* Planet markers in 3D space */
            .planet-marker {
                position: fixed;
                pointer-events: auto;
                cursor: pointer;
                transition: transform 0.1s ease;
                z-index: 100;
            }
            .planet-marker:hover {
                transform: scale(1.2);
            }
            .planet-marker-content {
                background: rgba(10, 20, 40, 0.9);
                border: 1px solid rgba(100, 150, 255, 0.5);
                border-radius: 8px;
                padding: 5px 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
            }
            .planet-marker-icon {
                font-size: 16px;
            }
            .planet-marker-name {
                color: #fff;
                font-size: 11px;
                font-weight: bold;
            }
            .planet-marker-dist {
                color: rgba(150, 180, 255, 0.7);
                font-size: 9px;
            }
            .planet-marker-arrow {
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid rgba(100, 150, 255, 0.5);
            }

            /* Speed lines effect */
            .speed-lines-container {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 50;
                overflow: hidden;
            }
            .speed-line {
                position: absolute;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
                height: 1px;
                animation: speedLineMove 0.3s linear infinite;
            }
            @keyframes speedLineMove {
                from { transform: translateX(-100vw); }
                to { transform: translateX(100vw); }
            }

            /* Warp flash effect */
            .warp-flash {
                position: fixed;
                inset: 0;
                background: radial-gradient(circle, rgba(100, 150, 255, 0.3) 0%, transparent 70%);
                pointer-events: none;
                z-index: 99;
                opacity: 0;
                transition: opacity 0.15s ease;
            }
            .warp-flash.active {
                opacity: 1;
            }

            /* Emergency brake effect */
            .emergency-brake-effect {
                position: fixed;
                inset: 0;
                border: 4px solid #ff4444;
                pointer-events: none;
                z-index: 98;
                opacity: 0;
                transition: opacity 0.1s;
            }
            .emergency-brake-effect.active {
                opacity: 1;
                animation: brakeFlash 0.2s ease-out;
            }
            @keyframes brakeFlash {
                0%, 100% { border-color: #ff4444; }
                50% { border-color: #ff8888; }
            }

            /* Planet info panel */
            .nav-planet-info {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 280px;
                max-height: 70vh;
                background: rgba(10, 20, 40, 0.95);
                border: 2px solid rgba(100, 150, 255, 0.5);
                border-radius: 15px;
                padding: 15px;
                pointer-events: auto;
                overflow-y: auto;
                z-index: 1003;
                animation: slideIn 0.2s ease;
            }
            .nav-planet-info.hidden { display: none; }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-50%) translateX(20px); }
                to { opacity: 1; transform: translateY(-50%) translateX(0); }
            }
            .planet-info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(100, 150, 255, 0.3);
            }
            .planet-info-name {
                font-size: 18px;
                font-weight: bold;
                color: #fff;
            }
            .planet-info-close {
                background: rgba(255, 100, 100, 0.3);
                border: 1px solid #ff6b6b;
                color: #ff6b6b;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            .planet-info-close:hover {
                background: rgba(255, 100, 100, 0.5);
            }
            .planet-info-type {
                color: rgba(150, 180, 255, 0.8);
                font-size: 12px;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .planet-info-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 15px;
            }
            .planet-info-stat {
                background: rgba(100, 150, 255, 0.1);
                padding: 8px;
                border-radius: 8px;
            }
            .planet-info-stat-label {
                color: rgba(150, 180, 255, 0.6);
                font-size: 9px;
                text-transform: uppercase;
            }
            .planet-info-stat-value {
                color: #fff;
                font-size: 12px;
                font-weight: bold;
            }
            .planet-info-curiosity {
                background: rgba(255, 200, 50, 0.1);
                border-left: 3px solid #ffc832;
                padding: 10px;
                border-radius: 0 8px 8px 0;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.4;
            }
            .planet-info-curiosity-title {
                color: #ffc832;
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            /* Proximity hint */
            .nav-proximity-hint {
                position: fixed;
                bottom: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(10, 20, 40, 0.9);
                border: 1px solid rgba(100, 150, 255, 0.5);
                border-radius: 20px;
                padding: 8px 20px;
                pointer-events: none;
                z-index: 1001;
                animation: fadeInUp 0.3s ease;
            }
            .nav-proximity-hint.hidden { display: none; }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .proximity-text {
                color: #fff;
                font-size: 13px;
            }
            .proximity-text .key-hint {
                background: rgba(74, 144, 226, 0.4);
                padding: 2px 8px;
                border-radius: 4px;
                color: #4a90e2;
                font-weight: bold;
            }

            /* Touch info button */
            .touch-info {
                border-color: #4a90e2 !important;
                order: 0; /* First in the list */
            }
            .touch-info.active {
                background: rgba(74, 144, 226, 0.5);
                box-shadow: 0 0 20px rgba(74, 144, 226, 0.7);
            }

            /* Hide new elements on mobile for now */
            @media (hover: none) and (pointer: coarse) {
                .nav-speedometer,
                .nav-compass,
                .nav-distances {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    initEventListeners() {
        // Keyboard - use capture phase to intercept before other handlers
        document.addEventListener('keydown', (e) => this.onKeyDown(e), true);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), true);
        
        // Mouse
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());

        // Mouse look with left-click drag (consistent with exploration mode)
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Click to close info panel (use "I" key to open info)
        document.addEventListener('click', (e) => this.onClickInteract(e));

        // Prevent context menu when using fallback mouse look
        document.addEventListener('contextmenu', (e) => {
            if (this.enabled && !this.isTouchDevice) {
                e.preventDefault();
            }
        });

        // Toggle with M key
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey) {
                this.toggle();
            }
        });
        
        // Touch event listeners (will be activated when HUD is shown)
        this.initTouchListeners();
    }
    
    initTouchListeners() {
        // Get touch elements after they're in DOM
        setTimeout(() => {
            // Joystick
            const joystick = document.getElementById('touch-joystick');
            if (joystick) {
                joystick.addEventListener('touchstart', (e) => this.onJoystickStart(e), { passive: false });
                joystick.addEventListener('touchmove', (e) => this.onJoystickMove(e), { passive: false });
                joystick.addEventListener('touchend', (e) => this.onJoystickEnd(e), { passive: false });
            }
            
            // Warp buttons
            const warpBtns = document.querySelectorAll('.touch-warp-btn');
            warpBtns.forEach(btn => {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const dir = btn.dataset.warp;
                    if (dir === 'up') this.setWarpLevel(this.warpLevel + 1);
                    else if (dir === 'down') this.setWarpLevel(this.warpLevel - 1);
                    if (this.touchWarpLevel) this.touchWarpLevel.textContent = this.warpLevel;
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
            document.addEventListener('touchstart', (e) => this.onTouchLookStart(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.onTouchLookMove(e), { passive: false });
            document.addEventListener('touchend', (e) => this.onTouchLookEnd(e), { passive: false });
            
        }, 100);
    }
    
    onJoystickStart(e) {
        if (!this.enabled) return;
        e.preventDefault();
        const touch = e.touches[0];
        const joystick = document.getElementById('touch-joystick');
        const rect = joystick.getBoundingClientRect();
        
        this.touchJoystickActive = true;
        this.joystickOrigin = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        this.moveForward = true; // Start moving when touching joystick
    }
    
    onJoystickMove(e) {
        if (!this.enabled || !this.touchJoystickActive) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const dx = touch.clientX - this.joystickOrigin.x;
        const dy = touch.clientY - this.joystickOrigin.y;
        
        // Limit to joystick radius
        const maxRadius = 50;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clampedDistance = Math.min(distance, maxRadius);
        const angle = Math.atan2(dy, dx);
        
        const clampedX = Math.cos(angle) * clampedDistance;
        const clampedY = Math.sin(angle) * clampedDistance;
        
        // Move the joystick stick visual
        const stick = document.querySelector('.joystick-stick');
        if (stick) {
            stick.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        }
        
        // Convert to movement
        const threshold = 15;
        this.moveForward = dy < -threshold;
        this.moveBackward = dy > threshold;
        this.moveLeft = dx < -threshold;
        this.moveRight = dx > threshold;
    }
    
    onJoystickEnd(e) {
        if (!this.enabled) return;
        this.touchJoystickActive = false;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Reset joystick visual
        const stick = document.querySelector('.joystick-stick');
        if (stick) {
            stick.style.transform = 'translate(0, 0)';
        }
    }
    
    onTouchLookStart(e) {
        if (!this.enabled) return;
        
        // Only handle touches on right half of screen (for looking)
        const touch = e.touches[0];
        if (touch.clientX < window.innerWidth / 2) return;
        
        // Don't interfere with buttons
        if (e.target.closest('.touch-controls button, .touch-warp-controls, .touch-action-buttons, .touch-exit-btn')) return;
        
        this.touchLookActive = true;
        this.lastTouchLook = { x: touch.clientX, y: touch.clientY };
    }
    
    onTouchLookMove(e) {
        if (!this.enabled || !this.touchLookActive) return;
        
        const touch = e.touches[0];
        const dx = touch.clientX - this.lastTouchLook.x;
        const dy = touch.clientY - this.lastTouchLook.y;
        
        // Apply rotation (similar to mouse look)
        this.euler.y -= dx * this.mouseSensitivity * 2;
        this.euler.x -= dy * this.mouseSensitivity * 2;
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        
        this.camera.quaternion.setFromEuler(this.euler);
        
        this.lastTouchLook = { x: touch.clientX, y: touch.clientY };
    }
    
    onTouchLookEnd(e) {
        this.touchLookActive = false;
    }
    
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    enable() {
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
            this.touchWarpLevel.textContent = this.warpLevel;
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

        // Show mouse controls hint on desktop
        if (!this.isTouchDevice) {
            this.showMouseControlsHint();
        }

        console.log('🎮 Navegação manual ativada! Use 1-9 para Warp');
    }

    showMouseControlsHint() {
        // Show hint for mouse controls (works with or without pointer lock)
        const hint = document.createElement('div');
        hint.className = 'mouse-controls-hint';
        hint.innerHTML = `
            <div class="hint-content">
                <span>🖱️</span>
                <span>${i18n.lang === 'en' ? 'Click + drag to look around | WASD to move | I = Info' : 'Clica + arrasta para olhar | WASD para mover | I = Info'}</span>
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
        if (this.originalCameraPosition) {
            this.camera.position.copy(this.originalCameraPosition);
        }
        
        // Reset touch states
        this.touchJoystickActive = false;
        this.touchLookActive = false;
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

        console.log('🎮 Navegação manual desativada');
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
        
        for (const [name, mesh] of Object.entries(this.app.solarSystem.objects)) {
            // Store original scale
            this.originalObjectScales.set(name, mesh.scale.clone());
            
            // Get scale multiplier for this object
            const scaleMultiplier = this.realisticScales[name] || this.realisticScales['default'];
            
            // Apply scale
            mesh.scale.multiplyScalar(scaleMultiplier);
            
            // Special: Also scale any glow effects attached to the Sun
            if (name === 'sun' && mesh.children) {
                mesh.children.forEach(child => {
                    if (child.material?.transparent) {
                        child.scale.setScalar(1); // Reset child scale relative to parent
                    }
                });
            }
        }
        
        console.log('🌟 Realistic scales applied - Sun is now MASSIVE!');
    }
    
    /**
     * Restore original scales when exiting manual navigation
     */
    restoreOriginalScales() {
        if (!this.app.solarSystem?.objects) return;
        
        for (const [name, mesh] of Object.entries(this.app.solarSystem.objects)) {
            const originalScale = this.originalObjectScales.get(name);
            if (originalScale) {
                mesh.scale.copy(originalScale);
            }
        }
        
        this.originalObjectScales.clear();
        console.log('🔄 Original scales restored');
    }

    updateWarpDisplay() {
        const warp = this.warpSpeeds[this.warpLevel - 1];
        if (this.warpNameDisplay) {
            // Use translated warp name
            this.warpNameDisplay.textContent = getWarpName(this.warpLevel);
            this.warpNameDisplay.style.color = warp.color;
        }
        if (this.warpNumberDisplay) {
            this.warpNumberDisplay.textContent = this.warpLevel;
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
        console.log('⚠️ Pointer lock blocked - using fallback mouse controls');

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
                <span>${i18n.lang === 'en' ? 'Hold RIGHT CLICK + move mouse to look around' : 'Segura BOTÃO DIREITO + move rato para olhar'}</span>
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
        if (!this.enabled || this.isTouchDevice) return;

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
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
            const up = new THREE.Vector3(0, 1, 0);

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

        // Update HUD elements
        this.updateHUD();
        this.updateCompass();
        this.updateDistances();
        this.updateSpeedometer();
        this.updateProximityHint();
    }
    
    formatSpeed(kmPerSec) {
        const lang = i18n.lang || 'pt';
        if (kmPerSec >= 299792) {
            return lang === 'en' ? 'Speed of Light! ⚡' : 'Velocidade da Luz! ⚡';
        } else if (kmPerSec >= 1000000) {
            return lang === 'en' 
                ? `${(kmPerSec / 1000000).toFixed(1)} million km/s`
                : `${(kmPerSec / 1000000).toFixed(1)} milhões km/s`;
        } else if (kmPerSec >= 1000) {
            return lang === 'en'
                ? `${(kmPerSec / 1000).toFixed(0)}k km/s`
                : `${(kmPerSec / 1000).toFixed(0)} mil km/s`;
        }
        return `${kmPerSec.toLocaleString()} km/s`;
    }
    
    getSpeedComparison(kmPerSec) {
        const lang = i18n.lang || 'pt';
        // Fun comparisons for kids!
        if (kmPerSec >= 299792) {
            return lang === 'en' ? '🌟 Nothing in the universe is faster!' : '🌟 Nada no universo é mais rápido!';
        } else if (kmPerSec >= 50000000) {
            return lang === 'en' ? '🚀 Earth → Mars in 1 minute!' : '🚀 Terra → Marte em 1 minuto!';
        } else if (kmPerSec >= 20000000) {
            return lang === 'en' ? '🌍 Around the world in 0.002 seconds!' : '🌍 Volta ao mundo em 0.002 segundos!';
        } else if (kmPerSec >= 5000000) {
            return lang === 'en' ? '☀️ Sun → Earth in 30 seconds!' : '☀️ Sol → Terra em 30 segundos!';
        } else if (kmPerSec >= 1000000) {
            return lang === 'en' ? '🛸 100x faster than Voyager!' : '🛸 100x mais rápido que a Voyager!';
        } else if (kmPerSec >= 500000) {
            return lang === 'en' ? '⚡ 50x faster than lightning!' : '⚡ 50x mais rápido que um raio!';
        } else if (kmPerSec >= 100000) {
            return lang === 'en' ? '🏎️ 10,000x faster than an F1 car!' : '🏎️ 10.000x mais rápido que um Fórmula 1!';
        } else if (kmPerSec >= 50000) {
            return lang === 'en' ? '✈️ 5,000x faster than a plane!' : '✈️ 5.000x mais rápido que um avião!';
        } else {
            return lang === 'en' ? '🚗 Like a super fast space car!' : '🚗 Como um carro espacial super veloz!';
        }
    }
    
    updateHUD() {
        const warp = this.warpSpeeds[this.warpLevel - 1];
        
        // Calculate "real" speed based on warp level
        const speedPercent = this.currentSpeed / warp.speed;
        const realKmS = Math.round(warp.realKmS * speedPercent);
        const lang = i18n.lang || 'pt';
        
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
                this.speedComparison.textContent = lang === 'en' ? 'Press W to accelerate!' : 'Pressiona W para acelerar!';
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
        let effect = document.querySelector('.emergency-brake-effect');
        if (!effect) {
            effect = document.createElement('div');
            effect.className = 'emergency-brake-effect';
            document.body.appendChild(effect);
        }
        effect.classList.add('active');
    }

    hideBrakeEffect() {
        const effect = document.querySelector('.emergency-brake-effect');
        if (effect) {
            effect.classList.remove('active');
        }
    }

    updateCompass() {
        const sunIndicator = this.hud?.querySelector('.sun-indicator');
        if (!sunIndicator) return;

        // Get direction to sun (origin)
        const toSun = new THREE.Vector3(0, 0, 0).sub(this.camera.position);

        // Project to camera's view plane
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);

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
        const distanceList = this.hud?.querySelector('.distance-list');
        if (!distanceList || !this.app.solarSystem?.objects) return;

        // Calculate distances to all major objects
        const distances = [];
        const mainObjects = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

        for (const name of mainObjects) {
            const mesh = this.app.solarSystem.objects[name];
            if (mesh) {
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                const dist = this.camera.position.distanceTo(worldPos);
                distances.push({ name, dist, mesh });
            }
        }

        // Sort by distance and take top 4 for horizontal display
        distances.sort((a, b) => a.dist - b.dist);
        const closest = distances.slice(0, 4);

        // Short planet names for compact display - using i18n
        const shortNameKeys = {
            'sun': 'short_sun',
            'mercury': 'short_mercury',
            'venus': 'short_venus',
            'earth': 'short_earth',
            'mars': 'short_mars',
            'jupiter': 'short_jupiter',
            'saturn': 'short_saturn',
            'uranus': 'short_uranus',
            'neptune': 'short_neptune'
        };

        const goToText = i18n.t('go_to');

        // Update HTML
        distanceList.innerHTML = closest.map(({ name, dist }) => {
            const shortName = i18n.t(shortNameKeys[name]) || name;
            return `
            <div class="distance-item" data-planet="${name}" title="${goToText} ${name}">
                <span class="planet-name">${shortName}</span>
                <span class="planet-dist">${this.formatDistance(dist)}</span>
            </div>
        `;
        }).join('');

        // Add click handlers for auto-pilot
        distanceList.querySelectorAll('.distance-item').forEach(item => {
            item.onclick = () => {
                const planetName = item.dataset.planet;
                this.enableAutoPilot(planetName);
            };
        });
    }

    formatDistance(units) {
        // Convert units to readable distance
        // At 150x scale, 1 unit ≈ some distance
        const km = units * 100; // Approximate conversion

        if (km >= 1000000) {
            return `${(km / 1000000).toFixed(1)}M km`;
        } else if (km >= 1000) {
            return `${(km / 1000).toFixed(0)}k km`;
        }
        return `${km.toFixed(0)} km`;
    }

    updateSpeedometer() {
        const fill = this.hud?.querySelector('.speedometer-fill');
        const needle = this.hud?.querySelector('.speedometer-needle');
        if (!fill) return;

        const warp = this.warpSpeeds[this.warpLevel - 1];
        const maxSpeed = warp.speed * 2; // Including boost
        const speedPercent = Math.min(this.currentSpeed / maxSpeed, 1);

        // Arc length is 126 units (half circle)
        const offset = 126 - (speedPercent * 126);
        fill.style.strokeDashoffset = offset;
        fill.style.stroke = warp.color;

        // Move needle
        if (needle) {
            const angle = -90 + (speedPercent * 180); // -90 to 90 degrees
            const radian = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(radian) * 35;
            const cy = 50 + Math.sin(radian) * 35;
            needle.setAttribute('cx', cx);
            needle.setAttribute('cy', cy);
        }
    }

    updateSpeedLines() {
        // Only show speed lines at warp 5+
        const shouldShow = this.warpLevel >= 5 && this.currentSpeed > 100;

        let container = document.querySelector('.speed-lines-container');

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
        }

        this.updateWarpDisplay();
        this.app.audioManager?.playSelect();
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
            const cancelBtn = panel.querySelector('.autopilot-cancel');
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

        // Get target position
        const targetPos = new THREE.Vector3();
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

        // Calculate direction to target
        const direction = targetPos.clone().sub(this.camera.position).normalize();

        // Smoothly rotate towards target
        const targetQuaternion = new THREE.Quaternion();
        const lookMatrix = new THREE.Matrix4().lookAt(
            this.camera.position,
            targetPos,
            new THREE.Vector3(0, 1, 0)
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
            this.toggleBtn.title = i18n.t('manual_nav');
        }

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
            compassLabel.textContent = i18n.lang === 'en' ? 'SUN' : 'SOL';
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
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                const dist = this.camera.position.distanceTo(worldPos);

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

        this.nearestPlanet = nearest.name;
        this.infoPanelVisible = true;

        // Get planet data (imported at top of file)
        const planetData = getPlanetData()[nearest.name];

        if (!planetData) return;

        const panel = this.hud?.querySelector('.nav-planet-info');
        if (!panel) return;

        // Fill in the data
        const nameEl = panel.querySelector('.planet-info-name');
        const typeEl = panel.querySelector('.planet-info-type');
        const statsEl = panel.querySelector('.planet-info-stats');
        const curiosityEl = panel.querySelector('.planet-info-curiosity');

        if (nameEl) nameEl.textContent = planetData.nome || nearest.name;
        if (typeEl) typeEl.textContent = planetData.tipo || '';

        // Stats
        if (statsEl) {
            let statsHTML = '';

            if (planetData.distanciaSol) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_distance')}</div>
                        <div class="planet-info-stat-value">${planetData.distanciaSol}</div>
                    </div>
                `;
            }
            if (planetData.temperaturaMedia) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_temp')}</div>
                        <div class="planet-info-stat-value">${planetData.temperaturaMedia}</div>
                    </div>
                `;
            }
            if (planetData.duracaoDia) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_day')}</div>
                        <div class="planet-info-stat-value">${planetData.duracaoDia}</div>
                    </div>
                `;
            }
            if (planetData.duracaoAno) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_year')}</div>
                        <div class="planet-info-stat-value">${planetData.duracaoAno}</div>
                    </div>
                `;
            }
            if (planetData.luasConhecidas !== undefined) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_moons')}</div>
                        <div class="planet-info-stat-value">${planetData.luasConhecidas}</div>
                    </div>
                `;
            }
            if (planetData.raioKm) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('radius')}</div>
                        <div class="planet-info-stat-value">${planetData.raioKm.toLocaleString()} km</div>
                    </div>
                `;
            }

            statsEl.innerHTML = statsHTML;
        }

        // Curiosity
        if (curiosityEl && planetData.curiosidades && planetData.curiosidades.length > 0) {
            const randomCuriosity = planetData.curiosidades[Math.floor(Math.random() * planetData.curiosidades.length)];
            curiosityEl.innerHTML = `
                <div class="planet-info-curiosity-title">${i18n.t('info_wow_facts')}</div>
                ${randomCuriosity}
            `;
            curiosityEl.style.display = 'block';
        } else if (curiosityEl) {
            curiosityEl.style.display = 'none';
        }

        // Show panel
        panel.classList.remove('hidden');

        // Add close button handler
        const closeBtn = panel.querySelector('.planet-info-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hidePlanetInfo();
        }

        this.app.audioManager?.playSelect();
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
                ? (i18n.lang === 'en' ? 'Sun' : 'Sol')
                : this.targetedObject.name;

            crosshair.classList.add('targeting');
            if (crosshairHint) {
                crosshairHint.textContent = i18n.lang === 'en'
                    ? `[I] ${planetName}`
                    : `[I] ${planetName}`;
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
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

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
            const dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);

            const toplanet = new THREE.Vector3();
            nearest.mesh.getWorldPosition(toplanet);
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
        this.nearestPlanet = planetName;
        this.infoPanelVisible = true;

        // Get planet data
        const planetData = getPlanetData()[planetName];
        if (!planetData) return;

        const panel = this.hud?.querySelector('.nav-planet-info');
        if (!panel) return;

        // Fill in the data
        const nameEl = panel.querySelector('.planet-info-name');
        const typeEl = panel.querySelector('.planet-info-type');
        const statsEl = panel.querySelector('.planet-info-stats');
        const curiosityEl = panel.querySelector('.planet-info-curiosity');

        if (nameEl) nameEl.textContent = planetData.nome || planetName;
        if (typeEl) typeEl.textContent = planetData.tipo || '';

        // Stats
        if (statsEl) {
            let statsHTML = '';

            if (planetData.distanciaSol) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_distance')}</div>
                        <div class="planet-info-stat-value">${planetData.distanciaSol}</div>
                    </div>
                `;
            }
            if (planetData.temperaturaMedia) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_temp')}</div>
                        <div class="planet-info-stat-value">${planetData.temperaturaMedia}</div>
                    </div>
                `;
            }
            if (planetData.duracaoDia) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_day')}</div>
                        <div class="planet-info-stat-value">${planetData.duracaoDia}</div>
                    </div>
                `;
            }
            if (planetData.duracaoAno) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_year')}</div>
                        <div class="planet-info-stat-value">${planetData.duracaoAno}</div>
                    </div>
                `;
            }
            if (planetData.luasConhecidas !== undefined) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('info_moons')}</div>
                        <div class="planet-info-stat-value">${planetData.luasConhecidas}</div>
                    </div>
                `;
            }
            if (planetData.raioKm) {
                statsHTML += `
                    <div class="planet-info-stat">
                        <div class="planet-info-stat-label">${i18n.t('radius')}</div>
                        <div class="planet-info-stat-value">${planetData.raioKm.toLocaleString()} km</div>
                    </div>
                `;
            }

            statsEl.innerHTML = statsHTML;
        }

        // Curiosity
        if (curiosityEl && planetData.curiosidades && planetData.curiosidades.length > 0) {
            const randomCuriosity = planetData.curiosidades[Math.floor(Math.random() * planetData.curiosidades.length)];
            curiosityEl.innerHTML = `
                <div class="planet-info-curiosity-title">${i18n.t('info_wow_facts')}</div>
                ${randomCuriosity}
            `;
            curiosityEl.style.display = 'block';
        } else if (curiosityEl) {
            curiosityEl.style.display = 'none';
        }

        // Show panel
        panel.classList.remove('hidden');

        // Add close button handler
        const closeBtn = panel.querySelector('.planet-info-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hidePlanetInfo();
        }

        this.app.audioManager?.playSelect();
    }
}
