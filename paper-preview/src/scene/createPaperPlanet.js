import * as THREE from 'three';
import { createPaperProfile } from './paperGeometry.js';

function profileGeometry(seed, radius, segments = 72, jitter = 0.025) {
    const points = createPaperProfile({ seed, segments, jitter });
    const shape = new THREE.Shape();
    points.forEach((point, index) => {
        const x = point.x * radius;
        const y = point.y * radius;
        if (index === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    });
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 2);
}

function paperMaterial(map, color = '#ffffff', options = {}) {
    return new THREE.MeshStandardMaterial({
        map,
        color,
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide,
        ...options
    });
}

function makeLayer(geometry, material, z, { castShadow = true } = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    return mesh;
}

function addSunRays(group, textures, radius) {
    const material = paperMaterial(textures.sun, '#f1a62f');
    for (let index = 0; index < 18; index += 1) {
        const width = index % 2 === 0 ? 0.24 : 0.18;
        const length = index % 2 === 0 ? 0.58 : 0.42;
        const shape = new THREE.Shape();
        shape.moveTo(-width, 0);
        shape.lineTo(width, 0);
        shape.lineTo(0, length);
        shape.closePath();
        const ray = makeLayer(new THREE.ShapeGeometry(shape), material, -0.11);
        const angle = (index / 18) * Math.PI * 2;
        ray.position.x = Math.cos(angle) * (radius + 0.12);
        ray.position.y = Math.sin(angle) * (radius + 0.12);
        ray.rotation.z = angle - Math.PI / 2;
        group.add(ray);
    }
}

function addEarthClouds(group, textures, radius) {
    const material = paperMaterial(textures.cream, '#fff7dd');
    const clouds = [
        { x: -0.5, y: 0.54, sx: 0.46, sy: 0.1, rotation: -0.12 },
        { x: 0.42, y: -0.38, sx: 0.52, sy: 0.09, rotation: 0.16 },
        { x: 0.52, y: 0.35, sx: 0.3, sy: 0.07, rotation: -0.2 }
    ];

    for (let index = 0; index < clouds.length; index += 1) {
        const cloud = clouds[index];
        const geometry = profileGeometry(200 + index, radius, 32, 0.08);
        const layer = makeLayer(geometry, material, 0.055);
        layer.position.x = cloud.x;
        layer.position.y = cloud.y;
        layer.scale.set(cloud.sx, cloud.sy, 1);
        layer.rotation.z = cloud.rotation;
        group.add(layer);
    }
}

function addSaturnRings(group, textures, radius) {
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, radius * 1.92, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, radius * 1.13, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);
    const ringGeometry = new THREE.ExtrudeGeometry(ringShape, {
        depth: 0.12,
        bevelEnabled: false,
        curveSegments: 96
    });
    ringGeometry.translate(0, 0, -0.06);
    const ring = new THREE.Mesh(ringGeometry, [
        paperMaterial(textures.cream, '#e8c47d'),
        paperMaterial(textures.cardboard, '#8f673c')
    ]);
    ring.rotation.set(1.03, 0, -0.16);
    ring.position.z = -0.06;
    ring.castShadow = true;
    ring.receiveShadow = true;

    const stitch = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
            Array.from({ length: 96 }, (_, index) => {
                const angle = (index / 96) * Math.PI * 2;
                return new THREE.Vector3(
                    Math.cos(angle) * radius * 1.51,
                    Math.sin(angle) * radius * 1.51,
                    0.02
                );
            })
        ),
        new THREE.LineDashedMaterial({ color: '#8d633b', dashSize: 0.12, gapSize: 0.09 })
    );
    stitch.rotation.set(1.03, 0, -0.16);
    stitch.computeLineDistances();
    group.add(ring, stitch);
}

function addSculptureSlices(group, key, textures, config) {
    const faceTexture = textures[config.texture];
    const meridianAngles = [30, 60, 90, 120, 150].map((degrees) => THREE.MathUtils.degToRad(degrees));
    meridianAngles.forEach((angle, index) => {
        const useCardboard = index % 2 === 1;
        const material = useCardboard
            ? paperMaterial(textures.cardboard, '#9a7041')
            : paperMaterial(faceTexture, key === 'earth' ? '#3f7fa8' : '#d59a4e');
        const slice = makeLayer(
            profileGeometry(config.seed + 80 + index, config.radius * 0.985, 64, 0.02),
            material,
            0
        );
        slice.rotation.y = angle;
        slice.name = `${key}-meridian-${index + 1}`;
        group.add(slice);
    });

    const horizontalOffsets = [-0.58, 0, 0.58];
    horizontalOffsets.forEach((offset, index) => {
        const radiusScale = Math.sqrt(1 - (offset * offset));
        const slice = makeLayer(
            profileGeometry(config.seed + 120 + index, config.radius * radiusScale, 64, 0.018),
            paperMaterial(
                index === 1 ? faceTexture : textures.cardboard,
                index === 1 ? '#ffffff' : '#9a7041'
            ),
            0
        );
        slice.position.y = config.radius * offset;
        slice.rotation.x = Math.PI / 2;
        slice.name = `${key}-latitude-${index + 1}`;
        group.add(slice);
    });
}

const CONFIG = {
    sun: { radius: 1.62, seed: 11, texture: 'sun', rotation: -0.025 },
    earth: { radius: 1.34, seed: 29, texture: 'earth', rotation: 0.02 },
    saturn: { radius: 1.38, seed: 53, texture: 'saturn', rotation: -0.035 }
};

export function createPaperPlanet(key, textures) {
    const config = CONFIG[key];
    const group = new THREE.Group();
    group.name = `paper-${key}`;
    group.userData = { key, baseY: 0.35, phase: config.seed * 0.21 };

    if (key === 'sun') addSunRays(group, textures, config.radius);
    if (key === 'saturn') addSaturnRings(group, textures, config.radius);
    addSculptureSlices(group, key, textures, config);

    const shadow = makeLayer(
        profileGeometry(config.seed, config.radius * 1.06, 72, 0.03),
        new THREE.MeshBasicMaterial({ color: '#050817', transparent: true, opacity: 0.46, side: THREE.DoubleSide }),
        -0.14,
        { castShadow: false }
    );
    shadow.position.set(0.14, -0.16, -0.14);

    const cardboard = makeLayer(
        profileGeometry(config.seed, config.radius * 1.055, 72, 0.03),
        paperMaterial(textures.cardboard, '#b88c50'),
        -0.04
    );

    const deepCardboard = makeLayer(
        profileGeometry(config.seed, config.radius * 1.07, 72, 0.03),
        paperMaterial(textures.cardboard, '#8f673c'),
        -0.105
    );
    deepCardboard.position.x = 0.035;

    const face = makeLayer(
        profileGeometry(config.seed + 1, config.radius, 72, 0.024),
        paperMaterial(textures[config.texture]),
        0.015
    );

    const rim = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
            createPaperProfile({ seed: config.seed + 1, segments: 72, jitter: 0.024 })
                .map((point) => new THREE.Vector3(point.x * config.radius, point.y * config.radius, 0.045))
        ),
        new THREE.LineBasicMaterial({ color: '#2b2f3a', transparent: true, opacity: 0.26 })
    );

    group.add(shadow, deepCardboard, cardboard, face, rim);
    if (key === 'earth') addEarthClouds(group, textures, config.radius);
    group.rotation.z = config.rotation;
    return group;
}
