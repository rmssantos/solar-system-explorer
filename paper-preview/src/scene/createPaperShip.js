import * as THREE from 'three';

export const PAPER_SHIP_STYLE = Object.freeze({
    palette: Object.freeze({
        ivory: '#f2e7c9',
        coral: '#cf6652',
        cardboard: '#8f654b',
        cockpit: '#4f8298'
    }),
    outline: '#171829',
    exhaust: '#ef7355'
});

function paperMaterial(color, options = {}, paperTexture = null) {
    return new THREE.MeshStandardMaterial({
        color,
        map: paperTexture,
        roughness: 0.94,
        metalness: 0,
        flatShading: true,
        ...options
    });
}

function inkMaterial(side = THREE.BackSide) {
    return new THREE.MeshBasicMaterial({ color: PAPER_SHIP_STYLE.outline, side });
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

function outlinedComponent(name, geometry, color, paperTexture, outlineScale = 1.075) {
    const group = new THREE.Group();
    group.name = `${name}-layers`;
    const outline = new THREE.Mesh(geometry, inkMaterial());
    outline.name = `${name}-outline`;
    outline.scale.setScalar(outlineScale);
    const surface = new THREE.Mesh(geometry, paperMaterial(color, { side: THREE.DoubleSide }, paperTexture));
    surface.name = name;
    surface.castShadow = true;
    group.add(outline, surface);
    return group;
}

function createWing(name, mirrored = false, paperTexture = null) {
    const wing = outlinedComponent(name, extrudedShape([
        [0.06, 0.06],
        [1.18, 0.43],
        [0.9, 1.06],
        [0.17, 0.77]
    ], 0.09), PAPER_SHIP_STYLE.palette.coral, paperTexture, 1.055);
    wing.rotation.x = Math.PI / 2;
    wing.position.set(0, -0.06, -0.3);
    if (mirrored) wing.scale.x = -1;
    return wing;
}

function createTailFin(paperTexture = null) {
    const fin = outlinedComponent('courier-envelope-fin', extrudedShape([
        [0, 0],
        [0.74, 0],
        [0.58, 0.56],
        [0.37, 0.33],
        [0.18, 0.53]
    ], 0.085), PAPER_SHIP_STYLE.palette.coral, paperTexture, 1.06);
    fin.rotation.y = -Math.PI / 2;
    fin.position.set(0, 0.16, 0.3);
    return fin;
}

function createEngine(side, x, paperTexture = null) {
    const name = `courier-engine-${side}`;
    const engine = outlinedComponent(
        name,
        new THREE.CylinderGeometry(0.13, 0.17, 0.4, 8, 1, false),
        PAPER_SHIP_STYLE.palette.cardboard,
        paperTexture,
        1.09
    );
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -0.055, 0.7);

    const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.185, 0.185, 0.095, 8),
        paperMaterial(PAPER_SHIP_STYLE.palette.coral, {}, paperTexture)
    );
    collar.name = `courier-engine-collar-${side}`;
    collar.position.y = 0.23;
    collar.castShadow = true;
    engine.add(collar);
    return engine;
}

function createCanopy(paperTexture = null) {
    const group = new THREE.Group();
    group.name = 'courier-canopy-layers';
    const geometry = new THREE.SphereGeometry(0.29, 8, 5);
    const outline = new THREE.Mesh(geometry, inkMaterial());
    outline.name = 'courier-cockpit-outline';
    outline.scale.set(0.77, 0.64, 1.25);
    const cockpit = new THREE.Mesh(
        geometry,
        paperMaterial(PAPER_SHIP_STYLE.palette.cockpit, {}, paperTexture)
    );
    cockpit.name = 'courier-cockpit';
    cockpit.scale.set(0.7, 0.57, 1.16);
    cockpit.castShadow = true;

    const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.195, 0.025, 4, 8),
        paperMaterial(PAPER_SHIP_STYLE.palette.cardboard, {}, paperTexture)
    );
    frame.name = 'courier-canopy-frame';
    frame.position.z = 0.275;
    frame.scale.y = 0.76;
    const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 5, 3),
        paperMaterial('#d9f4ed', {}, paperTexture)
    );
    glint.name = 'courier-canopy-glint';
    glint.position.set(-0.08, 0.09, 0.28);
    group.position.set(0, 0.2, -0.34);
    group.add(outline, cockpit, frame, glint);
    return group;
}

function createRearPaperDetails(paperTexture = null) {
    const details = new THREE.Group();
    details.name = 'courier-paper-details';
    const left = new THREE.Mesh(
        extrudedShape([[-0.26, -0.12], [-0.03, -0.22], [-0.03, 0.18], [-0.23, 0.1]], 0.025),
        paperMaterial('#e5d6ae', { side: THREE.DoubleSide }, paperTexture)
    );
    left.name = 'courier-panel-left';
    left.position.z = 0.975;
    const right = left.clone();
    right.material = paperMaterial('#f8edcf', { side: THREE.DoubleSide }, paperTexture);
    right.name = 'courier-panel-right';
    right.scale.x = -1;

    const insigniaGeometry = extrudedShape([
        [-0.13, -0.09], [0, -0.18], [0.13, -0.09], [0.13, 0.09], [0, 0.18], [-0.13, 0.09]
    ], 0.03);
    const insignia = new THREE.Mesh(
        insigniaGeometry,
        paperMaterial(PAPER_SHIP_STYLE.palette.coral, { side: THREE.DoubleSide }, paperTexture)
    );
    insignia.name = 'courier-postal-insignia';
    insignia.position.set(0, -0.02, 1.005);
    const fold = new THREE.Mesh(
        extrudedShape([[-0.09, 0.06], [0, -0.01], [0.09, 0.06]], 0.012),
        paperMaterial(PAPER_SHIP_STYLE.palette.ivory, { side: THREE.DoubleSide }, paperTexture)
    );
    fold.name = 'courier-postal-fold';
    fold.position.set(0, -0.02, 1.028);
    details.add(left, right, insignia, fold);
    return details;
}

function createExhaust(side, x) {
    const group = new THREE.Group();
    group.name = `courier-exhaust-${side}`;
    group.position.set(x, -0.055, 1.12);
    const outer = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.58, 5, 1, false),
        new THREE.MeshBasicMaterial({ color: PAPER_SHIP_STYLE.exhaust, transparent: true, opacity: 0.84 })
    );
    outer.name = `courier-exhaust-outer-${side}`;
    outer.rotation.x = Math.PI / 2;
    const core = new THREE.Mesh(
        new THREE.ConeGeometry(0.065, 0.4, 5, 1, false),
        new THREE.MeshBasicMaterial({ color: '#d8f4ee' })
    );
    core.name = `courier-exhaust-core-${side}`;
    core.rotation.x = Math.PI / 2;
    core.position.z = -0.05;
    group.add(outer, core);
    return group;
}

export function createPaperShip({ paperTexture = null } = {}) {
    const ship = new THREE.Group();
    ship.name = 'paper-courier-ship';

    const fuselageGeometry = new THREE.ConeGeometry(0.38, 1.95, 6, 2, false);
    fuselageGeometry.rotateX(-Math.PI / 2);
    const outline = new THREE.Mesh(fuselageGeometry, inkMaterial());
    outline.name = 'courier-outline';
    outline.scale.setScalar(1.075);
    const rim = new THREE.Mesh(
        fuselageGeometry,
        paperMaterial(PAPER_SHIP_STYLE.palette.cardboard, { side: THREE.BackSide }, paperTexture)
    );
    rim.name = 'courier-paper-rim';
    rim.scale.setScalar(1.04);
    const fuselage = new THREE.Mesh(
        fuselageGeometry,
        paperMaterial(PAPER_SHIP_STYLE.palette.ivory, {}, paperTexture)
    );
    fuselage.name = 'courier-fuselage';
    fuselage.userData.closedVolume = true;
    fuselage.castShadow = true;

    const exhaust = new THREE.Group();
    exhaust.name = 'courier-exhaust';
    exhaust.add(createExhaust('left', -0.22), createExhaust('right', 0.22));
    exhaust.visible = false;

    ship.add(
        outline,
        rim,
        fuselage,
        createWing('courier-wing-left', false, paperTexture),
        createWing('courier-wing-right', true, paperTexture),
        createTailFin(paperTexture),
        createCanopy(paperTexture),
        createEngine('left', -0.22, paperTexture),
        createEngine('right', 0.22, paperTexture),
        createRearPaperDetails(paperTexture),
        exhaust
    );
    return ship;
}

export function updatePaperShipThrust(ship, speed, elapsed) {
    const exhaust = ship.getObjectByName('courier-exhaust');
    if (!exhaust) return;
    exhaust.visible = speed > 0.08;
    const throttle = Math.min(1, Math.max(0, speed / 8.5));
    const flutter = Math.sin(elapsed * 28) * 0.045;
    exhaust.scale.z = 0.82 + throttle * 0.78 + flutter;
    for (const side of ['left', 'right']) {
        const core = ship.getObjectByName(`courier-exhaust-core-${side}`);
        if (core) core.scale.y = 0.9 + throttle * 0.55 + flutter;
    }
}
