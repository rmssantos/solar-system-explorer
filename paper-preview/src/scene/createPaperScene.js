import * as THREE from 'three';
import { createLowPolyPlanet } from './createLowPolyPlanet.js';
import { createPaperShip, updatePaperShipThrust } from './createPaperShip.js';
import { createPaperTextures } from './paperTextures.js';
import { PRIMARY_WORLDS } from '../world/worldCatalog.js';
import { adjustCameraDistance, cameraModeForDistance } from './cameraZoom.js';
import { createPaperWorldObjects } from './createPaperWorldObjects.js';
import { createPrimarySnapshot } from '../world/orbitalSystem.js';
import { createOrbitPaths } from './createOrbitPaths.js';

const PLANET_KEYS = PRIMARY_WORLDS.map((world) => world.key);
const ORBIT_DAYS_PER_SECOND = 0.35;
const DAY_MS = 86_400_000;
export const CHASE_CAMERA_LAYOUT = Object.freeze({ distance: 6.4, verticalOffset: 0.9 });

function createPaperCockpit() {
    const cockpit = new THREE.Group();
    cockpit.name = 'paper-cockpit';
    const paper = new THREE.MeshBasicMaterial({ color: '#e7c98a' });
    const edge = new THREE.MeshBasicMaterial({ color: '#241f2a' });
    const panel = new THREE.MeshBasicMaterial({ color: '#263d59' });
    const glass = new THREE.MeshBasicMaterial({ color: '#6fb3c0', transparent: true, opacity: 0.52 });

    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.5, 0.16), panel);
    dashboard.position.set(0, -0.84, -1.42);
    cockpit.add(dashboard);

    [-0.9, 0.9].forEach((x, index) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.05, 0.12), paper);
        strut.position.set(x, 0.02, -1.48);
        strut.rotation.z = index === 0 ? -0.23 : 0.23;
        const strutEdge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.09, 0.14), edge);
        strutEdge.position.copy(strut.position);
        strutEdge.rotation.copy(strut.rotation);
        cockpit.add(strutEdge, strut);
    });

    const canopy = new THREE.Mesh(new THREE.CircleGeometry(0.23, 8), glass);
    canopy.position.set(0, -0.72, -1.32);
    cockpit.add(canopy);

    ['#ef765c', '#f4c85f', '#79bca8', '#6e8fc5'].forEach((color, index) => {
        const light = new THREE.Mesh(
            new THREE.CircleGeometry(0.045, 8),
            new THREE.MeshBasicMaterial({ color })
        );
        light.position.set(-0.38 + index * 0.25, -0.9, -1.31);
        cockpit.add(light);
    });

    const reticle = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.12, 0, -1.6), new THREE.Vector3(0.12, 0, -1.6),
            new THREE.Vector3(0, -0.12, -1.6), new THREE.Vector3(0, 0.12, -1.6)
        ]),
        new THREE.LineBasicMaterial({ color: '#f6d77c', transparent: true, opacity: 0.78 })
    );
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
        const planet = createLowPolyPlanet(key);
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
    const worldObjects = createPaperWorldObjects();
    scene.add(worldObjects.root);

    const rocket = createPaperShip();
    rocket.position.set(0, 0, 7);
    scene.add(rocket);

    const runtime = {
        elapsed: 0,
        simulationDateMs: initialDate.getTime(),
        primarySnapshot: initialSnapshot,
        activeIndex: -1,
        contextLost: false,
        cameraPosition: new THREE.Vector3(0, 2.2, 13),
        flightQuaternion: new THREE.Quaternion(),
        forward: new THREE.Vector3(),
        right: new THREE.Vector3(),
        up: new THREE.Vector3(),
        desiredCamera: new THREE.Vector3(),
        lightOffset: new THREE.Vector3(-4, 7, 8),
        shipPosition: new THREE.Vector3(0, 0, 7),
        orientation: { yaw: 0, pitch: 0, roll: 0 }
        , cameraDistance: CHASE_CAMERA_LAYOUT.distance
        , targetCameraDistance: CHASE_CAMERA_LAYOUT.distance
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
        runtime.flightQuaternion.setFromEuler(new THREE.Euler(
            flightState.orientation.pitch,
            flightState.orientation.yaw,
            flightState.orientation.roll,
            'YXZ'
        ));
        runtime.shipPosition.set(flightState.position.x, flightState.position.y, flightState.position.z);
        rocket.position.copy(runtime.shipPosition);
        rocket.quaternion.copy(runtime.flightQuaternion);

        const speed = Math.hypot(flightState.velocity.x, flightState.velocity.y, flightState.velocity.z);
        updatePaperShipThrust(rocket, speed, runtime.elapsed);

        runtime.forward.set(0, 0, -1).applyQuaternion(runtime.flightQuaternion);
        runtime.up.set(0, 1, 0).applyQuaternion(runtime.flightQuaternion);
        runtime.cameraDistance += (runtime.targetCameraDistance - runtime.cameraDistance)
            * (1 - Math.exp(-7 * delta));
        const cameraMode = cameraModeForDistance(runtime.cameraDistance);
        const verticalOffset = cameraMode === 'cockpit' ? 0.36 : CHASE_CAMERA_LAYOUT.verticalOffset;
        runtime.desiredCamera.copy(runtime.shipPosition)
            .addScaledVector(runtime.forward, cameraMode === 'cockpit' ? 0.28 : -runtime.cameraDistance)
            .addScaledVector(runtime.up, verticalOffset);
        runtime.cameraPosition.lerp(runtime.desiredCamera, 1 - Math.exp(-5.2 * delta));
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
    }

    function render() {
        if (!runtime.contextLost) renderer.render(scene, camera);
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

    function toggleOrbits(force) {
        orbitPaths.visible = typeof force === 'boolean' ? force : !orbitPaths.visible;
        return orbitPaths.visible;
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
        update,
        render,
        resize,
        getNavigationBasis,
        getPrimaryBodies,
        getState,
        adjustZoom,
        toggleOrbits,
        destroy
    };
}
