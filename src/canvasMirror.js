/**
 * Canvas Mirror — accessible (screen-reader / keyboard) navigation of the 3D scene.
 *
 * Renders a visually-hidden but focusable list of every visitable celestial body.
 * Tabbing through the list moves the keyboard focus; activating an item (Enter / Space)
 * flies the 3D camera to that body and announces the change via an aria-live region.
 *
 * This is the canonical fix for the "<canvas> is opaque to assistive tech" gap.
 */
import { i18n } from './i18n.js';

export class CanvasMirror {
    constructor(app) {
        this.app = app;
        this.container = null;
        this.list = null;
        this.live = null;
        this._unsubLang = null;

        this._mount();
        this._populate();

        this._unsubLang = i18n.onLangChange(() => this._populate());
    }

    _mount() {
        // Visually hidden but accessible to AT and keyboard. WCAG-friendly clip pattern.
        const css = `
            .canvas-mirror {
                position: absolute;
                width: 1px;
                height: 1px;
                margin: -1px;
                padding: 0;
                border: 0;
                clip: rect(0 0 0 0);
                clip-path: inset(50%);
                overflow: hidden;
                white-space: nowrap;
            }
            .canvas-mirror:focus-within {
                /* When focused, reveal a discreet panel for keyboard users (still small,
                   high-contrast, top-left) so sighted keyboard users see what they're picking. */
                position: fixed;
                top: 8px;
                left: 8px;
                width: 280px;
                height: auto;
                max-height: 70vh;
                margin: 0;
                padding: 12px 14px;
                border: 2px solid #6366f1;
                clip: auto;
                clip-path: none;
                overflow-y: auto;
                background: rgba(7, 9, 18, 0.96);
                color: #f1f5fb;
                border-radius: 10px;
                z-index: 10000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                white-space: normal;
            }
            .canvas-mirror h2 {
                font-size: 0.85rem;
                font-weight: 700;
                color: #a5b4fc;
                margin: 0 0 8px;
                letter-spacing: 0.04em;
                text-transform: uppercase;
            }
            .canvas-mirror ul { list-style: none; margin: 0; padding: 0; }
            .canvas-mirror li { margin: 0 0 2px; }
            .canvas-mirror button {
                width: 100%;
                text-align: left;
                background: transparent;
                color: inherit;
                border: 1px solid transparent;
                border-radius: 6px;
                padding: 6px 8px;
                font: inherit;
                font-size: 0.88rem;
                cursor: pointer;
            }
            .canvas-mirror button:hover { background: rgba(99, 102, 241, 0.12); }
            .canvas-mirror button:focus-visible {
                outline: 2px solid #a5b4fc;
                outline-offset: 1px;
                background: rgba(99, 102, 241, 0.18);
            }
            .canvas-mirror .visited { color: #86efac; }
            .canvas-mirror .visited::after { content: ' ✓'; }
            .canvas-mirror .sr-status {
                position: absolute;
                width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;
                clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden;
            }
        `;
        if (!document.getElementById('canvas-mirror-style')) {
            const style = document.createElement('style');
            style.id = 'canvas-mirror-style';
            style.textContent = css;
            document.head.appendChild(style);
        }

        this.container = document.createElement('nav');
        this.container.className = 'canvas-mirror';
        this.container.setAttribute('aria-label', i18n.t('mirror_aria_label') || 'Solar System navigation');

        this.heading = document.createElement('h2');
        this.container.appendChild(this.heading);

        this.list = document.createElement('ul');
        this.container.appendChild(this.list);

        this.live = document.createElement('div');
        this.live.className = 'sr-status';
        this.live.setAttribute('role', 'status');
        this.live.setAttribute('aria-live', 'polite');
        this.container.appendChild(this.live);

        // Insert at the start of <body> so it is the first thing screen readers encounter.
        document.body.insertBefore(this.container, document.body.firstChild);
    }

    _visitableNames() {
        // Inner planets, gas giants, the Sun, and the Moon are the canonical set.
        // Use whatever the live SolarSystem actually exposes.
        const all = Object.keys(this.app.solarSystem?.objects || {});
        const preferred = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        const ordered = preferred.filter(n => all.includes(n));
        // Append anything else (moons, dwarfs, probes) in the order the engine created them.
        const extras = all.filter(n => !preferred.includes(n));
        return [...ordered, ...extras];
    }

    _populate() {
        if (!this.list || !this.heading) return;
        this.heading.textContent = i18n.t('mirror_heading') || (i18n.lang === 'en' ? 'Solar System (keyboard)' : 'Sistema Solar (teclado)');
        this.container.setAttribute('aria-label', i18n.t('mirror_aria_label') || (i18n.lang === 'en' ? 'Solar System navigation' : 'Navegação do Sistema Solar'));
        this.list.innerHTML = '';
        const visited = this.app.gameManager?.visited || new Set();

        for (const name of this._visitableNames()) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            const localized = i18n.getPlanetName ? i18n.getPlanetName(name) : name;
            // Set label safely (no innerHTML with user/data content).
            btn.textContent = localized.charAt(0).toUpperCase() + localized.slice(1);
            if (visited.has?.(name)) btn.classList.add('visited');
            btn.dataset.objectName = name;
            btn.addEventListener('click', () => this._select(name, btn.textContent));
            li.appendChild(btn);
            this.list.appendChild(li);
        }
    }

    _select(name, label) {
        const mesh = this.app.solarSystem?.objects?.[name];
        if (!mesh || !this.app.cameraControls) return;
        // Same path as a mouse click on the canvas.
        this.app.cameraControls.flyToObject(mesh, name);
        // Announce to assistive tech.
        const verb = i18n.lang === 'en' ? 'Flying to' : 'A voar para';
        this.live.textContent = `${verb} ${label}`;
    }

    /** Refresh visited badges after a discovery. */
    refresh() {
        this._populate();
    }

    dispose() {
        if (this._unsubLang) i18n.offLangChange?.(this._unsubLang);
        this.container?.remove();
    }
}
