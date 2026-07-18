export const MISSION_ADAPTER_LOADERS = Object.freeze({
    docking: () => import('./createDockingGame.js'),
    sweep: () => import('./createSweepGame.js'),
    signal: () => import('./createSignalGame.js'),
    slingshot: () => import('./createSlingshotGame.js'),
    seismic: () => import('./createSeismicGame.js'),
    'ice-radar': () => import('./createIceRadarGame.js'),
    plume: () => import('./createPlumeGame.js'),
    dragonfly: () => import('./createDragonflyGame.js')
});
