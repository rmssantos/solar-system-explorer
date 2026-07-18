import * as THREE from 'three';
import { PLANET_STYLES, createSeededDirections } from './planetStyle.js';

function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        return value / 4294967296;
    };
}

function standardMaterial(options) {
    return new THREE.MeshStandardMaterial({
        roughness: 0.94,
        metalness: 0,
        flatShading: true,
        ...options
    });
}

function pickBodyColor(style, key, faceIndex, normalizedY) {
    if (['saturn', 'jupiter', 'venus', 'neptune'].includes(key)) {
        const bands = [0, 1, 0, 2, 1, 3, 0];
        const bandIndex = Math.min(bands.length - 1, Math.floor(((normalizedY + 1) / 2) * bands.length));
        return style.surfaceColors[bands[bandIndex]];
    }
    if (key === 'earth') return style.surfaceColors[faceIndex % 5 === 0 ? 1 : 0];
    const pattern = Math.abs(Math.sin((faceIndex + style.seed) * 12.9898) * 43758.5453) % 1;
    return style.surfaceColors[Math.floor(pattern * style.surfaceColors.length)];
}

function addSimpleSurfaceDetails(group, style, {
    includeCraters = true,
    includePolarCaps = true
} = {}) {
    if (style.features.craters && includeCraters) {
        const craterGroup = new THREE.Group();
        craterGroup.name = `${style.key}-craters`;
        createSeededDirections(style.seed + 220, style.features.craters.count).forEach((direction, index) => {
            const crater = new THREE.Mesh(
                new THREE.TorusGeometry(0.12 + (index % 3) * 0.035, 0.028, 4, 10),
                standardMaterial({ color: style.surfaceColors[2], side: THREE.DoubleSide })
            );
            placeTangent(crater, direction, style.radius * 1.018, 1, 0.72);
            craterGroup.add(crater);
        });
        group.add(craterGroup);
    }

    if (style.features.greatSpot) {
        const spot = new THREE.Mesh(
            new THREE.CircleGeometry(style.radius * 0.2, 12),
            standardMaterial({ color: style.surfaceColors[2], side: THREE.DoubleSide })
        );
        placeTangent(spot, { x: 0.82, y: -0.3, z: 0.48 }, style.radius * 1.022, 1.45, 0.62);
        spot.name = `${style.key}-storm`;
        group.add(spot);
    }

    if (style.features.polarCaps && style.key !== 'earth' && includePolarCaps) {
        [{ x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 }].forEach((direction) => {
            const cap = new THREE.Mesh(
                new THREE.CircleGeometry(style.radius * 0.28, 12),
                standardMaterial({ color: style.surfaceColors.at(-1), side: THREE.DoubleSide })
            );
            placeTangent(cap, direction, style.radius * 1.018, 1, 0.65);
            group.add(cap);
        });
    }
}

function createBodyGeometry(style) {
    const geometry = new THREE.IcosahedronGeometry(style.radius, style.geometryDetail);
    const position = geometry.getAttribute('position');
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();

    for (let vertex = 0; vertex < position.count; vertex += 3) {
        const centerY = (
            position.getY(vertex)
            + position.getY(vertex + 1)
            + position.getY(vertex + 2)
        ) / (3 * style.radius);
        color.set(pickBodyColor(style, style.key, vertex / 3, centerY));
        for (let offset = 0; offset < 3; offset += 1) {
            const colorIndex = (vertex + offset) * 3;
            colors[colorIndex] = color.r;
            colors[colorIndex + 1] = color.g;
            colors[colorIndex + 2] = color.b;
        }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
}

function createIrregularPatch(seed, points = 8) {
    const random = seededRandom(seed);
    const shape = new THREE.Shape();
    for (let index = 0; index < points; index += 1) {
        const angle = (index / points) * Math.PI * 2;
        const radius = 0.78 + random() * 0.28;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (index === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function placeTangent(mesh, direction, radius, scaleX, scaleY = scaleX) {
    const normal = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
    mesh.position.copy(normal).multiplyScalar(radius);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    mesh.scale.set(scaleX, scaleY, 1);
}

function addSunCorona(group, style) {
    const corona = new THREE.Group();
    corona.name = 'sun-corona';
    const config = style.features.corona;
    const directions = createSeededDirections(style.seed + 300, config.count);
    directions.forEach((direction, index) => {
        const height = 0.24 + (index % 3) * 0.045;
        const ray = new THREE.Mesh(
            new THREE.ConeGeometry(0.105 + (index % 2) * 0.025, height, 3),
            standardMaterial({
                color: index % 2 === 0 ? style.surfaceColors[1] : style.surfaceColors[2],
                emissive: style.emissive,
                emissiveIntensity: 0.22
            })
        );
        const normal = new THREE.Vector3(direction.x, direction.y, direction.z);
        ray.position.copy(normal).multiplyScalar(config.innerRadius + height * 0.25);
        ray.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        ray.castShadow = true;
        corona.add(ray);
    });
    group.add(corona);
}

function addEarthDetails(group, style, cloudTexture = null) {
    const land = new THREE.Group();
    land.name = 'earth-land-plates';
    const landConfig = style.features.landPlates;
    createSeededDirections(style.seed + 10, landConfig.count).forEach((direction, index) => {
        const patch = new THREE.Mesh(
            createIrregularPatch(style.seed + index, 7 + (index % 3)),
            standardMaterial({
                color: style.surfaceColors[2 + (index % 2)],
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: -2
            })
        );
        const scale = landConfig.minScale
            + ((index * 0.61803398875) % 1) * (landConfig.maxScale - landConfig.minScale);
        placeTangent(patch, direction, style.radius * 1.012, scale * 1.25, scale * 0.78);
        patch.rotation.z = index * 0.71;
        patch.castShadow = true;
        land.add(patch);
    });

    const clouds = new THREE.Group();
    clouds.name = 'earth-clouds';
    const cloudConfig = style.features.clouds;
    createSeededDirections(style.seed + 110, cloudConfig.count).forEach((direction, index) => {
        const cloud = new THREE.Mesh(
            createIrregularPatch(style.seed + 80 + index, 8),
            standardMaterial({
                color: '#fffaf0',
                map: cloudTexture,
                transparent: true,
                opacity: 0.92,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: -3
            })
        );
        const scale = cloudConfig.minScale + (index / cloudConfig.count)
            * (cloudConfig.maxScale - cloudConfig.minScale);
        placeTangent(cloud, direction, style.radius * 1.035, scale * 1.75, scale * 0.36);
        cloud.rotation.z = 0.35 + index * 0.9;
        clouds.add(cloud);
    });

    const caps = new THREE.Group();
    caps.name = 'earth-polar-caps';
    [{ x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 }].forEach((direction, index) => {
        const cap = new THREE.Mesh(
            createIrregularPatch(style.seed + 160 + index, 9),
            standardMaterial({ color: '#fffaf0', map: cloudTexture, side: THREE.DoubleSide })
        );
        placeTangent(cap, direction, style.radius * 1.012, 0.46, 0.31);
        caps.add(cap);
    });
    group.add(land, clouds, caps);
}

function addPlanetRings(group, style) {
    const config = style.features.rings;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, config.outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, config.innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.075,
        bevelEnabled: false,
        curveSegments: config.segments
    });
    geometry.translate(0, 0, -0.0375);
    const ring = new THREE.Mesh(geometry, [
        standardMaterial({ color: style.surfaceColors[3], side: THREE.DoubleSide }),
        standardMaterial({ color: style.rimColor, side: THREE.DoubleSide })
    ]);
    ring.name = `${style.key}-rings`;
    ring.rotation.set(config.tilt, 0, -0.14);
    ring.castShadow = true;
    ring.receiveShadow = true;

    const outline = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: style.outlineColor, side: THREE.BackSide })
    );
    outline.name = `${style.key}-ring-outline`;
    outline.rotation.copy(ring.rotation);
    outline.scale.setScalar(1.018);
    group.add(outline, ring);
}

export function createLowPolyPlanet(key, { surfaceTexture = null, cloudTexture = null } = {}) {
    const style = PLANET_STYLES[key];
    if (!style) throw new Error(`Unknown low-poly planet: ${key}`);

    const group = new THREE.Group();
    group.name = `low-poly-paper-${key}`;
    group.userData = { key, phase: style.seed * 0.21 };

    const geometry = createBodyGeometry(style);
    const outline = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: style.outlineColor, side: THREE.BackSide })
    );
    outline.name = `${key}-outline`;
    outline.scale.setScalar(style.outlineScale);

    const rim = new THREE.Mesh(
        geometry,
        standardMaterial({ color: style.rimColor, side: THREE.BackSide })
    );
    rim.name = `${key}-paper-rim`;
    rim.scale.setScalar(style.paperRimScale);

    const body = new THREE.Mesh(
        geometry,
        standardMaterial({
            color: '#ffffff',
            map: surfaceTexture,
            vertexColors: !surfaceTexture,
            emissive: style.emissive,
            emissiveIntensity: style.emissiveIntensity
        })
    );
    body.name = `${key}-body`;
    body.userData.closedVolume = true;
    body.castShadow = true;
    body.receiveShadow = true;

    group.add(outline, rim, body);
    if (key === 'sun') addSunCorona(group, style);
    if (key === 'earth') addEarthDetails(group, style, cloudTexture);
    addSimpleSurfaceDetails(group, style, {
        includeCraters: !surfaceTexture,
        includePolarCaps: !surfaceTexture
    });
    if (style.features.rings) addPlanetRings(group, style);
    return group;
}
