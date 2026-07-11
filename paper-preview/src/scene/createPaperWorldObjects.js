import * as THREE from 'three';
import { getWorldObject, WORLD_OBJECTS } from '../world/worldCatalog.js';

const OUTLINE = '#171b26';

function material(color, extra = {}) {
    return new THREE.MeshStandardMaterial({
        color, roughness: 0.92, metalness: 0, flatShading: true, ...extra
    });
}

function outlinedMesh(geometry, color, outlineScale = 1.08) {
    const group = new THREE.Group();
    const outline = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide }));
    outline.scale.setScalar(outlineScale);
    const body = new THREE.Mesh(geometry, material(color));
    body.castShadow = true;
    group.add(outline, body);
    return group;
}

function createMoon(object) {
    const palettes = {
        moon: '#c8c2b4', io: '#d9b45d', europa: '#dfcfaa', ganymede: '#8e806e',
        callisto: '#6d6258', titan: '#d29d55', enceladus: '#dce7e4', triton: '#8eb6bd',
        phobos: '#74685d', deimos: '#978879'
    };
    const moon = outlinedMesh(new THREE.IcosahedronGeometry(object.scale, 1), palettes[object.key] ?? '#a9a39a', 1.07);
    moon.name = `moon-${object.key}`;
    return moon;
}

function addBox(group, size, position, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color));
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
}

function createSpacecraft(object) {
    const group = new THREE.Group();
    group.name = `spacecraft-${object.key}`;
    const gold = '#d5ad55';
    const blue = '#557ba4';
    const cream = '#d9d2bd';

    if (object.key === 'tesla-roadster') {
        addBox(group, [0.72, 0.18, 0.34], [0, 0, 0], '#c94f47');
        addBox(group, [0.34, 0.15, 0.3], [-0.03, 0.15, -0.02], '#78aeb8');
        [[-0.24, -0.12, -0.2], [0.24, -0.12, -0.2], [-0.24, -0.12, 0.2], [0.24, -0.12, 0.2]].forEach((position) => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 8), material(OUTLINE));
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(...position);
            group.add(wheel);
        });
        const starman = outlinedMesh(new THREE.SphereGeometry(0.095, 8, 6), cream, 1.08);
        starman.position.set(0.03, 0.29, 0);
        group.add(starman);
    } else if (object.key === 'iss') {
        addBox(group, [0.7, 0.12, 0.14], [0, 0, 0], cream);
        addBox(group, [1.45, 0.035, 0.36], [0, 0, 0], blue);
        addBox(group, [0.08, 0.42, 0.08], [0, 0, 0], gold);
    } else if (object.key === 'hubble') {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.52, 8), material(cream));
        tube.rotation.x = Math.PI / 2;
        group.add(tube);
        addBox(group, [0.75, 0.03, 0.25], [0, 0, 0], blue);
    } else if (object.key === 'jwst') {
        const mirror = outlinedMesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 6), gold, 1.06);
        mirror.rotation.x = Math.PI / 2;
        group.add(mirror);
        addBox(group, [0.75, 0.025, 0.42], [0, -0.18, 0.08], cream);
    } else {
        const dish = outlinedMesh(new THREE.CylinderGeometry(0.28, 0.08, 0.09, 12), cream, 1.06);
        dish.rotation.x = Math.PI / 2;
        group.add(dish);
        addBox(group, [0.25, 0.18, 0.32], [0, 0, 0.2], gold);
        addBox(group, [0.85, 0.025, 0.18], [0, 0, 0.18], blue);
    }
    group.scale.setScalar(object.scale * (object.key === 'tesla-roadster' ? 5 : 3.4));
    return group;
}

function createSmallBody(object) {
    const geometry = new THREE.IcosahedronGeometry(object.scale, 1);
    const body = outlinedMesh(geometry, object.key === 'ceres' ? '#8d8375' : '#75685c', 1.08);
    body.name = `small-body-${object.key}`;
    body.scale.set(1.18, 0.82, 0.95);
    if (['halley', '67p', 'chelyabinsk'].includes(object.key)) {
        const tail = new THREE.Mesh(
            new THREE.ConeGeometry(object.scale * 0.42, object.scale * 4.5, 6),
            new THREE.MeshBasicMaterial({ color: '#b9d7d9', transparent: true, opacity: 0.28, depthWrite: false })
        );
        tail.position.z = object.scale * 2.2;
        tail.rotation.x = Math.PI / 2;
        body.add(tail);
    }
    return body;
}

export function createPaperWorldObjects() {
    const root = new THREE.Group();
    root.name = 'paper-world-objects';
    const entries = WORLD_OBJECTS.filter((object) => !['star', 'planet'].includes(object.type));
    const meshes = entries.map((object) => {
        const mesh = object.type === 'moon'
            ? createMoon(object)
            : object.type === 'spacecraft'
                ? createSpacecraft(object)
                : createSmallBody(object);
        mesh.userData.worldKey = object.key;
        mesh.userData.orbitPhase = object.orbitPhase ?? object.key.length * 0.73;
        root.add(mesh);
        return { object, mesh };
    });
    const livePositions = new Map();
    const liveOffsets = new Map();

    function update(elapsed, primarySnapshot = {}) {
        for (const { object, mesh } of meshes) {
            const livePosition = livePositions.get(object.key);
            const liveOffset = liveOffsets.get(object.key);
            const parentPosition = object.parentKey
                ? (primarySnapshot[object.parentKey]?.position ?? getWorldObject(object.parentKey).anchor)
                : null;
            if (livePosition) mesh.position.set(livePosition.x, livePosition.y, livePosition.z);
            else if (liveOffset && parentPosition) {
                mesh.position.set(
                    parentPosition.x + liveOffset.x,
                    parentPosition.y + liveOffset.y,
                    parentPosition.z + liveOffset.z
                );
            }
            else if (object.parentKey) {
                const angle = (object.orbitPhase ?? 0) + elapsed * (object.orbitSpeed ?? 0.08);
                const tilt = Math.sin(angle * 0.63) * 0.28;
                mesh.position.set(
                    parentPosition.x + Math.cos(angle) * object.orbitRadius,
                    parentPosition.y + Math.sin(angle) * object.orbitRadius * tilt,
                    parentPosition.z + Math.sin(angle) * object.orbitRadius
                );
            } else if (object.anchor) mesh.position.set(...object.anchor);
            mesh.rotation.y += 0.002 + object.scale * 0.001;
            mesh.rotation.z += object.type === 'small-body' ? 0.0015 : 0;
        }
    }

    update(0);
    function setLivePosition(key, position) {
        if (!meshes.some((entry) => entry.object.key === key)) return false;
        livePositions.set(key, { x: position.x, y: position.y, z: position.z });
        return true;
    }
    function setLiveOffset(key, offset) {
        if (!meshes.some((entry) => entry.object.key === key)) return false;
        livePositions.delete(key);
        liveOffsets.set(key, { x: offset.x, y: offset.y, z: offset.z });
        return true;
    }
    function findNearby(position) {
        let closest = null;
        let closestDistance = Infinity;
        for (const { object, mesh } of meshes) {
            const distance = Math.hypot(
                position.x - mesh.position.x,
                position.y - mesh.position.y,
                position.z - mesh.position.z
            );
            const interactionRadius = Math.max(
                object.type === 'moon' ? 2.2 : 1.65,
                object.scale * 3.5
            );
            if (distance <= interactionRadius && distance < closestDistance) {
                closest = object.key;
                closestDistance = distance;
            }
        }
        return closest;
    }
    function getPosition(key) {
        const entry = meshes.find((candidate) => candidate.object.key === key);
        return entry ? { x: entry.mesh.position.x, y: entry.mesh.position.y, z: entry.mesh.position.z } : null;
    }
    return { root, update, meshes, setLivePosition, setLiveOffset, findNearby, getPosition };
}
