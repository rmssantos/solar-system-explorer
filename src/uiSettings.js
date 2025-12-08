/**
 * UI Settings Manager
 * Handles visibility toggles and transparency for all UI panels
 * Provides unified semi-transparent panels with hover-to-opaque behavior
 */

import { i18n } from './i18n.js';

export class UISettings {
    constructor(app) {
        this.app = app;
        
        // Panel visibility states (load from localStorage)
        this.panelStates = this.loadStates();
        
        // Create settings button and panel
        this.createSettingsButton();
        this.createSettingsPanel();
        
        // Apply initial states
        this.applyAllStates();
        
        // Listen for manual navigation mode changes
        window.addEventListener('manualNavModeChanged', (e) => {
            this.onManualNavModeChanged(e.detail.active);
        });
    }
    
    loadStates() {
        try {
            const saved = localStorage.getItem('ui-panel-states');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load UI states:', e);
        }
        
        return {
            passport: true,
            passportExpanded: true,
            minimap: true,
            minimapExpanded: true,
            timeControl: true,
            langSelector: true,
            hudPanel: true
        };
    }
    
    saveStates() {
        try {
            localStorage.setItem('ui-panel-states', JSON.stringify(this.panelStates));
        } catch (e) {
            console.warn('Failed to save UI states:', e);
        }
    }
    
    createSettingsButton() {
        this.settingsBtn = document.createElement('button');
        this.settingsBtn.className = 'ui-settings-btn';
        this.settingsBtn.innerHTML = '⚙️';
        this.settingsBtn.title = i18n.t('ui_settings') || 'Configurações UI';
        this.settingsBtn.onclick = () => this.togglePanel();
        document.body.appendChild(this.settingsBtn);
    }
    
    createSettingsPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'ui-settings-panel hidden';
        
        this.panel.innerHTML = `
            <div class="ui-settings-header">
                <span>⚙️ ${i18n.t('ui_settings')}</span>
                <button class="ui-settings-close">×</button>
            </div>
            <div class="ui-settings-body">
                <label class="ui-toggle-row">
                    <input type="checkbox" data-panel="passport" ${this.panelStates.passport ? 'checked' : ''}>
                    <span>🛂 ${i18n.t('passport_title')}</span>
                </label>
                <label class="ui-toggle-row">
                    <input type="checkbox" data-panel="minimap" ${this.panelStates.minimap ? 'checked' : ''}>
                    <span>🗺️ ${i18n.t('minimap')}</span>
                </label>
                <label class="ui-toggle-row">
                    <input type="checkbox" data-panel="timeControl" ${this.panelStates.timeControl ? 'checked' : ''}>
                    <span>⏱️ ${i18n.t('time_control')}</span>
                </label>
                <label class="ui-toggle-row">
                    <input type="checkbox" data-panel="langSelector" ${this.panelStates.langSelector ? 'checked' : ''}>
                    <span>🌐 ${i18n.t('language')}</span>
                </label>
                <label class="ui-toggle-row">
                    <input type="checkbox" data-panel="hudPanel" ${this.panelStates.hudPanel ? 'checked' : ''}>
                    <span>🎮 ${i18n.t('controls_title')}</span>
                </label>
            </div>
        `;
        
        // Event listeners
        this.panel.querySelector('.ui-settings-close').onclick = () => this.togglePanel();
        
        this.panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const panel = e.target.dataset.panel;
                this.panelStates[panel] = e.target.checked;
                this.applyPanelState(panel);
                this.saveStates();
            });
        });
        
        document.body.appendChild(this.panel);
        
        // Add styles
        this.addStyles();
    }
    
    togglePanel() {
        this.panel.classList.toggle('hidden');
        this.settingsBtn.classList.toggle('active');
    }
    
    applyAllStates() {
        Object.keys(this.panelStates).forEach(panel => {
            this.applyPanelState(panel);
        });
    }
    
    applyPanelState(panelName) {
        const visible = this.panelStates[panelName];
        
        switch(panelName) {
            case 'passport':
                const passport = document.getElementById('passport-panel');
                if (passport) {
                    passport.classList.toggle('panel-hidden', !visible);
                }
                break;
                
            case 'minimap':
                const minimap = document.querySelector('.minimap-container');
                if (minimap) {
                    minimap.classList.toggle('panel-hidden', !visible);
                }
                break;
                
            case 'timeControl':
                const timeControl = document.querySelector('.time-control, #time-control-compact');
                if (timeControl) {
                    timeControl.classList.toggle('panel-hidden', !visible);
                }
                break;
                
            case 'langSelector':
                const langSelector = document.querySelector('.lang-selector');
                if (langSelector) {
                    langSelector.classList.toggle('panel-hidden', !visible);
                }
                break;
                
            case 'hudPanel':
                const hudPanel = document.getElementById('hud-panel');
                if (hudPanel) {
                    hudPanel.classList.toggle('panel-hidden', !visible);
                }
                break;
        }
    }
    
    onManualNavModeChanged(active) {
        // Make passport compact when manual nav is active
        const passport = document.getElementById('passport-panel');
        if (passport) {
            passport.classList.toggle('compact', active);
        }
    }
    
    // Toggle minimap expanded/minimized
    toggleMinimapExpanded() {
        const minimap = document.querySelector('.minimap-container');
        if (minimap) {
            this.panelStates.minimapExpanded = !this.panelStates.minimapExpanded;
            minimap.classList.toggle('minimized', !this.panelStates.minimapExpanded);
            this.saveStates();
        }
    }
    
    addStyles() {
        if (document.getElementById('ui-settings-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ui-settings-styles';
        style.textContent = `
            /* Settings button - HIDDEN (now in toolbar) */
            .ui-settings-btn {
                display: none !important;
            }
            
            /* Settings panel - positioned next to left toolbar */
            .ui-settings-panel {
                position: fixed;
                top: 50%;
                left: 80px;
                transform: translateY(-50%);
                width: 220px;
                background: rgba(15, 15, 35, 0.95);
                border: 1px solid rgba(74, 144, 226, 0.3);
                border-radius: 12px;
                backdrop-filter: blur(15px);
                z-index: 1200;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .ui-settings-panel.hidden {
                opacity: 0;
                transform: translateY(-50%) translateX(-20px) scale(0.95);
                pointer-events: none;
            }
            
            .ui-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(40, 40, 80, 0.5);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .ui-settings-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.3rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .ui-settings-close:hover {
                color: white;
            }
            
            .ui-settings-body {
                padding: 10px;
            }
            
            .ui-toggle-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: 0.85rem;
            }
            
            .ui-toggle-row:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .ui-toggle-row input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #4a90e2;
                cursor: pointer;
            }
            
            /* Hidden state for panels */
            .panel-hidden {
                opacity: 0 !important;
                pointer-events: none !important;
                transform: scale(0.9);
            }
            
            /* Ensure passport has hidden state */
            #passport-panel.panel-hidden {
                transform: translateX(-50%) translateY(-20px) scale(0.9);
            }
            
            /* Minimap hidden state */
            .minimap-container.panel-hidden {
                transform: translateX(-100%);
            }
            
            /* Time control hidden */
            #time-control-compact.panel-hidden,
            .time-control.panel-hidden {
                transform: translateX(100%);
            }
            
            /* HUD panel hidden */
            #hud-panel.panel-hidden {
                transform: translateX(-100%);
            }
        `;
        document.head.appendChild(style);
    }
}
