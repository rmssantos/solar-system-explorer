/**
 * Modern UI Layout Controller
 *
 * Was responsible for a top-right language selector, but the time-control
 * panel now embeds its own (canonical) language selector. Keeping a duplicate
 * top-right widget added clutter and made the UI Settings "Language" toggle
 * appear to do nothing (since users never look at the top-right widget). This
 * class is now a no-op stub, kept only so the App.init() sequence and any
 * downstream references (this.app.modernUI) don't break.
 */

export class ModernUI {
    constructor(app) {
        this.app = app;

        // Defensive cleanup: if an older session left a top-right .lang-selector
        // in the DOM (or another module recreates one in the future), remove it.
        const stray = document.getElementById('lang-selector');
        if (stray) stray.remove();
    }
}
