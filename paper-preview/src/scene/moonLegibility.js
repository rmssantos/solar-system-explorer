function normalized(vector, fallback = { x: 1, y: 0, z: 0 }) {
    const length = Math.hypot(vector.x, vector.y, vector.z);
    return length > 0.000001
        ? { x: vector.x / length, y: vector.y / length, z: vector.z / length }
        : fallback;
}

export function separateMoonSilhouette({ moon, parent, camera, minimumSeparation }) {
    const view = normalized({
        x: camera.x - parent.x,
        y: camera.y - parent.y,
        z: camera.z - parent.z
    });
    const offset = {
        x: moon.x - parent.x,
        y: moon.y - parent.y,
        z: moon.z - parent.z
    };
    const orbitRadius = Math.hypot(offset.x, offset.y, offset.z);
    if (orbitRadius < 0.0001) return { ...moon };
    const depth = (offset.x * view.x) + (offset.y * view.y) + (offset.z * view.z);
    const screen = {
        x: offset.x - view.x * depth,
        y: offset.y - view.y * depth,
        z: offset.z - view.z * depth
    };
    const screenSeparation = Math.hypot(screen.x, screen.y, screen.z);
    const desiredSeparation = Math.min(Math.max(0, minimumSeparation), orbitRadius * 0.98);
    if (screenSeparation >= desiredSeparation) return { ...moon };

    let screenDirection = normalized(screen, null);
    if (!screenDirection) {
        screenDirection = normalized({ x: view.z, y: 0, z: -view.x }, { x: 1, y: 0, z: 0 });
    }
    const adjustedDepth = Math.sqrt(Math.max(0, orbitRadius ** 2 - desiredSeparation ** 2))
        * (depth < 0 ? -1 : 1);
    return {
        x: parent.x + screenDirection.x * desiredSeparation + view.x * adjustedDepth,
        y: parent.y + screenDirection.y * desiredSeparation + view.y * adjustedDepth,
        z: parent.z + screenDirection.z * desiredSeparation + view.z * adjustedDepth
    };
}
