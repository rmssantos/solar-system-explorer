export const MISSION_ADAPTER_LOADERS = Object.freeze({
    docking: () => import('./createDockingGame.js'),
    sweep: () => import('./createSweepGame.js'),
    signal: () => import('./createSignalGame.js'),
    slingshot: () => import('./createSlingshotGame.js')
});
