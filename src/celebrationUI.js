/**
 * Manages celebration overlays and confetti effects when a player discovers something.
 */
import { SOLAR_SYSTEM_DATA } from './data/objectsInfo.js';
import { i18n } from './i18n.js';

export class CelebrationUI {
    constructor(app) {
        this.app = app;
    }

    show(name) {
        // Get object type to show correct message
        const objectData = SOLAR_SYSTEM_DATA[name];
        let discoveryKey = 'discovered_planet';

        if (objectData && objectData.type) {
            const tipo = objectData.type.toLowerCase();
            if (tipo.includes('lua') || tipo.includes('moon') || tipo.includes('sat\u00e9lite')) {
                discoveryKey = 'discovered_moon';
            } else if (tipo.includes('an\u00e3o') || tipo.includes('dwarf')) {
                discoveryKey = 'discovered_dwarf';
            } else if (tipo.includes('sonda') || tipo.includes('probe')) {
                discoveryKey = 'discovered_probe';
            } else if (tipo.includes('estrela') || tipo.includes('star')) {
                discoveryKey = 'discovered_star';
            } else if (tipo.includes('asteroide') || tipo.includes('asteroid')) {
                discoveryKey = 'discovered_asteroid';
            }
        }

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';

        const content = document.createElement('div');
        content.className = 'celebration-content';

        const emoji = document.createElement('div');
        emoji.className = 'celebration-emoji';
        emoji.innerText = '\uD83D\uDE80';

        const missionTitle = document.createElement('h3');
        missionTitle.innerText = i18n.t('mission_message');
        missionTitle.style.color = '#4a90e2';
        missionTitle.style.marginBottom = '5px';

        const title = document.createElement('h1');
        title.innerHTML = i18n.t('congrats_captain');

        const subTitle = document.createElement('p');
        subTitle.style.fontSize = '1.2rem';
        subTitle.style.color = '#ccc';
        subTitle.innerText = `${i18n.t(discoveryKey)} ${i18n.getPlanetName(name)}!`;

        content.appendChild(emoji);
        content.appendChild(missionTitle);
        content.appendChild(title);
        content.appendChild(subTitle);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Remove after 4 seconds
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 4000);

        // Trigger Confetti
        this.explodeConfetti();
    }

    explodeConfetti() {
        const colors = ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ffffff'];

        // Use a single container to batch DOM operations (instead of 60 individual appends)
        const container = document.createElement('div');
        container.className = 'confetti-container';
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
            container.appendChild(confetti);
        }

        document.body.appendChild(container);
        setTimeout(() => container.remove(), 4000);
    }
}
