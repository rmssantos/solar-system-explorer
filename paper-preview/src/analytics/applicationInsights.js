import { readAnalyticsConsent, writeAnalyticsConsent } from './consent.js';
import { sanitizeAnalyticsEvent, sanitizePageView } from './eventCatalog.js';

const defaultSdkLoader = () => import('@microsoft/applicationinsights-web');

/** @param {{connectionString?: string, storage?: any, loadSdk?: () => Promise<any>, now?: () => Date}} options */
export function createApplicationInsightsAnalytics({
    connectionString = '',
    storage = globalThis.localStorage,
    loadSdk = defaultSdkLoader,
    now = () => new Date()
} = /** @type {any} */ ({})) {
    let consent = readAnalyticsConsent(storage, now());
    let client = null;
    let loading = null;

    async function initialize() {
        if (consent !== 'granted' || !connectionString) return null;
        if (client) return client;
        if (loading) return loading;
        loading = loadSdk().then(({ ApplicationInsights }) => {
            const instance = new ApplicationInsights({
                config: {
                    connectionString,
                    disableCookiesUsage: true,
                    cookieCfg: { enabled: false },
                    disableAjaxTracking: true,
                    disableFetchTracking: true,
                    disableExceptionTracking: true,
                    enableAutoRouteTracking: false,
                    enableSessionStorageBuffer: false,
                    disableCorrelationHeaders: true,
                    disableDataLossAnalysis: true,
                    loggingLevelTelemetry: 0,
                    enableDebug: false,
                    samplingPercentage: 100
                }
            });
            instance.loadAppInsights();
            instance.addTelemetryInitializer((envelope) => {
                const tags = envelope.tags ?? {};
                tags['ai.user.id'] = '';
                tags['ai.session.id'] = '';
                delete tags['ai.operation.parentId'];
                delete tags['ai.operation.syntheticSource'];
                return true;
            });
            client = instance;
            return instance;
        }).catch(() => null).finally(() => { loading = null; });
        return loading;
    }

    async function start() {
        if (consent === 'granted') await initialize();
        return consent;
    }

    async function grant() {
        consent = writeAnalyticsConsent(storage, 'granted', now());
        await initialize();
        return consent;
    }

    async function deny() {
        consent = writeAnalyticsConsent(storage, 'denied', now());
        return consent;
    }

    async function revoke() {
        consent = writeAnalyticsConsent(storage, 'denied', now());
        const active = client;
        client = null;
        if (active?.unload) await active.unload(false);
        return consent;
    }

    function track(name, properties) {
        if (consent !== 'granted' || !client) return false;
        const event = sanitizeAnalyticsEvent(name, properties);
        if (!event) return false;
        client.trackEvent(event);
        return true;
    }

    function trackPageView(route, language) {
        if (consent !== 'granted' || !client) return false;
        const pageView = sanitizePageView(route, language);
        if (!pageView) return false;
        client.trackPageView(pageView);
        return true;
    }

    return Object.freeze({
        get consent() { return consent; },
        start,
        grant,
        deny,
        revoke,
        track,
        trackPageView
    });
}
