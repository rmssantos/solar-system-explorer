const DEFAULT_LOADERS = Object.freeze({
    docking: () => import('./createDockingGame.js'),
    sweep: () => import('./createSweepGame.js'),
    signal: () => import('./createSignalGame.js'),
    slingshot: () => import('./createSlingshotGame.js')
});

export async function createOrbitalMissionGame(options, loaders = DEFAULT_LOADERS) {
    const gameplay = Object.prototype.hasOwnProperty.call(loaders, options.profile?.gameplay)
        ? options.profile.gameplay
        : 'docking';
    const module = await loaders[gameplay]();
    if (gameplay === 'sweep') return module.createSweepGame(options);
    if (gameplay === 'signal') return module.createSignalGame(options);
    if (gameplay === 'slingshot') return module.createSlingshotGame(options);
    return module.createDockingGame(options);
}
