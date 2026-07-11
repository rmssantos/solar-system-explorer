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

function cylinderBetween(start, end, radius, color, segments = 7) {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, direction.length(), segments),
        material(color)
    );
    mesh.position.copy(from.add(to).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    return mesh;
}

function createRoadster() {
    const group = new THREE.Group();
    const red = '#d84e3d';
    const redDark = '#963b35';
    const paper = '#e8dfc5';
    const glass = '#4e8790';

    const bodyGeometry = new THREE.BufferGeometry();
    bodyGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -.48, -.08, -.21,  -.48, -.08, .21,  -.48, .08, -.2,  -.48, .08, .2,
        -.04, -.09, -.23,  -.04, -.09, .23,  -.04, .08, -.22,  -.04, .08, .22,
         .5, -.06, -.17,   .5, -.06, .17,   .5, .015, -.14,  .5, .015, .14
    ], 3));
    bodyGeometry.setIndex([
        0, 4, 6, 0, 6, 2,  1, 3, 7, 1, 7, 5,
        0, 1, 5, 0, 5, 4,  2, 6, 7, 2, 7, 3,
        4, 5, 9, 4, 9, 8,  6, 10, 11, 6, 11, 7,
        4, 8, 10, 4, 10, 6,  5, 7, 11, 5, 11, 9,
        8, 9, 11, 8, 11, 10,  0, 2, 3, 0, 3, 1
    ]);
    bodyGeometry.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeometry, material(red));
    body.name = 'roadster-body';
    body.castShadow = true;
    group.add(body);
    const underbody = addBox(group, [.82, .045, .34], [-.02, -.085, 0], OUTLINE);
    underbody.name = 'roadster-ink-underbody';

    const hood = addBox(group, [.39, .018, .3], [.285, .045, 0], '#ec6a4f');
    hood.name = 'roadster-hood-paper-layer';
    hood.rotation.z = -.12;
    const rearDeck = addBox(group, [.17, .045, .36], [-.39, .11, 0], redDark);
    rearDeck.name = 'roadster-rear-deck';

    const cockpit = outlinedMesh(new THREE.CylinderGeometry(.17, .17, .035, 8), OUTLINE, 1.06);
    cockpit.name = 'roadster-open-cockpit';
    cockpit.scale.set(1.28, 1, .92);
    cockpit.position.set(-.14, .115, 0);
    group.add(cockpit);

    const windscreen = new THREE.Mesh(
        new THREE.BoxGeometry(.025, .14, .31),
        material(glass, { transparent: true, opacity: .78 })
    );
    windscreen.name = 'roadster-windscreen';
    windscreen.position.set(.055, .145, 0);
    windscreen.scale.y = .78;
    windscreen.rotation.z = -.24;
    group.add(windscreen);

    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'roadster-wheel-group';
    [[-.31, -.105, -.225], [.31, -.09, -.19], [-.31, -.105, .225], [.31, -.09, .19]].forEach((position) => {
        const wheel = outlinedMesh(new THREE.CylinderGeometry(.105, .105, .075, 10), '#25262a', 1.04);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(...position);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, .079, 8), material('#c9a75b'));
        rim.rotation.x = Math.PI / 2;
        wheel.add(rim);
        wheelGroup.add(wheel);
    });
    group.add(wheelGroup);

    const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(.05, .011, 5, 10), material(OUTLINE));
    steeringWheel.name = 'roadster-steering-wheel';
    steeringWheel.position.set(.005, .205, -.075);
    steeringWheel.rotation.y = Math.PI / 2;
    group.add(steeringWheel);

    const starman = new THREE.Group();
    starman.name = 'starman';
    const torso = outlinedMesh(new THREE.BoxGeometry(.15, .16, .115), paper, 1.055);
    torso.position.set(-.145, .215, -.075);
    torso.rotation.z = -.16;
    starman.add(torso);
    const helmet = outlinedMesh(new THREE.IcosahedronGeometry(.087, 1), paper, 1.055);
    helmet.position.set(-.175, .33, -.075);
    starman.add(helmet);
    const visor = new THREE.Mesh(new THREE.IcosahedronGeometry(.066, 1), material('#263b4a'));
    visor.name = 'starman-helmet-visor';
    visor.position.set(-.112, .334, -.075);
    visor.scale.set(.32, .73, .78);
    starman.add(visor);
    starman.add(
        cylinderBetween([-.12, .27, -.125], [-.005, .21, -.12], .025, paper),
        cylinderBetween([-.12, .27, -.025], [-.005, .21, -.03], .025, paper),
        cylinderBetween([-.18, .15, -.115], [-.02, .11, -.12], .03, paper),
        cylinderBetween([-.18, .15, -.035], [-.01, .105, -.02], .03, paper)
    );
    group.add(starman);

    [[.505, .025, -.09], [.505, .025, .09]].forEach((position) => {
        const light = new THREE.Mesh(new THREE.BoxGeometry(.015, .04, .07), material('#f5d977'));
        light.position.set(...position);
        group.add(light);
    });
    const emblemStem = addBox(group, [.085, .012, .014], [.32, .073, 0], paper);
    emblemStem.name = 'roadster-paper-emblem';
    addBox(group, [.018, .012, .072], [.35, .074, 0], paper);
    group.rotation.y = Math.PI / 2 - .22;
    return group;
}

function createSpacecraft(object) {
    const group = new THREE.Group();
    group.name = `spacecraft-${object.key}`;
    const gold = '#d5ad55';
    const blue = '#557ba4';
    const cream = '#d9d2bd';

    if (object.key === 'tesla-roadster') {
        group.add(createRoadster());
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
