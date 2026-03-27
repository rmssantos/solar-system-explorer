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
     * Start the tutorial
     */
    show() {
        this.steps = this.getSteps(); // Refresh translations
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
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
        const nextBtn = this.card.querySelector('.tutorial-next-btn');
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
        } else {
            // No target or canvas - center everything
            this.spotlight.style.display = 'none';
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
    positionCard(rect, position) {
        const margin = 20;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Reset all positioning
        this.card.style.transform = '';
        this.card.style.left = '';
        this.card.style.top = '';
        this.card.style.bottom = '';
        this.card.style.right = '';

        // Mobile or center: always centered
        if (window.innerWidth <= 768 || position === 'center' || !rect) {
            this.card.style.left = '50%';
            this.card.style.top = '50%';
            this.card.style.transform = 'translate(-50%, -50%)';
            return;
        }

        // Use a fixed card size estimate (real size may not be available yet)
        const cardW = Math.min(380, vw - margin * 2);
        const cardH = 260;

        let left, top;

        if (position === 'above') {
            // Try above the target
            left = rect.left + rect.width / 2 - cardW / 2;
            top = rect.top - cardH - margin;
            // If goes above viewport, try below
            if (top < margin) top = rect.bottom + margin;
            // If STILL off-screen (target at bottom), center vertically
            if (top + cardH > vh - margin) top = vh / 2 - cardH / 2;
        } else if (position === 'beside') {
            // Try right of target
            left = rect.right + margin;
            top = rect.top;
            // If off right edge, try left
            if (left + cardW > vw - margin) left = rect.left - cardW - margin;
            // If off left edge too, center horizontally
            if (left < margin) left = vw / 2 - cardW / 2;
        }

        // FINAL CLAMP: absolutely guarantee within viewport
        left = Math.max(margin, Math.min(left, vw - cardW - margin));
        top = Math.max(margin, Math.min(top, vh - cardH - margin));

        this.card.style.left = `${left}px`;
        this.card.style.top = `${top}px`;

        // After render, re-check with actual dimensions and re-clamp if needed
        requestAnimationFrame(() => {
            if (!this.card) return;
            const actual = this.card.getBoundingClientRect();
            if (actual.right > vw - 5) {
                this.card.style.left = `${Math.max(margin, vw - actual.width - margin)}px`;
            }
            if (actual.left < 5) {
                this.card.style.left = `${margin}px`;
            }
            if (actual.bottom > vh - 5) {
                this.card.style.top = `${Math.max(margin, vh - actual.height - margin)}px`;
            }
        });
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
    }
}
