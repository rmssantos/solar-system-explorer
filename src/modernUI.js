/**
 * Modern UI Layout Controller
 * Handles language selector and overall UI layout organization
 */

import { i18n } from './i18n.js';

export class ModernUI {
    constructor(app) {
        this.app = app;
        
        this.createLanguageSelector();
        // Note: translateStaticElements removed - i18n.updateAllTranslations() handles this
        // Note: fixInfoPanelClose removed - close button handled properly in ui.js
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
        
        // Click handlers - no reload, use event system
        [ptBtn, enBtn].forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                i18n.setLang(lang);

                // Visual feedback
                ptBtn.classList.toggle('active', lang === 'pt');
                enBtn.classList.toggle('active', lang === 'en');

                // i18n.setLang() already calls updateAllTranslations() and notifies listeners
                // No reload needed!
            });
        });
        
        langSelector.appendChild(ptBtn);
        langSelector.appendChild(enBtn);
        document.body.appendChild(langSelector);
    }
}
