/**
 * UI Settings Manager
 * Handles visibility toggles and transparency for all UI panels
 * Provides unified semi-transparent panels with hover-to-opaque behavior
 */

import { i18n } from './i18n.js';
import * as storage from './utils/storage.js';

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

        // Re-render on language change
        i18n.onLangChange(() => this.updateTranslations());
    }

    updateTranslations() {
        // Update button tooltip
        if (this.settingsBtn) {
            this.settingsBtn.title = i18n.t('ui_settings') || 'UI Settings';
        }
        // Re-render panel labels
        if (this.panel) {
            const header = this.panel.querySelector('.ui-settings-header span');
            if (header) header.textContent = `⚙️ ${i18n.t('ui_settings')}`;

            const labels = this.panel.querySelectorAll('.ui-toggle-row span');
            const keys = ['passport_title', 'minimap', 'time_control', 'controls_title'];
            const icons = ['🛂', '🗺️', '⏱️', '🎮'];
            labels.forEach((label, i) => {
                if (keys[i]) label.textContent = `${icons[i]} ${i18n.t(keys[i])}`;
            });
        }
    }
    
    loadStates() {
        try {
            const saved = storage.getItem('uiPanelStates', null);
            if (saved) {
                return saved;
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
            hudPanel: true
        };
    }
    
    saveStates() {
        try {
            storage.setItem('uiPanelStates', this.panelStates);
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
            case 'passport': {
                const passport = document.getElementById('passport-panel');
                if (passport) {
                    passport.classList.toggle('panel-hidden', !visible);
                }
                break;
            }
            case 'minimap': {
                const minimap = document.querySelector('.minimap-container');
                if (minimap) {
                    minimap.classList.toggle('panel-hidden', !visible);
                }
                break;
            }
            case 'timeControl': {
                const timeControl = document.querySelector('.time-control, #time-control-compact');
                if (timeControl) {
                    timeControl.classList.toggle('panel-hidden', !visible);
                }
                break;
            }
            case 'hudPanel': {
                const hudPanel = document.getElementById('hud-panel');
                if (hudPanel) {
                    hudPanel.classList.toggle('panel-hidden', !visible);
                }
                break;
            }
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
}
