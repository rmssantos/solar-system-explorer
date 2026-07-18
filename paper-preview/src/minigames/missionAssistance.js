const STORAGE_KEY = 'paperSolarExplorer:mission-assistance:v1';
const KEYS = Object.freeze(['guide', 'calmPace', 'largeControls']);
export function createMissionAssistance(value = {}) { return Object.freeze(Object.fromEntries(KEYS.map((key) => [key, Boolean(value?.[key])]))); }
export function toggleMissionAssistance(state, key) { if (!KEYS.includes(key)) return state; const base = createMissionAssistance(state); return createMissionAssistance({ ...base, [key]: !base[key] }); }
export function loadMissionAssistance(storage = globalThis.localStorage) { try { return createMissionAssistance(JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}')); } catch { return createMissionAssistance(); } }
export function saveMissionAssistance(state, storage = globalThis.localStorage) { try { storage?.setItem(STORAGE_KEY, JSON.stringify(createMissionAssistance(state))); return true; } catch { return false; } }
