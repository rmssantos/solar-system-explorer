import { MISSION_ADAPTER_LOADERS } from './missionAdapterLoaders.js';

export { MISSION_ADAPTER_LOADERS } from './missionAdapterLoaders.js';

export async function createOrbitalMissionGame(options, loaders = MISSION_ADAPTER_LOADERS) {
    const gameplay = Object.prototype.hasOwnProperty.call(loaders, options.profile?.gameplay)
        ? options.profile.gameplay
        : 'docking';
    const module = await loaders[gameplay]();
    if (gameplay === 'sweep') return module.createSweepGame(options);
    if (gameplay === 'signal') return module.createSignalGame(options);
    if (gameplay === 'slingshot') return module.createSlingshotGame(options);
    return module.createDockingGame(options);
}
