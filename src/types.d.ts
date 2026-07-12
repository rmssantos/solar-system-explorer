// Ambient types for browser globals this app sets (supports checkJs).

interface Window {
    /** Set by main.js / biblioteca.js after a successful boot; gates the
     *  pre-boot fatal-error overlay in public/init.js. */
    __appBooted?: boolean;
    /** Dev-only handle exposed by initApp() for debugging. */
    app?: unknown;
    /** Dev-only mission reset helper exposed by MissionSystem. */
    resetMissions?: () => void;
    /** Bilingual fatal-error overlay defined once in public/init.js. */
    __showFatalError?: (message?: string) => void;
    /** Load-once guard for src/cosmic-icons.js (theme icon layer). */
    __cosmicIconsLoaded?: boolean;
    /** Inline SVG icon factory exposed by src/cosmic-icons.js. */
    cosmicIcon?: (name: string, size?: number, strokeWidth?: number) => string;
}

interface ImportMeta {
    env?: {
        DEV?: boolean;
        VITE_APP_VERSION?: string;
        VITE_GIT_SHA?: string;
    };
}
