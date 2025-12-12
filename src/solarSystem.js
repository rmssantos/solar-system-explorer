/**
 * Handles creation and animation of the Solar System objects.
 */
import * as THREE from 'three';
import { SOLAR_SYSTEM_DATA } from './data/objectsInfo.js';

export class SolarSystem {
    constructor(scene, uiManager, cameraControls) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.cameraControls = cameraControls;

        this.objects = {}; // Map of name -> Mesh/Group
        this.orbitSpeeds = {}; // Map of name -> speed
        this.distances = {};
        this.parents = {}; // Map of name -> parent Object3D
        this.comets = []; // Comet objects
        this.probes = []; // Space probe objects

        // Raycaster for selection
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        // Exploration mode is intentionally non-realistic, but the Sun should not look smaller than Jupiter/Saturn.
        // Increasing this keeps Mercury outside the Sun while improving the overall look.
        this.sunScale = 1.25;

        // Groups
        this.solarSystemGroup = new THREE.Group();
        this.scene.add(this.solarSystemGroup);

        // Texture Loader
        this.textureLoader = new THREE.TextureLoader();
    }

    async createSolarSystem() {
        // 1. Create Starfield Background
        this.createStarfield();

        // 2. Create Sun
        const sunData = SOLAR_SYSTEM_DATA['sun'];
        const sunRadius = sunData.raioKm * this.sunScale * 0.0001;
        const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);

        let sunMaterial;
        if (sunData.textureUrl) {
            const sunMap = this.textureLoader.load(sunData.textureUrl);
            sunMaterial = new THREE.MeshBasicMaterial({ map: sunMap, color: 0xffffff });
        } else {
            sunMaterial = new THREE.MeshBasicMaterial({ color: sunData.cor });
        }

        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

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
                !data.ehPlanetoAnao && 
                data.tipo !== 'Sonda Espacial' && 
                data.tipo !== 'Nave Alienígena' &&
                !data.isEasterEgg) {
                this.createPlanet(key, data, sunMesh);
            }
        }

        // 4. Create Asteroid Belt
        this.createAsteroidBelt();

        // 5. Create Dwarf Planets (after asteroid belt for visual order)
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            if (data.ehPlanetoAnao) {
                this.createDwarfPlanet(key, data, sunMesh);
            }
        }

        // 6. Create Space Probes
        this.createSpaceProbes();
        
        // 7. Create Easter Egg: UFO near Earth! 🛸
        this.createUFO();
    }

    createUFO() {
        // Easter egg: Alien UFO orbiting near Earth!
        const ufoGroup = new THREE.Group();
        
        // UFO Body (classic flying saucer shape)
        // Top dome
        const domeGeom = new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
            color: 0x88ff88,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const dome = new THREE.Mesh(domeGeom, domeMat);
        dome.position.y = 0.5;
        ufoGroup.add(dome);
        
        // Main saucer body
        const saucerGeom = new THREE.CylinderGeometry(5, 4, 1.5, 24);
        const saucerMat = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.95,
            roughness: 0.05
        });
        const saucer = new THREE.Mesh(saucerGeom, saucerMat);
        saucer.userData.root = ufoGroup;
        ufoGroup.add(saucer);
        
        // Outer ring
        const ringGeom = new THREE.TorusGeometry(6, 0.8, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.2
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.3;
        ufoGroup.add(ring);
        
        // Glowing lights around the rim
        const lightColors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const lightGeom = new THREE.SphereGeometry(0.4, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({
                color: lightColors[i % lightColors.length],
                transparent: true,
                opacity: 0.9
            });
            const light = new THREE.Mesh(lightGeom, lightMat);
            light.position.set(
                Math.cos(angle) * 5.5,
                -0.3,
                Math.sin(angle) * 5.5
            );
            light.userData.isUfoLight = true;
            light.userData.lightIndex = i;
            ufoGroup.add(light);
        }
        
        // Beam of light (abduction beam!)
        const beamGeom = new THREE.ConeGeometry(3, 12, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.rotation.x = Math.PI;
        beam.position.y = -7;
        ufoGroup.add(beam);
        
        // Position UFO near Earth (but at an interesting angle)
        // Earth is at approx 150 * 2 = 300 distance units
        const earthDistance = 150 * 2;
        
        // Position UFO slightly closer and more visible
        // Above Earth's orbital plane so it's easier to spot
        ufoGroup.position.set(
            earthDistance * 0.85,  // A bit closer to Sun than Earth
            80, // Higher above the orbital plane
            earthDistance * 0.3   // Offset to the side
        );
        
        // Make it bigger so it's easier to find!
        ufoGroup.scale.setScalar(3);
        
        // Add invisible hitbox for easier clicking
        const hitboxGeom = new THREE.SphereGeometry(12, 8, 8);
        const hitboxMat = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
        hitbox.userData.isHitbox = true;
        ufoGroup.add(hitbox);
        
        // Visual highlight for selection feedback
        const highlightGeom = new THREE.SphereGeometry(14, 16, 16);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.15, 
            side: THREE.BackSide
        });
        const highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
        highlightMesh.visible = false;
        highlightMesh.userData.isHighlight = true;
        saucer.add(highlightMesh);
        
        // Store reference for animation
        this.ufoGroup = ufoGroup;
        this.ufoBeam = beam;
        
        this.solarSystemGroup.add(ufoGroup);
        
        // Add to objects for click detection
        this.objects['ufo'] = saucer;
        
        console.log('🛸 Easter Egg: OVNI criado perto da Terra!');
    }

    updateUFO(deltaTime) {
        if (!this.ufoGroup) return;
        
        // Gentle hovering motion
        const time = Date.now() * 0.001;
        this.ufoGroup.position.y = 30 + Math.sin(time * 0.5) * 5;
        
        // Slow rotation
        this.ufoGroup.rotation.y += deltaTime * 0.3;
        
        // Wobble slightly
        this.ufoGroup.rotation.z = Math.sin(time * 0.3) * 0.1;
        
        // Animate rim lights
        this.ufoGroup.children.forEach(child => {
            if (child.userData.isUfoLight) {
                const pulse = Math.sin(time * 3 + child.userData.lightIndex * 0.8) * 0.4 + 0.6;
                child.material.opacity = pulse;
            }
        });
        
        // Beam pulsing
        if (this.ufoBeam) {
            this.ufoBeam.material.opacity = 0.1 + Math.sin(time * 2) * 0.08;
            this.ufoBeam.scale.x = 1 + Math.sin(time * 1.5) * 0.1;
            this.ufoBeam.scale.z = 1 + Math.sin(time * 1.5) * 0.1;
        }
    }

    createSpaceProbes() {
        this.probes = [];

        // Voyager 1 - furthest human-made object
        this.createProbe('voyager1', {
            distance: 15000,
            angle: 0.8,
            description: 'A sonda mais distante da Terra! Viaja desde 1977.',
            year: 1977,
            color: 0xFFD700
        });

        // Voyager 2
        this.createProbe('voyager2', {
            distance: 12500,
            angle: 2.1,
            description: 'A única sonda a visitar os 4 gigantes gasosos!',
            year: 1977,
            color: 0xFFD700
        });

        // New Horizons (near Pluto)
        this.createProbe('newhorizons', {
            distance: 8000,
            angle: 4.5,
            description: 'Fotografou Plutão de perto em 2015!',
            year: 2006,
            color: 0x00BFFF
        });

        // Pioneer 10
        this.createProbe('pioneer10', {
            distance: 13000,
            angle: 3.8,
            description: 'A primeira sonda a atravessar o cinturão de asteroides!',
            year: 1972,
            color: 0xFF6347
        });

        // Juno (at Jupiter)
        this.createProbe('juno', {
            distance: 778 * 2, // Jupiter distance
            angle: 1.5,
            orbiting: 'jupiter',
            description: 'Estuda Júpiter desde 2016!',
            year: 2011,
            color: 0x87CEEB
        });

        // Cassini position (around Saturn) - historical
        this.createProbe('cassini', {
            distance: 1434 * 2, // Saturn distance
            angle: 2.8,
            orbiting: 'saturn',
            description: 'Estudou Saturno durante 13 anos!',
            year: 1997,
            color: 0xDDA0DD
        });

        // ISS - International Space Station (orbits Earth)
        this.createProbe('iss', {
            distance: 20, // Orbital distance from Earth
            angle: 0.5,
            orbiting: 'earth',
            orbitSpeed: 8, // Fast orbit (90 min in real life)
            description: 'A casa dos astronautas no espaço!',
            year: 1998,
            color: 0xFFFFFF
        });

        // Hubble Space Telescope (orbits Earth)
        this.createProbe('hubble', {
            distance: 25, // Orbital distance from Earth
            angle: 1.2,
            orbiting: 'earth',
            orbitSpeed: 6, // Slightly slower orbit
            description: 'O telescópio que fotografa o Universo!',
            year: 1990,
            color: 0xC0C0C0
        });
    }

    createProbe(name, params) {
        const group = new THREE.Group();

        // Probe body (small box)
        const bodyGeom = new THREE.BoxGeometry(3, 2, 2);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            metalness: 0.8,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.userData.root = group;
        group.add(body);

        // Solar panels
        const panelGeom = new THREE.BoxGeometry(8, 0.2, 3);
        const panelMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a237e,
            metalness: 0.5,
            roughness: 0.2
        });
        const leftPanel = new THREE.Mesh(panelGeom, panelMat);
        leftPanel.position.set(-5, 0, 0);
        group.add(leftPanel);

        const rightPanel = new THREE.Mesh(panelGeom, panelMat);
        rightPanel.position.set(5, 0, 0);
        group.add(rightPanel);

        // Dish antenna
        const dishGeom = new THREE.ConeGeometry(2, 1, 16);
        const dishMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const dish = new THREE.Mesh(dishGeom, dishMat);
        dish.rotation.x = Math.PI;
        dish.position.set(0, 2, 0);
        group.add(dish);

        // Signal beacon (glowing)
        const beaconGeom = new THREE.SphereGeometry(0.5, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ 
            color: params.color,
            transparent: true,
            opacity: 0.8
        });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.set(0, 3, 0);
        group.add(beacon);

        // Add invisible hitbox sphere for easier clicking
        // This makes probes MUCH easier to click on
        const hitboxSize = params.orbiting === 'earth' ? 6 : 12; // Hitbox for clicking
        const hitboxGeom = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitboxMat = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
        hitbox.userData.isHitbox = true;
        group.add(hitbox);

        // Visual highlight (hidden by default) - for selection feedback
        const highlightGeom = new THREE.SphereGeometry(hitboxSize * 1.2, 16, 16);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: params.color || 0xffffff, 
            transparent: true, 
            opacity: 0.15, 
            side: THREE.BackSide
        });
        const highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
        highlightMesh.visible = false;
        highlightMesh.userData.isHighlight = true;
        body.add(highlightMesh); // Add to body since that's what we store in objects

        // Scale probes based on context
        // Earth-orbiting probes (ISS, Hubble) should be small but visible
        if (params.orbiting === 'earth') {
            group.scale.setScalar(0.4); // Smaller - more realistic compared to Earth
        } else {
            group.scale.setScalar(0.4); // Also smaller for deep space probes
        }

        // Check if this probe orbits a planet (like Earth)
        let orbitGroup = null;
        if (params.orbiting === 'earth') {
            // Find Earth's orbit group (parent)
            const earthParent = this.parents['earth'];
            if (earthParent) {
                // Create an orbit group that follows Earth
                orbitGroup = new THREE.Group();

                // Get Earth mesh to find its position within orbit
                const earthMesh = this.objects['earth'];
                if (earthMesh) {
                    // Position orbit group at Earth's local position
                    orbitGroup.position.copy(earthMesh.position);
                }
                
                // Position the probe at orbital distance from center of orbit group
                const x = params.distance * Math.cos(params.angle);
                const z = params.distance * Math.sin(params.angle);
                group.position.set(x, 0, z);
                
                orbitGroup.add(group);
                earthParent.add(orbitGroup);
            }
        } else {
            // Regular space probe - position in solar system
            const x = params.distance * Math.cos(params.angle);
            const z = params.distance * Math.sin(params.angle);
            const y = (Math.random() - 0.5) * 100; // Slight vertical offset
            group.position.set(x, y, z);
            this.solarSystemGroup.add(group);
        }

        // Store for interaction
        this.objects[name] = body;

        // Store probe data
        const probeData = {
            name: name,
            group: group,
            beacon: beacon,
            params: params,
            orbitGroup: orbitGroup // Store orbit group for animation
        };

        this.probes.push(probeData);
        return probeData;
    }

    updateProbes(deltaTime) {
        // Animate beacons (blinking)
        for (const probe of this.probes) {
            const blink = Math.sin(Date.now() * 0.003 + probe.params.angle) * 0.3 + 0.7;
            probe.beacon.material.opacity = blink;
            
            // Slowly rotate dish
            const dish = probe.group.children.find(c => c.geometry?.type === 'ConeGeometry');
            if (dish) {
                dish.rotation.z += deltaTime * 0.2;
            }
            
            // Animate orbital motion for probes that orbit planets
            if (probe.orbitGroup && probe.params.orbitSpeed) {
                probe.orbitGroup.rotation.y += probe.params.orbitSpeed * deltaTime * 0.1;
            }
        }
    }

    createDwarfPlanet(name, data, sunMesh) {
        // Dwarf planets have dashed orbit lines and smaller scale
        const distance = data.distanciaMediaAoSol * 2;

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
        const raioKm = data.raioKm || 500; // Fallback value if undefined
        const size = Math.max(raioKm * 0.002, 2); // Slightly larger scale for visibility
        const geometry = new THREE.SphereGeometry(size, 24, 24);

        const material = new THREE.MeshStandardMaterial({
            color: data.cor || 0x888888, // Fallback color
            roughness: 0.8,
            metalness: 0.1
        });

        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.castShadow = true;
        planetMesh.position.set(distance, 0, 0);
        orbitGroup.add(planetMesh);

        // Store references
        this.objects[name] = planetMesh;
        const dist = data.distanciaMediaAoSol || 1000; // Fallback to prevent division by zero
        this.orbitSpeeds[name] = (1 / dist) * 50;
        this.parents[name] = orbitGroup;

        // Invisible hitbox for easier clicking (dwarf planets are small and far)
        const hitboxSize = Math.max(size * 3, 8);
        const hitboxGeom = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitboxMat = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
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
        const distance = data.distanciaMediaAoSol * 2;

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
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        orbitLine.rotation.x = Math.PI / 2; // Flat on XZ plane
        this.solarSystemGroup.add(orbitLine);

        // Planet Mesh
        const raioKm = data.raioKm || 5000; // Fallback if undefined
        const size = raioKm * 0.001;
        const geometry = new THREE.SphereGeometry(size, 32, 32);

        let material;
        if (data.textureUrl) {
            const map = this.textureLoader.load(data.textureUrl);
            material = new THREE.MeshStandardMaterial({
                map: map,
                color: 0xffffff,
                roughness: 0.7,
                metalness: 0.1
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: data.cor || 0x888888, // Fallback color
                roughness: 0.7,
                metalness: 0.1
            });
        }

        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;

        // Position planet
        planetMesh.position.set(distance, 0, 0);
        orbitGroup.add(planetMesh);

        // Store references
        this.objects[name] = planetMesh;
        const dist = data.distanciaMediaAoSol || 100; // Fallback to prevent division by zero
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
            this.createPlanetRings(planetMesh, size, data.tipoAneis || 'bright', name);
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
        if (parentData.ehPlanetoAnao) {
            parentSize = Math.max(parentData.raioKm * 0.002, 2);
        } else {
            parentSize = parentData.raioKm * 0.001;
        }
        
        // Calculate moon distance - use progressive spacing from planet surface
        // Base distance starts at 1.5x parent radius, each moon further out
        const baseDistance = parentSize * 1.8;
        const spacing = parentSize * 0.6;
        
        // Sort moons by real distance (moonIndex already reflects order in data)
        // Each subsequent moon is further out
        const distance = baseDistance + (moonIndex * spacing);
        
        // Moon size - scale up small moons for visibility
        const raioKm = data.raioKm || 100; // Fallback if undefined
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
            const map = this.textureLoader.load(data.textureUrl);
            material = new THREE.MeshStandardMaterial({ map: map, color: 0xffffff });
        } else {
            material = new THREE.MeshStandardMaterial({ color: data.cor || 0xaaaaaa }); // Fallback color
        }

        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;

        moonMesh.position.set(distance, 0, 0);
        moonOrbitGroup.add(moonMesh);

        // Add invisible hitbox for easier clicking on small moons
        // Minimum hitbox size ensures even tiny moons are clickable
        const hitboxSize = Math.max(size * 2.5, 1.5);
        const hitboxGeom = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitboxMat = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
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
        const moonId = data.id || data.nome;
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
        this.createComets();
    }

    createComets() {
        this.comets = [];

        // Halley's Comet - elliptical orbit
        const halleyComet = this.createComet('Halley', {
            perihelion: 100,      // Closest to sun
            aphelion: 7000,       // Furthest from sun
            inclination: 0.3,     // Tilted orbit
            color: 0x88ccff,
            tailLength: 80,
            speed: 0.15
        });
        this.comets.push(halleyComet);

        // Second comet
        const comet2 = this.createComet('Encke', {
            perihelion: 80,
            aphelion: 1000,
            inclination: -0.2,
            color: 0xaaddff,
            tailLength: 40,
            speed: 0.3
        });
        this.comets.push(comet2);

        // Third comet (long period)
        const comet3 = this.createComet('Hale-Bopp', {
            perihelion: 150,
            aphelion: 10000,
            inclination: 0.5,
            color: 0xffffff,
            tailLength: 120,
            speed: 0.08
        });
        this.comets.push(comet3);
    }

    createComet(name, params) {
        const group = new THREE.Group();
        
        // Comet nucleus (rocky core)
        const nucleusGeom = new THREE.SphereGeometry(2, 8, 8);
        const nucleusMat = new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            emissive: params.color,
            emissiveIntensity: 0.3
        });
        const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
        group.add(nucleus);

        // Coma (glowing cloud around nucleus)
        const comaGeom = new THREE.SphereGeometry(5, 16, 16);
        const comaMat = new THREE.MeshBasicMaterial({ 
            color: params.color,
            transparent: true,
            opacity: 0.4
        });
        const coma = new THREE.Mesh(comaGeom, comaMat);
        group.add(coma);

        // Tail using trail of particles that follow comet position history
        const tailCount = 150;
        const tailGeom = new THREE.BufferGeometry();
        const tailPositions = new Float32Array(tailCount * 3);
        const tailColors = new Float32Array(tailCount * 3);
        const tailSizes = new Float32Array(tailCount);
        
        // Initialize all at origin
        for (let i = 0; i < tailCount; i++) {
            tailPositions[i * 3] = 0;
            tailPositions[i * 3 + 1] = 0;
            tailPositions[i * 3 + 2] = 0;
            
            const t = i / tailCount;
            const intensity = 1 - t * 0.9;
            const color = new THREE.Color(params.color);
            tailColors[i * 3] = color.r * intensity;
            tailColors[i * 3 + 1] = color.g * intensity;
            tailColors[i * 3 + 2] = color.b * intensity;
            
            // Particles get smaller towards the end
            tailSizes[i] = (1 - t * 0.7) * 3;
        }

        tailGeom.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
        tailGeom.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
        tailGeom.setAttribute('size', new THREE.BufferAttribute(tailSizes, 1));

        // Set a valid bounding sphere to prevent NaN errors during initial render
        tailGeom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);

        const tailMat = new THREE.PointsMaterial({
            size: 2.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const tail = new THREE.Points(tailGeom, tailMat);
        this.solarSystemGroup.add(tail);

        // Set orbit inclination
        group.rotation.x = params.inclination;

        this.solarSystemGroup.add(group);

        // Add to navigable objects (for clicking)
        this.objects[name] = nucleus;

        // Calculate orbital parameters
        const initialAngle = Math.random() * Math.PI * 2;
        const a = (params.perihelion + params.aphelion) / 2;
        const e = (params.aphelion - params.perihelion) / (params.aphelion + params.perihelion);

        // Calculate initial position
        const denominator = 1 + e * Math.cos(initialAngle);
        const r = denominator !== 0 ? a * (1 - e * e) / denominator : a;
        const x = r * Math.cos(initialAngle);
        const z = r * Math.sin(initialAngle);
        const y = z * Math.sin(params.inclination);
        const adjustedZ = z * Math.cos(params.inclination);
        const initialPos = new THREE.Vector3(x, y, adjustedZ);

        // Set initial comet group position
        group.position.copy(initialPos);

        // Position history for trail effect - initialize with valid starting position
        const positionHistory = [];
        for (let i = 0; i < tailCount; i++) {
            positionHistory.push(initialPos.clone());
        }

        // Initialize tail positions to valid values (not zeros)
        const positions = tailGeom.attributes.position.array;
        for (let i = 0; i < tailCount; i++) {
            positions[i * 3] = initialPos.x;
            positions[i * 3 + 1] = initialPos.y;
            positions[i * 3 + 2] = initialPos.z;
        }
        tailGeom.attributes.position.needsUpdate = true;

        // Update bounding sphere with actual position
        tailGeom.boundingSphere = new THREE.Sphere(initialPos.clone(), params.tailLength * 2);

        return {
            name: name,
            group: group,
            tail: tail,
            tailGeom: tailGeom,
            tailCount: tailCount,
            positionHistory: positionHistory,
            params: params,
            angle: initialAngle,
            a: a,
            e: e,
            lastPosition: initialPos.clone()
        };
    }

    updateComets(deltaTime) {
        for (const comet of this.comets) {
            // Update angle (faster when closer to sun - Kepler's 2nd law)
            const denominator = 1 + comet.e * Math.cos(comet.angle);
            // Protect against division by very small numbers and ensure valid range
            let r = comet.a;
            if (Math.abs(denominator) > 0.001) {
                r = comet.a * (1 - comet.e * comet.e) / denominator;
            }
            // Clamp r to reasonable bounds
            r = Math.max(comet.params.perihelion * 0.5, Math.min(r, comet.params.aphelion * 2));
            const speed = r > 0.1 ? comet.params.speed * (1000 / r) : comet.params.speed;
            comet.angle += speed * deltaTime;

            // Calculate position (elliptical orbit)
            const x = r * Math.cos(comet.angle);
            const z = r * Math.sin(comet.angle);

            // Apply inclination to Y
            const y = z * Math.sin(comet.params.inclination);
            const adjustedZ = z * Math.cos(comet.params.inclination);

            const currentPos = new THREE.Vector3(x, y, adjustedZ);

            // Check for NaN before applying position
            if (!isNaN(x) && !isNaN(y) && !isNaN(adjustedZ)) {
                comet.group.position.copy(currentPos);
            }

            // Update position history (shift all positions back)
            for (let i = comet.positionHistory.length - 1; i > 0; i--) {
                comet.positionHistory[i].copy(comet.positionHistory[i - 1]);
            }
            comet.positionHistory[0].copy(currentPos);

            // Direction away from sun (for solar wind effect)
            const len = currentPos.length();
            const dirFromSun = len > 0.001 ? currentPos.clone().divideScalar(len) : new THREE.Vector3(1, 0, 0);
            
            // Update tail particles - follow position history with solar wind push
            const positions = comet.tailGeom.attributes.position.array;

            for (let i = 0; i < comet.tailCount; i++) {
                const t = i / comet.tailCount;
                const historyPos = comet.positionHistory[i];

                // Solar wind pushes particles away from sun
                const solarPush = t * comet.params.tailLength * 0.5;

                // Blend between trail following and solar wind direction
                const blendFactor = t * 0.6; // More solar wind effect at tail end

                const trailX = historyPos.x + dirFromSun.x * solarPush * blendFactor;
                const trailY = historyPos.y + dirFromSun.y * solarPush * blendFactor;
                const trailZ = historyPos.z + dirFromSun.z * solarPush * blendFactor;

                // Add subtle randomness for natural look
                const spread = t * 2;

                // Calculate positions with NaN protection
                const px = trailX + (Math.random() - 0.5) * spread;
                const py = trailY + (Math.random() - 0.5) * spread;
                const pz = trailZ + (Math.random() - 0.5) * spread;

                // Only set if values are valid numbers
                positions[i * 3] = isFinite(px) ? px : 0;
                positions[i * 3 + 1] = isFinite(py) ? py : 0;
                positions[i * 3 + 2] = isFinite(pz) ? pz : 0;
            }

            comet.tailGeom.attributes.position.needsUpdate = true;

            // Keep a valid bounding sphere for frustum culling without per-frame allocations
            if (!comet.tailGeom.boundingSphere) {
                comet.tailGeom.boundingSphere = new THREE.Sphere(
                    comet.group.position.clone(),
                    comet.params.tailLength * 2
                );
            } else {
                comet.tailGeom.boundingSphere.center.copy(comet.group.position);
                comet.tailGeom.boundingSphere.radius = comet.params.tailLength * 2;
            }

            // Scale tail based on distance from sun (bigger when closer)
            const tailScale = Math.max(0.5, 2.0 - r / 2000);
            comet.tail.scale.setScalar(tailScale);
            
            comet.lastPosition.copy(currentPos);
        }
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
        
        console.log('✨ Starfield: 14,000 stars across 1.5M units');
    }

    update(deltaTime) {
        // Rotate Planets around Sun
        for (const [name, speed] of Object.entries(this.orbitSpeeds)) {
            if (this.parents[name]) {
                this.parents[name].rotation.y += speed * deltaTime * 0.1;
            }
        }

        // Asteroid belt rotation
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += 0.05 * deltaTime;
        }

        // Update comets
        if (this.comets) {
            this.updateComets(deltaTime);
        }

        // Update space probes
        if (this.probes) {
            this.updateProbes(deltaTime);
        }
        
        // Update UFO easter egg
        this.updateUFO(deltaTime);

        // Self rotation of planets (meshes)
        for (const mesh of Object.values(this.objects)) {
            mesh.rotation.y += 0.5 * deltaTime;
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
                // For probes, the hitbox is in the group, but body is stored in objects
                // For moons/planets, hitbox is child of the mesh itself
                const parent = hitObject.parent;
                
                // Check if parent is a registered object
                for (const [name, mesh] of Object.entries(this.objects)) {
                    if (mesh === parent) {
                        return mesh;
                    }
                }
                
                // For probes, the body mesh is the first BoxGeometry child
                if (parent.children) {
                    for (const child of parent.children) {
                        for (const [name, mesh] of Object.entries(this.objects)) {
                            if (mesh === child) {
                                return mesh;
                            }
                        }
                    }
                }
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
