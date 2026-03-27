/**
 * Mission Indicator - 2D HTML arrow overlay pointing toward the target planet
 * Feature 2B: Animated arrow pointing to the mission target
 */
import * as THREE from 'three';
import { i18n } from './i18n.js';

export class MissionIndicator {
    /**
     * @param {THREE.Camera} camera
     * @param {object} solarSystemObjects - map of name -> THREE.Object3D
     * @param {import('./missionSystem.js').MissionSystem} missionSystem
     */
    constructor(camera, solarSystemObjects, missionSystem) {
        this.camera = camera;
        this.objects = solarSystemObjects;
        this.missionSystem = missionSystem;
        this.el = null;
        this.arrowEl = null;
        this.labelEl = null;
        this._visible = false;
        this._hidden = false; // external hide (e.g. info panel open)
        this._manualNav = false;
        this._createDOM();

        // Listen for manual nav changes
        window.addEventListener('manualNavModeChanged', (e) => {
            this._manualNav = !!e.detail?.active;
        });
    }

    _createDOM() {
        this.el = document.createElement('div');
        this.el.className = 'mission-indicator';
        this.el.style.display = 'none';

        this.arrowEl = document.createElement('span');
        this.arrowEl.className = 'mission-indicator-arrow';
        this.arrowEl.textContent = '\u203A'; // ›

        this.labelEl = document.createElement('span');
        this.labelEl.className = 'mission-indicator-label';

        this.el.appendChild(this.arrowEl);
        this.el.appendChild(this.labelEl);
        document.body.appendChild(this.el);
    }

    /** Call externally to hide when info panel is open */
    setHidden(hidden) {
        this._hidden = hidden;
    }

    /**
     * Called every frame from the animate loop.
     */
    update() {
        const mission = this.missionSystem.activeMission;

        // Auto-detect info panel open state
        const infoPanel = document.getElementById('info-panel');
        const infoPanelOpen = infoPanel && !infoPanel.classList.contains('hidden');

        // Hide if no mission, in manual nav, externally hidden, or info panel open
        if (!mission || this._manualNav || this._hidden || infoPanelOpen) {
            if (this._visible) {
                this.el.style.display = 'none';
                this._visible = false;
            }
            return;
        }

        const targetName = mission.target;
        const mesh = this.objects[targetName];
        if (!mesh) {
            if (this._visible) {
                this.el.style.display = 'none';
                this._visible = false;
            }
            return;
        }

        // Get world position of target
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);

        // Project to screen (NDC)
        const ndc = worldPos.clone().project(this.camera);

        const hw = window.innerWidth / 2;
        const hh = window.innerHeight / 2;

        // Screen position
        const sx = ndc.x * hw + hw;
        const sy = -ndc.y * hh + hh;

        // Check if behind camera
        const behind = ndc.z > 1;

        const margin = 60;
        const onScreen = !behind &&
            sx >= margin && sx <= window.innerWidth - margin &&
            sy >= margin && sy <= window.innerHeight - margin;

        // If the planet is on-screen and reasonably close to center, hide indicator
        if (onScreen) {
            if (this._visible) {
                this.el.style.display = 'none';
                this._visible = false;
            }
            return;
        }

        // Show indicator
        if (!this._visible) {
            this.el.style.display = 'flex';
            this._visible = true;
        }

        // Compute angle from screen center to target
        let dx = sx - hw;
        let dy = sy - hh;

        // If behind camera, flip direction
        if (behind) {
            dx = -dx;
            dy = -dy;
        }

        const angle = Math.atan2(dy, dx);
        const angleDeg = (angle * 180) / Math.PI;

        // Position the indicator at the edge of the screen
        const edgeMargin = 50;
        const maxX = hw - edgeMargin;
        const maxY = hh - edgeMargin;

        // Scale factor to reach edge
        const abscos = Math.abs(Math.cos(angle));
        const abssin = Math.abs(Math.sin(angle));
        let scale = Infinity;
        if (abscos > 0.001) scale = Math.min(scale, maxX / abscos);
        if (abssin > 0.001) scale = Math.min(scale, maxY / abssin);

        const ex = hw + Math.cos(angle) * scale;
        const ey = hh + Math.sin(angle) * scale;

        this.el.style.left = ex + 'px';
        this.el.style.top = ey + 'px';

        // Rotate arrow to point toward the planet
        this.arrowEl.style.transform = `rotate(${angleDeg}deg)`;

        // Update label
        const findText = i18n.t('mission_indicator_find');
        this.labelEl.textContent = `${findText} ${this._getPlanetDisplayName(targetName)}`;
    }

    _getPlanetDisplayName(targetName) {
        // Try to use a short name from i18n, otherwise capitalize
        const shortKey = `short_${targetName}`;
        const short = i18n.t(shortKey);
        if (short !== shortKey) return short;
        return targetName.charAt(0).toUpperCase() + targetName.slice(1);
    }

    dispose() {
        this.el?.remove();
    }
}
