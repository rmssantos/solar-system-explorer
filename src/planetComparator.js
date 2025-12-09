/**
 * Planet Comparator - Compare two planets side by side
 */
import { SOLAR_SYSTEM_DATA, getTranslatedObjectData } from './data/objectsInfo.js';
import { i18n } from './i18n.js';

export class PlanetComparator {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.planet1 = null;
        this.planet2 = null;
        
        // Delay creation to ensure DOM is ready
        setTimeout(() => this.createUI(), 100);

        // Listen for language changes
        i18n.onLangChange(() => this.updateTranslations());
    }

    updateTranslations() {
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) compareBtn.title = i18n.t('compare_planets');
    }

    createUI() {
        // Remove existing button if any
        const existing = document.getElementById('compare-btn');
        if (existing) existing.remove();
        
        // Compare button
        const compareBtn = document.createElement('button');
        compareBtn.id = 'compare-btn';
        compareBtn.className = 'compare-btn';
        compareBtn.innerHTML = '⚖️';
        compareBtn.title = i18n.t('compare_planets');
        compareBtn.style.cssText = `
            position: fixed;
            bottom: 320px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(20, 20, 40, 0.8);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        compareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Compare button clicked!');
            this.openComparator();
        });
        
        document.body.appendChild(compareBtn);
        console.log('Compare button created and added to DOM');
    }

    openComparator() {
        console.log('Opening comparator, isOpen:', this.isOpen);
        if (this.isOpen) return;
        this.isOpen = true;

        const overlay = document.createElement('div');
        overlay.className = 'comparator-overlay';
        overlay.id = 'comparator-overlay';
        
        // Make overlay a flex container for centering
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // Get list of celestial bodies
        const bodies = Object.entries(SOLAR_SYSTEM_DATA)
            .filter(([key, data]) => data.raioKm) // Has radius = is a main body
            .map(([key, data]) => {
                const translated = getTranslatedObjectData(key);
                return { key, name: translated?.nome || data.nome || key, data };
            });
        
        const labels = {
            title: i18n.t('compare_title'),
            planet1: i18n.t('planet_1'),
            planet2: i18n.t('planet_2'),
            placeholder: i18n.t('select_planet'),
            instruction: i18n.t('select_instruction')
        };

        overlay.innerHTML = `
            <div class="comparator-container">
                <div class="comparator-header">
                    <h2>⚖️ ${labels.title}</h2>
                    <button class="comparator-close">✕</button>
                </div>
                
                <div class="comparator-selectors">
                    <div class="comparator-select-group">
                        <label>${labels.planet1}</label>
                        <select id="planet-select-1">
                            <option value="">${labels.placeholder}</option>
                            ${bodies.map(b => `<option value="${b.key}">${b.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="comparator-vs">VS</div>
                    <div class="comparator-select-group">
                        <label>${labels.planet2}</label>
                        <select id="planet-select-2">
                            <option value="">${labels.placeholder}</option>
                            ${bodies.map(b => `<option value="${b.key}">${b.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="comparator-results" id="comparator-results">
                    <div class="comparator-placeholder">
                        <span>🪐</span>
                        <p>${labels.instruction}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners - use addEventListener instead of onclick
        overlay.querySelector('.comparator-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        const select1 = document.getElementById('planet-select-1');
        const select2 = document.getElementById('planet-select-2');

        select1.addEventListener('change', () => {
            this.planet1Key = select1.value;
            this.planet1 = select1.value ? getTranslatedObjectData(select1.value) : null;
            this.updateComparison();
        });

        select2.addEventListener('change', () => {
            this.planet2Key = select2.value;
            this.planet2 = select2.value ? getTranslatedObjectData(select2.value) : null;
            this.updateComparison();
        });

        // Show with animation
        requestAnimationFrame(() => overlay.classList.add('visible'));
    }

    updateComparison() {
        const resultsDiv = document.getElementById('comparator-results');
        
        if (!this.planet1 || !this.planet2) {
            resultsDiv.innerHTML = `
                <div class="comparator-placeholder">
                    <span>🪐</span>
                    <p>${i18n.t('select_instruction')}</p>
                </div>
            `;
            return;
        }

        const p1 = this.planet1;
        const p2 = this.planet2;

        // Calculate comparisons
        const sizeRatio = p1.raioKm / p2.raioKm;
        const distRatio = (p1.distanciaMediaAoSol || 1) / (p2.distanciaMediaAoSol || 1);
        
        // Labels using i18n
        const labels = {
            size: i18n.t('compare_size'),
            temp: i18n.t('compare_temp'),
            distance: i18n.t('compare_distance'),
            moons: i18n.t('compare_moons'),
            day: i18n.t('compare_day'),
            year: i18n.t('compare_year'),
            closerNote: i18n.t('closer_note')
        };

        // Generate comparison bars
        const comparisons = [
            {
                label: labels.size,
                value1: `${p1.raioKm.toLocaleString()} km`,
                value2: `${p2.raioKm.toLocaleString()} km`,
                percent1: sizeRatio > 1 ? 100 : (sizeRatio * 100),
                percent2: sizeRatio > 1 ? (100 / sizeRatio) : 100,
                winner: sizeRatio > 1 ? 1 : 2
            },
            {
                label: labels.temp,
                value1: p1.temperaturaMediaAproximada || 'N/A',
                value2: p2.temperaturaMediaAproximada || 'N/A',
                percent1: 50,
                percent2: 50,
                winner: 0
            },
            {
                label: labels.distance,
                value1: p1.distanciaMediaAoSol ? `${p1.distanciaMediaAoSol} M km` : 'N/A',
                value2: p2.distanciaMediaAoSol ? `${p2.distanciaMediaAoSol} M km` : 'N/A',
                percent1: distRatio < 1 ? 100 : (100 / distRatio),
                percent2: distRatio < 1 ? (distRatio * 100) : 100,
                winner: distRatio < 1 ? 1 : 2,
                note: labels.closerNote
            },
            {
                label: labels.moons,
                value1: p1.numeroLuasConhecidas?.toString() || '0',
                value2: p2.numeroLuasConhecidas?.toString() || '0',
                percent1: this.calcPercent(p1.numeroLuasConhecidas || 0, p2.numeroLuasConhecidas || 0),
                percent2: this.calcPercent(p2.numeroLuasConhecidas || 0, p1.numeroLuasConhecidas || 0),
                winner: (p1.numeroLuasConhecidas || 0) > (p2.numeroLuasConhecidas || 0) ? 1 : 
                        (p1.numeroLuasConhecidas || 0) < (p2.numeroLuasConhecidas || 0) ? 2 : 0
            },
            {
                label: labels.day,
                value1: p1.duracaoDia || 'N/A',
                value2: p2.duracaoDia || 'N/A',
                percent1: 50,
                percent2: 50,
                winner: 0
            },
            {
                label: labels.year,
                value1: p1.duracaoAno || 'N/A',
                value2: p2.duracaoAno || 'N/A',
                percent1: 50,
                percent2: 50,
                winner: 0
            }
        ];

        const comparisonHTML = comparisons.map(comp => `
            <div class="comparison-row">
                <div class="comparison-label">${comp.label}</div>
                <div class="comparison-bars">
                    <div class="comparison-side left ${comp.winner === 1 ? 'winner' : ''}">
                        <span class="comparison-value">${comp.value1}</span>
                        <div class="comparison-bar-container">
                            <div class="comparison-bar" style="width: ${comp.percent1}%"></div>
                        </div>
                    </div>
                    <div class="comparison-side right ${comp.winner === 2 ? 'winner' : ''}">
                        <div class="comparison-bar-container">
                            <div class="comparison-bar" style="width: ${comp.percent2}%"></div>
                        </div>
                        <span class="comparison-value">${comp.value2}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Size comparison visual
        const maxSize = Math.max(p1.raioKm, p2.raioKm);
        const size1 = (p1.raioKm / maxSize) * 100;
        const size2 = (p2.raioKm / maxSize) * 100;

        resultsDiv.innerHTML = `
            <div class="comparison-visual">
                <div class="planet-visual" style="--size: ${size1}%">
                    <div class="planet-circle" style="background: #${p1.cor?.toString(16).padStart(6, '0') || '888888'}"></div>
                    <span class="planet-name">${p1.nome}</span>
                    <span class="planet-type">${p1.tipo}</span>
                </div>
                <div class="planet-visual" style="--size: ${size2}%">
                    <div class="planet-circle" style="background: #${p2.cor?.toString(16).padStart(6, '0') || '888888'}"></div>
                    <span class="planet-name">${p2.nome}</span>
                    <span class="planet-type">${p2.tipo}</span>
                </div>
            </div>

            <div class="comparison-details">
                ${comparisonHTML}
            </div>

            <div class="comparison-fun-fact">
                <span class="fun-fact-icon">💡</span>
                <span class="fun-fact-text">${this.getFunFact(p1, p2)}</span>
            </div>
        `;
    }

    calcPercent(val1, val2) {
        if (val1 === 0 && val2 === 0) return 50;
        const max = Math.max(val1, val2);
        return (val1 / max) * 100;
    }

    getFunFact(p1, p2) {
        const facts = [];
        
        if (p1.raioKm && p2.raioKm) {
            const bigger = p1.raioKm > p2.raioKm ? p1 : p2;
            const smaller = p1.raioKm > p2.raioKm ? p2 : p1;
            const ratio = Math.round(bigger.raioKm / smaller.raioKm);
            if (ratio > 1) {
                facts.push(`${bigger.nome} é ${ratio}x maior que ${smaller.nome}!`);
            }
        }

        if ((p1.numeroLuasConhecidas || 0) + (p2.numeroLuasConhecidas || 0) > 50) {
            facts.push(`Juntos têm ${(p1.numeroLuasConhecidas || 0) + (p2.numeroLuasConhecidas || 0)} luas!`);
        }

        if (p1.distanciaMediaAoSol && p2.distanciaMediaAoSol) {
            const diff = Math.abs(p1.distanciaMediaAoSol - p2.distanciaMediaAoSol);
            if (diff > 1000) {
                facts.push(`Estão a ${diff.toLocaleString()} milhões de km de distância um do outro!`);
            }
        }

        return facts.length > 0 ? facts[Math.floor(Math.random() * facts.length)] : 
            `${p1.nome} e ${p2.nome} são ambos fascinantes!`;
    }

    close() {
        const overlay = document.getElementById('comparator-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                this.isOpen = false;
                this.planet1 = null;
                this.planet2 = null;
            }, 300);
        }
    }
}
