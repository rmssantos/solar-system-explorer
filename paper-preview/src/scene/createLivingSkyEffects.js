import * as THREE from 'three';
import { getWorldObject } from '../world/worldCatalog.js';
import { PLANET_STYLES } from './planetStyle.js';

const TARGET_BY_EVENT = Object.freeze({
    'earth-aurora': 'earth',
    'io-shadow-transit': 'jupiter',
    'mars-dust-front': 'mars',
    'halley-2061': 'halley'
});

// These are the rendered radii after each low-poly planet's world scale is
// applied. Effects live beside the planets in scene space, so their geometry
// must already account for those scales rather than inheriting them.
const DISPLAY_RADIUS = Object.freeze(Object.fromEntries(['earth', 'jupiter', 'mars'].map((key) => [
    key,
    PLANET_STYLES[key].radius * getWorldObject(key).scale * 1.055
])));

function signalMaterial(color, options = {}) {
    return new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        ...options
    });
}

function addSignalMesh(group, geometry, material, name) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.renderOrder = 40;
    group.add(mesh);
    return mesh;
}

function makePaperParticles(name, points, colors) {
    const group = new THREE.Group();
    group.name = name;
    points.forEach(([x, y, size, rotation], index) => {
        const particle = addSignalMesh(
            group,
            new THREE.CircleGeometry(size, index % 3 === 0 ? 4 : 3),
            signalMaterial(colors[index % colors.length], { opacity: 0.86 }),
            `${name}-${index + 1}`
        );
        particle.position.set(x, y, 0.16 + (index % 3) * 0.012);
        particle.rotation.z = rotation;
        particle.userData.baseX = x;
        particle.userData.baseY = y;
    });
    return group;
}

function makeAurora() {
    const group = new THREE.Group();
    const ribbons = new THREE.Group();
    ribbons.name = 'living-sky-aurora-ribbons';
    const radius = DISPLAY_RADIUS.earth * 1.08;
    const north = addSignalMesh(
        ribbons,
        new THREE.TorusGeometry(radius, 0.17, 6, 54, Math.PI * 1.12),
        signalMaterial('#54be9c', { opacity: 0.88 }),
        'living-sky-aurora-north'
    );
    north.rotation.z = -0.22;
    north.position.z = 0.12;
    const violet = addSignalMesh(
        ribbons,
        new THREE.TorusGeometry(radius * 0.93, 0.095, 5, 48, Math.PI * 1.02),
        signalMaterial('#8c7bc0', { opacity: 0.76 }),
        'living-sky-aurora-violet'
    );
    violet.rotation.z = 0.14;
    violet.position.z = 0.15;
    const south = addSignalMesh(
        ribbons,
        new THREE.TorusGeometry(radius * 0.97, 0.12, 5, 50, Math.PI * 0.92),
        signalMaterial('#78d7d2', { opacity: 0.72 }),
        'living-sky-aurora-south'
    );
    south.rotation.z = Math.PI + 0.34;
    south.position.z = 0.1;

    const field = addSignalMesh(
        group,
        new THREE.RingGeometry(radius * 0.8, radius * 0.83, 44),
        signalMaterial('#78d7d2', { opacity: 0.27 }),
        'living-sky-aurora-field'
    );
    field.scale.y = 0.66;
    field.position.z = 0.08;
    const particles = makePaperParticles('living-sky-aurora-particles', [
        [-2.05, 1.4, 0.13, 0.2], [-1.58, 1.92, 0.1, 0.8], [-0.94, 2.25, 0.14, 1.1],
        [-0.18, 2.42, 0.09, 0.4], [0.62, 2.3, 0.13, 0.9], [1.32, 2.02, 0.1, 0.1],
        [1.94, 1.53, 0.14, 0.7], [-1.65, -1.85, 0.09, 0.5], [1.54, -1.92, 0.1, 1.2]
    ], ['#78d7d2', '#54be9c', '#b7a7e2']);
    group.add(field, ribbons, particles);
    return group;
}

function makeIoShadow() {
    const group = new THREE.Group();
    const surface = DISPLAY_RADIUS.jupiter + 0.12;
    const path = addSignalMesh(
        group,
        new THREE.PlaneGeometry(DISPLAY_RADIUS.jupiter * 1.62, 0.07),
        signalMaterial('#f2f0e8', { opacity: 0.35 }),
        'living-sky-io-transit-path'
    );
    path.position.set(0, 0.3, surface - 0.04);

    const spot = new THREE.Group();
    spot.name = 'living-sky-io-shadow';
    spot.position.set(-1.15, 0.3, surface);
    const shadow = addSignalMesh(
        spot,
        new THREE.CircleGeometry(0.5, 18),
        signalMaterial('#080c1b', { opacity: 0.96 }),
        'living-sky-io-shadow-disc'
    );
    const rim = addSignalMesh(
        spot,
        new THREE.RingGeometry(0.51, 0.63, 18),
        signalMaterial('#8c7bc0', { opacity: 0.9 }),
        'living-sky-io-shadow-rim'
    );
    const halo = addSignalMesh(
        spot,
        new THREE.RingGeometry(0.72, 0.76, 20),
        signalMaterial('#78d7d2', { opacity: 0.52 }),
        'living-sky-io-shadow-halo'
    );
    shadow.position.z = 0.03;
    rim.position.z = 0.02;
    halo.position.z = 0.01;
    group.add(spot);
    return group;
}

function makeDustFront() {
    const group = new THREE.Group();
    const bands = new THREE.Group();
    bands.name = 'living-sky-dust-bands';
    const radius = DISPLAY_RADIUS.mars * 1.18;
    const band = addSignalMesh(
        bands,
        new THREE.TorusGeometry(radius, 0.24, 6, 48, Math.PI * 1.42),
        signalMaterial('#e26d58', { opacity: 0.82 }),
        'living-sky-dust-band'
    );
    band.rotation.z = -0.74;
    band.position.z = 0.14;
    const paperEdge = addSignalMesh(
        bands,
        new THREE.TorusGeometry(radius * 1.04, 0.075, 5, 46, Math.PI * 1.3),
        signalMaterial('#9d6fb0', { opacity: 0.82 }),
        'living-sky-dust-cool-edge'
    );
    paperEdge.rotation.z = -0.61;
    paperEdge.position.z = 0.16;
    const innerVeil = addSignalMesh(
        bands,
        new THREE.CircleGeometry(radius * 0.9, 24, 0.32, Math.PI * 1.15),
        signalMaterial('#c96554', { opacity: 0.26 }),
        'living-sky-dust-veil'
    );
    innerVeil.rotation.z = -0.28;
    innerVeil.position.z = 0.08;
    const particles = makePaperParticles('living-sky-dust-particles', [
        [-1.38, 0.83, 0.1, 0.2], [-1.02, 0.52, 0.13, 0.7], [-0.58, 0.34, 0.08, 1.1],
        [-0.18, 0.08, 0.12, 0.4], [0.28, -0.1, 0.09, 0.9], [0.72, -0.33, 0.14, 0.2],
        [1.12, -0.58, 0.09, 0.8], [1.42, -0.84, 0.12, 1.2], [-0.7, 1.02, 0.07, 0.4],
        [0.88, -0.92, 0.08, 0.7], [0.12, 0.44, 0.07, 0.1], [1.3, -0.28, 0.06, 1.3]
    ], ['#f08a70', '#d86f5d', '#b77ab7']);
    group.add(innerVeil, bands, particles);
    return group;
}

function makeTailGeometry(length, width) {
    const shape = new THREE.Shape();
    shape.moveTo(0.18, 0.06);
    shape.bezierCurveTo(length * 0.3, width * 0.15, length * 0.68, width * 0.9, length, width);
    shape.lineTo(length * 0.92, width * 0.26);
    shape.bezierCurveTo(length * 0.58, width * 0.18, length * 0.24, -width * 0.2, 0.18, -0.06);
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 12);
}

function makeHalleyTails() {
    const group = new THREE.Group();
    const dust = addSignalMesh(
        group,
        makeTailGeometry(6.8, 1.12),
        signalMaterial('#f2f0e8', { opacity: 0.72 }),
        'living-sky-halley-dust-tail'
    );
    dust.rotation.z = 0.12;
    dust.position.z = 0.08;
    const ion = addSignalMesh(
        group,
        makeTailGeometry(7.45, 0.48),
        signalMaterial('#78d7d2', { opacity: 0.84 }),
        'living-sky-halley-ion-tail'
    );
    ion.rotation.z = -0.14;
    ion.position.z = 0.14;
    const halo = addSignalMesh(
        group,
        new THREE.RingGeometry(0.48, 0.72, 18),
        signalMaterial('#b7a7e2', { opacity: 0.7 }),
        'living-sky-halley-halo'
    );
    halo.position.z = 0.18;
    const spark = addSignalMesh(
        group,
        new THREE.CircleGeometry(0.18, 6),
        signalMaterial('#f2f0e8', { opacity: 0.95 }),
        'living-sky-halley-spark'
    );
    spark.position.z = 0.2;
    return group;
}

const BUILDERS = Object.freeze({
    'earth-aurora': makeAurora,
    'io-shadow-transit': makeIoShadow,
    'mars-dust-front': makeDustFront,
    'halley-2061': makeHalleyTails
});

export function createLivingSkyEffects({ reducedMotion = false } = {}) {
    const root = new THREE.Group();
    root.name = 'living-sky-effects';
    const active = new Set();
    const anchors = new Map();
    for (const [eventId, build] of Object.entries(BUILDERS)) {
        const effect = build();
        effect.name = `living-sky-${eventId}`;
        effect.visible = false;
        root.add(effect);
        anchors.set(eventId, effect.position);
    }

    function setPresentation(activeEventIds = []) {
        active.clear();
        activeEventIds.forEach((id) => {
            if (BUILDERS[id]) active.add(id);
        });
        for (const eventId of Object.keys(BUILDERS)) {
            const effect = root.getObjectByName(`living-sky-${eventId}`);
            if (effect) effect.visible = active.has(eventId);
        }
    }

    function update(elapsed, positions = {}, camera = null) {
        for (const [eventId, targetKey] of Object.entries(TARGET_BY_EVENT)) {
            const effect = root.getObjectByName(`living-sky-${eventId}`);
            const position = positions[targetKey];
            if (effect && position) effect.position.copy(position);
            if (effect && camera?.position) effect.lookAt(camera.position);
        }
        if (reducedMotion) return;

        const auroraRibbons = root.getObjectByName('living-sky-aurora-ribbons');
        const auroraParticles = root.getObjectByName('living-sky-aurora-particles');
        const ioShadow = root.getObjectByName('living-sky-io-shadow');
        const dustBands = root.getObjectByName('living-sky-dust-bands');
        const dustParticles = root.getObjectByName('living-sky-dust-particles');
        const dustTail = root.getObjectByName('living-sky-halley-dust-tail');
        const ionTail = root.getObjectByName('living-sky-halley-ion-tail');
        const halleyHalo = root.getObjectByName('living-sky-halley-halo');

        if (auroraRibbons) {
            const pulse = 1 + Math.sin(elapsed * 2.1) * 0.045;
            auroraRibbons.scale.set(pulse, 1 + Math.cos(elapsed * 1.7) * 0.035, 1);
        }
        auroraParticles?.children.forEach((particle, index) => {
            particle.position.y = particle.userData.baseY + Math.sin(elapsed * 1.8 + index * 0.8) * 0.12;
            particle.rotation.z += 0.004 + index * 0.0003;
        });
        if (ioShadow) {
            ioShadow.position.x = Math.sin(elapsed * 0.52) * 1.35;
            ioShadow.position.y = 0.3 + Math.sin(elapsed * 0.34) * 0.22;
        }
        if (dustBands) dustBands.rotation.z = Math.sin(elapsed * 0.45) * 0.11;
        dustParticles?.children.forEach((particle, index) => {
            particle.position.x = particle.userData.baseX + Math.sin(elapsed * 0.8 + index) * 0.1;
            particle.position.y = particle.userData.baseY + Math.cos(elapsed * 0.65 + index * 0.7) * 0.07;
        });
        if (dustTail) dustTail.scale.x = 0.97 + Math.sin(elapsed * 0.55) * 0.035;
        if (ionTail) ionTail.scale.x = 0.98 + Math.cos(elapsed * 0.72) * 0.025;
        if (halleyHalo) halleyHalo.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.08);
    }

    function getTelemetry(eventId, camera, observerPosition) {
        const effect = root.getObjectByName(`living-sky-${eventId}`);
        if (!effect || !camera || !observerPosition) {
            return { visible: false, screenX: 0, screenY: 0, screenDistance: 1, worldDistance: Infinity };
        }
        camera.updateMatrixWorld();
        const projected = effect.position.clone().project(camera);
        const visible = projected.z >= -1 && projected.z <= 1
            && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1;
        return Object.freeze({
            visible,
            screenX: Number(projected.x.toFixed(3)),
            screenY: Number(projected.y.toFixed(3)),
            screenDistance: Number(Math.hypot(projected.x, projected.y).toFixed(3)),
            worldDistance: Number(effect.position.distanceTo(observerPosition).toFixed(3))
        });
    }

    function destroy() {
        root.traverse((object) => {
            object.geometry?.dispose?.();
            if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
            else object.material?.dispose?.();
        });
        root.clear();
        anchors.clear();
        active.clear();
    }

    return { root, setPresentation, update, getTelemetry, destroy };
}
