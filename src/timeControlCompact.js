/**
 * Time Control Compact - Single line with modern buttons
 * Controls orbital speed with elegant design
 */

import { i18n } from './i18n.js';

export class TimeControlCompact {
    constructor(app) {
        this.app = app;
        this.timeScale = 1;
        this.isPaused = false;
        this.previousTimeScale = 1;
        this.isExpanded = true;
        
        this.presets = [
            { icon: '⏸️', value: 0 },
            { icon: '🐌', value: 0.25 },
            { icon: '🐢', value: 0.5 },
            { icon: '▶️', value: 1 },
            { icon: '⏩', value: 2 },
            { icon: '🚀', value: 5 },
            { icon: '⚡', value: 10 }
        ];
        
        this.createUI();
        this.setupKeyboardShortcuts();
    }
    
    createUI() {
        // Main container - compact single line
        this.container = document.createElement('div');
        this.container.id = 'time-control-compact';
        this.container.className = 'time-compact';
        
        // Toggle/hamburger button to show/hide - modern icon
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'time-toggle-btn';
        toggleBtn.title = i18n.t('toggle_controls') || 'Mostrar/Esconder';
        toggleBtn.addEventListener('click', () => this.toggleExpanded());
        
        // Create modern toggle icon with CSS
        const toggleIcon = document.createElement('div');
        toggleIcon.className = 'toggle-icon expanded';
        toggleBtn.appendChild(toggleIcon);
        this.toggleIcon = toggleIcon;
        
        this.container.appendChild(toggleBtn);
        
        // Collapsible content wrapper
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.className = 'time-content';
        
        // Speed display
        const speedDisplay = document.createElement('div');
        speedDisplay.className = 'time-speed';
        speedDisplay.id = 'time-speed-display';
        speedDisplay.innerHTML = '1x';
        
        // Preset buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'time-buttons';
        
        this.presets.forEach((preset, index) => {
            const btn = document.createElement('button');
            btn.className = 'time-btn';
            btn.innerHTML = preset.icon;
            btn.dataset.value = preset.value;
            btn.dataset.index = index;
            
            if (preset.value === 1) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                this.setTimeScale(preset.value);
            });
            
            buttonsContainer.appendChild(btn);
        });
        
        this.contentWrapper.appendChild(speedDisplay);
        this.contentWrapper.appendChild(buttonsContainer);
        
        // Add language selector inside time control
        this.addLanguageButtons();
        
        this.container.appendChild(this.contentWrapper);
        document.body.appendChild(this.container);
        
        this.addStyles();
    }
    
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('collapsed', !this.isExpanded);
        if (this.toggleIcon) {
            this.toggleIcon.classList.toggle('expanded', this.isExpanded);
            this.toggleIcon.classList.toggle('collapsed', !this.isExpanded);
        }
    }
    
    addLanguageButtons() {
        const langContainer = document.createElement('div');
        langContainer.className = 'time-lang';
        
        const currentLang = i18n.lang;
        
        const ptBtn = document.createElement('button');
        ptBtn.className = `lang-btn ${currentLang === 'pt' ? 'active' : ''}`;
        ptBtn.innerHTML = '🇵🇹';
        ptBtn.title = 'Português';
        ptBtn.id = 'lang-btn-pt';
        ptBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setLanguage('pt');
        });
        
        const enBtn = document.createElement('button');
        enBtn.className = `lang-btn ${currentLang === 'en' ? 'active' : ''}`;
        enBtn.innerHTML = '🇬🇧';
        enBtn.title = 'English';
        enBtn.id = 'lang-btn-en';
        enBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setLanguage('en');
        });
        
        langContainer.appendChild(ptBtn);
        langContainer.appendChild(enBtn);
        this.contentWrapper.appendChild(langContainer);
        
        // Store references for updates
        this.ptBtn = ptBtn;
        this.enBtn = enBtn;
    }
    
    setLanguage(lang) {
        // Use i18n system instead of direct localStorage
        i18n.setLang(lang);
        
        // Update button states
        if (this.ptBtn && this.enBtn) {
            this.ptBtn.classList.toggle('active', lang === 'pt');
            this.enBtn.classList.toggle('active', lang === 'en');
        }
        
        // Update UI elements that need translation
        this.updateTranslatedElements();
    }
    
    updateTranslatedElements() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translated = i18n.t(key);
            if (translated !== key) {
                el.textContent = translated;
            }
        });
        
        // Dispatch custom event for other components to update
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: i18n.lang }));
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case '+':
                case '=':
                    this.speedUp();
                    break;
                case '-':
                    this.slowDown();
                    break;
                case '0':
                    this.setTimeScale(1);
                    break;
            }
        });
    }
    
    setTimeScale(value) {
        this.timeScale = Math.max(0, Math.min(10, value));
        this.isPaused = this.timeScale === 0;
        
        // Update display
        const display = document.getElementById('time-speed-display');
        if (display) {
            if (this.timeScale === 0) {
                display.innerHTML = '⏸️';
                display.classList.add('paused');
            } else {
                display.innerHTML = `${this.timeScale}x`;
                display.classList.remove('paused');
            }
        }
        
        // Update active button
        const buttons = this.container.querySelectorAll('.time-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.value) === this.timeScale);
        });
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('timeScaleChanged', { 
            detail: { timeScale: this.timeScale }
        }));
    }
    
    togglePause() {
        if (this.isPaused) {
            this.setTimeScale(this.previousTimeScale || 1);
        } else {
            this.previousTimeScale = this.timeScale;
            this.setTimeScale(0);
        }
    }
    
    speedUp() {
        const currentIndex = this.presets.findIndex(p => p.value === this.timeScale);
        if (currentIndex < this.presets.length - 1) {
            this.setTimeScale(this.presets[currentIndex + 1].value);
        }
    }
    
    slowDown() {
        const currentIndex = this.presets.findIndex(p => p.value === this.timeScale);
        if (currentIndex > 0) {
            this.setTimeScale(this.presets[currentIndex - 1].value);
        }
    }
    
    getTimeScale() {
        return this.timeScale;
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .time-compact {
                position: fixed;
                bottom: 15px;
                right: 15px;
                z-index: 800;
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 5px 10px;
                background: rgba(15, 20, 40, 0.9);
                border: 1px solid rgba(100, 150, 255, 0.2);
                border-radius: 20px;
                backdrop-filter: blur(15px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                opacity: 0.4;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .time-compact:hover {
                opacity: 1;
            }
            
            .time-compact.panel-hidden {
                transform: translateX(calc(100% + 20px));
                opacity: 0;
                pointer-events: none;
            }
            
            .time-toggle-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 6px;
                border-radius: 6px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .time-toggle-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            /* Modern toggle icon - chevron arrows */
            .toggle-icon {
                width: 12px;
                height: 12px;
                position: relative;
                transition: transform 0.3s ease;
            }
            
            .toggle-icon::before,
            .toggle-icon::after {
                content: '';
                position: absolute;
                width: 6px;
                height: 2px;
                background: linear-gradient(90deg, #66ddff, #4a90e2);
                border-radius: 1px;
                transition: all 0.3s ease;
            }
            
            .toggle-icon.expanded::before {
                top: 4px;
                left: 0;
                transform: rotate(45deg);
            }
            
            .toggle-icon.expanded::after {
                top: 4px;
                left: 4px;
                transform: rotate(-45deg);
            }
            
            .toggle-icon.collapsed::before {
                top: 3px;
                left: 3px;
                transform: rotate(-45deg);
            }
            
            .toggle-icon.collapsed::after {
                top: 7px;
                left: 3px;
                transform: rotate(45deg);
            }
            
            .time-toggle-btn:hover .toggle-icon::before,
            .time-toggle-btn:hover .toggle-icon::after {
                background: linear-gradient(90deg, #ffffff, #88ccff);
            }
            
            .time-content {
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s ease;
            }
            
            .time-compact.collapsed .time-content {
                display: none;
            }
            
            .time-speed {
                font-size: 0.8rem;
                font-weight: 700;
                color: #66ddff;
                min-width: 30px;
                text-align: center;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            
            .time-speed.paused {
                color: #ff6666;
                animation: pulse-pause 1s ease-in-out infinite;
            }
            
            @keyframes pulse-pause {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .time-buttons {
                display: flex;
                gap: 4px;
            }
            
            .time-btn {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(60, 80, 120, 0.4);
                font-size: 0.85rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s ease;
                padding: 0;
            }
            
            .time-btn:hover {
                background: rgba(80, 100, 150, 0.6);
                transform: scale(1.1);
            }
            
            .time-btn.active {
                background: linear-gradient(135deg, #4a90e2, #357abd);
                border-color: #66aaff;
                box-shadow: 0 0 12px rgba(74, 144, 226, 0.5);
            }
            
            /* Language buttons inside time bar */
            .time-lang {
                display: flex;
                gap: 3px;
                margin-left: 6px;
                padding-left: 8px;
                border-left: 1px solid rgba(100, 150, 255, 0.3);
            }
            
            .lang-btn {
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid transparent;
                background: rgba(40, 50, 80, 0.6);
                font-size: 0.9rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s ease;
                padding: 0;
            }
            
            .lang-btn:hover {
                transform: scale(1.1);
                border-color: rgba(100, 150, 255, 0.5);
            }
            
            .lang-btn.active {
                border-color: #4a90e2;
                box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
            }
            
            /* Hide old time control */
            .time-control {
                display: none !important;
            }
            
            /* Hide old language selector */
            .lang-selector {
                display: none !important;
            }
            
            /* Mobile */
            @media (max-width: 768px) {
                .time-compact {
                    padding: 6px 12px;
                    gap: 8px;
                }
                
                .time-btn {
                    width: 32px;
                    height: 32px;
                    font-size: 0.9rem;
                }
                
                .time-speed {
                    font-size: 0.85rem;
                    min-width: 32px;
                }
            }
            
            @media (max-width: 480px) {
                .time-compact {
                    bottom: 10px;
                    right: 10px;
                    padding: 4px 8px;
                }
                
                .time-btn {
                    width: 28px;
                    height: 28px;
                    font-size: 0.8rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
