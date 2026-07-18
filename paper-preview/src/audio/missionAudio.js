export const MISSION_EVENT_CUES = Object.freeze({
    'transmitter-collected': 'cargo-capture',
    'debris-hit': 'shield-impact',
    'unsafe-contact': 'soft-impact',
    docked: 'docking-clamp',
    'signal-complete': 'signal-lock',
    'slingshot-boost': 'slingshot-boost',
    'slingshot-complete': 'mission-celebration'
    , 'seismic-solved': 'signal-lock'
    , 'ice-map-complete': 'signal-lock'
    , 'radar-overheat': 'soft-impact'
    , 'plume-sampled': 'cargo-capture'
    , 'large-grain-hit': 'soft-impact'
    , 'dragonfly-landed': 'mission-celebration'
    , 'rough-landing': 'soft-impact'
});

export function getMissionEventCue(event) {
    return MISSION_EVENT_CUES[event] ?? null;
}
