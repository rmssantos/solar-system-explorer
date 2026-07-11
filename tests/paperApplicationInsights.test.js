import { describe, expect, it, vi } from 'vitest';
import { createApplicationInsightsAnalytics } from '../paper-preview/src/analytics/applicationInsights.js';

function memoryStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key)
    };
}

function sdkHarness() {
    const instance = {
        loadAppInsights: vi.fn(),
        trackEvent: vi.fn(),
        trackPageView: vi.fn(),
        addTelemetryInitializer: vi.fn(),
        flush: vi.fn(),
        unload: vi.fn(async () => true)
    };
    const ApplicationInsights = vi.fn(function ApplicationInsights(options) {
        this.config = options.config;
        Object.assign(this, instance);
    });
    return { instance, ApplicationInsights, loadSdk: vi.fn(async () => ({ ApplicationInsights })) };
}

describe('consent-gated Application Insights adapter', () => {
    it('does not load or send before explicit consent', async () => {
        const sdk = sdkHarness();
        const analytics = createApplicationInsightsAnalytics({
            connectionString: 'InstrumentationKey=test', storage: memoryStorage(), loadSdk: sdk.loadSdk
        });
        await analytics.start();
        analytics.track('object_open', { objectKey: 'earth', category: 'worlds', surface: 'library' });
        analytics.trackPageView('library', 'pt');
        expect(analytics.consent).toBe('pending');
        expect(sdk.loadSdk).not.toHaveBeenCalled();
        expect(sdk.instance.trackEvent).not.toHaveBeenCalled();
    });

    it('loads once after grant with privacy-preserving automatic collection disabled', async () => {
        const sdk = sdkHarness();
        const analytics = createApplicationInsightsAnalytics({
            connectionString: 'InstrumentationKey=test', storage: memoryStorage(), loadSdk: sdk.loadSdk
        });
        await analytics.grant();
        await analytics.grant();
        expect(sdk.loadSdk).toHaveBeenCalledTimes(1);
        expect(sdk.ApplicationInsights).toHaveBeenCalledTimes(1);
        const config = sdk.ApplicationInsights.mock.calls[0][0].config;
        expect(config).toMatchObject({
            disableCookiesUsage: true,
            disableAjaxTracking: true,
            disableFetchTracking: true,
            disableExceptionTracking: true,
            enableAutoRouteTracking: false,
            enableSessionStorageBuffer: false,
            disableCorrelationHeaders: true
        });
        expect(config.loggingLevelTelemetry).toBe(0);
        expect(sdk.instance.addTelemetryInitializer).toHaveBeenCalledOnce();
        const initializer = sdk.instance.addTelemetryInitializer.mock.calls[0][0];
        const envelope = { tags: { 'ai.user.id': 'user', 'ai.session.id': 'session', 'ai.operation.id': 'operation', 'ai.device.type': 'Browser' } };
        expect(initializer(envelope)).toBe(true);
        // The SDK fills missing context tags after initializers, so empty sentinels must remain present.
        envelope.tags['ai.user.id'] ??= 'sdk-generated-user';
        envelope.tags['ai.session.id'] ??= 'sdk-generated-session';
        expect(envelope.tags).toEqual({
            'ai.user.id': '',
            'ai.session.id': '',
            'ai.operation.id': 'operation',
            'ai.device.type': 'Browser'
        });
    });

    it('sends only sanitized semantic events and safe page names', async () => {
        const sdk = sdkHarness();
        const analytics = createApplicationInsightsAnalytics({
            connectionString: 'InstrumentationKey=test', storage: memoryStorage(), loadSdk: sdk.loadSdk
        });
        await analytics.grant();
        analytics.track('object_open', { objectKey: 'mars', category: 'worlds', surface: 'game', query: 'private' });
        analytics.track('mouse_move', { x: 10 });
        analytics.trackPageView('library', 'en');
        expect(sdk.instance.trackEvent).toHaveBeenCalledOnce();
        expect(sdk.instance.trackEvent).toHaveBeenCalledWith({
            name: 'object_open', properties: { objectKey: 'mars', category: 'worlds', surface: 'game' }
        });
        expect(sdk.instance.trackPageView).toHaveBeenCalledWith({
            name: 'library', uri: '/biblioteca/', properties: { language: 'en' }
        });
    });

    it('allows the SDK to enrich page views in place without throwing', async () => {
        const sdk = sdkHarness();
        sdk.instance.trackPageView.mockImplementation((pageView) => { pageView.duration = 0; });
        const analytics = createApplicationInsightsAnalytics({
            connectionString: 'InstrumentationKey=test', storage: memoryStorage(), loadSdk: sdk.loadSdk
        });
        await analytics.grant();
        expect(() => analytics.trackPageView('home', 'pt')).not.toThrow();
        expect(sdk.instance.trackPageView).toHaveBeenCalledOnce();
    });

    it('declines without loading and revocation stops future sends', async () => {
        const sdk = sdkHarness();
        const storage = memoryStorage();
        const declined = createApplicationInsightsAnalytics({ connectionString: 'InstrumentationKey=test', storage, loadSdk: sdk.loadSdk });
        await declined.deny();
        expect(declined.consent).toBe('denied');
        expect(sdk.loadSdk).not.toHaveBeenCalled();

        const active = createApplicationInsightsAnalytics({ connectionString: 'InstrumentationKey=test', storage: memoryStorage(), loadSdk: sdk.loadSdk });
        await active.grant();
        await active.revoke();
        active.track('object_open', { objectKey: 'earth', category: 'worlds', surface: 'game' });
        expect(active.consent).toBe('denied');
        expect(sdk.instance.unload).toHaveBeenCalled();
        expect(sdk.instance.flush).not.toHaveBeenCalled();
        expect(sdk.instance.trackEvent).not.toHaveBeenCalled();
    });

    it('stays a safe no-op when the production connection string is absent', async () => {
        const sdk = sdkHarness();
        const analytics = createApplicationInsightsAnalytics({ connectionString: '', storage: memoryStorage(), loadSdk: sdk.loadSdk });
        await analytics.grant();
        expect(analytics.consent).toBe('granted');
        expect(sdk.loadSdk).not.toHaveBeenCalled();
    });
});
