/**
 * Interactive Tutorial - Shows on first visit
 * Mobile-first overlay tutorial for kids (~8 years old)
 * Guides them through the main features of the Solar System Explorer
 */

import { i18n } from './i18n.js';

export class Tutorial {
    constructor() {
        this.currentStep = 0;
        this.overlay = null;
        this.steps = this.getSteps();
    }

    /**
     * Check if tutorial should be shown (first visit)
     */
    static shouldShow() {
        try {
            return !localStorage.getItem('spaceExplorer_tutorialDone');
        } catch {
            return false;
        }
    }

    /**
     * Mark tutorial as completed
     */
    static markDone() {
        try {
            localStorage.setItem('spaceExplorer_tutorialDone', 'true');
        } catch {
            // Ignore storage errors
        }
    }

    /**
     * Get the tutorial step definitions
     */
    getSteps() {
        return [
            {
                key: 'tutorial_step1',
                targetSelector: '.nav-controls',
                position: 'above',
                icon: '👆'
            },
            {
                key: 'tutorial_step2',
                targetSelector: '#canvas-container',
                position: 'center',
                icon: '👆'
            },
            {
                key: 'tutorial_step3',
                targetSelector: '#mission-panel',
                position: 'beside',
                icon: '🎯'
            },
            {
                key: 'tutorial_step4',
                targetSelector: null,
                position: 'center',
                icon: '🎮'
            }
        ];
    }

    /**
     * Start the tutorial. Returns a Promise that resolves once the user
     * dismisses or completes it — used by the FTUE orchestrator to sequence
     * popups.
     */
    show() {
        this.steps = this.getSteps(); // Refresh translations
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
        return new Promise((resolve) => {
            this._onDismiss = resolve;
        });
    }

    /**
     * Create the tutorial overlay DOM
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-label', i18n.t('tutorial_title'));

        // Spotlight cutout (SVG-based for smooth spotlight effect)
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tutorial-spotlight';
        this.overlay.appendChild(this.spotlight);

        // Content card
        this.card = document.createElement('div');
        this.card.className = 'tutorial-card';
        this.overlay.appendChild(this.card);

        // Animated hand pointer
        this.hand = document.createElement('div');
        this.hand.className = 'tutorial-hand';
        this.hand.innerHTML = '<span class="tutorial-hand-icon">👆</span>';
        this.overlay.appendChild(this.hand);

        // SVG connector line (card → target)
        this.connectorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.connectorSvg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:20001;pointer-events:none;';
        this.connectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.connectorLine.setAttribute('stroke', 'rgba(120,140,255,0.4)');
        this.connectorLine.setAttribute('stroke-width', '2');
        this.connectorLine.setAttribute('stroke-dasharray', '6,4');
        this.connectorSvg.appendChild(this.connectorLine);
        this.overlay.appendChild(this.connectorSvg);

        // Click on overlay background dismisses tutorial
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target === this.spotlight) {
                this.complete();
            }
        });

        document.body.appendChild(this.overlay);

        // Animate in
        requestAnimationFrame(() => {
            this.overlay.classList.add('visible');
        });
    }

    /**
     * Show a specific tutorial step
     */
    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }

        this.currentStep = index;
        const step = this.steps[index];
        const isLast = index === this.steps.length - 1;

        // Update card content
        this.card.innerHTML = `
            <div class="tutorial-step-indicator">
                ${this.steps.map((_, i) => `<span class="tutorial-dot ${i === index ? 'active' : ''} ${i < index ? 'done' : ''}"></span>`).join('')}
            </div>
            <div class="tutorial-icon">${step.icon}</div>
            <p class="tutorial-text">${i18n.t(step.key)}</p>
            <div class="tutorial-buttons">
                <button class="tutorial-skip-btn" aria-label="${i18n.t('tutorial_skip')}">${i18n.t('tutorial_skip')}</button>
                <button class="tutorial-next-btn" aria-label="${isLast ? i18n.t('tutorial_got_it') : i18n.t('tutorial_next')}">
                    ${isLast ? i18n.t('tutorial_got_it') : i18n.t('tutorial_next')}
                </button>
            </div>
        `;

        // Wire up buttons
        this.card.querySelector('.tutorial-skip-btn').addEventListener('click', () => this.complete());
        this.card.querySelector('.tutorial-next-btn').addEventListener('click', () => this.showStep(index + 1));

        // Focus the next button for keyboard users
        const nextBtn = /** @type {HTMLButtonElement|null} */ (this.card.querySelector('.tutorial-next-btn'));
        if (nextBtn) nextBtn.focus();

        // Position spotlight and hand
        this.positionSpotlight(step);

        // Card entrance animation
        this.card.classList.remove('tutorial-card-enter');
        void this.card.offsetWidth; // Force reflow
        this.card.classList.add('tutorial-card-enter');
    }

    /**
     * Position the spotlight cutout over the target element
     */
    positionSpotlight(step) {
        const target = step.targetSelector ? document.querySelector(step.targetSelector) : null;

        if (target && step.targetSelector !== '#canvas-container') {
            const rect = target.getBoundingClientRect();
            const padding = 12;

            this.spotlight.style.display = 'block';
            this.spotlight.style.left = `${rect.left - padding}px`;
            this.spotlight.style.top = `${rect.top - padding}px`;
            this.spotlight.style.width = `${rect.width + padding * 2}px`;
            this.spotlight.style.height = `${rect.height + padding * 2}px`;
            this.spotlight.style.borderRadius = '12px';

            // Position hand near target
            this.hand.style.display = 'block';
            this.hand.style.left = `${rect.left + rect.width / 2}px`;
            this.hand.style.top = `${rect.top - 30}px`;
            this.hand.querySelector('.tutorial-hand-icon').textContent = step.icon;

            // Position card relative to target
            this.positionCard(rect, step.position);

            // Draw a connecting line from card to target after card is positioned
            requestAnimationFrame(() => this._drawConnector(rect));
        } else {
            // No target or canvas - center everything
            this.spotlight.style.display = 'none';
            this._hideConnector();
            this.hand.style.display = step.targetSelector === '#canvas-container' ? 'block' : 'none';

            if (step.targetSelector === '#canvas-container') {
                this.hand.style.left = '50%';
                this.hand.style.top = '40%';
                this.hand.querySelector('.tutorial-hand-icon').textContent = step.icon;
            }

            this.card.style.left = '50%';
            this.card.style.top = '50%';
            this.card.style.transform = 'translate(-50%, -50%)';
            this.card.style.bottom = 'auto';
            this.card.style.right = 'auto';
        }
    }

    /**
     * Position the tutorial card relative to a target rect
     */
    _drawConnector(targetRect) {
        if (!this.connectorLine || !this.card) {
            if (this.connectorSvg) this.connectorSvg.style.display = 'none';
            return;
        }
        const cardRect = this.card.getBoundingClientRect();
        if (!cardRect.width) { this.connectorSvg.style.display = 'none'; return; }

        // Card edge closest to target center
        const tx = targetRect.left + targetRect.width / 2;
        const ty = targetRect.top + targetRect.height / 2;
        const cx = cardRect.left + cardRect.width / 2;
        const cy = cardRect.top + cardRect.height / 2;

        // Don't show if card overlaps target
        const dist = Math.hypot(tx - cx, ty - cy);
        if (dist < 80) { this.connectorSvg.style.display = 'none'; return; }

        this.connectorSvg.style.display = '';
        this.connectorLine.setAttribute('x1', String(cx));
        this.connectorLine.setAttribute('y1', String(cy));
        this.connectorLine.setAttribute('x2', String(tx));
        this.connectorLine.setAttribute('y2', String(ty));
    }

    _hideConnector() {
        if (this.connectorSvg) this.connectorSvg.style.display = 'none';
    }

    positionCard(rect, position) {
        const margin = 16;
        const gap = 12; // gap between card and target
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cardW = Math.min(360, vw - margin * 2);
        const cardH = 240;

        // Reset
        this.card.style.transform = '';
        this.card.style.left = '';
        this.card.style.top = '';

        if (vw <= 768 || position === 'center' || !rect) {
            this.card.style.left = '50%';
            this.card.style.top = '50%';
            this.card.style.transform = 'translate(-50%, -50%)';
            return;
        }

        // Target center
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;

        // Try all 4 positions in preference order, pick the one closest to target that fits
        const candidates = [
            // Above target
            { left: tx - cardW / 2, top: rect.top - cardH - gap },
            // Below target
            { left: tx - cardW / 2, top: rect.bottom + gap },
            // Right of target
            { left: rect.right + gap, top: ty - cardH / 2 },
            // Left of target
            { left: rect.left - cardW - gap, top: ty - cardH / 2 },
        ];

        // Reorder based on preferred position
        if (position === 'beside') {
            // Prefer right, then left, then below, then above
            candidates.sort((a, b) => {
                const aRight = a.left > rect.right;
                const bRight = b.left > rect.right;
                if (aRight && !bRight) return -1;
                if (!aRight && bRight) return 1;
                return 0;
            });
        }

        // Pick the first candidate that fits within viewport (with clamping)
        let best = candidates[0];
        for (const c of candidates) {
            const cl = Math.max(margin, Math.min(c.left, vw - cardW - margin));
            const ct = Math.max(margin, Math.min(c.top, vh - cardH - margin));
            // Check if clamped position is still near the target (within 400px)
            const dist = Math.hypot(cl + cardW / 2 - tx, ct + cardH / 2 - ty);
            if (dist < 400) {
                best = { left: cl, top: ct };
                break;
            }
        }

        // Final clamp
        best.left = Math.max(margin, Math.min(best.left, vw - cardW - margin));
        best.top = Math.max(margin, Math.min(best.top, vh - cardH - margin));

        this.card.style.left = `${best.left}px`;
        this.card.style.top = `${best.top}px`;
    }

    /**
     * Complete the tutorial (skip or finish)
     */
    complete() {
        Tutorial.markDone();

        if (this.overlay) {
            this.overlay.classList.remove('visible');
            this.overlay.classList.add('fade-out');
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 400);
        }
        if (this._onDismiss) {
            const cb = this._onDismiss;
            this._onDismiss = null;
            cb();
        }
    }
}
