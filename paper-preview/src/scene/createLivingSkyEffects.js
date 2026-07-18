import * as THREE from 'three';

const TARGET_BY_EVENT = Object.freeze({
    'earth-aurora': 'earth',
    'io-shadow-transit': 'jupiter',
    'mars-dust-front': 'mars',
    'halley-2061': 'halley'
});

function basicMaterial(color, options = {}) {
    return new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, ...options });
}

function makeAurora() {
    const group = new THREE.Group();
    const north = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.075, 5, 28), basicMaterial('#54be9c', { opacity: 0.78 }));
    const south = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.06, 5, 28), basicMaterial('#78d7d2', { opacity: 0.62 }));
    north.rotation.x = Math.PI / 2; north.position.y = 0.86;
    south.rotation.x = Math.PI / 2; south.position.y = -0.86;
    const curtain = new THREE.Mesh(
        new THREE.CylinderGeometry(1.08, 1.22, 0.72, 18, 1, true),
        basicMaterial('#7568a6', { opacity: 0.24, side: THREE.DoubleSide })
    );
    curtain.name = 'living-sky-aurora-curtain'; curtain.position.y = 0.66;
    group.add(north, south, curtain);
    group.scale.setScalar(0.52);
    return group;
}

function makeIoShadow() {
    const group = new THREE.Group();
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.24, 14), basicMaterial('#101936', { opacity: 0.88, side: THREE.DoubleSide }));
    shadow.name = 'living-sky-io-shadow'; shadow.position.set(-0.52, 0.16, 1.1);
    const rim = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.29, 14), basicMaterial('#7568a6', { opacity: 0.48, side: THREE.DoubleSide }));
    rim.position.copy(shadow.position);
    group.add(shadow, rim);
    return group;
}

function makeDustFront() {
    const group = new THREE.Group();
    const band = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.18, 5, 30, Math.PI * 1.25),
        basicMaterial('#e26d58', { opacity: 0.44, side: THREE.DoubleSide })
    );
    band.name = 'living-sky-dust-band'; band.rotation.set(1.1, 0.1, -0.5);
    const coolEdge = new THREE.Mesh(
        new THREE.TorusGeometry(1.17, 0.045, 4, 30, Math.PI * 1.15),
        basicMaterial('#7568a6', { opacity: 0.55 })
    );
    coolEdge.rotation.copy(band.rotation); coolEdge.rotation.z -= 0.08;
    group.add(band, coolEdge);
    group.scale.setScalar(0.55);
    return group;
}

function makeHalleyTails() {
    const group = new THREE.Group();
    const dust = new THREE.Mesh(new THREE.ConeGeometry(0.42, 4.3, 7, 1, true), basicMaterial('#f2f0e8', { opacity: 0.4, side: THREE.DoubleSide }));
    dust.name = 'living-sky-halley-dust-tail'; dust.rotation.z = -Math.PI / 2; dust.position.x = 2.05;
    const ion = new THREE.Mesh(new THREE.ConeGeometry(0.19, 5.1, 6, 1, true), basicMaterial('#78d7d2', { opacity: 0.56, side: THREE.DoubleSide }));
    ion.name = 'living-sky-halley-ion-tail'; ion.rotation.z = -Math.PI / 2; ion.position.set(2.45, 0.34, -0.16);
    group.add(dust, ion);
    group.scale.setScalar(0.72);
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

    function update(elapsed, positions = {}) {
        for (const [eventId, targetKey] of Object.entries(TARGET_BY_EVENT)) {
            const effect = root.getObjectByName(`living-sky-${eventId}`);
            const position = positions[targetKey];
            if (effect && position) effect.position.copy(position);
        }
        if (reducedMotion) return;
        const aurora = root.getObjectByName('living-sky-earth-aurora');
        const shadow = root.getObjectByName('living-sky-io-shadow-transit');
        const dust = root.getObjectByName('living-sky-mars-dust-front');
        const halley = root.getObjectByName('living-sky-halley-2061');
        if (aurora) aurora.rotation.y = elapsed * 0.14;
        if (shadow) shadow.rotation.z = Math.sin(elapsed * 0.7) * 0.32;
        if (dust) dust.rotation.y = elapsed * 0.11;
        if (halley) halley.rotation.z = Math.sin(elapsed * 0.24) * 0.09;
    }

    function getTelemetry(eventId, camera, observerPosition) {
        const effect = root.getObjectByName(`living-sky-${eventId}`);
        if (!effect || !camera || !observerPosition) return { visible: false, screenDistance: 1, worldDistance: Infinity };
        const projected = effect.position.clone().project(camera);
        const visible = projected.z >= -1 && projected.z <= 1
            && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1;
        return Object.freeze({
            visible,
            screenDistance: Number(Math.hypot(projected.x, projected.y).toFixed(3)),
            worldDistance: Number(effect.position.distanceTo(observerPosition).toFixed(3))
        });
    }

    function destroy() {
        root.traverse((object) => {
            object.geometry?.dispose?.();
            object.material?.dispose?.();
        });
        root.clear();
        anchors.clear();
        active.clear();
    }

    return { root, setPresentation, update, getTelemetry, destroy };
}
