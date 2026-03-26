// Suppress Three.js NaN bounding sphere warnings (cosmetic, from comet init)
var _w = console.warn;
console.warn = function() {
    if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('computeBoundingSphere') !== -1) return;
    _w.apply(console, arguments);
};

// Service Worker Registration (disabled in development)
if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(reg) { reg.unregister(); });
    });
}
