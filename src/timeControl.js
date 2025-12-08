/**
 * Time Control System - Control orbital speed
 * Allows speeding up, slowing down, or pausing time
 */

import { i18n } from './i18n.js';

export class TimeControl {
    constructor(app) {
        this.app = app;
        this.timeScale = 1; // 1 = normal, 0 = paused, >1 = fast forward
        this.isPaused = false;
        
        this.presets = [
            { label: '⏸️', value: 0, name: { pt: 'Pausado', en: 'Paused' } },
            { label: '🐌', value: 0.25, name: { pt: 'Muito Lento', en: 'Very Slow' } },
            { label: '🐢', value: 0.5, name: { pt: 'Lento', en: 'Slow' } },
            { label: '▶️', value: 1, name: { pt: 'Normal', en: 'Normal' } },
            { label: '⏩', value: 2, name: { pt: 'Rápido', en: 'Fast' } },
            { label: '🚀', value: 5, name: { pt: 'Muito Rápido', en: 'Very Fast' } },
            { label: '⚡', value: 10, name: { pt: 'Velocidade Máxima', en: 'Maximum Speed' } }
        ];
        
        this.createUI();
        this.setupKeyboardShortcuts();
    }
    
    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.className = 'time-control';
        this.container.innerHTML = `
            <div class="time-control-header">
                <span class="time-icon">⏱️</span>
                <span class="time-label">${i18n.t('timeControl', 'Tempo')}</span>
            </div>
            <div class="time-control-body">
                <div class="time-slider-container">
                    <input type="range" 
                           class="time-slider" 
                           id="time-slider"
                           min="0" 
                           max="10" 
                           step="0.25" 
                           value="1">
                    <div class="time-value" id="time-value">1x</div>
                </div>
                <div class="time-presets" id="time-presets"></div>
            </div>
        `;
        document.body.appendChild(this.container);
        
        // Build preset buttons
        const presetsContainer = this.container.querySelector('#time-presets');
        const lang = i18n.lang;
        
        this.presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'time-preset-btn';
            btn.innerHTML = preset.label;
            btn.title = preset.name[lang];
            btn.dataset.value = preset.value;
            
            if (preset.value === 1) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                this.setTimeScale(preset.value);
                this.updateActivePreset(preset.value);
            });
            
            presetsContainer.appendChild(btn);
        });
        
        // Slider event
        const slider = this.container.querySelector('#time-slider');
        slider.addEventListener('input', (e) => {
            this.setTimeScale(parseFloat(e.target.value));
        });
        
        // Toggle expand/collapse
        const header = this.container.querySelector('.time-control-header');
        header.addEventListener('click', () => {
            this.container.classList.toggle('expanded');
        });
        
        // Start collapsed on mobile
        if (window.innerWidth > 768) {
            this.container.classList.add('expanded');
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                    // Spacebar: toggle pause
                    e.preventDefault();
                    this.togglePause();
                    break;
                case '+':
                case '=':
                    // Plus: speed up
                    this.speedUp();
                    break;
                case '-':
                    // Minus: slow down
                    this.slowDown();
                    break;
                case '0':
                    // Reset to normal
                    this.setTimeScale(1);
                    break;
            }
        });
    }
    
    setTimeScale(value) {
        this.timeScale = Math.max(0, Math.min(10, value));
        this.isPaused = this.timeScale === 0;
        
        // Update UI
        const slider = this.container.querySelector('#time-slider');
        const valueDisplay = this.container.querySelector('#time-value');
        
        slider.value = this.timeScale;
        
        if (this.timeScale === 0) {
            valueDisplay.textContent = '⏸️';
            valueDisplay.classList.add('paused');
        } else {
            valueDisplay.textContent = `${this.timeScale}x`;
            valueDisplay.classList.remove('paused');
        }
        
        this.updateActivePreset(this.timeScale);
        
        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('timeScaleChanged', { 
            detail: { timeScale: this.timeScale }
        }));
    }
    
    updateActivePreset(value) {
        const buttons = this.container.querySelectorAll('.time-preset-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.value) === value);
        });
    }
    
    togglePause() {
        if (this.isPaused) {
            // Resume to previous speed or 1x
            this.setTimeScale(this.previousTimeScale || 1);
        } else {
            // Pause
            this.previousTimeScale = this.timeScale;
            this.setTimeScale(0);
        }
    }
    
    speedUp() {
        const newScale = Math.min(10, this.timeScale + 0.5);
        this.setTimeScale(newScale);
    }
    
    slowDown() {
        const newScale = Math.max(0, this.timeScale - 0.5);
        this.setTimeScale(newScale);
    }
    
    getTimeScale() {
        return this.timeScale;
    }
}
