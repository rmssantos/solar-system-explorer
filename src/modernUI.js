/**
 * Modern UI Layout Controller
 * Handles language selector and overall UI layout organization
 */

import { i18n } from './i18n.js';

export class ModernUI {
    constructor(app) {
        this.app = app;
        
        this.addGlobalStyles();
        this.createLanguageSelector();
        this.translateStaticElements();
        this.fixInfoPanelClose();
    }
    
    translateStaticElements() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translation = i18n.t(key);
            if (translation !== key) {
                el.textContent = translation;
            }
        });
        
        // Translate specific elements
        const controlsTitle = document.getElementById('controls-title');
        if (controlsTitle) {
            controlsTitle.textContent = i18n.t('controls_title', 'Controlos');
        }
    }
    
    fixInfoPanelClose() {
        // Ensure close button works properly
        const closeBtn = document.getElementById('close-info');
        const infoPanel = document.getElementById('info-panel');
        
        if (closeBtn && infoPanel) {
            // Remove old listeners and add fresh one
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                infoPanel.classList.add('hidden');
            });
        }
    }
    
    createLanguageSelector() {
        // Remove existing if any
        const existing = document.getElementById('lang-selector');
        if (existing) existing.remove();
        
        // Language flags container - position at TOP RIGHT corner
        const langSelector = document.createElement('div');
        langSelector.className = 'lang-selector';
        langSelector.id = 'lang-selector';
        
        const currentLang = i18n.lang || 'pt';
        
        // Portuguese flag
        const ptBtn = document.createElement('button');
        ptBtn.className = `lang-flag ${currentLang === 'pt' ? 'active' : ''}`;
        ptBtn.innerHTML = '🇵🇹';
        ptBtn.title = 'Português';
        ptBtn.dataset.lang = 'pt';
        
        // English flag  
        const enBtn = document.createElement('button');
        enBtn.className = `lang-flag ${currentLang === 'en' ? 'active' : ''}`;
        enBtn.innerHTML = '🇬🇧';
        enBtn.title = 'English';
        enBtn.dataset.lang = 'en';
        
        // Click handlers
        [ptBtn, enBtn].forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                i18n.setLang(lang);
                
                // Visual feedback
                ptBtn.classList.toggle('active', lang === 'pt');
                enBtn.classList.toggle('active', lang === 'en');
                
                // Reload to apply translations
                setTimeout(() => location.reload(), 300);
            });
        });
        
        langSelector.appendChild(ptBtn);
        langSelector.appendChild(enBtn);
        document.body.appendChild(langSelector);
    }
    
    addGlobalStyles() {
        // Remove old style if exists
        const oldStyle = document.getElementById('modern-ui-styles');
        if (oldStyle) oldStyle.remove();
        
        const style = document.createElement('style');
        style.id = 'modern-ui-styles';
        style.textContent = `
            /* ========== LANGUAGE SELECTOR - Bottom Right with Time Control ========== */
            .lang-selector {
                position: fixed;
                bottom: 70px;
                right: 10px;
                z-index: 1100;
                display: flex;
                gap: 4px;
            }
            
            .lang-flag {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid transparent;
                background: rgba(20, 25, 45, 0.9);
                font-size: 1.2rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
            }
            
            .lang-flag:hover {
                transform: scale(1.1);
                border-color: rgba(100, 150, 255, 0.5);
            }
            
            .lang-flag.active {
                border-color: #4a90e2;
                box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
            }
            
            /* ========== MINIMAP - Top Right, HIGH z-index ========== */
            .minimap-container, #minimap-container {
                position: fixed !important;
                top: 0 !important;
                right: 0 !important;
                left: auto !important;
                bottom: auto !important;
                width: 180px !important;
                z-index: 1500 !important;
                border-radius: 0 0 0 12px !important;
                border: 2px solid rgba(100, 150, 255, 0.4) !important;
                background: rgba(5, 10, 25, 0.9) !important;
            }
            
            /* ========== MISSIONS PANEL - Top Left, away from toolbar ========== */
            .missions-panel, #missions-panel, #mission-panel {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: auto !important;
                width: 220px !important;
                max-height: 200px !important;
                overflow-y: auto !important;
                z-index: 800 !important;
                background: rgba(15, 20, 40, 0.95) !important;
                border-radius: 0 0 12px 0 !important;
                border: 1px solid rgba(100, 150, 255, 0.2) !important;
                font-size: 0.8rem !important;
                pointer-events: auto !important;
            }
            
            /* ========== INFO PANEL - Center Right ========== */
            #info-panel {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                right: auto !important;
                max-width: 450px !important;
                width: 90% !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                z-index: 2000 !important;
                background: rgba(10, 15, 35, 0.98) !important;
                border: 2px solid rgba(100, 150, 255, 0.4) !important;
                border-radius: 16px !important;
                backdrop-filter: blur(20px) !important;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8) !important;
            }
            
            #info-panel.hidden {
                display: none !important;
            }
            
            /* ========== CLOSE BUTTON - Prominent Red X ========== */
            #close-info, .close-info-btn {
                position: absolute !important;
                top: 12px !important;
                right: 12px !important;
                width: 36px !important;
                height: 36px !important;
                border-radius: 50% !important;
                border: 2px solid rgba(255, 100, 100, 0.5) !important;
                background: rgba(200, 50, 50, 0.9) !important;
                color: white !important;
                font-size: 1.4rem !important;
                font-weight: bold !important;
                cursor: pointer !important;
                z-index: 100 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
                line-height: 1 !important;
            }
            
            #close-info:hover, .close-info-btn:hover {
                background: rgba(255, 60, 60, 1) !important;
                transform: scale(1.1) !important;
                box-shadow: 0 0 15px rgba(255, 100, 100, 0.6) !important;
            }
            
            /* ========== HUD PANEL - Bottom Left, simple vertical ========== */
            #hud-panel {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: auto !important;
                top: auto !important;
                z-index: 700 !important;
                background: rgba(15, 20, 40, 0.9) !important;
                border: 1px solid rgba(100, 150, 255, 0.2) !important;
                border-radius: 0 10px 0 0 !important;
                padding: 10px 14px !important;
                backdrop-filter: blur(12px) !important;
                max-width: 200px !important;
                pointer-events: auto !important;
            }
            
            #hud-panel h3 {
                font-size: 0.85rem !important;
                margin-bottom: 6px !important;
                color: #88aaff !important;
            }
            
            #hud-panel .hud-section {
                margin: 0 !important;
                padding: 0 !important;
            }
            
            #hud-panel .hud-section ul {
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
            }
            
            #hud-panel .hud-section li {
                font-size: 0.75rem !important;
                margin-bottom: 3px !important;
                opacity: 0.9 !important;
            }
            
            #hud-panel .nav-controls {
                display: flex !important;
                gap: 6px !important;
                margin-top: 8px !important;
            }
            
            #hud-panel button {
                padding: 5px 10px !important;
                font-size: 0.75rem !important;
                border-radius: 8px !important;
            }
            
            /* ========== PASSPORT - Top Center ========== */
            #passport-panel {
                position: fixed !important;
                top: 0 !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                right: auto !important;
                z-index: 700 !important;
                border-radius: 0 0 12px 12px !important;
            }
            
            /* ========== XP PANEL - Bottom Center (compact) ========== */
            .xp-panel, #xp-panel {
                position: fixed !important;
                bottom: 0 !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                z-index: 700 !important;
                max-width: 260px !important;
                padding: 6px 12px !important;
                font-size: 0.8rem !important;
                pointer-events: auto !important;
                border-radius: 12px 12px 0 0 !important;
            }
            
            .xp-panel .xp-header {
                gap: 6px !important;
            }
            
            .xp-panel .xp-rank-icon {
                font-size: 1.2rem !important;
            }
            
            .xp-panel .xp-rank-name {
                font-size: 0.75rem !important;
            }
            
            .xp-panel .xp-amount {
                font-size: 0.7rem !important;
            }
            
            .xp-panel .xp-bar-container {
                height: 4px !important;
            }
            
            .xp-panel .xp-next {
                font-size: 0.65rem !important;
                padding-top: 3px !important;
            }
            
            /* ========== HIDE OLD ELEMENTS ========== */
            #photo-btn, #gallery-btn, #compare-btn,
            .photo-btn, .gallery-btn, .compare-btn,
            #settings-btn, .collectibles-counter, #collectibles-counter {
                display: none !important;
            }
            
            /* ========== MOBILE RESPONSIVE ========== */
            @media (max-width: 768px) {
                .lang-selector {
                    right: 240px;
                    bottom: 10px;
                }
                
                .lang-flag {
                    width: 28px;
                    height: 28px;
                    font-size: 1rem;
                }
                
                .minimap-container, #minimap-container {
                    width: 120px !important;
                    top: 0 !important;
                    right: 0 !important;
                    border-radius: 0 0 0 12px !important;
                }
                
                .missions-panel, #missions-panel {
                    top: 0 !important;
                    left: 0 !important;
                    right: auto !important;
                    width: 180px !important;
                    max-height: 180px !important;
                    font-size: 0.85rem !important;
                    border-radius: 0 0 12px 0 !important;
                }
                
                #hud-panel {
                    left: 0 !important;
                    bottom: 0 !important;
                    padding: 8px 12px !important;
                    border-radius: 0 10px 0 0 !important;
                }
                
                #passport-panel {
                    display: none !important;
                }
                
                #info-panel {
                    max-width: 95% !important;
                    max-height: 85vh !important;
                }
            }
            
            @media (max-width: 480px) {
                .missions-panel, #missions-panel {
                    display: none !important;
                }
                
                .lang-selector {
                    right: 100px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
