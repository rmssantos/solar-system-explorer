/**
 * Welcome Screen - Captain Personalization
 * Allows the player to enter their name and customize their experience
 */
import { i18n } from './i18n.js';

export class WelcomeScreen {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.playerName = '';
        this.shipColor = '#ff4444';
        this.overlay = null;
        
        // Check if player data exists
        this.loadSavedData();
    }

    loadSavedData() {
        const saved = localStorage.getItem('spaceExplorer_player');
        if (saved) {
            const data = JSON.parse(saved);
            this.playerName = data.name || '';
            this.shipColor = data.shipColor || '#ff4444';
            return true;
        }
        return false;
    }

    saveData() {
        const data = {
            name: this.playerName,
            shipColor: this.shipColor,
            savedAt: Date.now()
        };
        localStorage.setItem('spaceExplorer_player', JSON.stringify(data));
    }

    show() {
        // If already has saved name, skip welcome
        if (this.playerName) {
            this.onComplete(this.playerName, this.shipColor);
            return;
        }

        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'welcome-overlay';
        this.overlay.innerHTML = `
            <div class="welcome-container">
                <div class="welcome-stars"></div>
                <div class="welcome-content">
                    <div class="welcome-lang-selector">
                        <button class="lang-mini-btn ${i18n.lang === 'pt' ? 'active' : ''}" data-lang="pt">🇵🇹</button>
                        <button class="lang-mini-btn ${i18n.lang === 'en' ? 'active' : ''}" data-lang="en">🇬🇧</button>
                    </div>
                    <div class="welcome-rocket">🚀</div>
                    <h1 class="welcome-title">${i18n.t('welcome_title')}</h1>
                    <p class="welcome-subtitle">${i18n.t('welcome_subtitle')}</p>
                    
                    <div class="welcome-form">
                        <label class="welcome-label">
                            <span>👨‍🚀 ${i18n.t('captain_name')}</span>
                            <input type="text" id="captain-name" class="welcome-input" 
                                   placeholder="${i18n.t('captain_placeholder')}" maxlength="20" autofocus>
                        </label>
                        
                        <label class="welcome-label">
                            <span>${i18n.t('ship_color')}</span>
                            <div class="ship-colors">
                                <button class="color-btn selected" data-color="#ff4444" style="background: #ff4444" title="${i18n.t('color_red')}"></button>
                                <button class="color-btn" data-color="#44ff44" style="background: #44ff44" title="${i18n.t('color_green')}"></button>
                                <button class="color-btn" data-color="#4444ff" style="background: #4444ff" title="${i18n.t('color_blue')}"></button>
                                <button class="color-btn" data-color="#ffff44" style="background: #ffff44" title="${i18n.t('color_yellow')}"></button>
                                <button class="color-btn" data-color="#ff44ff" style="background: #ff44ff" title="${i18n.t('color_pink')}"></button>
                                <button class="color-btn" data-color="#44ffff" style="background: #44ffff" title="${i18n.t('color_cyan')}"></button>
                                <button class="color-btn" data-color="#ff8800" style="background: #ff8800" title="${i18n.t('color_orange')}"></button>
                                <button class="color-btn" data-color="#ffffff" style="background: #ffffff" title="${i18n.t('color_white')}"></button>
                            </div>
                        </label>
                        
                        <button id="start-adventure" class="welcome-btn" disabled>
                            <span class="btn-text">${i18n.t('start_mission')}</span>
                        </button>
                    </div>
                    
                    <div class="welcome-hints">
                        <p>${i18n.t('tip_arrows')}</p>
                        <p>${i18n.t('tip_click')}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.initListeners();
        
        // Animate in
        requestAnimationFrame(() => {
            this.overlay.classList.add('visible');
        });
    }

    initListeners() {
        const nameInput = this.overlay.querySelector('#captain-name');
        const startBtn = this.overlay.querySelector('#start-adventure');
        const colorBtns = this.overlay.querySelectorAll('.color-btn');
        const langBtns = this.overlay.querySelectorAll('.lang-mini-btn');

        // Language selection
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                i18n.setLang(lang);
                // Re-render the overlay
                const currentName = nameInput.value;
                const currentColor = this.shipColor;
                this.overlay.remove();
                this.createOverlay();
                // Restore values
                this.overlay.querySelector('#captain-name').value = currentName;
                this.playerName = currentName;
                this.overlay.querySelector('#start-adventure').disabled = currentName.length < 2;
                // Restore color
                this.overlay.querySelectorAll('.color-btn').forEach(b => {
                    b.classList.toggle('selected', b.dataset.color === currentColor);
                });
            });
        });

        // Name input
        nameInput.addEventListener('input', (e) => {
            this.playerName = e.target.value.trim();
            startBtn.disabled = this.playerName.length < 2;
        });

        // Color selection
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.shipColor = btn.dataset.color;
            });
        });

        // Start button
        startBtn.addEventListener('click', () => {
            if (this.playerName.length >= 2) {
                this.startGame();
            }
        });

        // Enter key
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.playerName.length >= 2) {
                this.startGame();
            }
        });
    }

    startGame() {
        this.saveData();
        
        // Animate out
        this.overlay.classList.add('fade-out');
        
        setTimeout(() => {
            this.overlay.remove();
            this.onComplete(this.playerName, this.shipColor);
        }, 800);
    }

    // Static method to reset player data
    static resetPlayer() {
        localStorage.removeItem('spaceExplorer_player');
        localStorage.removeItem('spaceExplorer_game');
    }
}
