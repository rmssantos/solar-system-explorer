const MAX_MIX_SPEED = 7;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeFlightSpeed(speed) {
    return clamp((Number(speed) || 0) / MAX_MIX_SPEED, 0, 1);
}

export function createAudioMix({
    enabled = true,
    unlocked = false,
    visible = true,
    speed = 0,
    boost = false,
    autopilot = false,
    dialogOpen = false
} = {}) {
    const speedRatio = normalizeFlightSpeed(speed);
    const enginePlaybackRate = clamp(0.78 + (speedRatio * 0.48) + (boost ? 0.12 : 0), 0.72, 1.38);
    if (!enabled || !unlocked || !visible) {
        return { ambienceVolume: 0, engineVolume: 0, enginePlaybackRate, speedRatio };
    }

    const dialogDuck = dialogOpen ? 0.42 : 1;
    const ambienceVolume = (0.2 + (autopilot ? 0.035 : 0)) * dialogDuck;
    const engineBase = 0.015 + (speedRatio * 0.245) + (boost ? 0.1 : 0);
    const engineVolume = clamp(engineBase * (dialogOpen ? 0.3 : 1), 0, 0.38);
    return { ambienceVolume, engineVolume, enginePlaybackRate, speedRatio };
}
