/**
 * IntroAnimation - Cinematic flythrough of the solar system
 * High-quality 8-second camera flight with post-processing,
 * real planet textures, atmospheric effects, and particle trails.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Texture URLs from the project's public/textures folder
const TEXTURES = {
    sun: '/textures/sun_real.jpg',
    mercury: '/textures/mercurymap.jpg',
    venus: '/textures/venusmap.jpg',
    earth: '/textures/earthmap1k.jpg',
    mars: '/textures/marsmap1k.jpg',
    jupiter: '/textures/jupitermap.jpg',
    saturn: '/textures/saturnmap.jpg',
    uranus: '/textures/uranusmap.jpg',
    neptune: '/textures/neptunemap.jpg',
    moon: '/textures/moonmap1k.jpg',
};

export class IntroAnimation {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 80000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(w, h);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.clock = new THREE.Clock();
        this.duration = 8;
        this.elapsed = 0;
        this.isComplete = false;
        this.isStopped = false;
        this.onComplete = null;
        this.planets = [];
        this.speedParticles = null;
        this.textureLoader = new THREE.TextureLoader();

        this._onResize = this._handleResize.bind(this);
        window.addEventListener('resize', this._onResize);

        this.setupPostProcessing(w, h);
        this.setupScene();
        this.createCameraPath();
        this.createCockpitOverlay();
    }

    setupPostProcessing(w, h) {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom for Sun glow, planet atmospheres, and star sparkle
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(w, h),
            1.8,   // strength - strong bloom for cinematic feel
            0.6,   // radius
            0.4    // threshold - low to catch planet glows
        );
        this.composer.addPass(this.bloomPass);
    }

    setupScene() {
        // Deep space background with subtle nebula color
        this.scene.background = new THREE.Color(0x020208);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.00003);

        this._createStarfield();
        this._createNebula();
        this._createSun();
        this._createPlanets();
        this._createAsteroidBelt();
        this._createSpeedParticles();
        this._createComet();

        // Lighting
        const ambient = new THREE.AmbientLight(0x1a1a3a, 0.3);
        this.scene.add(ambient);

        // Sun light - warm, high intensity
        this.sunLight = new THREE.PointLight(0xfff0dd, 4, 8000, 0.3);
        this.sunLight.position.set(0, 0, 0);
        this.scene.add(this.sunLight);

        // Subtle fill light from behind (rim light for planets)
        const fillLight = new THREE.DirectionalLight(0x4466aa, 0.15);
        fillLight.position.set(-500, 200, -500);
        this.scene.add(fillLight);
    }

    _createStarfield() {
        // Multi-layer starfield with varying sizes and colors
        const layers = [
            { count: 3000, minR: 5000, maxR: 15000, size: 1.5, color: 0xffffff },   // Distant small white
            { count: 2000, minR: 4000, maxR: 10000, size: 3.0, color: 0xffffff },   // Medium white
            { count: 500,  minR: 3000, maxR: 8000,  size: 5.0, color: 0xaaccff },   // Bright blue-white
            { count: 200,  minR: 3000, maxR: 8000,  size: 4.0, color: 0xffddaa },   // Warm yellow
            { count: 100,  minR: 2000, maxR: 6000,  size: 6.0, color: 0xff8866 },   // Red giants
        ];

        layers.forEach(layer => {
            const geo = new THREE.BufferGeometry();
            const positions = new Float32Array(layer.count * 3);
            const colors = new Float32Array(layer.count * 3);
            const sizes = new Float32Array(layer.count);
            const baseColor = new THREE.Color(layer.color);

            for (let i = 0; i < layer.count; i++) {
                const r = layer.minR + Math.random() * (layer.maxR - layer.minR);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);

                // Slight color variation per star
                const variation = 0.8 + Math.random() * 0.4;
                colors[i * 3] = baseColor.r * variation;
                colors[i * 3 + 1] = baseColor.g * variation;
                colors[i * 3 + 2] = baseColor.b * variation;

                sizes[i] = layer.size * (0.5 + Math.random());
            }

            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            const mat = new THREE.PointsMaterial({
                size: layer.size,
                sizeAttenuation: true,
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
            });
            this.scene.add(new THREE.Points(geo, mat));
        });
    }

    _createNebula() {
        // Nebula clouds using large semi-transparent sprites
        const nebulaColors = [0x331155, 0x113355, 0x220044, 0x003344, 0x441133];
        nebulaColors.forEach((color, i) => {
            const geo = new THREE.SphereGeometry(800 + i * 200, 8, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.03 + i * 0.005,
                side: THREE.BackSide,
                depthWrite: false,
            });
            const nebula = new THREE.Mesh(geo, mat);
            nebula.position.set(
                (Math.random() - 0.5) * 4000,
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 3000
            );
            this.scene.add(nebula);
        });
    }

    _createSun() {
        // Sun with real texture (or fallback emissive)
        const sunGeo = new THREE.SphereGeometry(35, 64, 64);
        const sunTex = this.textureLoader.load(TEXTURES.sun);
        const sunMat = new THREE.MeshBasicMaterial({ map: sunTex, color: 0xffcc66 });
        this.sun = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(this.sun);

        // Inner corona glow
        const glow1Geo = new THREE.SphereGeometry(55, 32, 32);
        const glow1Mat = new THREE.MeshBasicMaterial({
            color: 0xffdd44,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        this.sunGlowInner = new THREE.Mesh(glow1Geo, glow1Mat);
        this.scene.add(this.sunGlowInner);

        // Outer corona
        const glow2Geo = new THREE.SphereGeometry(90, 32, 32);
        const glow2Mat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        this.sunGlowOuter = new THREE.Mesh(glow2Geo, glow2Mat);
        this.scene.add(this.sunGlowOuter);

        // Solar flare ring (flat disc)
        const flareGeo = new THREE.RingGeometry(36, 100, 64);
        const flareMat = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.03,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });
        this.solarFlare = new THREE.Mesh(flareGeo, flareMat);
        this.solarFlare.rotation.x = Math.PI / 2;
        this.scene.add(this.solarFlare);
    }

    _createPlanets() {
        const planetDefs = [
            { name: 'mercury', radius: 1.2, distance: 90, y: -1, texture: TEXTURES.mercury },
            { name: 'venus', radius: 2.8, distance: 145, y: 3, color: 0xdeb887, atmosphere: 0xffeeaa },
            { name: 'earth', radius: 2.8, distance: 210, y: -2, texture: TEXTURES.earth, atmosphere: 0x4488ff, hasMoon: true },
            { name: 'mars', radius: 2.0, distance: 290, y: 4, texture: TEXTURES.mars, atmosphere: 0xff6644 },
            { name: 'jupiter', radius: 14, distance: 580, y: -6, texture: TEXTURES.jupiter },
            { name: 'saturn', radius: 11, distance: 800, y: 8, texture: TEXTURES.saturn, hasRing: true },
            { name: 'uranus', radius: 7, distance: 1020, y: -10, texture: TEXTURES.uranus, tilted: true, atmosphere: 0x66ffee },
            { name: 'neptune', radius: 7, distance: 1250, y: 5, texture: TEXTURES.neptune, atmosphere: 0x4488ff },
        ];

        planetDefs.forEach(def => {
            const geo = new THREE.SphereGeometry(def.radius, 48, 48);
            let mat;

            if (def.texture) {
                const tex = this.textureLoader.load(def.texture);
                mat = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: 0.6,
                    metalness: 0.1,
                });
            } else {
                mat = new THREE.MeshStandardMaterial({ color: def.color || 0x888888, roughness: 0.6, metalness: 0.15 });
            }

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(def.distance, def.y, 15 + Math.sin(def.distance * 0.01) * 20);
            mesh.castShadow = true;
            this.scene.add(mesh);

            const planetObj = { mesh, def };

            // Atmospheric glow (rim light effect)
            if (def.atmosphere) {
                const atmosGeo = new THREE.SphereGeometry(def.radius * 1.15, 32, 32);
                const atmosMat = new THREE.MeshBasicMaterial({
                    color: def.atmosphere,
                    transparent: true,
                    opacity: 0.08,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                });
                const atmos = new THREE.Mesh(atmosGeo, atmosMat);
                atmos.position.copy(mesh.position);
                this.scene.add(atmos);
                planetObj.atmosphere = atmos;
            }

            // Earth's Moon
            if (def.hasMoon) {
                const moonGeo = new THREE.SphereGeometry(0.7, 24, 24);
                let moonMat;
                try {
                    const moonTex = this.textureLoader.load(TEXTURES.moon);
                    moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 });
                } catch {
                    moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
                }
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.position.set(def.distance + 6, def.y + 1, 18);
                this.scene.add(moon);
                planetObj.moon = moon;
            }

            // Saturn's Rings (multi-band with transparency gradient)
            if (def.hasRing) {
                const ringColors = [
                    { inner: 1.2, outer: 1.5, color: 0xd4c5a0, opacity: 0.3 },
                    { inner: 1.5, outer: 1.8, color: 0xfff8dc, opacity: 0.5 },
                    { inner: 1.8, outer: 2.0, color: 0xdac292, opacity: 0.35 },
                    { inner: 2.05, outer: 2.3, color: 0xc9b88c, opacity: 0.2 },
                ];
                ringColors.forEach(ring => {
                    const rGeo = new THREE.RingGeometry(def.radius * ring.inner, def.radius * ring.outer, 128);
                    const rMat = new THREE.MeshBasicMaterial({
                        color: ring.color,
                        transparent: true,
                        opacity: ring.opacity,
                        side: THREE.DoubleSide,
                    });
                    const rMesh = new THREE.Mesh(rGeo, rMat);
                    rMesh.position.copy(mesh.position);
                    rMesh.rotation.x = Math.PI * 0.38;
                    rMesh.rotation.y = Math.PI * 0.05;
                    this.scene.add(rMesh);
                });
            }

            if (def.tilted) {
                mesh.rotation.z = Math.PI * 0.45;
                // Add Uranus thin ring
                const uRingGeo = new THREE.RingGeometry(def.radius * 1.3, def.radius * 1.35, 64);
                const uRingMat = new THREE.MeshBasicMaterial({
                    color: 0x88ddcc,
                    transparent: true,
                    opacity: 0.15,
                    side: THREE.DoubleSide,
                });
                const uRing = new THREE.Mesh(uRingGeo, uRingMat);
                uRing.position.copy(mesh.position);
                uRing.rotation.x = Math.PI * 0.5;
                uRing.rotation.z = Math.PI * 0.45;
                this.scene.add(uRing);
            }

            this.planets.push(planetObj);
        });
    }

    _createAsteroidBelt() {
        const count = 400;
        const geo = new THREE.IcosahedronGeometry(0.4, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x887766, roughness: 1.0, metalness: 0.3 });
        this.asteroidMesh = new THREE.InstancedMesh(geo, mat, count);

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        for (let i = 0; i < count; i++) {
            const dist = 360 + Math.random() * 160;
            const angle = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 40;
            dummy.position.set(
                dist + Math.cos(angle) * 40,
                y,
                Math.sin(angle) * 40 + 15
            );
            const s = 0.2 + Math.random() * 1.5;
            dummy.scale.set(s, s * (0.6 + Math.random() * 0.8), s);
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            dummy.updateMatrix();
            this.asteroidMesh.setMatrixAt(i, dummy.matrix);

            // Color variation (gray to brown)
            color.setHSL(0.08, 0.1 + Math.random() * 0.2, 0.3 + Math.random() * 0.3);
            this.asteroidMesh.setColorAt(i, color);
        }
        this.asteroidMesh.instanceMatrix.needsUpdate = true;
        this.asteroidMesh.instanceColor.needsUpdate = true;
        this.scene.add(this.asteroidMesh);
    }

    _createSpeedParticles() {
        // Particles that streak past the camera to convey speed
        const count = 600;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = Math.random() * 300 - 150;
            velocities[i * 3] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 2] = -(5 + Math.random() * 15); // Fly backward
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this._speedVelocities = velocities;

        const mat = new THREE.PointsMaterial({
            color: 0xaaccff,
            size: 0.8,
            transparent: true,
            opacity: 0.0, // Start invisible, fade in during acceleration
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
        this.speedParticles = new THREE.Points(geo, mat);
        this.scene.add(this.speedParticles);
    }

    _createComet() {
        // A comet with a glowing tail that streaks past during the flyby
        const cometGroup = new THREE.Group();

        // Nucleus
        const nucleusGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xddffff });
        cometGroup.add(new THREE.Mesh(nucleusGeo, nucleusMat));

        // Coma glow
        const comaGeo = new THREE.SphereGeometry(4, 16, 16);
        const comaMat = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
        });
        cometGroup.add(new THREE.Mesh(comaGeo, comaMat));

        // Tail particles
        const tailCount = 80;
        const tailGeo = new THREE.BufferGeometry();
        const tailPos = new Float32Array(tailCount * 3);
        const tailColors = new Float32Array(tailCount * 3);
        for (let i = 0; i < tailCount; i++) {
            const t = i / tailCount;
            tailPos[i * 3] = -t * 60 + (Math.random() - 0.5) * t * 10;
            tailPos[i * 3 + 1] = (Math.random() - 0.5) * t * 8;
            tailPos[i * 3 + 2] = (Math.random() - 0.5) * t * 8;
            const intensity = 1 - t;
            tailColors[i * 3] = 0.5 * intensity;
            tailColors[i * 3 + 1] = 0.8 * intensity;
            tailColors[i * 3 + 2] = 1.0 * intensity;
        }
        tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
        tailGeo.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
        const tailMat = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
        cometGroup.add(new THREE.Points(tailGeo, tailMat));

        // Start position (flies across the scene during animation)
        cometGroup.position.set(-200, 80, -300);
        this.comet = cometGroup;
        this.scene.add(cometGroup);
    }

    createCameraPath() {
        // Longer, more dramatic S-curve with closer planet passes
        this.path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-20, 30, -600),       // Start: dark space, slightly offset
            new THREE.Vector3(-10, 15, -200),        // Drift forward
            new THREE.Vector3(10, 8, -40),           // Close to Sun - dramatic
            new THREE.Vector3(80, 5, 60),            // Sweep past Mercury/Venus
            new THREE.Vector3(200, 3, 30),           // Close to Earth
            new THREE.Vector3(350, 8, 50),           // Through asteroid belt
            new THREE.Vector3(580, 15, -10),         // Past Jupiter (close!)
            new THREE.Vector3(810, 5, 25),           // Saturn rings flyby
            new THREE.Vector3(1050, 18, 0),          // Uranus/Neptune
            new THREE.Vector3(1300, 40, -30),        // Pull away
            new THREE.Vector3(1600, 120, -10),       // High vantage reveal
        ], false, 'catmullrom', 0.3);
    }

    createCockpitOverlay() {
        // HTML/CSS cockpit frame overlay - simulates being inside a spaceship
        this.cockpit = document.createElement('div');
        this.cockpit.className = 'intro-cockpit';
        this.cockpit.innerHTML = `
            <div class="cockpit-frame">
                <!-- Top bar with ship systems -->
                <div class="cockpit-top">
                    <div class="cockpit-display left">
                        <span class="cockpit-label">NAV</span>
                        <span class="cockpit-value" id="cockpit-nav">AUTOPILOT</span>
                    </div>
                    <div class="cockpit-display center">
                        <span class="cockpit-label">SYSTEM</span>
                        <span class="cockpit-value" id="cockpit-system">SOLAR SYSTEM EXPLORER</span>
                    </div>
                    <div class="cockpit-display right">
                        <span class="cockpit-label">SPEED</span>
                        <span class="cockpit-value" id="cockpit-speed">0 km/s</span>
                    </div>
                </div>
                <!-- Bottom panel with controls silhouette -->
                <div class="cockpit-bottom">
                    <div class="cockpit-panel-left">
                        <div class="cockpit-gauge"></div>
                        <div class="cockpit-gauge small"></div>
                    </div>
                    <div class="cockpit-panel-center">
                        <div class="cockpit-crosshair">+</div>
                    </div>
                    <div class="cockpit-panel-right">
                        <div class="cockpit-gauge"></div>
                        <div class="cockpit-gauge small"></div>
                    </div>
                </div>
                <!-- Side pillars (window frame) -->
                <div class="cockpit-pillar left-pillar"></div>
                <div class="cockpit-pillar right-pillar"></div>
            </div>
        `;
        this.container.appendChild(this.cockpit);

        // Store refs for animation updates
        this._cockpitSpeed = this.cockpit.querySelector('#cockpit-speed');
        this._cockpitNav = this.cockpit.querySelector('#cockpit-nav');
        this._cockpitSystem = this.cockpit.querySelector('#cockpit-system');
    }

    _updateCockpit(t) {
        if (!this._cockpitSpeed) return;

        // Simulate speed readout
        const speedCurve = Math.sin(t * Math.PI) * (t < 0.85 ? 1 : (1 - (t - 0.85) / 0.15));
        const speed = Math.round(speedCurve * 299792); // up to light speed
        this._cockpitSpeed.textContent = speed > 1000 ? `${(speed / 1000).toFixed(1)}k km/s` : `${speed} km/s`;

        // Nav status changes
        if (t < 0.1) this._cockpitNav.textContent = 'ENGAGING';
        else if (t < 0.85) this._cockpitNav.textContent = 'WARP ACTIVE';
        else this._cockpitNav.textContent = 'ARRIVING';

        // Glow the displays more at high speed
        const intensity = Math.min(speedCurve * 1.5, 1);
        this.cockpit.style.setProperty('--cockpit-glow', `rgba(100, 180, 255, ${intensity * 0.3})`);
    }

    update() {
        if (this.isStopped) return;

        const dt = this.clock.getDelta();
        this.elapsed += Math.min(dt, 0.1);
        const t = Math.min(this.elapsed / this.duration, 1);

        // Smooth ease-in-out with slight slow at Sun pass
        const eased = t < 0.15
            ? 8 * t * t * t   // Slow start
            : t < 0.5
                ? 2 * t * t
                : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Camera position
        const pos = this.path.getPoint(eased);
        this.camera.position.copy(pos);

        // Camera look direction
        if (t < 0.85) {
            const lookPoint = this.path.getPoint(Math.min(eased + 0.025, 1));
            this.camera.lookAt(lookPoint);
        } else {
            // Final reveal: look back at the Sun
            const lookAhead = this.path.getPoint(Math.min(eased + 0.025, 1));
            const sunPos = new THREE.Vector3(0, 0, 0);
            const blend = (t - 0.85) / 0.15;
            const smoothBlend = blend * blend * (3 - 2 * blend); // smoothstep
            const lookTarget = lookAhead.clone().lerp(sunPos, smoothBlend);
            this.camera.lookAt(lookTarget);
        }

        // Subtle camera roll for cinematic feel
        this.camera.rotation.z = Math.sin(t * Math.PI * 2) * 0.02;

        const time = this.elapsed;

        // Animate planets
        this.planets.forEach(p => {
            p.mesh.rotation.y += dt * 0.4;
            if (p.moon) {
                const ep = p.mesh.position;
                p.moon.position.x = ep.x + Math.cos(time * 1.5) * 6;
                p.moon.position.z = ep.z + Math.sin(time * 1.5) * 6;
                p.moon.rotation.y += dt * 0.3;
            }
            if (p.atmosphere) {
                const pulse = 1 + Math.sin(time * 2 + p.def.distance * 0.01) * 0.03;
                p.atmosphere.scale.setScalar(pulse);
            }
        });

        // Asteroid belt rotation
        if (this.asteroidMesh) {
            this.asteroidMesh.rotation.y += dt * 0.03;
        }

        // Sun animation
        if (this.sun) this.sun.rotation.y += dt * 0.1;
        if (this.sunGlowInner) {
            this.sunGlowInner.material.opacity = 0.1 + Math.sin(time * 3) * 0.04;
            const s = 1 + Math.sin(time * 2) * 0.04;
            this.sunGlowInner.scale.set(s, s, s);
        }
        if (this.sunGlowOuter) {
            this.sunGlowOuter.material.opacity = 0.04 + Math.sin(time * 1.5 + 1) * 0.02;
        }
        if (this.solarFlare) {
            this.solarFlare.rotation.z += dt * 0.2;
            this.solarFlare.material.opacity = 0.02 + Math.sin(time * 4) * 0.01;
        }

        // Speed particles - visible during acceleration (t 0.1 to 0.7)
        if (this.speedParticles) {
            const speedIntensity = t > 0.05 && t < 0.75 ? Math.sin((t - 0.05) / 0.7 * Math.PI) * 0.6 : 0;
            this.speedParticles.material.opacity = speedIntensity;

            // Move particles relative to camera
            this.speedParticles.position.copy(this.camera.position);
            this.speedParticles.quaternion.copy(this.camera.quaternion);
        }

        // Comet flies across during mid-section
        if (this.comet) {
            const cometT = (t - 0.2) / 0.5; // active from t=0.2 to t=0.7
            if (cometT > 0 && cometT < 1) {
                const ct = cometT * cometT * (3 - 2 * cometT); // smoothstep
                this.comet.position.set(
                    -200 + ct * 1600,
                    80 - ct * 60 + Math.sin(ct * Math.PI) * 30,
                    -300 + ct * 400
                );
                this.comet.visible = true;
            } else {
                this.comet.visible = false;
            }
        }

        // Dynamic bloom adjustment - stronger near the Sun
        if (this.bloomPass) {
            const distToSun = this.camera.position.length();
            if (distToSun < 200) {
                this.bloomPass.strength = 2.5;
                this.renderer.toneMappingExposure = 1.3;
            } else {
                this.bloomPass.strength = 1.5;
                this.renderer.toneMappingExposure = 1.0;
            }
        }

        this.composer.render();

        // Update cockpit HUD
        this._updateCockpit(t);

        if (t >= 1 && !this.isComplete) {
            this.isComplete = true;
            if (this.onComplete) this.onComplete();
        }

        if (!this.isStopped) {
            this._rafId = requestAnimationFrame(() => this.update());
        }
    }

    start() {
        return new Promise(resolve => {
            this.onComplete = resolve;
            const w = this.container.clientWidth || window.innerWidth;
            const h = this.container.clientHeight || window.innerHeight;
            this.renderer.setSize(w, h);
            this.container.appendChild(this.renderer.domElement);
            this.clock.start();
            this.update();
        });
    }

    skip() {
        this.isStopped = true;
        if (this._rafId) cancelAnimationFrame(this._rafId);

        const finalPos = this.path.getPoint(1);
        this.camera.position.copy(finalPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        if (this.speedParticles) this.speedParticles.visible = false;
        if (this.comet) this.comet.visible = false;
        this.composer.render();

        if (!this.isComplete) {
            this.isComplete = true;
            if (this.onComplete) this.onComplete();
        }
    }

    _handleResize() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.composer.setSize(w, h);
    }

    dispose() {
        this.isStopped = true;
        if (this._rafId) cancelAnimationFrame(this._rafId);
        window.removeEventListener('resize', this._onResize);

        this.scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(m => {
                    if (m.map) m.map.dispose();
                    m.dispose();
                });
            }
        });

        this.composer.dispose();
        this.renderer.dispose();
        if (this.renderer.domElement?.parentNode) {
            this.renderer.domElement.remove();
        }
        if (this.cockpit?.parentNode) {
            this.cockpit.remove();
        }
    }
}
