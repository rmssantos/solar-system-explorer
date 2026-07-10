import * as THREE from 'three';
import { PLANET_ANCHORS } from '../flightSimulation.js';
import { createLowPolyPlanet } from './createLowPolyPlanet.js';
import { createPaperShip, updatePaperShipThrust } from './createPaperShip.js';
import { createPaperTextures } from './paperTextures.js';

const PLANET_KEYS = ['sun', 'earth', 'saturn'];
export const CHASE_CAMERA_LAYOUT = Object.freeze({ distance: 6.4, verticalOffset: 0.9 });

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
        150
    );
    const blue = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: '#6379a8' }),
        38
    );
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();

    for (let index = 0; index < 188; index += 1) {
        position.set(-52 + random() * 104, -27 + random() * 54, -52 + random() * 78);
        rotation.setFromEuler(new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI));
        const size = 0.55 + random() * 1.8;
        scale.setScalar(size);
        matrix.compose(position, rotation, scale);
        if (index < 150) cream.setMatrixAt(index, matrix);
        else blue.setMatrixAt(index - 150, matrix);
    }
    cream.instanceMatrix.needsUpdate = true;
    blue.instanceMatrix.needsUpdate = true;
    scene.add(cream, blue);
}

function createStitchedRoute() {
    const route = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 7),
        new THREE.Vector3(PLANET_ANCHORS.sun.x, PLANET_ANCHORS.sun.y, PLANET_ANCHORS.sun.z),
        new THREE.Vector3(PLANET_ANCHORS.earth.x, PLANET_ANCHORS.earth.y, PLANET_ANCHORS.earth.z),
        new THREE.Vector3(PLANET_ANCHORS.saturn.x, PLANET_ANCHORS.saturn.y, PLANET_ANCHORS.saturn.z)
    ]);
    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(route.getPoints(220)),
        new THREE.LineDashedMaterial({
            color: '#d8ca9e',
            dashSize: 0.32,
            gapSize: 0.24,
            transparent: true,
            opacity: 0.42
        })
    );
    line.computeLineDistances();
    return line;
}

export function createPaperScene(stage) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101936');
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
    camera.position.set(0, 2.2, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);

    const textures = createPaperTextures(renderer);
    const background = new THREE.Mesh(
        new THREE.SphereGeometry(88, 36, 20),
        new THREE.MeshBasicMaterial({ map: textures.night, color: '#172243', side: THREE.BackSide })
    );
    scene.add(background);
    addPaperStars(scene);
    scene.add(createStitchedRoute());

    scene.add(new THREE.HemisphereLight('#fff0c4', '#192346', 1.65));
    const keyLight = new THREE.DirectionalLight('#ffe8b0', 2.7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight, keyLight.target);

    const planets = PLANET_KEYS.map((key) => {
        const anchor = PLANET_ANCHORS[key];
        const planet = createLowPolyPlanet(key);
        planet.userData.baseY = anchor.y;
        planet.userData.baseZ = anchor.z;
        planet.userData.baseScale = 1.7;
        planet.position.set(anchor.x, anchor.y, anchor.z);
        planet.scale.setScalar(planet.userData.baseScale);
        scene.add(planet);
        return planet;
    });

    const rocket = createPaperShip();
    rocket.position.set(0, 0, 7);
    scene.add(rocket);

    const runtime = {
        elapsed: 0,
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
    };

    function resize() {
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
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
        runtime.desiredCamera.copy(runtime.shipPosition)
            .addScaledVector(runtime.forward, -CHASE_CAMERA_LAYOUT.distance)
            .addScaledVector(runtime.up, CHASE_CAMERA_LAYOUT.verticalOffset);
        runtime.cameraPosition.lerp(runtime.desiredCamera, 1 - Math.exp(-5.2 * delta));
        camera.position.copy(runtime.cameraPosition);
        camera.quaternion.copy(runtime.flightQuaternion);

        keyLight.position.copy(camera.position).add(runtime.lightOffset);
        keyLight.target.position.copy(runtime.shipPosition);
        runtime.activeIndex = PLANET_KEYS.indexOf(flightState.nearbyPlanetKey);
    }

    function update(deltaSeconds) {
        const delta = Math.min(Math.max(deltaSeconds, 0), 0.1);
        runtime.elapsed += delta;
        planets.forEach((planet, index) => {
            planet.position.y = planet.userData.baseY + Math.sin(runtime.elapsed * 0.44 + planet.userData.phase) * 0.055;
            planet.rotation.y += delta * (0.035 + index * 0.008);
            const selectedScale = planet.userData.baseScale * (index === runtime.activeIndex ? 1.045 : 1);
            planet.scale.lerp(new THREE.Vector3(selectedScale, selectedScale, selectedScale), Math.min(1, delta * 4));
        });
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
            cameraForward: Object.fromEntries(
                Object.entries(getNavigationBasis().forward)
                    .map(([key, value]) => [key, Number(value.toFixed(3))])
            ),
            contextLost: runtime.contextLost
        };
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
    window.addEventListener('resize', resize);
    resize();

    function destroy() {
        window.removeEventListener('resize', resize);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        scene.traverse((object) => {
            object.geometry?.dispose?.();
            if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
            else object.material?.dispose?.();
        });
        Object.values(textures).forEach((texture) => texture.dispose());
        renderer.dispose();
        renderer.domElement.remove();
    }

    return { setFlightSnapshot, update, render, resize, getNavigationBasis, getState, destroy };
}
