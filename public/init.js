// Suppress noisy Three.js computeBoundingSphere NaN warnings.
// Must run before any module parses; loaded as external script for CSP.
(function () {
    var _w = console.warn;
    console.warn = function () {
        if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('computeBoundingSphere') !== -1) return;
        _w.apply(console, arguments);
    };
})();

// Global error visibility: the dev cannot see kids' tablets, so an uncaught
// error must produce an actionable, kid-friendly screen instead of a silent
// freeze. Bilingual on purpose — i18n may be part of what broke.
(function () {
    var shown = false;
    function showErrorOverlay(message) {
        if (shown || document.getElementById('fatal-error-screen')) return;
        // The in-app init error screen (main.js) is richer; this one only
        // appears for errors nothing else caught.
        shown = true;
        try {
            var overlay = document.createElement('div');
            overlay.id = 'fatal-error-screen';
            overlay.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;text-align:center;padding:24px;font-family:system-ui,sans-serif;color:#e2e8f0;';
            var emoji = document.createElement('div');
            emoji.style.cssText = 'font-size:4rem;margin-bottom:16px;';
            emoji.textContent = '🚀💥';
            overlay.appendChild(emoji);
            var title = document.createElement('h1');
            title.style.cssText = 'font-size:1.4rem;margin:0 0 8px;color:#ffd700;';
            title.textContent = 'Houston, temos um problema!';
            overlay.appendChild(title);
            var sub = document.createElement('p');
            sub.style.cssText = 'margin:0 0 20px;color:#94a3b8;';
            sub.textContent = 'Houston, we have a problem!';
            overlay.appendChild(sub);
            var detail = document.createElement('p');
            detail.style.cssText = 'font-size:0.75rem;color:#64748b;max-width:480px;word-break:break-word;margin:0 0 24px;';
            detail.textContent = String(message || 'Unknown error');
            overlay.appendChild(detail);
            var btn = document.createElement('button');
            btn.style.cssText = 'background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:8px;padding:12px 32px;color:white;font-size:1.1rem;cursor:pointer;font-weight:bold;';
            btn.textContent = '🔄 Recarregar / Reload';
            btn.addEventListener('click', function () { location.reload(); });
            overlay.appendChild(btn);
            document.body.appendChild(overlay);
        } catch (e) { /* never throw from the error handler */ }
    }

    // Shared with src/main.js's fatal paths so the crash screen exists once.
    window.__showFatalError = showErrorOverlay;

    // Only take over the screen while the app has not booted yet (the page
    // sets window.__appBooted after a successful init). A transient error
    // mid-game must not replace a working app with an error screen.
    window.addEventListener('error', function (event) {
        // Resource load errors (img, script) bubble here too but have no
        // .error — a missing texture must not nuke the whole app.
        if (!event.error || window.__appBooted) return;
        showErrorOverlay(event.error && event.error.message);
    });
    // Unhandled rejections are logged but never take over the screen: benign
    // rejections (autoplay denials, transient fetches, extensions) are common
    // during the welcome-screen dwell time and break nothing.
    window.addEventListener('unhandledrejection', function (event) {
        var r = event.reason;
        console.error('[init] Unhandled rejection:', r && r.message ? r.message : r);
    });
})();

// Service Worker Registration (disabled in development)
if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (reg) { reg.unregister(); });
    });
}
