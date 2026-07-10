import * as THREE from 'three';
import { PLANET_ANCHORS } from '../flightSimulation.js';
import { createPaperPlanet } from './createPaperPlanet.js';
import { createPaperTextures } from './paperTextures.js';

const PLANET_KEYS = ['sun', 'earth', 'saturn'];
const PLANET_X = PLANET_KEYS.map((key) => PLANET_ANCHORS[key].x);

function smoothStep(value) {
    return value * value * (3 - (2 * value));
}

function makeRocket(textures) {
    const group = new THREE.Group();
    group.name = 'cardboard-rocket';

    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.55, -0.2);
    bodyShape.lineTo(0.35, -0.2);
    bodyShape.lineTo(0.72, 0);
    bodyShape.lineTo(0.35, 0.2);
    bodyShape.lineTo(-0.55, 0.2);
    bodyShape.closePath();
    const body = new THREE.Mesh(
        new THREE.ShapeGeometry(bodyShape),
        new THREE.MeshStandardMaterial({ map: textures.cream, roughness: 0.95, side: THREE.DoubleSide })
    );
    body.castShadow = true;

    const windowMesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.115, 20),
        new THREE.MeshStandardMaterial({ color: '#4388b8', roughness: 0.92 })
    );
    windowMesh.position.set(0.18, 0, 0.04);

    const finShape = new THREE.Shape();
    finShape.moveTo(-0.3, -0.18);
    finShape.lineTo(-0.55, -0.48);
    finShape.lineTo(-0.02, -0.2);
    finShape.closePath();
    const finMaterial = new THREE.MeshStandardMaterial({ map: textures.coral, roughness: 0.96, side: THREE.DoubleSide });
    const lowerFin = new THREE.Mesh(new THREE.ShapeGeometry(finShape), finMaterial);
    lowerFin.position.z = -0.01;
    const upperFin = lowerFin.clone();
    upperFin.scale.y = -1;

    const flameShape = new THREE.Shape();
    flameShape.moveTo(-0.54, -0.13);
    flameShape.lineTo(-0.96, 0);
    flameShape.lineTo(-0.54, 0.13);
    flameShape.closePath();
    const flame = new THREE.Mesh(
        new THREE.ShapeGeometry(flameShape),
        new THREE.MeshBasicMaterial({ color: '#f5b83d', side: THREE.DoubleSide })
    );
    flame.position.z = -0.02;
    flame.name = 'rocket-flame';

    group.add(flame, lowerFin, upperFin, body, windowMesh);
    group.scale.setScalar(0.72);
    return group;
}

function addPunchedStars(scene) {
    const starMaterial = new THREE.MeshBasicMaterial({ color: '#fff1bd', side: THREE.DoubleSide });
    const blueMaterial = new THREE.MeshBasicMaterial({ color: '#6379a8', side: THREE.DoubleSide });
    let seed = 9127;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };

    for (let index = 0; index < 112; index += 1) {
        const radius = 0.018 + random() * 0.052;
        const geometry = new THREE.CircleGeometry(radius, index % 3 === 0 ? 5 : 10);
        const star = new THREE.Mesh(geometry, index % 8 === 0 ? blueMaterial : starMaterial);
        star.position.set(-22 + random() * 44, -7 + random() * 14, -2.2 + random() * 0.15);
        star.rotation.z = random() * Math.PI;
        scene.add(star);
    }
}

function createStitchedOrbit() {
    const points = Array.from({ length: 121 }, (_, index) => {
        const progress = index / 120;
        const x = -10 + progress * 20;
        const y = -2.35 + Math.sin(progress * Math.PI * 3) * 0.22;
        return new THREE.Vector3(x, y, -0.7);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
        geometry,
        new THREE.LineDashedMaterial({
            color: '#d8ca9e',
            dashSize: 0.13,
            gapSize: 0.11,
            transparent: true,
            opacity: 0.58
        })
    );
    line.computeLineDistances();
    return line;
}

export function createPaperScene(stage) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101936');

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    camera.position.set(PLANET_X[0], 0.25, 14);
    camera.lookAt(PLANET_X[0], 0.25, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);

    const textures = createPaperTextures(renderer);
    const background = new THREE.Mesh(
        new THREE.PlaneGeometry(52, 23),
        new THREE.MeshBasicMaterial({ map: textures.night, color: '#162142', side: THREE.DoubleSide })
    );
    background.position.set(0, 0, -2.45);
    scene.add(background);
    addPunchedStars(scene);

    scene.add(new THREE.HemisphereLight('#fff0c4', '#192346', 1.55));
    const keyLight = new THREE.DirectionalLight('#ffe8b0', 2.8);
    keyLight.position.set(-5, 7, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    const planets = PLANET_KEYS.map((key) => {
        const anchor = PLANET_ANCHORS[key];
        const planet = createPaperPlanet(key, textures);
        planet.userData.baseY = anchor.y;
        planet.userData.baseZ = anchor.z;
        planet.position.set(anchor.x, anchor.y, anchor.z);
        scene.add(planet);
        return planet;
    });

    scene.add(createStitchedOrbit());
    const rocket = makeRocket(textures);
    rocket.position.set(PLANET_X[0], -2.1, 0.3);
    scene.add(rocket);

    const runtime = {
        elapsed: 0,
        activeIndex: 0,
        cameraX: PLANET_X[0],
        flightMode: false,
        cameraOrbit: { yaw: 0, pitch: 0 },
        cameraFocus: new THREE.Vector3(PLANET_X[0], -2.1, 0.3),
        cameraPosition: new THREE.Vector3(PLANET_X[0], 0.25, 14),
        contextLost: false,
        transition: {
            active: false,
            fromX: PLANET_X[0],
            toX: PLANET_X[0],
            fromIndex: 0,
            toIndex: 0,
            elapsed: 0,
            duration: 1.12
        }
    };

    function resize() {
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }

    function setActivePlanet(index, { immediate = false, reducedMotion = false } = {}) {
        runtime.flightMode = false;
        const targetIndex = Math.max(0, Math.min(PLANET_X.length - 1, index));
        runtime.activeIndex = targetIndex;
        if (immediate || reducedMotion) {
            runtime.transition.active = false;
            runtime.cameraX = PLANET_X[targetIndex];
            rocket.position.set(PLANET_X[targetIndex], -2.1, 0.3);
            return;
        }

        runtime.transition = {
            active: true,
            fromX: runtime.cameraX,
            toX: PLANET_X[targetIndex],
            fromIndex: runtime.transition.toIndex,
            toIndex: targetIndex,
            elapsed: 0,
            duration: 1.12
        };
        rocket.scale.x = runtime.transition.toX >= runtime.transition.fromX ? 0.72 : -0.72;
    }

    function setFlightSnapshot(flightState, cameraOrbit, deltaSeconds) {
        const delta = Math.min(Math.max(deltaSeconds, 0), 0.1);
        runtime.flightMode = true;
        runtime.cameraOrbit.yaw = THREE.MathUtils.clamp(cameraOrbit.yaw, -0.34, 0.34);
        runtime.cameraOrbit.pitch = THREE.MathUtils.clamp(cameraOrbit.pitch, -0.18, 0.18);

        const speed = Math.hypot(flightState.velocity.x, flightState.velocity.y);
        rocket.position.set(flightState.position.x, flightState.position.y, flightState.position.z + 0.38);
        if (speed > 0.035) {
            const heading = Math.atan2(flightState.velocity.y, flightState.velocity.x);
            const angleDelta = Math.atan2(
                Math.sin(heading - rocket.rotation.z),
                Math.cos(heading - rocket.rotation.z)
            );
            rocket.rotation.z += angleDelta * Math.min(1, delta * 8);
        }
        rocket.rotation.x = THREE.MathUtils.lerp(
            rocket.rotation.x,
            -flightState.velocity.y * 0.035,
            Math.min(1, delta * 6)
        );

        const flame = rocket.getObjectByName('rocket-flame');
        if (flame) {
            flame.visible = speed > 0.06;
            flame.scale.x = 0.7 + Math.min(1, speed / 3.9) * 0.48 + Math.sin(runtime.elapsed * 28) * 0.08;
        }

        const lookAhead = new THREE.Vector3(
            flightState.velocity.x * 0.24,
            flightState.velocity.y * 0.24,
            0
        );
        const desiredFocus = new THREE.Vector3(
            flightState.position.x,
            flightState.position.y,
            flightState.position.z
        ).add(lookAhead);
        runtime.cameraFocus.lerp(desiredFocus, 1 - Math.exp(-6 * delta));

        const yaw = runtime.cameraOrbit.yaw;
        const pitch = runtime.cameraOrbit.pitch;
        const distance = 11.6;
        const desiredCamera = new THREE.Vector3(
            runtime.cameraFocus.x + Math.sin(yaw) * distance,
            runtime.cameraFocus.y + 0.65 + Math.sin(pitch) * distance,
            runtime.cameraFocus.z + Math.cos(yaw) * Math.cos(pitch) * distance
        );
        runtime.cameraPosition.lerp(desiredCamera, 1 - Math.exp(-4.5 * delta));
        camera.position.copy(runtime.cameraPosition);
        camera.lookAt(runtime.cameraFocus);

        runtime.activeIndex = PLANET_KEYS.indexOf(flightState.nearbyPlanetKey);
    }

    function update(deltaSeconds) {
        const delta = Math.min(Math.max(deltaSeconds, 0), 0.1);
        runtime.elapsed += delta;

        planets.forEach((planet, index) => {
            const float = Math.sin(runtime.elapsed * 0.72 + planet.userData.phase) * 0.045;
            planet.position.y = planet.userData.baseY + float;
            planet.rotation.z += (index % 2 === 0 ? 1 : -1) * delta * 0.006;
            if (!runtime.transition.active) {
                const selectedScale = index === runtime.activeIndex ? 1.035 : 1;
                planet.scale.lerp(new THREE.Vector3(selectedScale, selectedScale, 1), Math.min(1, delta * 5));
                planet.position.z = THREE.MathUtils.lerp(
                    planet.position.z,
                    planet.userData.baseZ,
                    Math.min(1, delta * 8)
                );
            }
        });

        if (!runtime.flightMode && runtime.transition.active) {
            runtime.transition.elapsed += delta;
            const linear = Math.min(1, runtime.transition.elapsed / runtime.transition.duration);
            const eased = smoothStep(linear);
            runtime.cameraX = THREE.MathUtils.lerp(runtime.transition.fromX, runtime.transition.toX, eased);
            rocket.position.x = runtime.cameraX;
            rocket.position.y = -2.1 + Math.sin(linear * Math.PI) * 0.72;
            const flame = rocket.getObjectByName('rocket-flame');
            if (flame) flame.scale.x = 0.82 + Math.sin(runtime.elapsed * 32) * 0.18;

            const destination = planets[runtime.transition.toIndex];
            const lift = Math.sin(linear * Math.PI);
            destination.position.z = destination.userData.baseZ + lift * 0.28;
            destination.scale.setScalar(1 + lift * 0.055);

            if (linear >= 1) {
                runtime.transition.active = false;
                runtime.cameraX = runtime.transition.toX;
                rocket.position.set(runtime.cameraX, -2.1, 0.3);
                rocket.scale.x = 0.72;
            }
        }

        if (!runtime.flightMode) {
            camera.position.x = runtime.cameraX;
            camera.lookAt(runtime.cameraX, 0.25, 0);
        }
    }

    function render() {
        if (!runtime.contextLost) renderer.render(scene, camera);
    }

    function getState() {
        return {
            activeIndex: runtime.activeIndex,
            mode: runtime.flightMode ? 'flight' : 'rail',
            cameraX: Number(runtime.cameraX.toFixed(3)),
            camera: {
                x: Number(camera.position.x.toFixed(3)),
                y: Number(camera.position.y.toFixed(3)),
                z: Number(camera.position.z.toFixed(3)),
                yaw: Number(runtime.cameraOrbit.yaw.toFixed(3)),
                pitch: Number(runtime.cameraOrbit.pitch.toFixed(3))
            },
            rocket: {
                x: Number(rocket.position.x.toFixed(3)),
                y: Number(rocket.position.y.toFixed(3)),
                z: Number(rocket.position.z.toFixed(3)),
                heading: Number(rocket.rotation.z.toFixed(3))
            },
            transitionActive: runtime.transition.active,
            transitionProgress: runtime.transition.active
                ? Number(Math.min(1, runtime.transition.elapsed / runtime.transition.duration).toFixed(3))
                : 1,
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

    return { setActivePlanet, setFlightSnapshot, update, render, resize, getState, destroy };
}
