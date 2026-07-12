import { createAudioMix } from './audioState.js';

const PREFERENCE_KEY = 'paper-solar-audio-enabled-v1';
const AUDIO_ROOT = '/audio/';
const CUES = Object.freeze({
    'paper-fold': { file: 'paper-fold.mp3', volume: 0.34 },
    'autopilot-start': { file: 'autopilot-start.mp3', volume: 0.38 },
    'autopilot-arrive': { file: 'autopilot-arrive.mp3', volume: 0.42 },
    'quiz-correct': { file: 'quiz-correct.mp3', volume: 0.4 },
    'quiz-wrong': { file: 'quiz-wrong.mp3', volume: 0.3 },
    'reward-chime': { file: 'reward-chime.mp3', volume: 0.42 },
    'lumi-signal': { file: 'lumi-signal.mp3', volume: 0.34 }
});

function safeReadPreference(storage) {
    try { return storage?.getItem(PREFERENCE_KEY) !== 'off'; } catch { return true; }
}

function safeWritePreference(storage, enabled) {
    try { storage?.setItem(PREFERENCE_KEY, enabled ? 'on' : 'off'); } catch { /* optional preference */ }
}

function safePlay(audio) {
    try {
        return Promise.resolve(audio.play()).catch(() => false);
    } catch {
        return Promise.resolve(false);
    }
}

export function createAudioDirector({
    createAudio = (src) => new globalThis.Audio(src),
    storage = globalThis.localStorage,
    documentRef = globalThis.document,
    onStateChange = (_state) => {}
} = {}) {
    const ambience = createAudio(`${AUDIO_ROOT}cosmic-ambience.mp3`);
    const engine = createAudio(`${AUDIO_ROOT}paper-engine.mp3`);
    const loops = [ambience, engine];
    loops.forEach((audio) => {
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
    });

    let enabled = safeReadPreference(storage);
    let unlocked = false;
    let visible = !documentRef?.hidden;
    let destroyed = false;
    let lastCue = null;
    const activeOneShots = new Set();

    function getState() {
        return {
            enabled,
            unlocked,
            visible,
            ambienceVolume: ambience.volume,
            engineVolume: engine.volume,
            enginePlaybackRate: engine.playbackRate,
            lastCue,
            activeCueCount: activeOneShots.size
        };
    }

    function notify() { onStateChange(getState()); }

    async function startLoops() {
        if (destroyed || !enabled || !unlocked || !visible) return false;
        await Promise.allSettled(loops.map(safePlay));
        return true;
    }

    async function unlock() {
        if (destroyed) return false;
        unlocked = true;
        notify();
        return startLoops();
    }

    async function toggle() {
        if (destroyed) return getState();
        enabled = !enabled;
        safeWritePreference(storage, enabled);
        if (!enabled) loops.forEach((audio) => audio.pause());
        notify();
        if (enabled) await unlock();
        return getState();
    }

    function update(snapshot = {}, deltaSeconds = 1 / 60) {
        if (destroyed) return getState();
        const target = createAudioMix({ ...snapshot, enabled, unlocked, visible });
        const alpha = Math.min(1, Math.max(0, deltaSeconds) * 5);
        ambience.volume += (target.ambienceVolume - ambience.volume) * alpha;
        engine.volume += (target.engineVolume - engine.volume) * alpha;
        engine.playbackRate += (target.enginePlaybackRate - engine.playbackRate) * alpha;
        return getState();
    }

    function play(cueName) {
        const cue = CUES[cueName];
        if (!cue || destroyed || !enabled || !unlocked || !visible) return false;
        const audio = createAudio(`${AUDIO_ROOT}${cue.file}`);
        audio.preload = 'auto';
        audio.volume = cue.volume;
        const clean = () => {
            activeOneShots.delete(audio);
            audio.removeEventListener?.('ended', clean);
        };
        audio.addEventListener?.('ended', clean, { once: true });
        activeOneShots.add(audio);
        lastCue = cueName;
        safePlay(audio).then((started) => { if (started === false) clean(); });
        return true;
    }

    function handleVisibilityChange() {
        visible = !documentRef.hidden;
        if (!visible) {
            loops.forEach((audio) => audio.pause());
            activeOneShots.forEach((audio) => audio.pause());
        } else {
            startLoops();
        }
        notify();
    }

    documentRef?.addEventListener?.('visibilitychange', handleVisibilityChange);

    function destroy() {
        destroyed = true;
        loops.forEach((audio) => audio.pause());
        activeOneShots.forEach((audio) => audio.pause());
        activeOneShots.clear();
        documentRef?.removeEventListener?.('visibilitychange', handleVisibilityChange);
    }

    return { unlock, toggle, update, play, getState, destroy };
}
