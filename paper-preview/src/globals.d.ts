export {};

declare global {
    interface Window {
        render_game_to_text: () => string;
        advanceTime: (milliseconds: number) => void;
        __paperPreview: Record<string, unknown>;
    }
}

