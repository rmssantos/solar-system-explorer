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
}
