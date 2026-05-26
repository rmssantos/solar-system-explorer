/**
 * FTUE (First-Time User Experience) Orchestrator.
 *
 * Replaces the previous parallel-setTimeout boot sequence that stacked four
 * popups on top of each other in the first five seconds: welcome toast, Astro
 * mascot intro, tutorial overlay, and mission overlay all fired regardless of
 * whether the prior popup had been dismissed.
 *
 * This orchestrator chains them as awaited steps so that:
 *   - First-time users see: Astro hello → tutorial → mission overlay
 *   - Returning users see:  welcome toast → mission overlay (if a fresh one)
 *
 * Each step returns a Promise that resolves when the popup is dismissed. The
 * orchestrator awaits each one in sequence with a small inter-step beat so the
 * UI never feels jammed.
 */
import { i18n } from './i18n.js';
import { Tutorial } from './tutorial.js';

const INTER_STEP_DELAY_MS = 350;

const FIRST_VISIT_MASCOT_KEY = 'spaceExplorer_astroIntroShown';

export class FtueOrchestrator {
    constructor(app) {
        this.app = app;
        this._cancelled = false;
    }

    /**
     * Returns true if the user has no recorded progress (fresh install / cleared LS).
     * We treat anyone with zero XP AND zero planet visits as first-time.
     */
    isFirstTimeUser() {
        const visited = this.app.gameManager?.visited?.size ?? 0;
        const xp = this.app.xpSystem?.xp ?? 0;
        return visited === 0 && xp === 0;
    }

    async run() {
        const firstTime = this.isFirstTimeUser();

        // 1) First-time users: a single, brief Astro intro. Returning users skip
        //    this entirely — they already know who Astro is.
        if (firstTime && this._astroIntroNotShownYet()) {
            await this._wait(600); // small breathing room after loading overlay clears
            await this._astroIntro();
            await this._wait(INTER_STEP_DELAY_MS);
        }

        if (this._cancelled) return;

        // 2) Tutorial — gated by its own localStorage flag. Awaits dismissal so
        //    the mission overlay never lands on top of an open tutorial.
        if (Tutorial.shouldShow()) {
            const tutorial = new Tutorial();
            await tutorial.show();
            await this._wait(INTER_STEP_DELAY_MS);
        }

        if (this._cancelled) return;

        // 3) Returning users get a one-line welcome-back toast. We show it
        //    AFTER any onboarding (it's just a greeting, not blocking onboarding).
        if (!firstTime) {
            await this._welcomeBackToast();
            await this._wait(INTER_STEP_DELAY_MS);
        }

        if (this._cancelled) return;

        // 4) Mission overlay — only if there is an active mission and the user
        //    hasn't already cleared it. Awaits dismissal but with auto-timeout
        //    so the user can interact freely.
        const ms = this.app.missionSystem;
        if (ms?.activeMission && this.app.missionOverlay) {
            await this.app.missionOverlay.show(
                ms.activeMission,
                ms.completedMissions.size === 0
            );
        }
    }

    cancel() { this._cancelled = true; }

    // ----- internals -----

    _astroIntroNotShownYet() {
        try {
            return !localStorage.getItem(FIRST_VISIT_MASCOT_KEY);
        } catch {
            return true;
        }
    }

    async _astroIntro() {
        const msg = i18n.lang === 'pt'
            ? 'Olá! Sou o Astro, o teu guia espacial! Vamos explorar o Sistema Solar!'
            : 'Hello! I\'m Astro, your space guide! Let\'s explore the Solar System!';
        try {
            localStorage.setItem(FIRST_VISIT_MASCOT_KEY, '1');
        } catch { /* ignore */ }
        if (this.app.mascot?.showAwaitable) {
            await this.app.mascot.showAwaitable(msg, 'neutral', {
                duration: 4500, position: 'auto',
            });
        } else if (this.app.mascot?.show) {
            this.app.mascot.show(msg, 'neutral', { duration: 4500, position: 'auto' });
            await this._wait(4500);
        }
    }

    _welcomeBackToast() {
        return new Promise((resolve) => {
            const rank = this.app.xpSystem?.getCurrentRank?.();
            const rankName = rank ? this.app.xpSystem.getRankName(rank) : '';
            const toast = document.createElement('div');
            toast.className = 'welcome-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            const iconEl = document.createElement('span');
            iconEl.className = 'toast-icon';
            iconEl.textContent = '🚀';
            const textEl = document.createElement('span');
            textEl.className = 'toast-text';
            const greeting = i18n.t('welcome_back');
            const rankBit = rank ? `${rank.icon} ${rankName} ` : '';
            textEl.textContent = `${greeting}, ${rankBit}${this.app.playerName}!`;
            toast.appendChild(iconEl);
            toast.appendChild(textEl);
            document.body.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('visible'));

            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    toast.remove();
                    resolve();
                }, 500);
            }, 2500);
        });
    }

    _wait(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
}
