/**
 * Unified Toolbar - Compact vertical sidebar with action buttons
 * Clean design with proper toggle functionality
 */

import { i18n } from './i18n.js';
import { BibliotecaPanel } from './bibliotecaPanel.js';

export class Toolbar {
    constructor(app) {
        this.app = app;
        this.isExpanded = true;
        this.buttons = [];
        this.bibliotecaPanel = new BibliotecaPanel();

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
        const shareBtn = document.getElementById('toolbar-share');
        const settingsBtn = document.getElementById('toolbar-settings');

        if (photoBtn) photoBtn.title = i18n.t('take_photo');
        if (galleryBtn) galleryBtn.title = i18n.t('gallery');
        if (compareBtn) compareBtn.title = i18n.t('compare_planets');
        if (achievementsBtn) achievementsBtn.title = i18n.t('achievements');
        if (libraryBtn) libraryBtn.title = i18n.t('biblioteca_btn');
        if (shareBtn) shareBtn.title = i18n.t('share_progress');
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
        
        // Library button (opens in-app panel)
        this.addButton('\uD83D\uDCDA', 'library', i18n.t('biblioteca_btn'), () => {
            this.bibliotecaPanel.open();
        });

        // Share Progress button
        this.addButton('\uD83D\uDCE4', 'share', i18n.t('share_progress'), () => {
            if (this.app.showShareProgress) this.app.showShareProgress();
        });

        // Settings button
        this.addButton('\u2699\uFE0F', 'settings', i18n.t('settings', 'Configura\u00e7\u00f5es'), () => {
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
}
