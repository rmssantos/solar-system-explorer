/**
 * Unified Toolbar - Compact vertical sidebar with action buttons
 * Clean design with proper toggle functionality
 */

import { i18n } from './i18n.js';

export class Toolbar {
    constructor(app) {
        this.app = app;
        this.isExpanded = true;
        this.buttons = [];
        
        this.createToolbar();

        // Listen for language changes
        i18n.onLangChange(() => this.updateTranslations());

        // Hide toolbar when in manual navigation mode
        window.addEventListener('manualNavModeChanged', (e) => {
            if (e.detail?.active) {
                this.container.classList.add('hidden-for-nav');
            } else {
                this.container.classList.remove('hidden-for-nav');
            }
        });
    }
    
    updateTranslations() {
        // Update button titles
        const photoBtn = document.getElementById('toolbar-photo');
        const galleryBtn = document.getElementById('toolbar-gallery');
        const compareBtn = document.getElementById('toolbar-compare');
        const achievementsBtn = document.getElementById('toolbar-achievements');
        const libraryBtn = document.getElementById('toolbar-library');
        const settingsBtn = document.getElementById('toolbar-settings');

        if (photoBtn) photoBtn.title = i18n.t('take_photo');
        if (galleryBtn) galleryBtn.title = i18n.t('gallery');
        if (compareBtn) compareBtn.title = i18n.t('compare_planets');
        if (achievementsBtn) achievementsBtn.title = i18n.t('achievements');
        if (libraryBtn) libraryBtn.title = i18n.t('library');
        if (settingsBtn) settingsBtn.title = i18n.t('settings');

        this.toggleBtn.title = this.isExpanded ? i18n.t('hide_menu') : i18n.t('show_menu');
    }
    
    createToolbar() {
        // Main toolbar container
        this.container = document.createElement('div');
        this.container.id = 'main-toolbar';
        
        // Toolbar content (buttons area)
        this.content = document.createElement('div');
        this.content.className = 'toolbar-content';
        
        // Add buttons with emoji icons
        this.addButton('📸', 'photo', i18n.t('take_photo', 'Foto'), () => {
            if (this.app.photoMode) this.app.photoMode.takePhoto();
        });
        
        this.addButton('🖼️', 'gallery', i18n.t('gallery', 'Galeria'), () => {
            if (this.app.photoMode) this.app.photoMode.showGallery();
        });
        
        this.addButton('⚖️', 'compare', i18n.t('compare', 'Comparar'), () => {
            if (this.app.planetComparator) this.app.planetComparator.openComparator();
        });
        
        // Achievements button
        this.addButton('🏆', 'achievements', i18n.t('achievements', 'Conquistas'), () => {
            if (this.app.achievementSystem) this.app.achievementSystem.showAchievementsPanel();
        });
        
        // Library button
        this.addButton('📚', 'library', i18n.t('library', 'Biblioteca'), () => {
            window.location.href = 'biblioteca.html';
        });

        // Settings button
        this.addButton('⚙️', 'settings', i18n.t('settings', 'Configurações'), () => {
            if (this.app.uiSettings) this.app.uiSettings.togglePanel();
        });
        
        // Toggle button (OUTSIDE content, always visible)
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'toolbar-toggle';
        this.toggleBtn.innerHTML = '‹';
        this.toggleBtn.title = i18n.t('hide_menu', 'Esconder');
        this.toggleBtn.addEventListener('click', () => this.toggle());
        
        this.container.appendChild(this.content);
        this.container.appendChild(this.toggleBtn);
        document.body.appendChild(this.container);
        
        this.addStyles();
    }
    
    addButton(icon, id, title, callback) {
        const btn = document.createElement('button');
        btn.className = 'toolbar-btn';
        btn.id = `toolbar-${id}`;
        btn.innerHTML = icon;
        btn.title = title;
        btn.addEventListener('click', callback);
        this.content.appendChild(btn);
        this.buttons.push(btn);
        return btn;
    }
    
    toggle() {
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('collapsed', !this.isExpanded);
        this.toggleBtn.innerHTML = this.isExpanded ? '‹' : '›';
    }
    
    updateCollectiblesCount(current, total) {
        const el = document.getElementById('toolbar-coll-count');
        if (el) el.textContent = `${current}/${total}`;
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.id = 'toolbar-styles';
        style.textContent = `
            #main-toolbar {
                position: fixed;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                z-index: 900;
                display: flex;
                align-items: center;
                transition: transform 0.3s ease, opacity 0.3s ease;
                opacity: 0.5;
            }
            
            #main-toolbar:hover {
                opacity: 1;
            }
            
            #main-toolbar.collapsed {
                transform: translateY(-50%) translateX(-48px);
            }
            
            .toolbar-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px 6px;
                background: linear-gradient(180deg, rgba(20, 25, 45, 0.95) 0%, rgba(15, 20, 35, 0.98) 100%);
                border: 1px solid rgba(100, 150, 255, 0.2);
                border-left: none;
                border-radius: 0 12px 12px 0;
                backdrop-filter: blur(12px);
            }
            
            .toolbar-toggle {
                width: 18px;
                height: 40px;
                background: linear-gradient(180deg, rgba(30, 40, 60, 0.95) 0%, rgba(20, 30, 50, 0.98) 100%);
                border: 1px solid rgba(100, 150, 255, 0.2);
                border-left: none;
                border-radius: 0 6px 6px 0;
                color: rgba(150, 180, 255, 0.8);
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .toolbar-toggle:hover {
                background: linear-gradient(180deg, rgba(50, 70, 100, 0.95) 0%, rgba(40, 60, 90, 0.98) 100%);
                color: white;
            }
            
            .toolbar-btn {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                border: none;
                background: transparent;
                font-size: 1.3rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                filter: grayscale(20%);
                opacity: 0.85;
            }
            
            .toolbar-btn:hover {
                transform: scale(1.2);
                filter: grayscale(0%) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
                opacity: 1;
            }
            
            .toolbar-btn:active {
                transform: scale(0.95);
            }
            
            /* Hide old floating buttons */
            #photo-btn, #gallery-btn, #compare-btn,
            .photo-btn, .gallery-btn, .compare-btn,
            #settings-btn, .toolbar-collectibles,
            .ui-settings-btn {
                display: none !important;
            }
            
            /* Hide when in manual navigation mode */
            #main-toolbar.hidden-for-nav {
                transform: translateY(-50%) translateX(-100%);
                opacity: 0;
                pointer-events: none;
            }

            @media (max-width: 768px) {
                .toolbar-btn {
                    width: 32px;
                    height: 32px;
                    font-size: 1rem;
                }
                .toolbar-content {
                    padding: 6px 4px;
                    gap: 3px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
