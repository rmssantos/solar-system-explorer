/**
 * Handles creation and animation of the Solar System objects.
 */
import * as THREE from 'three';
import { SOLAR_SYSTEM_DATA } from './data/objectsInfo.js';
import { resourceManager } from './resourceManager.js';
import { CometSystem } from './cometSystem.js';
import { ProbeSystem } from './probeSystem.js';
import { UFOSystem } from './ufoSystem.js';

export class SolarSystem {
    constructor(scene, uiManager, cameraControls) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.cameraControls = cameraControls;

        this.objects = {}; // Map of name -> Mesh/Group
        this.orbitSpeeds = {}; // Map of name -> speed
        this.distances = {};
        this.parents = {}; // Map of name -> parent Object3D

        // Raycaster for selection
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        // Exploration mode is intentionally non-realistic, but the Sun should not look smaller than Jupiter/Saturn.
        // Increasing this keeps Mercury outside the Sun while improving the overall look.
        this.sunScale = 1.25;

        // Groups
        this.solarSystemGroup = new THREE.Group();
        this.scene.add(this.solarSystemGroup);

        // Textures are loaded via resourceManager.loadTexture() (tracked + cached)

        // Shared materials (reuse instead of creating new instances)
        this._hitboxMaterial = new THREE.MeshBasicMaterial({
            transparent: true, opacity: 0, depthWrite: false
        });
        this._orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x444444, transparent: true, opacity: 0.3
        });

        // Pre-cached arrays for animation loop (avoid Object.entries/values per frame)
        this._orbitEntries = [];
        this._objectValues = [];

        // Reverse map: mesh → name for O(1) click lookup (built after scene creation)
        this._meshToName = new Map();

        // Accumulated time for UFO/probe animation (instead of Date.now())
        this._animTime = 0;

        // Lazy texture loading: outer planets load textures only when camera is close
        // Inner planets (sun, mercury, venus, earth, mars) load eagerly
        this._outerPlanets = new Set(['jupiter', 'saturn', 'uranus', 'neptune']);
        this._lazyTextureThreshold = 2000; // units
        this._lazyTextureMeshes = []; // { mesh, textureUrl, loaded }
        this._worldPos = new THREE.Vector3(); // reusable vector for distance checks
    }

    async createSolarSystem() {
        // 1. Create Starfield Background
        this.createStarfield();

        // 2. Create Sun
        const sunData = SOLAR_SYSTEM_DATA['sun'];
        const sunRadius = sunData.radiusKm * this.sunScale * 0.0001;
        const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);

        let sunMaterial;
        if (sunData.textureUrl) {
            const sunMap = resourceManager.loadTexture(sunData.textureUrl);
            sunMaterial = new THREE.MeshBasicMaterial({ map: sunMap, color: 0xffffff });
        } else {
            sunMaterial = new THREE.MeshBasicMaterial({ color: sunData.color });
        }

        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.frustumCulled = true;
        resourceManager.trackGeometry(sunGeometry);
        resourceManager.trackMaterial(sunMaterial);

        // Subtle corona/glow (visual only)
        const coronaGeom1 = new THREE.SphereGeometry(sunRadius * 1.12, 32, 32);
        const coronaMat1 = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const corona1 = new THREE.Mesh(coronaGeom1, coronaMat1);
        corona1.renderOrder = 1;
        sunMesh.add(corona1);

        const coronaGeom2 = new THREE.SphereGeometry(sunRadius * 1.25, 24, 24);
        const coronaMat2 = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.07,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const corona2 = new THREE.Mesh(coronaGeom2, coronaMat2);
        corona2.renderOrder = 1;
        sunMesh.add(corona2);

        this.solarSystemGroup.add(sunMesh);
        this.objects['sun'] = sunMesh;

        // 3. Create Planets and Moons
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            // Skip Sun, dwarf planets, space probes, and special objects (UFO)
            if (key !== 'sun' && 
                !data.isDwarfPlanet && 
                data.type !== 'Sonda Espacial' && 
                data.type !== 'Nave Alienígena' &&
                !data.isEasterEgg) {
                this.createPlanet(key, data, sunMesh);
            }
        }

        // 4. Create Asteroid Belt
        this.createAsteroidBelt();

        // 5. Create Dwarf Planets (after asteroid belt for visual order)
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            if (data.isDwarfPlanet) {
                this.createDwarfPlanet(key, data, sunMesh);
            }
        }

        // 6. Create Space Probes
        this._probeSystem = new ProbeSystem(this.solarSystemGroup, this.objects, this.parents, this._hitboxMaterial);
        this._probeSystem.createSpaceProbes();
        this.probes = this._probeSystem.probes;

        // 7. Create Easter Egg: UFO near Earth!
        this._ufoSystem = new UFOSystem(this.solarSystemGroup, this.objects, this._hitboxMaterial);
        this._ufoSystem.createUFO();

        // 8. Frustum culling hints: set bounding spheres on complex groups
        // This helps the renderer skip off-screen groups more efficiently
        this._setGroupBoundingSpheres();
    }

    /**
     * Set bounding spheres on complex groups (probes, UFO) to improve frustum culling.
     * Three.js uses these to quickly determine if a group is visible.
     */
    _setGroupBoundingSpheres() {
        // Probe groups: each probe is a small group of meshes
        if (this._probeSystem && this._probeSystem.probes) {
            for (const probe of this._probeSystem.probes) {
                if (probe.group) {
                    // Probes are scaled to 0.4, largest element is solar panel ~9 units
                    // Bounding sphere of ~15 units covers the whole probe comfortably
                    probe.group.traverse((child) => {
                        if (child.isMesh) {
                            child.frustumCulled = true;
                        }
                    });
                }
            }
        }

        // UFO group: classic saucer shape ~12 units wide (before 3x scale)
        if (this._ufoSystem && this._ufoSystem.ufoGroup) {
            this._ufoSystem.ufoGroup.traverse((child) => {
                if (child.isMesh) {
                    child.frustumCulled = true;
                }
            });
        }
    }

    createDwarfPlanet(name, data, sunMesh) {
        // Dwarf planets have dashed orbit lines and smaller scale
        const distance = data.avgDistanceFromSun * 2;

        const orbitGroup = new THREE.Group();
        this.solarSystemGroup.add(orbitGroup);

        // Dashed orbit line for dwarf planets
        const orbitCurve = new THREE.EllipseCurve(0, 0, distance, distance, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMaterial = new THREE.LineDashedMaterial({ 
            color: 0x666688, 
            transparent: true, 
            opacity: 0.4,
            dashSize: 20,
            gapSize: 10
        });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        orbitLine.computeLineDistances();
        orbitLine.rotation.x = Math.PI / 2;
        this.solarSystemGroup.add(orbitLine);

        // Dwarf planet mesh - smaller scale
        const radiusKm = data.radiusKm || 500; // Fallback value if undefined
        const size = Math.max(radiusKm * 0.002, 2); // Slightly larger scale for visibility
        const geometry = new THREE.SphereGeometry(size, 24, 24);

        const material = new THREE.MeshStandardMaterial({
            color: data.color || 0x888888, // Fallback color
            roughness: 0.8,
            metalness: 0.1
        });

        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.castShadow = true;
        planetMesh.frustumCulled = true;
        planetMesh.position.set(distance, 0, 0);
        orbitGroup.add(planetMesh);

        // Register for lazy texture loading (all dwarf planets are distant)
        if (data.textureUrl) {
            this._lazyTextureMeshes.push({
                mesh: planetMesh,
                material: material,
                textureUrl: data.textureUrl,
                loaded: false
            });
        }

        // Store references
        this.objects[name] = planetMesh;
        const dist = data.avgDistanceFromSun || 1000; // Fallback to prevent division by zero
        this.orbitSpeeds[name] = (1 / dist) * 50;
        this.parents[name] = orbitGroup;

        // Invisible hitbox for easier clicking (dwarf planets are small and far)
        const hitboxSize = Math.max(size * 3, 8);
        const hitboxGeom = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitbox = new THREE.Mesh(hitboxGeom, this._hitboxMaterial);
        hitbox.userData.isHitbox = true;
        planetMesh.add(hitbox);

        // Visual highlight (hidden by default)
        const highlightGeom = new THREE.SphereGeometry(hitboxSize * 1.2, 24, 24);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.15, 
            side: THREE.BackSide
        });
        const highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
        highlightMesh.visible = false; // Hide by default
        highlightMesh.userData.isHighlight = true;
        planetMesh.add(highlightMesh);

        // Moons for dwarf planets
        if (data.moons) {
            data.moons.forEach((moonData, index) => {
                this.createMoon(moonData, planetMesh, data, index);
            });
        }
    }

    createPlanet(name, data, sunMesh) {
        const distance = data.avgDistanceFromSun * 2;

        // Pivot group for orbit rotation
        const orbitGroup = new THREE.Group();
        this.solarSystemGroup.add(orbitGroup);

        // Create Orbit Line
        const orbitCurve = new THREE.EllipseCurve(
            0, 0,
            distance, distance,
            0, 2 * Math.PI,
            false,
            0
        );
        const points = orbitCurve.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const orbitLine = new THREE.Line(orbitGeometry, this._orbitMaterial);
        orbitLine.rotation.x = Math.PI / 2; // Flat on XZ plane
        this.solarSystemGroup.add(orbitLine);

        // Planet Mesh with LOD (high/low detail geometry)
        const radiusKm = data.radiusKm || 5000; // Fallback if undefined
        const size = radiusKm * 0.001;
        const geometryHi = new THREE.SphereGeometry(size, 32, 32);
        const geometryLo = new THREE.SphereGeometry(size, 12, 12);

        // Lazy texture loading: outer planets start with solid color, load texture when camera is near
        const isOuterPlanet = this._outerPlanets.has(name);

        let material;
        if (data.textureUrl && !isOuterPlanet) {
            // Inner planets: load texture eagerly (visible immediately)
            const map = resourceManager.loadTexture(data.textureUrl);
            material = new THREE.MeshStandardMaterial({
                map: map,
                color: 0xffffff,
                roughness: 0.7,
                metalness: 0.1
            });
        } else {
            // Outer planets with texture: solid color first, texture loaded lazily
            // Planets without texture: just solid color
            material = new THREE.MeshStandardMaterial({
                color: data.color || 0x888888,
                roughness: 0.7,
                metalness: 0.1
            });
        }

        // Use THREE.LOD: high-detail nearby, low-detail far away
        const lod = new THREE.LOD();
        const meshHi = new THREE.Mesh(geometryHi, material);
        const meshLo = new THREE.Mesh(geometryLo, material);
        meshHi.castShadow = true;
        meshLo.castShadow = true;
        meshHi.frustumCulled = true;
        meshLo.frustumCulled = true;
        lod.addLevel(meshHi, 0);       // Full detail when close
        lod.addLevel(meshLo, 500);     // Low detail beyond 500 units from camera
        resourceManager.trackGeometry(geometryHi);
        resourceManager.trackGeometry(geometryLo);
        resourceManager.trackMaterial(material);

        const planetMesh = lod;
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;

        // Register for lazy texture loading if this is an outer planet with a texture
        if (isOuterPlanet && data.textureUrl) {
            this._lazyTextureMeshes.push({
                mesh: planetMesh,
                material: material,
                textureUrl: data.textureUrl,
                loaded: false
            });
        }

        // Position planet
        planetMesh.position.set(distance, 0, 0);
        orbitGroup.add(planetMesh);

        // Store references
        this.objects[name] = planetMesh;
        const dist = data.avgDistanceFromSun || 100; // Fallback to prevent division by zero
        this.orbitSpeeds[name] = (1 / dist) * 50;
        this.parents[name] = orbitGroup;

        // Visual Selection Highlight (hidden by default)
        const highlightGeom = new THREE.SphereGeometry(size * 1.2, 32, 32);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.15, 
            side: THREE.BackSide 
        });
        const highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
        highlightMesh.visible = false; // Hide by default (not on material!)
        highlightMesh.userData.isHighlight = true;
        planetMesh.add(highlightMesh);

        // Rings for planets (Saturn, Uranus, Neptune)
        if (data.temAneis) {
            this.createPlanetRings(planetMesh, size, data.ringType || 'bright', name);
        }

        // Moons
        if (data.moons) {
            data.moons.forEach((moonData, index) => {
                this.createMoon(moonData, planetMesh, data, index);
            });
        }
    }

    createPlanetRings(planetMesh, planetSize, ringType, planetName) {
        const ringGroup = new THREE.Group();

        if (ringType === 'bright') {
            // Saturn's magnificent rings - multiple detailed bands
            const ringBands = [
                { inner: 1.2, outer: 1.5, color: 0x8B7355, opacity: 0.3 },   // D Ring (innermost, faint)
                { inner: 1.5, outer: 1.95, color: 0xC4A663, opacity: 0.7 },  // C Ring
                { inner: 1.95, outer: 2.0, color: 0x2F2F2F, opacity: 0.1 },  // Colombo Gap
                { inner: 2.0, outer: 2.45, color: 0xDEC882, opacity: 0.85 }, // B Ring (brightest)
                { inner: 2.45, outer: 2.55, color: 0x1F1F1F, opacity: 0.05 },// Cassini Division
                { inner: 2.55, outer: 3.0, color: 0xBFA76A, opacity: 0.65 }, // A Ring
                { inner: 3.0, outer: 3.05, color: 0x2F2F2F, opacity: 0.1 },  // Encke Gap
                { inner: 3.05, outer: 3.2, color: 0xA08050, opacity: 0.4 },  // A Ring outer
                { inner: 3.4, outer: 3.6, color: 0x6B5B4F, opacity: 0.15 },  // F Ring (thin, outer)
            ];

            ringBands.forEach(band => {
                const ringGeom = new THREE.RingGeometry(
                    planetSize * band.inner,
                    planetSize * band.outer,
                    64
                );
                const ringMat = new THREE.MeshBasicMaterial({
                    color: band.color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: band.opacity
                });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ringGroup.add(ring);
            });

        } else if (ringType === 'dark') {
            // Uranus's dark, thin rings
            const ringBands = [
                { inner: 1.6, outer: 1.65, color: 0x3A3A3A, opacity: 0.3 },  // 6 Ring
                { inner: 1.7, outer: 1.75, color: 0x4A4A4A, opacity: 0.35 }, // 5 Ring
                { inner: 1.8, outer: 1.85, color: 0x3D3D3D, opacity: 0.3 },  // 4 Ring
                { inner: 1.95, outer: 2.0, color: 0x5A5A5A, opacity: 0.4 },  // Alpha Ring
                { inner: 2.05, outer: 2.1, color: 0x555555, opacity: 0.35 }, // Beta Ring
                { inner: 2.2, outer: 2.3, color: 0x4D4D4D, opacity: 0.45 },  // Epsilon Ring (brightest)
            ];

            ringBands.forEach(band => {
                const ringGeom = new THREE.RingGeometry(
                    planetSize * band.inner,
                    planetSize * band.outer,
                    48
                );
                const ringMat = new THREE.MeshBasicMaterial({
                    color: band.color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: band.opacity
                });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ringGroup.add(ring);
            });

        } else if (ringType === 'faint') {
            // Neptune's very faint rings
            const ringBands = [
                { inner: 1.7, outer: 1.75, color: 0x2A2A2A, opacity: 0.15 }, // Galle Ring
                { inner: 2.1, outer: 2.15, color: 0x333333, opacity: 0.2 },  // Le Verrier Ring
                { inner: 2.3, outer: 2.32, color: 0x2F2F2F, opacity: 0.15 }, // Lassell Ring
                { inner: 2.5, outer: 2.55, color: 0x383838, opacity: 0.25 }, // Adams Ring (brightest)
            ];

            ringBands.forEach(band => {
                const ringGeom = new THREE.RingGeometry(
                    planetSize * band.inner,
                    planetSize * band.outer,
                    48
                );
                const ringMat = new THREE.MeshBasicMaterial({
                    color: band.color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: band.opacity
                });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ringGroup.add(ring);
            });
        }

        ringGroup.rotation.x = Math.PI / 2;
        planetMesh.add(ringGroup);
    }

    createMoon(data, parentPlanet, parentData, moonIndex = 0) {
        const moonOrbitGroup = new THREE.Group();
        parentPlanet.add(moonOrbitGroup);

        // Get parent planet visual size - use correct scale based on type
        // Dwarf planets use 0.002 scale (see createDwarfPlanet), regular planets use 0.001
        let parentSize;
        if (parentData.isDwarfPlanet) {
            parentSize = Math.max(parentData.radiusKm * 0.002, 2);
        } else {
            parentSize = parentData.radiusKm * 0.001;
        }
        
        // Calculate moon distance - use progressive spacing from planet surface
        // Base distance starts at 1.5x parent radius, each moon further out
        const baseDistance = parentSize * 1.8;
        const spacing = parentSize * 0.6;
        
        // Sort moons by real distance (moonIndex already reflects order in data)
        // Each subsequent moon is further out
        const distance = baseDistance + (moonIndex * spacing);
        
        // Moon size - scale up small moons for visibility
        const raioKm = data.radiusKm || 100; // Fallback if undefined
        let size = raioKm * 0.001;
        
        // Minimum visible size depends on parent size
        // Mars moons need bigger minimum since Mars is small
        const minSize = Math.max(parentSize * 0.08, 0.5);
        size = Math.max(size, minSize);
        
        // Cap maximum moon size to not be bigger than 1/4 of parent
        size = Math.min(size, parentSize * 0.25);

        const geometry = new THREE.SphereGeometry(size, 16, 16);

        let material;
        if (data.textureUrl) {
            const map = resourceManager.loadTexture(data.textureUrl);
            material = new THREE.MeshStandardMaterial({ map: map, color: 0xffffff });
        } else {
            material = new THREE.MeshStandardMaterial({ color: data.color || 0xaaaaaa }); // Fallback color
        }

        const moonMesh = new THREE.Mesh(geometry, material);
        resourceManager.trackGeometry(geometry);
        resourceManager.trackMaterial(material);
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        moonMesh.frustumCulled = true;

        moonMesh.position.set(distance, 0, 0);
        moonOrbitGroup.add(moonMesh);

        // Add invisible hitbox for easier clicking on small moons
        // Minimum hitbox size ensures even tiny moons are clickable
        const hitboxSize = Math.max(size * 2.5, 1.5);
        const hitboxGeom = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitbox = new THREE.Mesh(hitboxGeom, this._hitboxMaterial);
        hitbox.userData.isHitbox = true;
        moonMesh.add(hitbox);

        // Visual highlight for selection feedback
        const highlightGeom = new THREE.SphereGeometry(hitboxSize * 1.2, 16, 16);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.15, 
            side: THREE.BackSide
        });
        const highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
        highlightMesh.visible = false;
        highlightMesh.userData.isHighlight = true;
        moonMesh.add(highlightMesh);

        // Store references (no visible orbit ring for moons)
        // Use moon id if available, otherwise fall back to nome
        const moonId = data.id || data.name;
        this.objects[moonId] = moonMesh;
        
        // Orbital speed - closer moons orbit faster (Kepler's law approximation)
        // Use moonIndex to create variety - inner moons faster than outer
        const baseSpeed = 2.5;
        this.orbitSpeeds[moonId] = baseSpeed / (1 + moonIndex * 0.4);

        this.parents[moonId] = moonOrbitGroup;
        
        // Add slight orbital inclination for visual interest (varies by moon)
        const inclination = ((moonIndex * 0.7) % 1 - 0.5) * 0.4;
        moonOrbitGroup.rotation.z = inclination;
        
        // Start each moon at a different position in its orbit
        const startAngle = (moonIndex * Math.PI * 0.618); // Golden ratio spacing
        moonOrbitGroup.rotation.y = startAngle;
    }

    createAsteroidBelt() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        const color = new THREE.Color(0x888888);

        // Asteroid belt is between Mars (228*2=456) and Jupiter (778*2=1556)
        // Real asteroid belt: 2.2 to 3.2 AU from Sun
        // In our scale: ~500 to ~1000 units, centered around 700-800
        for (let i = 0; i < particleCount; i++) {
            const r = 550 + Math.random() * 500; // From 550 to 1050 (between Mars and Jupiter)
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 30; // Slightly thicker belt

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            positions.push(x, y, z);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Set bounding sphere to prevent NaN errors during frustum culling
        geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1200);

        const material = new THREE.PointsMaterial({ size: 2, vertexColors: true });
        const asteroidBelt = new THREE.Points(geometry, material);

        this.asteroidBelt = asteroidBelt;
        this.solarSystemGroup.add(asteroidBelt);

        // Create comets
        this._cometSystem = new CometSystem(this.solarSystemGroup, this.objects);
        this._cometSystem.createComets();
        this.comets = this._cometSystem.comets;
    }

    createStarfield() {
        // Create a MASSIVE starfield that covers entire navigable space
        // The solar system extends to about 6000 units (Neptune at scaled distance)
        // But in manual nav mode with 15x scale, we go MUCH further
        const starsGeometry = new THREE.BufferGeometry();
        const starsPos = [];
        const starColors = [];

        // Layer 1: Dense nearby stars
        const nearStarCount = 5000;
        for (let i = 0; i < nearStarCount; i++) {
            const radius = 5000 + Math.random() * 50000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            starsPos.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            
            const temp = Math.random();
            if (temp < 0.6) starColors.push(1, 1, 1);
            else if (temp < 0.8) starColors.push(0.8, 0.9, 1);
            else if (temp < 0.95) starColors.push(1, 0.95, 0.8);
            else starColors.push(1, 0.7, 0.7);
        }

        // Layer 2: Medium distance stars
        const midStarCount = 4000;
        for (let i = 0; i < midStarCount; i++) {
            const radius = 50000 + Math.random() * 200000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            starsPos.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            starColors.push(1, 1, 1);
        }

        // Layer 3: Distant stars
        const farStarCount = 3000;
        for (let i = 0; i < farStarCount; i++) {
            const radius = 200000 + Math.random() * 500000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            starsPos.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            starColors.push(0.9, 0.92, 1);
        }
        
        // Layer 4: Ultra-distant background
        const bgStarCount = 2000;
        for (let i = 0; i < bgStarCount; i++) {
            const radius = 500000 + Math.random() * 1500000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            starsPos.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            starColors.push(0.85, 0.88, 1);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPos, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

        // Set bounding sphere to prevent NaN errors during frustum culling
        starsGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2000000);

        const starsMaterial = new THREE.PointsMaterial({ 
            size: 35,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        starField.name = 'starfield';
        
        // Add directly to scene (NOT to solarSystemGroup) so it doesn't get scaled
        this.scene.add(starField);
        this.starField = starField;
        
    }

    update(deltaTime, camera) {
        // Accumulate time for animations (replaces Date.now() calls)
        this._animTime += deltaTime;

        // Cache orbit entries on first call (avoid Object.entries allocation per frame)
        if (this._orbitEntries.length === 0 && Object.keys(this.orbitSpeeds).length > 0) {
            this._orbitEntries = Object.entries(this.orbitSpeeds);
            this._objectValues = Object.values(this.objects);
            // Build reverse mesh→name map for O(1) click lookups
            for (const [name, mesh] of Object.entries(this.objects)) {
                this._meshToName.set(mesh, name);
            }
        }

        // Lazy texture loading: check camera distance to outer planets
        if (camera && this._lazyTextureMeshes.length > 0) {
            this._updateLazyTextures(camera);
        }

        // Rotate Planets around Sun
        for (const [name, speed] of this._orbitEntries) {
            if (this.parents[name]) {
                this.parents[name].rotation.y += speed * deltaTime * 0.1;
            }
        }

        // Asteroid belt rotation
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += 0.05 * deltaTime;
        }

        // Update comets
        if (this._cometSystem) {
            this._cometSystem.updateComets(deltaTime);
        }

        // Update space probes
        if (this._probeSystem) {
            this._probeSystem.updateProbes(deltaTime, this._animTime);
        }

        // Update UFO easter egg
        if (this._ufoSystem) {
            this._ufoSystem.updateUFO(deltaTime, this._animTime);
        }

        // Self rotation of planets and moons only (exclude UFO, comets, probes)
        const excludeKeys = new Set(['ufo', 'Halley', 'Encke', 'Hale-Bopp']);
        for (const [name] of this._orbitEntries) {
            const mesh = this.objects[name];
            if (mesh && !excludeKeys.has(name)) {
                mesh.rotation.y += 0.5 * deltaTime;
            }
        }
    }

    /**
     * Check camera distance to planets with deferred textures and load when close enough.
     * Once all lazy textures are loaded, the array is emptied and no further checks occur.
     */
    _updateLazyTextures(camera) {
        let allLoaded = true;
        for (const entry of this._lazyTextureMeshes) {
            if (entry.loaded) continue;
            allLoaded = false;

            // Get world position of the planet mesh
            entry.mesh.getWorldPosition(this._worldPos);
            const dist = camera.position.distanceTo(this._worldPos);

            if (dist < this._lazyTextureThreshold) {
                // Load texture and swap onto the material
                resourceManager.loadTexture(entry.textureUrl, (tex) => {
                    entry.material.map = tex;
                    entry.material.color.set(0xffffff);
                    entry.material.needsUpdate = true;
                });
                entry.loaded = true;
            }
        }

        // Once every lazy texture has been loaded, clear the array to skip future checks
        if (allLoaded && this._lazyTextureMeshes.length > 0) {
            this._lazyTextureMeshes = [];
        }
    }

    // Backward-compatible proxy so external code (main.js) can still call this directly
    updateComets(deltaTime) {
        if (this._cometSystem) {
            this._cometSystem.updateComets(deltaTime);
        }
    }

    checkIntersection(camera, x, y) {
        this.pointer.set(x, y);
        this.raycaster.setFromCamera(this.pointer, camera);

        const intersects = this.raycaster.intersectObjects(this.solarSystemGroup.children, true);

        const validIntersects = intersects.filter(hit =>
            hit.object.type === 'Mesh' &&
            hit.object.geometry.type !== 'RingGeometry' &&
            !hit.object.userData.isHighlight
        );

        if (validIntersects.length > 0) {
            let hitObject = validIntersects[0].object;
            
            // If we hit a hitbox, return its parent (the actual clickable object)
            if (hitObject.userData.isHitbox && hitObject.parent) {
                const parent = hitObject.parent;

                // O(1) lookup via reverse map
                if (this._meshToName.has(parent)) return parent;

                // For probes: check children of parent group
                if (parent.children) {
                    for (const child of parent.children) {
                        if (this._meshToName.has(child)) return child;
                    }
                }
            }

            // Bubble up to a registered object (O(1) per level via Map)
            let current = hitObject;
            while (current) {
                if (this._meshToName.has(current)) return current;
                current = current.parent;
            }
            
            return hitObject;
        }
        return null;
    }

    highlightObject(object) {
        let foundName = null;
        for (const [name, mesh] of Object.entries(this.objects)) {
            if (mesh === object) {
                foundName = name;
                break;
            }
        }

        // Return name but don't show glow highlight (disabled)
        return foundName;
    }

    clearHighlights() {
        for (const mesh of Object.values(this.objects)) {
            const hl = mesh.children.find(c => c.userData.isHighlight);
            if (hl) hl.visible = false;
        }
    }
}
