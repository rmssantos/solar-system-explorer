import * as THREE from 'three';

export const PAPER_SHIP_STYLE = Object.freeze({
    palette: Object.freeze({
        ivory: '#f2e7c9',
        coral: '#cf6652',
        cardboard: '#8f654b',
        cockpit: '#4f8298'
    }),
    outline: '#171829',
    exhaust: '#e3a63b'
});

function paperMaterial(color, options = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.92,
        metalness: 0,
        flatShading: true,
        ...options
    });
}

function extrudedShape(points, depth = 0.08) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => {
        if (index === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    });
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        curveSegments: 1
    });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
}

function createWing(name, mirrored = false) {
    const geometry = extrudedShape([
        [0.08, 0.08],
        [1.12, 0.48],
        [0.82, 1.05],
        [0.2, 0.78]
    ], 0.09);
    const wing = new THREE.Mesh(geometry, [
        paperMaterial(PAPER_SHIP_STYLE.palette.coral, { side: THREE.DoubleSide }),
        paperMaterial(PAPER_SHIP_STYLE.palette.cardboard, { side: THREE.DoubleSide })
    ]);
    wing.name = name;
    wing.rotation.x = Math.PI / 2;
    wing.position.set(0, -0.06, -0.25);
    if (mirrored) wing.scale.x = -1;
    wing.castShadow = true;
    return wing;
}

function createTailFin() {
    const fin = new THREE.Mesh(
        extrudedShape([
            [0, 0],
            [0.72, 0],
            [0.57, 0.52],
            [0.38, 0.31],
            [0.2, 0.5]
        ], 0.085),
        [
            paperMaterial(PAPER_SHIP_STYLE.palette.coral, { side: THREE.DoubleSide }),
            paperMaterial(PAPER_SHIP_STYLE.palette.cardboard, { side: THREE.DoubleSide })
        ]
    );
    fin.name = 'courier-envelope-fin';
    fin.rotation.y = -Math.PI / 2;
    fin.position.set(0, 0.16, 0.32);
    fin.castShadow = true;
    return fin;
}

function createEngine(name, x) {
    const engine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.16, 0.38, 6, 1, false),
        paperMaterial(PAPER_SHIP_STYLE.palette.cardboard)
    );
    engine.name = name;
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -0.055, 0.72);
    engine.castShadow = true;
    return engine;
}

function createExhaust(x) {
    const exhaust = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.5, 4, 1, false),
        new THREE.MeshBasicMaterial({ color: PAPER_SHIP_STYLE.exhaust })
    );
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(x, -0.055, 1.14);
    return exhaust;
}

export function createPaperShip() {
    const ship = new THREE.Group();
    ship.name = 'paper-courier-ship';

    const fuselageGeometry = new THREE.ConeGeometry(0.36, 1.9, 6, 2, false);
    fuselageGeometry.rotateX(-Math.PI / 2);

    const outline = new THREE.Mesh(
        fuselageGeometry,
        new THREE.MeshBasicMaterial({ color: PAPER_SHIP_STYLE.outline, side: THREE.BackSide })
    );
    outline.name = 'courier-outline';
    outline.scale.setScalar(1.065);

    const rim = new THREE.Mesh(
        fuselageGeometry,
        paperMaterial(PAPER_SHIP_STYLE.palette.cardboard, { side: THREE.BackSide })
    );
    rim.name = 'courier-paper-rim';
    rim.scale.setScalar(1.035);

    const fuselage = new THREE.Mesh(
        fuselageGeometry,
        paperMaterial(PAPER_SHIP_STYLE.palette.ivory)
    );
    fuselage.name = 'courier-fuselage';
    fuselage.userData.closedVolume = true;
    fuselage.castShadow = true;

    const cockpit = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 6, 4),
        paperMaterial(PAPER_SHIP_STYLE.palette.cockpit)
    );
    cockpit.name = 'courier-cockpit';
    cockpit.scale.set(0.72, 0.58, 1.2);
    cockpit.position.set(0, 0.2, -0.34);
    cockpit.castShadow = true;

    const leftWing = createWing('courier-wing-left');
    const rightWing = createWing('courier-wing-right', true);
    const tailFin = createTailFin();
    const leftEngine = createEngine('courier-engine-left', -0.21);
    const rightEngine = createEngine('courier-engine-right', 0.21);

    const exhaust = new THREE.Group();
    exhaust.name = 'courier-exhaust';
    exhaust.add(createExhaust(-0.21), createExhaust(0.21));
    exhaust.visible = false;

    ship.add(
        outline,
        rim,
        fuselage,
        leftWing,
        rightWing,
        tailFin,
        cockpit,
        leftEngine,
        rightEngine,
        exhaust
    );
    return ship;
}

export function updatePaperShipThrust(ship, speed, elapsed) {
    const exhaust = ship.getObjectByName('courier-exhaust');
    if (!exhaust) return;
    exhaust.visible = speed > 0.08;
    const throttle = Math.min(1, Math.max(0, speed / 8.5));
    exhaust.scale.z = 0.82 + throttle * 0.78 + Math.sin(elapsed * 28) * 0.045;
}
