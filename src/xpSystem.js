/**
 * XP and Leveling System
 * Tracks player progress and unlocks ranks
 */
import { i18n } from './i18n.js';

export class XPSystem {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.totalXPEarned = 0;

        // Rank definitions (with translations)
        this.ranks = [
            { level: 1, name: { pt: 'Cadete Espacial', en: 'Space Cadet' }, icon: '👶', minXP: 0 },
            { level: 2, name: { pt: 'Aprendiz de Piloto', en: 'Pilot Apprentice' }, icon: '🧑‍🎓', minXP: 100 },
            { level: 3, name: { pt: 'Piloto Júnior', en: 'Junior Pilot' }, icon: '👨‍✈️', minXP: 250 },
            { level: 4, name: { pt: 'Piloto', en: 'Pilot' }, icon: '🚀', minXP: 450 },
            { level: 5, name: { pt: 'Piloto Sénior', en: 'Senior Pilot' }, icon: '⭐', minXP: 700 },
            { level: 6, name: { pt: 'Comandante', en: 'Commander' }, icon: '🎖️', minXP: 1000 },
            { level: 7, name: { pt: 'Capitão', en: 'Captain' }, icon: '👨‍🚀', minXP: 1400 },
            { level: 8, name: { pt: 'Almirante', en: 'Admiral' }, icon: '🏅', minXP: 1900 },
            { level: 9, name: { pt: 'Almirante Espacial', en: 'Space Admiral' }, icon: '🌟', minXP: 2500 },
            { level: 10, name: { pt: 'Lenda do Espaço', en: 'Space Legend' }, icon: '👑', minXP: 3200 }
        ];

        this.xpPanel = null;
        this.loadProgress();
        this.createUI();

        // Listen for language changes
        i18n.onLangChange(() => this.updateUI());
    }

    loadProgress() {
        const saved = localStorage.getItem('spaceExplorer_xp');
        if (saved) {
            const data = JSON.parse(saved);
            this.xp = data.xp || 0;
            this.totalXPEarned = data.totalXP || 0;
            this.level = this.calculateLevel();
        }
    }

    saveProgress() {
        const data = {
            xp: this.xp,
            totalXP: this.totalXPEarned
        };
        localStorage.setItem('spaceExplorer_xp', JSON.stringify(data));
    }

    calculateLevel() {
        let currentLevel = 1;
        for (const rank of this.ranks) {
            if (this.xp >= rank.minXP) {
                currentLevel = rank.level;
            }
        }
        return currentLevel;
    }

    getCurrentRank() {
        return this.ranks.find(r => r.level === this.level) || this.ranks[0];
    }

    getRankName(rank) {
        const lang = i18n.lang || 'pt';
        return typeof rank.name === 'object' ? rank.name[lang] : rank.name;
    }

    getNextRank() {
        return this.ranks.find(r => r.level === this.level + 1) || null;
    }

    getXPToNextLevel() {
        const next = this.getNextRank();
        if (!next) return 0;
        return next.minXP - this.xp;
    }

    getProgressPercent() {
        const current = this.getCurrentRank();
        const next = this.getNextRank();

        if (!next) return 100;

        const levelXP = this.xp - current.minXP;
        const levelRange = next.minXP - current.minXP;

        return Math.floor((levelXP / levelRange) * 100);
    }

    addXP(amount, reason = '') {
        const oldLevel = this.level;
        this.xp += amount;
        this.totalXPEarned += amount;
        this.level = this.calculateLevel();

        this.saveProgress();
        this.updateUI();

        // Show XP gain animation
        this.showXPGain(amount);

        // Check for level up
        if (this.level > oldLevel) {
            return {
                leveledUp: true,
                newLevel: this.level,
                newRank: this.getCurrentRank()
            };
        }

        return { leveledUp: false };
    }

    createUI() {
        this.xpPanel = document.createElement('div');
        this.xpPanel.id = 'xp-panel';
        this.xpPanel.className = 'xp-panel';

        document.body.appendChild(this.xpPanel);
        this.updateUI();
    }

    updateUI() {
        const rank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        const progress = this.getProgressPercent();
        const lang = i18n.lang || 'pt';

        const nextLabel = i18n.t('next_level');
        const maxLabel = i18n.t('max_level');

        let nextInfo = '';
        if (nextRank) {
            nextInfo = `
                <div class="xp-next">
                    <span>${nextLabel}: ${nextRank.icon} ${this.getRankName(nextRank)}</span>
                    <span class="xp-needed">${this.getXPToNextLevel()} XP</span>
                </div>
            `;
        } else {
            nextInfo = `<div class="xp-next max-level">${maxLabel}</div>`;
        }

        this.xpPanel.innerHTML = `
            <div class="xp-header">
                <span class="xp-rank-icon">${rank.icon}</span>
                <div class="xp-rank-info">
                    <span class="xp-rank-name">${this.getRankName(rank)}</span>
                    <span class="xp-amount">⭐ ${this.xp} XP</span>
                </div>
            </div>
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${progress}%"></div>
            </div>
            ${nextInfo}
        `;
    }

    showXPGain(amount) {
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.innerHTML = `+${amount} ⭐`;

        // Position above XP panel (bottom center)
        popup.style.bottom = '100px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';

        document.body.appendChild(popup);

        // Animate
        requestAnimationFrame(() => {
            popup.classList.add('animate');
        });

        setTimeout(() => popup.remove(), 1500);
    }

    showLevelUp(rank) {
        const overlay = document.createElement('div');
        overlay.className = 'levelup-overlay';
        const rankName = this.getRankName(rank);

        overlay.innerHTML = `
            <div class="levelup-content">
                <div class="levelup-icon">${rank.icon}</div>
                <h2>SUBISTE DE NÍVEL!</h2>
                <p class="levelup-rank">${rankName}</p>
                <p class="levelup-level">Nível ${rank.level}</p>
                <button class="levelup-btn">Continuar Aventura! 🚀</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        // Close button
        overlay.querySelector('.levelup-btn').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        });

        // Auto close after 5s
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.remove(), 500);
            }
        }, 5000);
    }
}
