import * as THREE from 'three';
import { positionAtDate } from '../world/orbitalSystem.js';

const EPOCH_MS = Date.parse('2000-01-01T12:00:00Z');
const DAY_MS = 86_400_000;
const ORBIT_COLORS = Object.freeze({
    mercury: '#8f887c', venus: '#c99b5d', earth: '#5d91a5', mars: '#b76349',
    jupiter: '#c49b72', saturn: '#d1b17b', uranus: '#82bdbc', neptune: '#527cb3'
});

export function createOrbitPathSamples(worlds, segments = 128) {
    return Object.freeze(Object.fromEntries(worlds
        .filter((world) => world.type === 'planet')
        .map((world) => {
            const points = Array.from({ length: segments + 1 }, (_, index) => {
                const cycle = index === segments ? 0 : index / segments;
                const date = new Date(EPOCH_MS + cycle * world.orbit.periodDays * DAY_MS);
                return positionAtDate(world.orbit, date);
            });
            return [world.key, Object.freeze(points)];
        })));
}

export function createOrbitPaths(worlds, { segments = 160 } = {}) {
    const group = new THREE.Group();
    group.name = 'heliocentric-orbit-paths';
    const samples = createOrbitPathSamples(worlds, segments);
    Object.entries(samples).forEach(([key, points]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(
            points.map((point) => new THREE.Vector3(point.x, point.y, point.z))
        );
        const material = new THREE.LineDashedMaterial({
            color: ORBIT_COLORS[key],
            dashSize: key === 'mercury' ? 0.22 : 0.5,
            gapSize: key === 'mercury' ? 0.32 : 0.75,
            transparent: true,
            opacity: key === 'earth' ? 0.28 : 0.16,
            depthWrite: false
        });
        const line = new THREE.Line(geometry, material);
        line.name = `orbit-${key}`;
        line.computeLineDistances();
        group.add(line);
    });
    return group;
}
