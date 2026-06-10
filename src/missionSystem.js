/**
 * Mission System - Interactive quests for space exploration
 * Provides guided objectives and rewards for discoveries
 */
import { i18n } from './i18n.js';
import * as storage from './utils/storage.js';

export class MissionSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.missions = this.createMissions();
        this.activeMission = null;
        this.completedMissions = new Set();
        this.missionPanel = null;

        this.loadProgress();
        this.createUI();

        // Listen for language changes
        i18n.onLangChange(() => this.updateMissionUI());

        // Check if active mission target was already visited
        this.checkAlreadyVisitedMissions();

        // Debug helper (only in development)
        if (import.meta.env?.DEV) {
            window.resetMissions = () => {
                storage.removeItem('missions');
                location.reload();
            };
        }
    }

    // Check all missions to see if any targets were already visited before
    checkAlreadyVisitedMissions() {
        // Wait a bit for gameManager to be fully initialized
        setTimeout(() => {
            this.autoCompletePendingMissions();
        }, 1000);
    }

    // Auto-complete missions for already visited planets
    autoCompletePendingMissions() {
        if (!this.gameManager) return;

        let hasChanges = false;

        // Check all uncompleted missions
        for (const mission of this.missions) {
            if (this.completedMissions.has(mission.id)) continue;

            // Check if target was already visited
            if (this.gameManager.isVisited && this.gameManager.isVisited(mission.target)) {
                this.completedMissions.add(mission.id);
                hasChanges = true;
            }
        }

        if (hasChanges) {
            // Update active mission to next uncompleted
            this.activeMission = this.getNextMission();
            this.saveProgress();
            this.updateMissionUI();
        }
    }

    createMissions() {
        return [
            // Beginner Missions
            {
                id: 'first_flight',
                title: '🚀 Primeiro Voo',
                description: 'Visita o teu primeiro planeta! Começa por Mercúrio, o mais perto do Sol.',
                hint: 'Usa as setas ◀ ▶ para navegar até Mercúrio!',
                target: 'mercury',
                xpReward: 50,
                category: 'beginner',
                order: 1
            },
            {
                id: 'hot_planet',
                title: '🔥 Planeta Mais Quente',
                description: 'Descobre qual é o planeta mais quente do Sistema Solar. Dica: não é o mais perto do Sol!',
                hint: 'O efeito de estufa faz um planeta ficar MUITO quente...',
                target: 'venus',
                xpReward: 75,
                category: 'beginner',
                order: 2
            },
            {
                id: 'home_sweet_home',
                title: '🏠 Lar Doce Lar',
                description: 'Visita o nosso planeta - a Terra! O único com vida conhecida.',
                hint: 'É o terceiro planeta a contar do Sol.',
                target: 'earth',
                xpReward: 50,
                category: 'beginner',
                order: 3
            },
            {
                id: 'red_planet',
                title: '🔴 Planeta Vermelho',
                description: 'Viaja até Marte, o Planeta Vermelho! Os cientistas querem enviar pessoas para lá.',
                hint: 'Tem o maior vulcão do Sistema Solar!',
                target: 'mars',
                xpReward: 75,
                category: 'beginner',
                order: 4
            },

            // Intermediate Missions
            {
                id: 'gas_giant',
                title: '🌪️ Gigante de Gás',
                description: 'Descobre Júpiter, o maior planeta! É tão grande que cabiam 1300 Terras lá dentro!',
                hint: 'Procura a Grande Mancha Vermelha - uma tempestade gigante!',
                target: 'jupiter',
                xpReward: 100,
                category: 'intermediate',
                order: 5
            },
            {
                id: 'ring_master',
                title: '💍 Senhor dos Anéis',
                description: 'Visita Saturno e os seus magníficos anéis! São feitos de gelo e rochas.',
                hint: 'Este planeta é tão leve que flutuaria em água!',
                target: 'saturn',
                xpReward: 100,
                category: 'intermediate',
                order: 6
            },
            {
                id: 'sideways_planet',
                title: '🔄 Planeta Deitado',
                description: 'Encontra Úrano, o planeta que roda "deitado"! O seu eixo está quase na horizontal.',
                hint: 'A sua cor azul-esverdeada vem do metano.',
                target: 'uranus',
                xpReward: 125,
                category: 'intermediate',
                order: 7
            },
            {
                id: 'windy_world',
                title: '💨 Mundo dos Ventos',
                description: 'Viaja até Neptuno, onde os ventos chegam a 2100 km/h! O mais distante dos planetas.',
                hint: 'É o planeta mais azul do Sistema Solar.',
                target: 'neptune',
                xpReward: 150,
                category: 'intermediate',
                order: 8
            },

            // Moon Missions
            {
                id: 'our_moon',
                title: '🌙 A Nossa Lua',
                description: 'Visita a Lua, o único satélite natural da Terra! Humanos já caminharam lá.',
                hint: 'Está a cerca de 384.000 km da Terra.',
                target: 'moon',
                xpReward: 75,
                category: 'moons',
                order: 9
            },
            {
                id: 'volcanic_moon',
                title: '🌋 Lua Vulcânica',
                description: 'Descobre Io, a lua mais vulcânica do Sistema Solar! Tem centenas de vulcões activos.',
                hint: 'É uma lua de Júpiter.',
                target: 'io',
                xpReward: 100,
                category: 'moons',
                order: 10
            },
            {
                id: 'ocean_moon',
                title: '🌊 Lua com Oceano',
                description: 'Encontra Europa! Os cientistas acham que tem um oceano escondido debaixo do gelo.',
                hint: 'Também orbita Júpiter. Pode ter vida alienígena!',
                target: 'europa',
                xpReward: 100,
                category: 'moons',
                order: 11
            },
            {
                id: 'biggest_moon',
                title: '🏆 Maior Lua',
                description: 'Visita Ganimedes, a maior lua do Sistema Solar! É maior que Mercúrio!',
                hint: 'Orbita o maior planeta...',
                target: 'ganymede',
                xpReward: 100,
                category: 'moons',
                order: 12
            },
            {
                id: 'titan_explorer',
                title: '🪐 Explorador de Titã',
                description: 'Descobre Titã, a única lua com atmosfera densa! Tem lagos de metano líquido.',
                hint: 'É a maior lua de Saturno.',
                target: 'titan',
                xpReward: 125,
                category: 'moons',
                order: 13
            },
            {
                id: 'death_star',
                title: '⭐ Estrela da Morte',
                description: 'Encontra Mimas, a lua que parece a Estrela da Morte do Star Wars!',
                hint: 'A cratera Herschel dá-lhe esse aspecto. Orbita Saturno.',
                target: 'mimas',
                xpReward: 100,
                category: 'moons',
                order: 14
            },

            // Special Mission
            {
                id: 'sun_seeker',
                title: '☀️ Caçador do Sol',
                description: 'Visita o Sol, a nossa estrela! Contém 99,86% de toda a massa do Sistema Solar.',
                hint: 'Está no centro de tudo!',
                target: 'sun',
                xpReward: 200,
                category: 'special',
                order: 15
            },

            // Dwarf Planet Missions
            {
                id: 'pluto_explorer',
                title: '💔 O Ex-Planeta',
                description: 'Descobre Plutão, o famoso planeta anão! Foi "despromovido" em 2006.',
                hint: 'Está muito além de Neptuno e tem um coração de gelo!',
                target: 'pluto',
                xpReward: 175,
                category: 'dwarf',
                order: 16
            },
            {
                id: 'ceres_belt',
                title: '🪨 Rainha dos Asteroides',
                description: 'Encontra Ceres, o maior objeto no cinturão de asteroides!',
                hint: 'Está entre Marte e Júpiter.',
                target: 'ceres',
                xpReward: 150,
                category: 'dwarf',
                order: 17
            },
            {
                id: 'eris_discord',
                title: '😈 Deusa da Discórdia',
                description: 'Viaja até Éris, o planeta anão que causou a "despromição" de Plutão!',
                hint: 'É o mais distante dos planetas anões conhecidos.',
                target: 'eris',
                xpReward: 200,
                category: 'dwarf',
                order: 18
            },
            {
                id: 'makemake_easter',
                title: '🐣 Descoberta Pascal',
                description: 'Descobre Makemake, o planeta anão descoberto na Páscoa!',
                hint: 'Tem o nome do deus da Ilha de Páscoa.',
                target: 'makemake',
                xpReward: 175,
                category: 'dwarf',
                order: 19
            },
            {
                id: 'haumea_rugby',
                title: '🏈 Bola de Rugby Espacial',
                description: 'Encontra Haumea, o planeta anão em forma de bola de rugby!',
                hint: 'Roda tão rápido que esticou!',
                target: 'haumea',
                xpReward: 175,
                category: 'dwarf',
                order: 20
            }
        ];
    }

    loadProgress() {
        const data = storage.getItem('missions', null);
        if (data) {
            // Shape-validate: a corrupt non-array here would throw inside
            // App.init and brick the app on every launch.
            this.completedMissions = new Set(Array.isArray(data.completed) ? data.completed : []);

            // Find the saved active mission
            const savedActive = this.missions.find(m => m.id === data.active);

            // Only use saved active if it's not already completed
            if (savedActive && !this.completedMissions.has(savedActive.id)) {
                this.activeMission = savedActive;
            }
            // If saved active IS completed, it will be corrected by validateState()

        }

        // Validate state to ensure consistency
        this.validateState();
    }

    // Ensure active mission is valid and not already completed
    validateState() {
        // If we have no active mission, or the active mission is already completed
        if (!this.activeMission || this.completedMissions.has(this.activeMission.id)) {
            // Normal startup correction: advance to next uncompleted mission
            const nextMission = this.getNextMission();

            if (nextMission) {
                this.activeMission = nextMission;
                this.saveProgress();
            } else {
                this.activeMission = null; // No more missions
            }
        }
    }

    saveProgress() {
        const data = {
            completed: Array.from(this.completedMissions),
            active: this.activeMission?.id || null
        };
        storage.setItem('missions', data);
    }

    getNextMission() {
        return this.missions
            .filter(m => !this.completedMissions.has(m.id))
            .sort((a, b) => a.order - b.order)[0] || null;
    }

    createUI() {
        // Mission Panel
        this.missionPanel = document.createElement('div');
        this.missionPanel.id = 'mission-panel';
        this.missionPanel.className = 'mission-panel';

        document.body.appendChild(this.missionPanel);
        this.updateMissionUI();
    }

    updateMissionUI(animate = false) {
        const progress = this.getProgress();
        const pct = progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;

        if (!this.activeMission) {
            this.missionPanel.innerHTML = `
                <div class="mission-progress-bar-wrap">
                    <div class="mission-progress-label">${i18n.t('mission_progress')}: ${progress.completed}/${progress.total}</div>
                    <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
                </div>
                <div class="mission-complete-all">
                    <span class="mission-icon">🎉</span>
                    <div class="mission-info">
                        <span class="mission-title">${i18n.t('mission_completed_all')}</span>
                        <span class="mission-desc">${i18n.t('true_explorer')}</span>
                    </div>
                </div>
            `;
            return;
        }

        // Slide-out animation when mission changes
        if (animate) {
            this.missionPanel.classList.add('mission-slide-out');
            setTimeout(() => {
                this.missionPanel.classList.remove('mission-slide-out');
                this._renderActiveMission(progress, pct);
                this.missionPanel.classList.add('mission-slide-in');
                setTimeout(() => {
                    this.missionPanel.classList.remove('mission-slide-in');
                }, 400);
            }, 300);
        } else {
            this._renderActiveMission(progress, pct);
        }
    }

    _renderActiveMission(progress, pct) {
        this.missionPanel.innerHTML = `
            <div class="mission-progress-bar-wrap">
                <div class="mission-progress-label">${i18n.t('mission_progress')}: ${progress.completed}/${progress.total}</div>
                <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
            </div>
            <div class="mission-header">
                <span class="mission-badge">${i18n.t('mission')} ${progress.completed + 1}/${progress.total}</span>
                <button class="mission-hint-btn" title="${i18n.t('see_hint')}" aria-label="${i18n.t('see_hint')}">💡</button>
            </div>
            <div class="mission-active-card">
                <div class="mission-content">
                    <span class="mission-icon-large">${this.activeMission.title.split(' ')[0]}</span>
                    <div class="mission-info">
                        <span class="mission-title">${this.getMissionTitle(this.activeMission)}</span>
                        <span class="mission-desc">${this.getMissionDesc(this.activeMission)}</span>
                    </div>
                </div>
                <div class="mission-reward">
                    <span>⭐ ${i18n.t('mission_reward')}: ${this.activeMission.xpReward} XP</span>
                </div>
            </div>
            <div class="mission-hint hidden">
                <span>💡 ${this.getMissionHint(this.activeMission)}</span>
            </div>
        `;

        // Hint button
        const hintBtn = this.missionPanel.querySelector('.mission-hint-btn');
        const hintDiv = this.missionPanel.querySelector('.mission-hint');

        hintBtn?.addEventListener('click', () => {
            hintDiv.classList.toggle('hidden');
            hintBtn.classList.toggle('active');
        });
    }

    // Get translated mission title (i18n is the single source of truth)
    getMissionTitle(mission) {
        const key = `mission_${mission.id}_title`;
        const translated = i18n.t(key);
        if (translated !== key) return translated.replace(/^[^\s]+ /, ''); // Remove emoji
        // Fallback: strip emoji from hardcoded title
        return mission.title.split(' ').slice(1).join(' ');
    }

    // Get translated mission description
    getMissionDesc(mission) {
        const key = `mission_${mission.id}_desc`;
        const translated = i18n.t(key);
        return translated !== key ? translated : mission.description;
    }

    // Get translated mission hint
    getMissionHint(mission) {
        const key = `mission_${mission.id}_hint`;
        const translated = i18n.t(key);
        return translated !== key ? translated : mission.hint;
    }

    checkMissionComplete(planetName) {
        // First, check if any uncompleted mission has this planet as target
        // This allows completing missions even if visited before becoming active
        let completedMission = null;

        for (const mission of this.missions) {
            if (this.completedMissions.has(mission.id)) continue;

            if (mission.target === planetName) {
                this.completedMissions.add(mission.id);
                completedMission = mission;
                break; // Only complete one mission at a time
            }
        }

        if (completedMission) {
            // Gold glow on complete
            this.missionPanel.classList.add('mission-gold-glow');
            setTimeout(() => {
                this.missionPanel.classList.remove('mission-gold-glow');
            }, 1500);

            // Update active mission to next uncompleted
            this.activeMission = this.getNextMission();
            this.saveProgress();
            this.updateMissionUI(true); // animate transition

            // Trigger mascot celebration
            window.dispatchEvent(new CustomEvent('app:mission-complete', { detail: completedMission }));

            // Check if all missions are now complete
            if (this.completedMissions.size === this.missions.length) {
                window.dispatchEvent(new CustomEvent('app:all-missions-complete'));
            }

            return completedMission;
        }

        return null;
    }

    // Called when viewing planet info - also triggers mission check
    onPlanetInfoViewed(planetName) {
        return this.checkMissionComplete(planetName);
    }

    getProgress() {
        return {
            completed: this.completedMissions.size,
            total: this.missions.length
        };
    }

    getMissionForPlanet(planetName) {
        return this.missions.find(m => m.target === planetName && !this.completedMissions.has(m.id));
    }

    isTargetPlanet(planetName) {
        return this.activeMission?.target === planetName;
    }
}

/**
 * Exported mission definitions for testing.
 * These mirror the missions created in MissionSystem.createMissions().
 */
export const MISSION_DEFINITIONS = [
    { id: 'first_flight', target: 'mercury' },
    { id: 'hot_planet', target: 'venus' },
    { id: 'home_sweet_home', target: 'earth' },
    { id: 'red_planet', target: 'mars' },
    { id: 'gas_giant', target: 'jupiter' },
    { id: 'ring_master', target: 'saturn' },
    { id: 'sideways_planet', target: 'uranus' },
    { id: 'windy_world', target: 'neptune' },
    { id: 'our_moon', target: 'moon' },
    { id: 'volcanic_moon', target: 'io' },
    { id: 'ocean_moon', target: 'europa' },
    { id: 'biggest_moon', target: 'ganymede' },
    { id: 'titan_explorer', target: 'titan' },
    { id: 'death_star', target: 'mimas' },
    { id: 'sun_seeker', target: 'sun' },
    { id: 'pluto_explorer', target: 'pluto' },
    { id: 'ceres_belt', target: 'ceres' },
    { id: 'eris_discord', target: 'eris' },
    { id: 'makemake_easter', target: 'makemake' },
    { id: 'haumea_rugby', target: 'haumea' },
];
