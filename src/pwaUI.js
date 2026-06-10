/**
 * PWA UI:
 *   1. "Install app" affordance — captures `beforeinstallprompt`, shows a small
 *      button when the browser confirms the app is installable. Hides after the
 *      user accepts or dismisses.
 *   2. "New version available" banner — observes the registered Service Worker
 *      for a waiting state and offers a single-click reload to take the update.
 *
 * Both are no-ops on browsers that don't fire the relevant events (Safari < 17,
 * Firefox without PWA support, etc.) — safe to construct unconditionally.
 */
import { i18n } from './i18n.js';

/**
 * Not in the TS DOM lib (Chromium-only event).
 * @typedef {Event & { prompt: () => Promise<void>, userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }} BeforeInstallPromptEvent
 */

export class PWAUI {
    constructor() {
        /** @type {BeforeInstallPromptEvent | null} */
        this._installPromptEvent = null;
        this._installBtn = null;
        this._updateBanner = null;
        this._mountStyles();
        this._wireInstallPrompt();
        this._wireSWUpdate();
    }

    _mountStyles() {
        if (document.getElementById('pwa-ui-style')) return;
        const css = `
            .pwa-install-btn {
                /* Top-left corner — bottom-right is taken by .time-control and the
                   manual-nav toggle; top-right by the settings button + minimap. */
                position: fixed;
                top: 12px;
                left: 12px;
                z-index: 1100;
                background: linear-gradient(135deg, #6366f1, #a855f7);
                color: white;
                border: none;
                border-radius: 999px;
                padding: 8px 14px 8px 10px;
                font-size: 0.82rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transform: translateY(-20px);
                opacity: 0;
                transition: transform 0.25s ease, opacity 0.25s ease;
            }
            .pwa-install-btn.visible { transform: translateY(0); opacity: 1; }
            @media (max-width: 600px) {
                .pwa-install-btn { padding: 6px 12px 6px 8px; font-size: 0.75rem; }
            }
            .pwa-install-btn:hover { filter: brightness(1.1); }
            .pwa-install-btn:focus-visible { outline: 2px solid #f0f4ff; outline-offset: 3px; }
            .pwa-install-btn .icon { font-size: 1.1rem; }
            body.manual-nav-active .pwa-install-btn { display: none; }

            .pwa-update-banner {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translate(-50%, 20px);
                z-index: 1101;
                background: rgba(7, 9, 18, 0.96);
                border: 1px solid #6366f1;
                border-radius: 12px;
                padding: 10px 14px;
                color: #f1f5fb;
                font-size: 0.9rem;
                display: inline-flex;
                align-items: center;
                gap: 14px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.45);
                opacity: 0;
                transition: transform 0.25s ease, opacity 0.25s ease;
                max-width: 92vw;
            }
            .pwa-update-banner.visible {
                transform: translate(-50%, 0);
                opacity: 1;
            }
            .pwa-update-banner button {
                background: linear-gradient(135deg, #6366f1, #a855f7);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
            }
            .pwa-update-banner button:focus-visible {
                outline: 2px solid #f0f4ff;
                outline-offset: 2px;
            }
            .pwa-update-banner .close {
                background: transparent;
                color: #94a3b8;
                font-size: 1.1rem;
                padding: 0 4px;
            }
        `;
        const style = document.createElement('style');
        style.id = 'pwa-ui-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------- Install prompt --------

    _wireInstallPrompt() {
        // Don't show if already running as installed PWA.
        const isStandalone =
            window.matchMedia?.('(display-mode: standalone)').matches ||
            window.navigator['standalone'] === true;
        if (isStandalone) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this._installPromptEvent = /** @type {BeforeInstallPromptEvent} */ (e);
            this._showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this._installPromptEvent = null;
            this._hideInstallButton();
        });
    }

    _showInstallButton() {
        if (this._installBtn) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pwa-install-btn';
        btn.setAttribute('aria-label', i18n.t('install_app'));
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '⬇️';
        const label = document.createElement('span');
        label.textContent = i18n.t('install_app_short');
        btn.append(icon, label);

        btn.addEventListener('click', async () => {
            if (!this._installPromptEvent) return;
            this._installPromptEvent.prompt();
            const { outcome } = await this._installPromptEvent.userChoice;
            this._installPromptEvent = null;
            if (outcome === 'accepted') this._hideInstallButton();
        });

        document.body.appendChild(btn);
        this._installBtn = btn;
        // Defer the visible class to next frame so the transition runs.
        requestAnimationFrame(() => btn.classList.add('visible'));
    }

    _hideInstallButton() {
        if (!this._installBtn) return;
        this._installBtn.classList.remove('visible');
        const btn = this._installBtn;
        this._installBtn = null;
        setTimeout(() => btn.remove(), 300);
    }

    // -------- SW update banner --------

    _wireSWUpdate() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.getRegistration().then((reg) => {
            if (!reg) return;

            // A waiting worker means there's a new SW ready to take over.
            if (reg.waiting) this._showUpdateBanner(reg.waiting);

            reg.addEventListener('updatefound', () => {
                const installing = reg.installing;
                if (!installing) return;
                installing.addEventListener('statechange', () => {
                    if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                        this._showUpdateBanner(installing);
                    }
                });
            });
        }).catch(() => { /* ignore — SW disabled in dev */ });

        // When the new SW takes control, reload once (and only once) so the page
        // is served by the new worker.
        let hasReloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (hasReloaded) return;
            hasReloaded = true;
            window.location.reload();
        });
    }

    _showUpdateBanner(worker) {
        if (this._updateBanner) return;
        const banner = document.createElement('div');
        banner.className = 'pwa-update-banner';
        banner.setAttribute('role', 'status');
        banner.setAttribute('aria-live', 'polite');

        const msg = document.createElement('span');
        msg.textContent = i18n.t('new_version');

        const reloadBtn = document.createElement('button');
        reloadBtn.type = 'button';
        reloadBtn.textContent = i18n.t('update_now');
        reloadBtn.addEventListener('click', () => {
            // Ask the waiting worker to take over; controllerchange listener triggers reload.
            worker.postMessage('skipWaiting');
            reloadBtn.disabled = true;
            reloadBtn.textContent = i18n.t('updating');
        });

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close';
        closeBtn.setAttribute('aria-label', i18n.t('dismiss'));
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this._hideUpdateBanner());

        banner.append(msg, reloadBtn, closeBtn);
        document.body.appendChild(banner);
        this._updateBanner = banner;
        requestAnimationFrame(() => banner.classList.add('visible'));
    }

    _hideUpdateBanner() {
        if (!this._updateBanner) return;
        this._updateBanner.classList.remove('visible');
        const b = this._updateBanner;
        this._updateBanner = null;
        setTimeout(() => b.remove(), 300);
    }
}
