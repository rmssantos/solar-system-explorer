/**
 * Manages the Passport UI: planet badge bar showing visited/unvisited planets.
 */
import { SOLAR_SYSTEM_DATA } from './data/objectsInfo.js';
import { i18n } from './i18n.js';

export class PassportUI {
    constructor(app) {
        this.app = app;
        this.passportContainer = null;
        this.passportExpanded = true;
    }

    create() {
        // Create a horizontal scroll bar with planet icons
        const passportContainer = document.createElement('div');
        passportContainer.id = 'passport-panel';

        // Toggle button (minimize/expand) - modern chevron icon
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'passport-toggle';
        toggleBtn.title = i18n.t('minimize');
        toggleBtn.onclick = () => this.toggle();

        // Create chevron icon with CSS
        const chevron = document.createElement('div');
        chevron.className = 'chevron-icon left';
        toggleBtn.appendChild(chevron);

        passportContainer.appendChild(toggleBtn);

        const title = document.createElement('div');
        title.className = 'passport-title';
        title.innerText = i18n.t('passport_title');
        passportContainer.appendChild(title);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'passport-items';
        passportContainer.appendChild(itemsContainer);

        // Collectable Types (exclude Sun logic inside visit method, but here we list main planets)
        // IDs are now lowercase English
        const mainBodies = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        // Tell GM total count
        if (this.app.gameManager) this.app.gameManager.setTotal(mainBodies.length);

        mainBodies.forEach(id => {
            const badge = document.createElement('div');
            badge.className = 'passport-badge locked';
            badge.id = `badge-${id}`;

            // Get translated name for tooltip using the data.name
            const data = SOLAR_SYSTEM_DATA[id];
            const translatedName = data ? (i18n.lang === 'en' ? i18n.getPlanetName(data.name) : data.name) : id;
            badge.title = translatedName;

            // Simple Circle Icon
            const icon = document.createElement('div');
            icon.className = 'badge-icon';
            // Set color based on data? default gray
            if (data) icon.style.backgroundColor = '#' + data.color.toString(16).padStart(6, '0');

            const label = document.createElement('span');
            label.innerText = translatedName.substring(0, 3); // Mer, Ven...

            badge.appendChild(icon);
            badge.appendChild(label);
            itemsContainer.appendChild(badge);
        });

        document.body.appendChild(passportContainer);
        this.passportContainer = passportContainer;
        this.passportExpanded = true;
    }

    toggle() {
        this.passportExpanded = !this.passportExpanded;
        const panel = document.getElementById('passport-panel');
        const chevron = panel?.querySelector('.passport-toggle .chevron-icon');

        if (panel) {
            panel.classList.toggle('hidden-passport', !this.passportExpanded);
        }
        if (chevron) {
            chevron.className = this.passportExpanded ? 'chevron-icon left' : 'chevron-icon right';
        }

        const toggleBtn = /** @type {HTMLElement|null} */ (panel?.querySelector('.passport-toggle'));
        if (toggleBtn) {
            toggleBtn.title = this.passportExpanded ?
                i18n.t('minimize') :
                i18n.t('expand');
        }
    }

    updateLanguage() {
        const panel = document.getElementById('passport-panel');
        if (!panel) return;

        // Update title
        const title = /** @type {HTMLElement|null} */ (panel.querySelector('.passport-title'));
        if (title) {
            title.innerText = i18n.t('passport_title');
        }

        // Update toggle button tooltip
        const toggleBtn = /** @type {HTMLElement|null} */ (panel.querySelector('.passport-toggle'));
        if (toggleBtn) {
            toggleBtn.title = this.passportExpanded ?
                i18n.t('minimize') :
                i18n.t('expand');
        }

        // Update badge tooltips and labels
        const mainBodies = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        mainBodies.forEach(id => {
            const badge = document.getElementById(`badge-${id}`);
            if (badge) {
                const data = SOLAR_SYSTEM_DATA[id];
                const translatedName = data ? (i18n.lang === 'en' ? i18n.getPlanetName(data.name) : data.name) : id;
                badge.title = translatedName;
                const label = badge.querySelector('span');
                if (label) {
                    label.innerText = translatedName.substring(0, 3);
                }
            }
        });
    }

    update(name, forceUnlock = false) {
        if (!this.app.gameManager) return;

        if (this.app.gameManager.isVisited(name) || forceUnlock) {
            const badge = document.getElementById(`badge-${name}`);
            if (badge) {
                badge.classList.remove('locked');
                badge.classList.add('unlocked');
            }
        }
    }
}
