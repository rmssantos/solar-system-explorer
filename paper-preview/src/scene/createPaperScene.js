import * as THREE from 'three';
import { createLowPolyPlanet } from './createLowPolyPlanet.js';
import { createPaperShip, updatePaperShipThrust } from './createPaperShip.js';
import { createPaperTextures } from './paperTextures.js';
import { PRIMARY_WORLDS, getWorldObject } from '../world/worldCatalog.js';
import { adjustCameraDistance, cameraModeForDistance } from './cameraZoom.js';
import { createPaperWorldObjects } from './createPaperWorldObjects.js';
import { createPrimarySnapshot } from '../world/orbitalSystem.js';
import { createOrbitPaths } from './createOrbitPaths.js';
import { syncSkyDome } from './skyDome.js';
import { cameraFollowAlpha } from './cameraFollow.js';

const PLANET_KEYS = PRIMARY_WORLDS.map((world) => world.key);
const ORBIT_DAYS_PER_SECOND = 0.35;
const DAY_MS = 86_400_000;
export const CHASE_CAMERA_LAYOUT = Object.freeze({ distance: 6.4, verticalOffset: 0.9 });

export const PAPER_COCKPIT_STYLE = Object.freeze({
    palette: Object.freeze({
        paper: '#e7c98a', ink: '#241f2a', panel: '#263d59', glass: '#6fb3c0', signal: '#f4c85f'
    }),
    components: Object.freeze([
        'canopy-arch', 'canopy-struts', 'dashboard', 'radar', 'gauges', 'signal-lights', 'reticle'
    ])
});

function createPaperCockpit() {
    const cockpit = new THREE.Group();
    cockpit.name = 'paper-cockpit';
    const { palette } = PAPER_COCKPIT_STYLE;
    const paper = new THREE.MeshBasicMaterial({ color: palette.paper });
    const edge = new THREE.MeshBasicMaterial({ color: palette.ink });
    const panel = new THREE.MeshBasicMaterial({ color: palette.panel });
    const glass = new THREE.MeshBasicMaterial({ color: palette.glass, transparent: true, opacity: 0.68 });

    const dashboardEdge = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.38, 0.17), edge);
    dashboardEdge.position.set(0, -1, -2.2);
    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.32, 0.18), panel);
    dashboard.name = 'cockpit-dashboard';
    dashboard.position.set(0, -0.98, -2.1);
    const dashboardLipEdge = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.13, 0.2), edge);
    dashboardLipEdge.position.set(0, -0.78, -2.18);
    const dashboardLip = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 0.21), paper);
    dashboardLip.position.set(0, -0.78, -2.07);
    cockpit.add(dashboardEdge, dashboard, dashboardLipEdge, dashboardLip);

    [-1.15, 1.15].forEach((x, index) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.2, 0.08), paper);
        strut.name = 'cockpit-canopy-strut';
        strut.position.set(x, 0.08, -1.7);
        strut.rotation.z = index === 0 ? -0.23 : 0.23;
        const strutEdge = new THREE.Mesh(new THREE.BoxGeometry(0.085, 2.24, 0.1), edge);
        strutEdge.position.copy(strut.position);
        strutEdge.position.z = -1.78;
        strutEdge.rotation.copy(strut.rotation);
        cockpit.add(strutEdge, strut);
    });

    const archEdge = new THREE.Mesh(new THREE.TorusGeometry(1.33, 0.04, 4, 24, Math.PI), edge);
    archEdge.name = 'cockpit-canopy-arch';
    archEdge.position.set(0, 0.1, -1.78);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.33, 0.022, 4, 24, Math.PI), paper);
    arch.position.set(0, 0.1, -1.7);
    cockpit.add(archEdge, arch);

    const radarFrame = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.43, 0.08), edge);
    radarFrame.position.set(0, -0.98, -2.01);
    const radar = new THREE.Mesh(new THREE.CircleGeometry(0.17, 12), glass);
    radar.name = 'cockpit-radar';
    radar.position.set(0, -0.98, -1.94);
    const radarOrbit = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.012, 4, 16),
        new THREE.MeshBasicMaterial({ color: palette.signal })
    );
    radarOrbit.position.set(0, -0.98, -1.91);
    cockpit.add(radarFrame, radar, radarOrbit);

    [-0.72, 0.72].forEach((x, index) => {
        const gaugeFrame = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), edge);
        gaugeFrame.position.set(x, -0.98, -2.01);
        const gauge = new THREE.Mesh(
            new THREE.CircleGeometry(0.145, 12),
            new THREE.MeshBasicMaterial({ color: index === 0 ? '#e7c98a' : '#79bca8' })
        );
        gauge.name = 'cockpit-gauge';
        gauge.position.set(x, -0.98, -1.94);
        const needle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.12, 0.02), edge);
        needle.position.set(x, -0.97, -1.9);
        needle.rotation.z = index === 0 ? -0.7 : 0.55;
        cockpit.add(gaugeFrame, gauge, needle);
    });

    ['#ef765c', '#f4c85f', '#79bca8', '#6e8fc5'].forEach((color, index) => {
        const light = new THREE.Mesh(
            new THREE.CircleGeometry(0.045, 8),
            new THREE.MeshBasicMaterial({ color })
        );
        light.name = 'cockpit-signal-light';
        light.position.set(-0.3 + index * 0.2, -1.11, -1.94);
        cockpit.add(light);
    });

    const handleBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.08), paper);
    handleBase.position.set(0.96, -1.08, -1.94);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.07), new THREE.MeshBasicMaterial({ color: '#ef765c' }));
    handle.position.set(0.96, -0.94, -1.9);
    handle.rotation.z = -0.18;
    cockpit.add(handleBase, handle);

    const reticle = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.12, 0, -1.6), new THREE.Vector3(0.12, 0, -1.6),
            new THREE.Vector3(0, -0.12, -1.6), new THREE.Vector3(0, 0.12, -1.6)
        ]),
        new THREE.LineBasicMaterial({ color: '#f6d77c', transparent: true, opacity: 0.76 })
    );
    reticle.name = 'cockpit-reticle';
    cockpit.add(reticle);
    cockpit.visible = false;
    return cockpit;
}

function addPaperStars(scene) {
    let seed = 9127;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const geometry = new THREE.OctahedronGeometry(0.055, 0);
    const cream = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: '#fff1bd' }),
        320
    );
    const blue = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: '#6379a8' }),
        80
    );
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();

    for (let index = 0; index < 400; index += 1) {
        position.set(-45 + random() * 220, -36 + random() * 72, -150 + random() * 190);
        rotation.setFromEuler(new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI));
        const size = 0.55 + random() * 1.8;
        scale.setScalar(size);
        matrix.compose(position, rotation, scale);
        if (index < 320) cream.setMatrixAt(index, matrix);
        else blue.setMatrixAt(index - 320, matrix);
    }
    cream.instanceMatrix.needsUpdate = true;
    blue.instanceMatrix.needsUpdate = true;
    scene.add(cream, blue);
}

function addPaperAtmosphere(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 3, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(111,143,197,.36)');
    gradient.addColorStop(0.45, 'rgba(95,102,159,.18)');
    gradient.addColorStop(1, 'rgba(28,39,76,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const nebulaTexture = new THREE.CanvasTexture(canvas);
    nebulaTexture.colorSpace = THREE.SRGBColorSpace;
    const nebulaMaterial = new THREE.SpriteMaterial({
        map: nebulaTexture, color: '#9aa8d2', transparent: true, opacity: 0.34,
        depthWrite: false, blending: THREE.AdditiveBlending
    });
    [
        [-18, 12, -20, 26], [44, -15, -38, 34], [84, 16, -73, 38],
        [126, -13, -111, 42], [154, 17, -140, 34]
    ].forEach(([x, y, z, size], index) => {
        const cloud = new THREE.Sprite(nebulaMaterial.clone());
        cloud.material.color.set(index % 2 ? '#b28da9' : '#7898bd');
        cloud.position.set(x, y, z);
        cloud.scale.set(size, size * 0.64, 1);
        scene.add(cloud);
    });

    const asteroidGeometry = new THREE.IcosahedronGeometry(0.11, 0);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: '#72675d', roughness: 1, flatShading: true
    });
    const belt = new THREE.InstancedMesh(asteroidGeometry, asteroidMaterial, 90);
    const matrix = new THREE.Matrix4();
    let seed = 4901;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    for (let index = 0; index < 90; index += 1) {
        const angle = random() * Math.PI * 2;
        const radius = 68 + random() * 8;
        const position = new THREE.Vector3(
            Math.cos(angle) * radius,
            -1 + (random() - 0.5) * 4,
            Math.sin(angle) * radius
        );
        const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(random() * 3, random() * 3, random() * 3));
        const size = 0.45 + random() * 1.35;
        matrix.compose(position, rotation, new THREE.Vector3(size, size * 0.75, size * 0.9));
        belt.setMatrixAt(index, matrix);
    }
    belt.instanceMatrix.needsUpdate = true;
    belt.name = 'paper-asteroid-belt';
    scene.add(belt);
    return nebulaTexture;
}

function createSurpriseEffect() {
    const root = new THREE.Group();
    root.name = 'surprise-effect';
    root.visible = false;

    const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.72, 0),
        new THREE.MeshBasicMaterial({ color: '#f4c85f', transparent: true })
    );
    core.name = 'surprise-core';
    root.add(core);

    const tailMaterial = new THREE.MeshBasicMaterial({ color: '#ef765c', transparent: true, opacity: 0.78 });
    for (let index = 0; index < 5; index += 1) {
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13 + index * 0.04, 1.1 + index * 0.36, 4), tailMaterial.clone());
        tail.name = 'surprise-tail';
        tail.rotation.z = Math.PI / 2;
        tail.position.set(1 + index * 0.52, (index - 2) * 0.16, 0);
        root.add(tail);
    }

    for (let index = 0; index < 3; index += 1) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.2 + index * 0.65, 0.035, 4, 24),
            new THREE.MeshBasicMaterial({ color: '#79bca8', transparent: true, opacity: 0.66 - index * 0.12 })
        );
        ring.name = 'surprise-ring';
        ring.rotation.x = Math.PI / 2;
        root.add(ring);
    }

    return root;
}

function createAutopilotTrail() {
    const trail = new THREE.Group();
    trail.name = 'paper-autopilot-trail';
    trail.visible = false;
    const colors = ['#f4c85f', '#ef765c', '#79bca8', '#f5e8bb'];
    for (let index = 0; index < 10; index += 1) {
        const shard = new THREE.Mesh(
            new THREE.TetrahedronGeometry(0.075 + (index % 3) * 0.025, 0),
            new THREE.MeshBasicMaterial({ color: colors[index % colors.length], transparent: true, opacity: 0.86 })
        );
        shard.userData.phase = index * 1.73;
        shard.position.z = 1.45 + index * 0.38;
        trail.add(shard);
    }
    return trail;
}

export function createPaperScene(stage) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101936');
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 360);
    camera.position.set(0, 2.2, 13);
    const cockpit = createPaperCockpit();
    camera.add(cockpit);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);

    const surfaceTextureLoader = new THREE.TextureLoader();
    const surfaceTextures = Object.fromEntries(PLANET_KEYS.map((key) => {
        const texture = surfaceTextureLoader.load(`/art/textures/paper-${key}-surface.webp`);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        return [key, texture];
    }));
    const objectSurfaceTextures = Object.fromEntries(Object.entries({
        moon: '/art/textures/paper-moon-surface.webp',
        rocky: '/art/textures/paper-rocky-surface.webp',
        craft: '/art/textures/paper-craft-surface.webp'
    }).map(([key, path]) => {
        const texture = surfaceTextureLoader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        return [key, texture];
    }));

    const textures = createPaperTextures(renderer);
    const background = new THREE.Mesh(
        new THREE.SphereGeometry(260, 36, 20),
        new THREE.MeshBasicMaterial({ map: textures.night, color: '#172243', side: THREE.BackSide })
    );
    scene.add(background);
    addPaperStars(scene);
    const nebulaTexture = addPaperAtmosphere(scene);
    const orbitPaths = createOrbitPaths(PRIMARY_WORLDS);
    scene.add(orbitPaths);

    scene.add(new THREE.HemisphereLight('#fff0c4', '#192346', 1.65));
    const keyLight = new THREE.DirectionalLight('#ffe8b0', 2.7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight, keyLight.target);

    const initialDate = new Date();
    const initialSnapshot = createPrimarySnapshot(initialDate);
    const planets = PLANET_KEYS.map((key) => {
        const world = PRIMARY_WORLDS.find((candidate) => candidate.key === key);
        const planet = createLowPolyPlanet(key, {
            surfaceTexture: surfaceTextures[key] ?? null,
            cloudTexture: key === 'earth' ? textures.cream : null
        });
        planet.userData.baseScale = world.scale;
        planet.position.set(
            initialSnapshot[key].position.x,
            initialSnapshot[key].position.y,
            initialSnapshot[key].position.z
        );
        planet.scale.setScalar(planet.userData.baseScale);
        scene.add(planet);
        return planet;
    });
    const worldObjects = createPaperWorldObjects({ paperTextures: objectSurfaceTextures });
    scene.add(worldObjects.root);

    const rocket = createPaperShip({ paperTexture: objectSurfaceTextures.craft });
    rocket.position.set(0, 0, 14);
    scene.add(rocket);
    const surpriseEffect = createSurpriseEffect();
    scene.add(surpriseEffect);
    const autopilotTrail = createAutopilotTrail();
    scene.add(autopilotTrail);

    const runtime = {
        elapsed: 0,
        simulationDateMs: initialDate.getTime(),
        primarySnapshot: initialSnapshot,
        activeIndex: -1,
        contextLost: false,
        cameraPosition: new THREE.Vector3(0, 2.2, 13),
        followedShipPosition: new THREE.Vector3(0, 0, 14),
        flightQuaternion: new THREE.Quaternion(),
        targetFlightQuaternion: new THREE.Quaternion(),
        forward: new THREE.Vector3(),
        right: new THREE.Vector3(),
        up: new THREE.Vector3(),
        desiredCamera: new THREE.Vector3(),
        lightOffset: new THREE.Vector3(-4, 7, 8),
        shipPosition: new THREE.Vector3(0, 0, 7),
        orientation: { yaw: 0, pitch: 0, roll: 0 }
        , cameraDistance: /** @type {number} */ (CHASE_CAMERA_LAYOUT.distance)
        , targetCameraDistance: /** @type {number} */ (CHASE_CAMERA_LAYOUT.distance)
        , surpriseRemaining: 0
        , surpriseVelocity: new THREE.Vector3()
    };

    const pinchPointers = new Map();
    let pinchDistance = null;

    function adjustZoom(delta) {
        runtime.targetCameraDistance = adjustCameraDistance(runtime.targetCameraDistance, delta);
    }

    function handleWheel(event) {
        event.preventDefault();
        adjustZoom(event.deltaY * 0.008);
    }

    function handleZoomKey(event) {
        if (event.code === 'KeyV') {
            runtime.targetCameraDistance = cameraModeForDistance(runtime.targetCameraDistance) === 'cockpit'
                ? CHASE_CAMERA_LAYOUT.distance
                : 0.32;
        } else if (event.code === 'Equal' || event.code === 'NumpadAdd') adjustZoom(-0.8);
        else if (event.code === 'Minus' || event.code === 'NumpadSubtract') adjustZoom(0.8);
        else return;
        event.preventDefault();
    }

    function handlePinchPointer(event) {
        if (event.type === 'pointerup' || event.type === 'pointercancel') pinchPointers.delete(event.pointerId);
        else pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const points = [...pinchPointers.values()];
        if (points.length !== 2) {
            pinchDistance = null;
            return;
        }
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        if (pinchDistance !== null) adjustZoom((pinchDistance - distance) * 0.025);
        pinchDistance = distance;
    }

    function resize() {
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        cockpit.scale.x = Math.min(1, Math.max(0.36, camera.aspect / 1.15));
        renderer.setSize(width, height, false);
    }

    function setFlightSnapshot(flightState, deltaSeconds) {
        const delta = Math.min(Math.max(deltaSeconds, 0), 0.1);
        runtime.orientation = { ...flightState.orientation };
        runtime.targetFlightQuaternion.setFromEuler(new THREE.Euler(
            flightState.orientation.pitch,
            flightState.orientation.yaw,
            flightState.orientation.roll,
            'YXZ'
        ));
        runtime.flightQuaternion.slerp(runtime.targetFlightQuaternion, cameraFollowAlpha(delta));
        runtime.shipPosition.set(flightState.position.x, flightState.position.y, flightState.position.z);
        rocket.position.copy(runtime.shipPosition);
        rocket.quaternion.copy(runtime.flightQuaternion);
        autopilotTrail.position.copy(runtime.shipPosition);
        autopilotTrail.quaternion.copy(runtime.flightQuaternion);

        const speed = Math.hypot(flightState.velocity.x, flightState.velocity.y, flightState.velocity.z);
        updatePaperShipThrust(rocket, speed, runtime.elapsed);

        runtime.forward.set(0, 0, -1).applyQuaternion(runtime.flightQuaternion);
        runtime.up.set(0, 1, 0).applyQuaternion(runtime.flightQuaternion);
        runtime.cameraDistance += (runtime.targetCameraDistance - runtime.cameraDistance)
            * (1 - Math.exp(-7 * delta));
        const cameraMode = cameraModeForDistance(runtime.cameraDistance);
        const verticalOffset = cameraMode === 'cockpit' ? 0.36 : CHASE_CAMERA_LAYOUT.verticalOffset;
        // Smooth only translation. Smoothing the complete camera position also smooths the
        // rotated chase offset, which makes the ship wobble on screen while looking around.
        runtime.followedShipPosition.lerp(runtime.shipPosition, 1 - Math.exp(-5.2 * delta));
        runtime.desiredCamera.copy(runtime.followedShipPosition)
            .addScaledVector(runtime.forward, cameraMode === 'cockpit' ? 0.28 : -runtime.cameraDistance)
            .addScaledVector(runtime.up, verticalOffset);
        runtime.cameraPosition.copy(runtime.desiredCamera);
        camera.position.copy(runtime.cameraPosition);
        camera.quaternion.copy(runtime.flightQuaternion);
        cockpit.visible = cameraMode === 'cockpit';
        rocket.visible = cameraMode !== 'cockpit';

        keyLight.position.copy(camera.position).add(runtime.lightOffset);
        keyLight.target.position.copy(runtime.shipPosition);
        runtime.activeIndex = PLANET_KEYS.indexOf(flightState.nearbyPlanetKey);
    }

    function update(deltaSeconds) {
        const delta = Math.min(Math.max(deltaSeconds, 0), 0.1);
        runtime.elapsed += delta;
        runtime.simulationDateMs += delta * ORBIT_DAYS_PER_SECOND * DAY_MS;
        runtime.primarySnapshot = createPrimarySnapshot(new Date(runtime.simulationDateMs));
        planets.forEach((planet, index) => {
            const position = runtime.primarySnapshot[planet.userData.key].position;
            planet.position.set(position.x, position.y, position.z);
            planet.rotation.y += delta * (0.035 + index * 0.008);
            const selectedScale = planet.userData.baseScale * (index === runtime.activeIndex ? 1.045 : 1);
            planet.scale.lerp(new THREE.Vector3(selectedScale, selectedScale, selectedScale), Math.min(1, delta * 4));
        });
        worldObjects.update(runtime.elapsed, runtime.primarySnapshot);
        if (autopilotTrail.visible) {
            autopilotTrail.children.forEach((shard, index) => {
                const wave = runtime.elapsed * 7 + shard.userData.phase;
                shard.position.x = Math.sin(wave) * (0.22 + index * 0.025);
                shard.position.y = Math.cos(wave * 0.83) * (0.16 + index * 0.018);
                shard.rotation.x += delta * (1.8 + index * 0.07);
                shard.rotation.y += delta * (2.3 + index * 0.05);
            });
        }
        if (runtime.surpriseRemaining > 0) {
            runtime.surpriseRemaining = Math.max(0, runtime.surpriseRemaining - delta);
            surpriseEffect.position.addScaledVector(runtime.surpriseVelocity, delta);
            surpriseEffect.rotation.x += delta * 0.45;
            surpriseEffect.rotation.z += delta * 0.75;
            const opacity = Math.min(1, runtime.surpriseRemaining / 1.5);
            surpriseEffect.traverse((child) => {
                if (child.material) child.material.opacity = opacity * (child.name === 'surprise-ring' ? 0.62 : 1);
            });
            surpriseEffect.visible = runtime.surpriseRemaining > 0;
        }
    }

    function render() {
        if (!runtime.contextLost) {
            syncSkyDome(background, camera);
            renderer.render(scene, camera);
        }
    }

    function getNavigationBasis() {
        runtime.forward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        runtime.right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
        runtime.up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
        return {
            forward: { x: runtime.forward.x, y: runtime.forward.y, z: runtime.forward.z },
            right: { x: runtime.right.x, y: runtime.right.y, z: runtime.right.z },
            up: { x: runtime.up.x, y: runtime.up.y, z: runtime.up.z }
        };
    }

    function getState() {
        return {
            activeIndex: runtime.activeIndex,
            mode: 'flight-360',
            camera: {
                x: Number(camera.position.x.toFixed(3)),
                y: Number(camera.position.y.toFixed(3)),
                z: Number(camera.position.z.toFixed(3))
            },
            rocket: {
                x: Number(rocket.position.x.toFixed(3)),
                y: Number(rocket.position.y.toFixed(3)),
                z: Number(rocket.position.z.toFixed(3))
            },
            orientation: Object.fromEntries(
                Object.entries(runtime.orientation).map(([key, value]) => [key, Number(value.toFixed(3))])
            ),
            cameraMode: cameraModeForDistance(runtime.cameraDistance),
            cameraDistance: Number(runtime.cameraDistance.toFixed(2)),
            orbitDate: new Date(runtime.simulationDateMs).toISOString(),
            orbitsVisible: orbitPaths.visible,
            cameraForward: Object.fromEntries(
                Object.entries(getNavigationBasis().forward)
                    .map(([key, value]) => [key, Number(value.toFixed(3))])
            ),
            contextLost: runtime.contextLost
        };
    }

    function getPrimaryBodies() {
        return planets.map((planet) => {
            const world = PRIMARY_WORLDS.find((entry) => entry.key === planet.userData.key);
            return {
                key: planet.userData.key,
                position: { x: planet.position.x, y: planet.position.y, z: planet.position.z },
                collisionRadius: world.collisionRadius,
                interactionRadius: world.interactionRadius
            };
        });
    }

    function getWorldObjectPosition(key) {
        const planet = planets.find((entry) => entry.userData.key === key);
        if (planet) return { x: planet.position.x, y: planet.position.y, z: planet.position.z };
        return worldObjects.getPosition(key);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const projectedPointerTarget = new THREE.Vector3();
    function pickWorldObject(clientX, clientY) {
        const bounds = renderer.domElement.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return null;
        pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -(((clientY - bounds.top) / bounds.height) * 2 - 1);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects([...planets, worldObjects.root], true);
        for (const hit of hits) {
            let candidate = hit.object;
            while (candidate && candidate !== scene) {
                const key = candidate.userData.worldKey ?? candidate.userData.key;
                if (key && getWorldObject(key)) return key;
                candidate = candidate.parent;
            }
        }
        let closestKey = null;
        let closestScreenDistance = 24;
        const candidates = [
            ...planets.map((mesh) => ({ key: mesh.userData.key, mesh })),
            ...worldObjects.meshes.map(({ object, mesh }) => ({ key: object.key, mesh }))
        ];
        for (const candidate of candidates) {
            projectedPointerTarget.copy(candidate.mesh.position).project(camera);
            if (projectedPointerTarget.z < -1 || projectedPointerTarget.z > 1) continue;
            const screenX = bounds.left + ((projectedPointerTarget.x + 1) / 2) * bounds.width;
            const screenY = bounds.top + ((1 - projectedPointerTarget.y) / 2) * bounds.height;
            const screenDistance = Math.hypot(clientX - screenX, clientY - screenY);
            if (screenDistance < closestScreenDistance) {
                closestScreenDistance = screenDistance;
                closestKey = candidate.key;
            }
        }
        if (closestKey) return closestKey;
        return null;
    }

    function setAutopilotActive(active) {
        autopilotTrail.visible = Boolean(active);
    }

    function toggleOrbits(force) {
        orbitPaths.visible = typeof force === 'boolean' ? force : !orbitPaths.visible;
        return orbitPaths.visible;
    }

    function triggerSurprise(effect = 'star') {
        runtime.right.set(1, 0, 0).applyQuaternion(runtime.flightQuaternion);
        surpriseEffect.position.copy(runtime.shipPosition)
            .addScaledVector(runtime.forward, 12)
            .addScaledVector(runtime.right, effect === 'meteor' ? -6 : 6)
            .addScaledVector(runtime.up, 3.2);
        const colors = {
            comet: '#f4c85f', signal: '#79bca8', postcard: '#ef765c',
            meteor: '#e4a45d', capsule: '#6e8fc5', star: '#fff0a6'
        };
        surpriseEffect.getObjectByName('surprise-core').material.color.set(colors[effect] ?? colors.star);
        surpriseEffect.children.filter((child) => child.name === 'surprise-ring')
            .forEach((child) => { child.visible = effect === 'signal' || effect === 'capsule'; });
        surpriseEffect.children.filter((child) => child.name === 'surprise-tail')
            .forEach((child, index) => { child.visible = effect === 'comet' || effect === 'meteor' || index < 2; });
        surpriseEffect.scale.setScalar(effect === 'meteor' ? 1.3 : 1);
        runtime.surpriseVelocity.copy(runtime.right).multiplyScalar(effect === 'meteor' ? 5 : 1.4);
        runtime.surpriseRemaining = 8;
        surpriseEffect.visible = true;
    }

    function handleContextLost(event) {
        event.preventDefault();
        runtime.contextLost = true;
    }

    function handleContextRestored() {
        runtime.contextLost = false;
        render();
    }

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.addEventListener('pointerdown', handlePinchPointer);
    renderer.domElement.addEventListener('pointermove', handlePinchPointer);
    renderer.domElement.addEventListener('pointerup', handlePinchPointer);
    renderer.domElement.addEventListener('pointercancel', handlePinchPointer);
    window.addEventListener('keydown', handleZoomKey);
    window.addEventListener('resize', resize);
    resize();

    function destroy() {
        window.removeEventListener('resize', resize);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        renderer.domElement.removeEventListener('pointerdown', handlePinchPointer);
        renderer.domElement.removeEventListener('pointermove', handlePinchPointer);
        renderer.domElement.removeEventListener('pointerup', handlePinchPointer);
        renderer.domElement.removeEventListener('pointercancel', handlePinchPointer);
        window.removeEventListener('keydown', handleZoomKey);
        scene.traverse((object) => {
            object.geometry?.dispose?.();
            if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
            else object.material?.dispose?.();
        });
        Object.values(textures).forEach((texture) => texture.dispose());
        Object.values(surfaceTextures).forEach((texture) => texture.dispose());
        nebulaTexture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
    }

    return {
        setFlightSnapshot,
        setWorldObjectPosition: worldObjects.setLivePosition,
        setWorldObjectOffset: worldObjects.setLiveOffset,
        findNearbyWorldObject: worldObjects.findNearby,
        getWorldObjectPosition,
        pickWorldObject,
        setAutopilotActive,
        update,
        render,
        resize,
        getNavigationBasis,
        getPrimaryBodies,
        getState,
        adjustZoom,
        toggleOrbits,
        triggerSurprise,
        destroy
    };
}
