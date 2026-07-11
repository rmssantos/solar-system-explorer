import { paperI18n } from '../i18n/paperI18n.js';
import { createApplicationInsightsAnalytics } from './applicationInsights.js';

function connectionString() {
    try {
        return import.meta.env['VITE_APPLICATIONINSIGHTS_CONNECTION_STRING'] ?? '';
    } catch {
        return '';
    }
}

export function createSiteAnalytics({
    document = globalThis.document,
    i18n = paperI18n,
    analytics = createApplicationInsightsAnalytics({ connectionString: connectionString() })
} = {}) {
    let surface = 'home';
    let card = null;
    let started = false;
    let pageViewSent = false;

    function handleNavigation(event) {
        const anchor = event.target.closest?.('a[href]');
        if (!anchor) return;
        let destination = null;
        try {
            const url = new URL(anchor.href, globalThis.location?.origin ?? 'https://local.invalid');
            if (url.origin !== (globalThis.location?.origin ?? url.origin)) return;
            if (url.pathname.startsWith('/jogo')) destination = 'game';
            else if (url.pathname.startsWith('/biblioteca')) destination = 'library';
            else if (url.pathname.startsWith('/privacidade')) destination = 'privacy';
            else if (url.pathname === '/') destination = 'home';
        } catch {
            return;
        }
        if (destination) analytics.track('navigation_click', { destination, surface, language: i18n.language });
    }

    function handleClientError(event) {
        const errorType = event?.target?.tagName === 'IMG' ? 'asset' : 'unknown';
        analytics.track('error_event', { errorType, surface });
    }

    function renderCard() {
        if (!card) return;
        card.querySelector('[data-privacy-kicker]').textContent = i18n.t('privacy.consent.kicker');
        card.querySelector('[data-privacy-title]').textContent = i18n.t('privacy.consent.title');
        card.querySelector('[data-privacy-copy]').textContent = i18n.t('privacy.consent.copy');
        card.querySelector('[data-privacy-decline]').textContent = i18n.t(analytics.consent === 'granted' ? 'privacy.consent.revoke' : 'privacy.consent.decline');
        card.querySelector('[data-privacy-allow]').textContent = i18n.t('privacy.consent.allow');
        card.querySelector('[data-privacy-policy]').textContent = i18n.t('privacy.consent.policy');
        card.querySelector('[data-privacy-status]').textContent = analytics.consent === 'granted'
            ? i18n.t('privacy.status.on')
            : analytics.consent === 'denied' ? i18n.t('privacy.status.off') : '';
    }

    function ensureCard() {
        if (card || !document?.body) return card;
        card = document.createElement('section');
        card.className = 'privacy-consent-card';
        card.hidden = true;
        card.setAttribute('aria-labelledby', 'privacy-consent-title');
        card.innerHTML = `
            <span class="privacy-consent-tape" aria-hidden="true"></span>
            <div class="privacy-consent-copy">
                <small data-privacy-kicker></small>
                <strong id="privacy-consent-title" data-privacy-title></strong>
                <p data-privacy-copy></p>
                <span class="privacy-consent-status" data-privacy-status aria-live="polite"></span>
            </div>
            <div class="privacy-consent-actions">
                <button type="button" data-privacy-decline></button>
                <button type="button" data-privacy-allow></button>
                <a href="/privacidade/" data-privacy-policy></a>
            </div>`;
        card.querySelector('[data-privacy-allow]').addEventListener('click', async () => {
            await analytics.grant();
            analytics.track('privacy_choice', { choice: 'granted', surface });
            if (!pageViewSent) {
                analytics.trackPageView(surface, i18n.language);
                pageViewSent = true;
            }
            card.hidden = true;
            renderCard();
        });
        card.querySelector('[data-privacy-decline]').addEventListener('click', async () => {
            if (analytics.consent === 'granted') {
                analytics.track('privacy_choice', { choice: 'revoked', surface });
                await analytics.revoke();
            } else {
                await analytics.deny();
            }
            card.hidden = true;
            renderCard();
        });
        document.body.append(card);
        renderCard();
        return card;
    }

    function openSettings() {
        ensureCard();
        renderCard();
        card.hidden = false;
        card.querySelector(analytics.consent === 'granted' ? '[data-privacy-decline]' : '[data-privacy-allow]')?.focus({ preventScroll: true });
    }

    async function start(nextSurface = 'home') {
        surface = nextSurface;
        ensureCard();
        if (!started) {
            started = true;
            document?.querySelectorAll('[data-privacy-settings]').forEach((button) => button.addEventListener('click', openSettings));
            document?.addEventListener('click', handleNavigation);
            const eventTarget = document?.defaultView ?? globalThis;
            eventTarget?.addEventListener?.('error', handleClientError);
            eventTarget?.addEventListener?.('unhandledrejection', handleClientError);
            i18n.subscribe(renderCard);
            await analytics.start();
        }
        renderCard();
        if (analytics.consent === 'pending') card.hidden = false;
        if (analytics.consent === 'granted' && !pageViewSent) {
            analytics.trackPageView(surface, i18n.language);
            pageViewSent = true;
        }
        return analytics.consent;
    }

    return Object.freeze({
        get consent() { return analytics.consent; },
        start,
        openSettings,
        track: (name, properties) => analytics.track(name, properties),
        trackPageView: (route = surface, language = i18n.language) => analytics.trackPageView(route, language)
    });
}

export const siteAnalytics = createSiteAnalytics();
