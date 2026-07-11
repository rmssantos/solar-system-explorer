export function chooseNearbyObject(planetKey, orbitingObjectKey) {
    return orbitingObjectKey ?? planetKey ?? null;
}
