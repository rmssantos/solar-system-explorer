/**
 * Achievement System - Unlockable badges and rewards
 * Tracks special accomplishments
 * Supports PT and EN languages
 */
import { i18n } from './i18n.js';

// Achievement translations
const ACHIEVEMENT_TRANSLATIONS = {
    pt: {
        first_discovery: { title: 'Primeiro Passo', description: 'Descobriste o teu primeiro planeta!' },
        inner_planets: { title: 'Explorador Interior', description: 'Visitaste todos os planetas rochosos!' },
        gas_giants: { title: 'Caçador de Gigantes', description: 'Visitaste todos os gigantes gasosos!' },
        ice_giants: { title: 'Explorador Gelado', description: 'Visitaste os gigantes de gelo!' },
        all_planets: { title: 'Mestre do Sistema Solar', description: 'Visitaste TODOS os 8 planetas!' },
        moon_hunter: { title: 'Caçador de Luas', description: 'Visitaste 5 luas diferentes!' },
        moon_master: { title: 'Mestre das Luas', description: 'Visitaste 10 luas diferentes!' },
        galilean_moons: { title: 'Seguidor de Galileu', description: 'Visitaste as 4 luas galileanas de Júpiter!' },
        curious_mind: { title: 'Mente Curiosa', description: 'Respondeste a 5 quizzes correctamente!' },
        space_genius: { title: 'Génio Espacial', description: 'Respondeste a 15 quizzes correctamente!' },
        sun_worshipper: { title: 'Adorador do Sol', description: 'Visitaste a nossa estrela!' },
        ring_lover: { title: 'Amante dos Anéis', description: 'Visitaste o belo Saturno!' },
        dwarf_explorer: { title: 'Explorador Anão', description: 'Visitaste todos os planetas anões!' },
        probe_finder: { title: 'Caçador de Sondas', description: 'Visitaste 3 sondas espaciais!' },
        probe_master: { title: 'Mestre das Sondas', description: 'Visitaste TODAS as sondas espaciais!' },
        earth_observer: { title: 'Observador da Terra', description: 'Visitaste a ISS e o Hubble!' },
        alien_hunter: { title: 'Caçador de Aliens', description: 'Encontraste o OVNI secreto!' },
        speedrunner: { title: 'Velocista Espacial', description: 'Visitaste 3 planetas em menos de 2 minutos!' },
        level_5: { title: 'A Subir!', description: 'Alcançaste o nível 5!' },
        level_10: { title: 'Lenda Máxima', description: 'Alcançaste o nível máximo!' },
        completionist: { title: 'Completista', description: 'Visitaste TODOS os objetos do sistema solar!' },
        // UI
        achievement_unlocked: 'CONQUISTA DESBLOQUEADA!',
        achievements: 'Conquistas',
        view_achievements: 'Ver Conquistas',
        to_unlock: 'Por desbloquear',
        discovery: '🔭 Descobertas',
        learning: '🧠 Aprendizagem',
        special: '⭐ Especiais',
        progress: '📈 Progresso',
        achievement_prefix: 'Conquista'
    },
    en: {
        first_discovery: { title: 'First Step', description: 'You discovered your first planet!' },
        inner_planets: { title: 'Inner Explorer', description: 'You visited all rocky planets!' },
        gas_giants: { title: 'Giant Hunter', description: 'You visited all gas giants!' },
        ice_giants: { title: 'Ice Explorer', description: 'You visited the ice giants!' },
        all_planets: { title: 'Solar System Master', description: 'You visited ALL 8 planets!' },
        moon_hunter: { title: 'Moon Hunter', description: 'You visited 5 different moons!' },
        moon_master: { title: 'Moon Master', description: 'You visited 10 different moons!' },
        galilean_moons: { title: 'Galileo\'s Follower', description: 'You visited Jupiter\'s 4 Galilean moons!' },
        curious_mind: { title: 'Curious Mind', description: 'You answered 5 quizzes correctly!' },
        space_genius: { title: 'Space Genius', description: 'You answered 15 quizzes correctly!' },
        sun_worshipper: { title: 'Sun Worshipper', description: 'You visited our star!' },
        ring_lover: { title: 'Ring Lover', description: 'You visited beautiful Saturn!' },
        dwarf_explorer: { title: 'Dwarf Explorer', description: 'You visited all dwarf planets!' },
        probe_finder: { title: 'Probe Finder', description: 'You visited 3 space probes!' },
        probe_master: { title: 'Probe Master', description: 'You visited ALL space probes!' },
        earth_observer: { title: 'Earth Observer', description: 'You visited the ISS and Hubble!' },
        alien_hunter: { title: 'Alien Hunter', description: 'You found the secret UFO!' },
        speedrunner: { title: 'Space Speedrunner', description: 'You visited 3 planets in less than 2 minutes!' },
        level_5: { title: 'Rising Up!', description: 'You reached level 5!' },
        level_10: { title: 'Maximum Legend', description: 'You reached the maximum level!' },
        completionist: { title: 'Completionist', description: 'You visited ALL objects in the solar system!' },
        // UI
        achievement_unlocked: 'ACHIEVEMENT UNLOCKED!',
        achievements: 'Achievements',
        view_achievements: 'View Achievements',
        to_unlock: 'To unlock',
        discovery: '🔭 Discovery',
        learning: '🧠 Learning',
        special: '⭐ Special',
        progress: '📈 Progress',
        achievement_prefix: 'Achievement'
    }
};

export class AchievementSystem {
    constructor(xpSystem, audioManager) {
        this.xpSystem = xpSystem;
        this.audioManager = audioManager;
        this.unlockedAchievements = new Set();
        this.achievements = this.createAchievements();
        this.achievementQueue = [];
        this.isShowingAchievement = false;
        
        // Speedrun tracking
        this.speedrunStart = null;
        this.speedrunCount = 0;
        
        this.loadProgress();
        this.createUI();

        // Listen for language changes
        i18n.onLangChange(() => this.updateTranslations());
    }

    updateTranslations() {
        const btn = document.getElementById('achievements-btn');
        if (btn) {
            btn.title = this.getTranslation('view_achievements');
        }
    }

    getTranslation(key) {
        const lang = i18n.lang || 'pt';
        return ACHIEVEMENT_TRANSLATIONS[lang]?.[key] || ACHIEVEMENT_TRANSLATIONS['pt'][key];
    }

    getAchievementText(achievementId) {
        const lang = i18n.lang || 'pt';
        const trans = ACHIEVEMENT_TRANSLATIONS[lang]?.[achievementId] || ACHIEVEMENT_TRANSLATIONS['pt'][achievementId];
        return trans || { title: achievementId, description: '' };
    }

    createAchievements() {
        return [
            // Discovery Achievements
            {
                id: 'first_discovery',
                icon: '🎯',
                xpReward: 25,
                category: 'discovery'
            },
            {
                id: 'inner_planets',
                icon: '🪨',
                xpReward: 100,
                requirement: { type: 'planets', targets: ['mercury', 'venus', 'earth', 'mars'] },
                category: 'discovery'
            },
            {
                id: 'gas_giants',
                icon: '🌪️',
                xpReward: 100,
                requirement: { type: 'planets', targets: ['jupiter', 'saturn'] },
                category: 'discovery'
            },
            {
                id: 'ice_giants',
                icon: '🧊',
                xpReward: 100,
                requirement: { type: 'planets', targets: ['uranus', 'neptune'] },
                category: 'discovery'
            },
            {
                id: 'all_planets',
                icon: '🏆',
                xpReward: 200,
                requirement: { type: 'planets', targets: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] },
                category: 'discovery'
            },
            {
                id: 'moon_hunter',
                icon: '🌙',
                xpReward: 75,
                requirement: { type: 'moonCount', count: 5 },
                category: 'discovery'
            },
            {
                id: 'moon_master',
                icon: '🌕',
                xpReward: 150,
                requirement: { type: 'moonCount', count: 10 },
                category: 'discovery'
            },
            {
                id: 'galilean_moons',
                icon: '🔭',
                xpReward: 150,
                requirement: { type: 'planets', targets: ['io', 'europa', 'ganymede', 'callisto'] },
                category: 'discovery'
            },
            {
                id: 'dwarf_explorer',
                icon: '🔮',
                xpReward: 150,
                requirement: { type: 'planets', targets: ['pluto', 'ceres', 'eris', 'makemake', 'haumea'] },
                category: 'discovery'
            },
            
            // Learning Achievements
            {
                id: 'curious_mind',
                icon: '🧠',
                xpReward: 50,
                requirement: { type: 'quizCount', count: 5 },
                category: 'learning'
            },
            {
                id: 'space_genius',
                icon: '🎓',
                xpReward: 150,
                requirement: { type: 'quizCount', count: 15 },
                category: 'learning'
            },
            
            // Special Achievements
            {
                id: 'sun_worshipper',
                icon: '☀️',
                xpReward: 50,
                category: 'special'
            },
            {
                id: 'ring_lover',
                icon: '💍',
                xpReward: 50,
                category: 'special'
            },
            {
                id: 'probe_finder',
                icon: '🛰️',
                xpReward: 75,
                requirement: { type: 'probeCount', count: 3 },
                category: 'special'
            },
            {
                id: 'probe_master',
                icon: '📡',
                xpReward: 200,
                requirement: { type: 'planets', targets: ['voyager1', 'voyager2', 'newhorizons', 'pioneer10', 'juno', 'cassini', 'iss', 'hubble'] },
                category: 'special'
            },
            {
                id: 'earth_observer',
                icon: '🌍',
                xpReward: 100,
                requirement: { type: 'planets', targets: ['iss', 'hubble'] },
                category: 'special'
            },
            {
                id: 'alien_hunter',
                icon: '👽',
                xpReward: 100,
                category: 'special'
            },
            {
                id: 'speedrunner',
                icon: '⚡',
                xpReward: 75,
                requirement: { type: 'speedrun', count: 3, timeSeconds: 120 },
                category: 'special'
            },
            
            // Level Achievements
            {
                id: 'level_5',
                icon: '📈',
                xpReward: 50,
                requirement: { type: 'level', level: 5 },
                category: 'progress'
            },
            {
                id: 'level_10',
                icon: '👑',
                xpReward: 100,
                requirement: { type: 'level', level: 10 },
                category: 'progress'
            },
            {
                id: 'completionist',
                icon: '🌟',
                xpReward: 500,
                requirement: { type: 'totalVisits', count: 38 },
                category: 'progress'
            }
        ];
    }

    loadProgress() {
        const saved = localStorage.getItem('spaceExplorer_achievements');
        if (saved) {
            this.unlockedAchievements = new Set(JSON.parse(saved));
        }
    }

    saveProgress() {
        localStorage.setItem('spaceExplorer_achievements', JSON.stringify([...this.unlockedAchievements]));
    }

    createUI() {
        // Achievement button
        const btn = document.createElement('button');
        btn.id = 'achievements-btn';
        btn.className = 'achievements-btn';
        btn.innerHTML = '🏆';
        btn.title = this.getTranslation('view_achievements');
        btn.addEventListener('click', () => this.showAchievementsPanel());
        document.body.appendChild(btn);
    }

    unlock(achievementId, skipAnimation = false) {
        if (this.unlockedAchievements.has(achievementId)) return false;
        
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;
        
        this.unlockedAchievements.add(achievementId);
        this.saveProgress();
        
        // Award XP
        if (this.xpSystem && achievement.xpReward) {
            const text = this.getAchievementText(achievementId);
            this.xpSystem.addXP(achievement.xpReward, `${this.getTranslation('achievement_prefix')}: ${text.title}`);
        }
        
        // Show notification
        if (!skipAnimation) {
            this.queueAchievementNotification(achievement);

            // Trigger mascot celebration for achievements
            const text = this.getAchievementText(achievementId);
            window.dispatchEvent(new CustomEvent('app:achievement', { detail: { name: text.title } }));
        }

        return true;
    }

    queueAchievementNotification(achievement) {
        this.achievementQueue.push(achievement);
        this.processQueue();
    }

    processQueue() {
        if (this.isShowingAchievement || this.achievementQueue.length === 0) return;
        
        this.isShowingAchievement = true;
        const achievement = this.achievementQueue.shift();
        
        this.showAchievementNotification(achievement, () => {
            this.isShowingAchievement = false;
            this.processQueue();
        });
    }

    showAchievementNotification(achievement, onComplete) {
        // Play sound
        if (this.audioManager) {
            this.audioManager.playSuccess();
        }
        
        const text = this.getAchievementText(achievement.id);
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <span class="achievement-label">${this.getTranslation('achievement_unlocked')}</span>
                <span class="achievement-title">${text.title}</span>
                <span class="achievement-desc">${text.description}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('visible');
        });
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                onComplete();
            }, 500);
        }, 3500);
    }

    showAchievementsPanel() {
        const overlay = document.createElement('div');
        overlay.className = 'achievements-panel-overlay';
        
        const unlockedCount = this.unlockedAchievements.size;
        const totalCount = this.achievements.length;
        
        const categories = {
            discovery: { name: this.getTranslation('discovery'), achievements: [] },
            learning: { name: this.getTranslation('learning'), achievements: [] },
            special: { name: this.getTranslation('special'), achievements: [] },
            progress: { name: this.getTranslation('progress'), achievements: [] }
        };
        
        this.achievements.forEach(a => {
            const cat = categories[a.category] || categories.special;
            cat.achievements.push(a);
        });
        
        let categoriesHTML = '';
        for (const [key, cat] of Object.entries(categories)) {
            if (cat.achievements.length === 0) continue;
            
            categoriesHTML += `
                <div class="achievement-category">
                    <h3>${cat.name}</h3>
                    <div class="achievement-grid">
                        ${cat.achievements.map(a => {
                            const unlocked = this.unlockedAchievements.has(a.id);
                            const text = this.getAchievementText(a.id);
                            return `
                                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                                    <span class="achievement-card-icon">${unlocked ? a.icon : '🔒'}</span>
                                    <span class="achievement-card-title">${unlocked ? text.title : '???'}</span>
                                    <span class="achievement-card-desc">${unlocked ? text.description : this.getTranslation('to_unlock')}</span>
                                    ${unlocked && a.xpReward ? `<span class="achievement-card-xp">+${a.xpReward} XP</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        overlay.innerHTML = `
            <div class="achievements-panel">
                <div class="achievements-header">
                    <h2>🏆 ${this.getTranslation('achievements')}</h2>
                    <span class="achievements-count">${unlockedCount}/${totalCount}</span>
                    <button class="achievements-close">✕</button>
                </div>
                <div class="achievements-progress">
                    <div class="achievements-bar" style="width: ${(unlockedCount/totalCount)*100}%"></div>
                </div>
                <div class="achievements-content">
                    ${categoriesHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });
        
        // Close button
        overlay.querySelector('.achievements-close').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        });
        
        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.remove(), 300);
            }
        });
    }

    // Check methods for different achievement types
    checkPlanetVisit(planetName, visitedPlanets) {
        // First discovery
        if (visitedPlanets.size === 1) {
            this.unlock('first_discovery');
            // Start speedrun timer
            this.speedrunStart = Date.now();
            this.speedrunCount = 1;
        } else if (this.speedrunStart) {
            this.speedrunCount++;
            // Check speedrunner achievement
            const elapsed = (Date.now() - this.speedrunStart) / 1000;
            if (this.speedrunCount >= 3 && elapsed <= 120) {
                this.unlock('speedrunner');
            }
        }
        
        // Sun visit
        if (planetName === 'sun') {
            this.unlock('sun_worshipper');
        }
        
        // Saturn visit
        if (planetName === 'saturn') {
            this.unlock('ring_lover');
        }
        
        // UFO Easter Egg
        if (planetName === 'ufo') {
            this.unlock('alien_hunter');
            // Trigger mascot surprise reaction
            window.dispatchEvent(new CustomEvent('app:easter-egg', { detail: 'UFO' }));
        }
        
        // All moons list
        const allMoons = [
            'moon', 'phobos', 'deimos', 'io', 'europa', 'ganymede', 'callisto',
            'titan', 'enceladus', 'mimas', 'titania', 'oberon', 'triton', 'proteus',
            'charon', 'dysnomia'
        ];
        
        // All probes list
        const allProbes = ['voyager1', 'voyager2', 'newhorizons', 'pioneer10', 'juno', 'cassini', 'iss', 'hubble'];
        
        // Check group achievements
        this.achievements.forEach(a => {
            if (a.requirement?.type === 'planets') {
                const allVisited = a.requirement.targets.every(t => visitedPlanets.has(t));
                if (allVisited) {
                    this.unlock(a.id);
                }
            }
            
            if (a.requirement?.type === 'moonCount') {
                const visitedMoons = allMoons.filter(m => visitedPlanets.has(m));
                if (visitedMoons.length >= a.requirement.count) {
                    this.unlock(a.id);
                }
            }
            
            if (a.requirement?.type === 'probeCount') {
                const visitedProbes = allProbes.filter(p => visitedPlanets.has(p));
                if (visitedProbes.length >= a.requirement.count) {
                    this.unlock(a.id);
                }
            }
            
            if (a.requirement?.type === 'totalVisits') {
                if (visitedPlanets.size >= a.requirement.count) {
                    this.unlock(a.id);
                }
            }
        });
    }

    checkQuizCount(count) {
        this.achievements.forEach(a => {
            if (a.requirement?.type === 'quizCount' && count >= a.requirement.count) {
                this.unlock(a.id);
            }
        });
    }

    checkLevel(level) {
        this.achievements.forEach(a => {
            if (a.requirement?.type === 'level' && level >= a.requirement.level) {
                this.unlock(a.id);
            }
        });
    }
}
