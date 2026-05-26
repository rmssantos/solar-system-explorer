/**
 * Mission Overlay - Shows a large centered overlay when a new mission starts
 * Feature 2A: Prominent first mission display
 */
import { i18n } from './i18n.js';

export class MissionOverlay {
    constructor() {
        this._shownThisSession = false;
        this._overlay = null;
        this._dismissTimer = null;
    }

    /**
     * Show the mission overlay for the given mission.
     * Only shows once per session (first call). Returns a Promise that
     * resolves when the overlay is dismissed (clicked away or auto-timeout) —
     * used by the FTUE orchestrator to chain popups.
     * @param {object} mission - The active mission object
     * @param {boolean} isFirst - Whether this is the very first mission
     * @returns {Promise<void>}
     */
    show(mission, isFirst = true) {
        if (this._shownThisSession || !mission) return Promise.resolve();
        this._shownThisSession = true;

        const emoji = mission.title.split(' ')[0];
        const titleKey = isFirst ? 'mission_overlay_title' : 'mission_overlay_new';
        const missionKey = `mission_${mission.id}_desc`;
        const desc = i18n.t(missionKey) !== missionKey
            ? i18n.t(missionKey)
            : mission.description;

        this._overlay = document.createElement('div');
        this._overlay.className = 'mission-overlay';
        this._overlay.setAttribute('role', 'dialog');
        this._overlay.setAttribute('aria-label', i18n.t(titleKey));

        const card = document.createElement('div');
        card.className = 'mission-overlay-card';

        const iconEl = document.createElement('div');
        iconEl.className = 'mission-overlay-icon';
        iconEl.textContent = emoji;

        const titleEl = document.createElement('h2');
        titleEl.className = 'mission-overlay-title';
        titleEl.textContent = i18n.t(titleKey);

        const descEl = document.createElement('p');
        descEl.className = 'mission-overlay-desc';
        descEl.textContent = desc;

        const btn = document.createElement('button');
        btn.className = 'mission-overlay-btn';
        btn.textContent = i18n.t('mission_overlay_go');
        btn.setAttribute('aria-label', i18n.t('mission_overlay_go'));
        btn.addEventListener('click', () => this.dismiss());

        card.appendChild(iconEl);
        card.appendChild(titleEl);
        card.appendChild(descEl);
        card.appendChild(btn);
        this._overlay.appendChild(card);
        document.body.appendChild(this._overlay);

        // Animate in
        requestAnimationFrame(() => {
            this._overlay.classList.add('visible');
        });

        // Auto-dismiss after 8 seconds
        this._dismissTimer = setTimeout(() => this.dismiss(), 8000);

        return new Promise((resolve) => {
            this._onDismiss = resolve;
        });
    }

    dismiss() {
        if (this._dismissTimer) {
            clearTimeout(this._dismissTimer);
            this._dismissTimer = null;
        }
        if (this._overlay) {
            this._overlay.classList.add('fade-out');
            setTimeout(() => {
                this._overlay?.remove();
                this._overlay = null;
            }, 400);
        }
        if (this._onDismiss) {
            const cb = this._onDismiss;
            this._onDismiss = null;
            cb();
        }
    }
}
