/**
 * Handles creation and animation of space probes in the Solar System.
 */
import * as THREE from 'three';

export class ProbeSystem {
    constructor(solarSystemGroup, objects, parents, hitboxMaterial) {
        this.solarSystemGroup = solarSystemGroup;
        this.objects = objects;
        this.parents = parents;
        this._hitboxMaterial = hitboxMaterial;
        this.probes = [];
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
        const hitbox = new THREE.Mesh(hitboxGeom, this._hitboxMaterial);
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

        // Scale probes - small but visible
        group.scale.setScalar(0.4);

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

    updateProbes(deltaTime, animTime) {
        // Animate beacons (blinking) - use accumulated time instead of Date.now()
        const time = animTime;
        for (const probe of this.probes) {
            const blink = Math.sin(time * 3 + probe.params.angle) * 0.3 + 0.7;
            probe.beacon.material.opacity = blink;

            // Slowly rotate dish (cache reference on first call)
            if (!probe._dish) {
                probe._dish = probe.group.children.find(c => c.geometry?.type === 'ConeGeometry') || null;
            }
            if (probe._dish) {
                probe._dish.rotation.z += deltaTime * 0.2;
            }

            // Animate orbital motion for probes that orbit planets
            if (probe.orbitGroup && probe.params.orbitSpeed) {
                probe.orbitGroup.rotation.y += probe.params.orbitSpeed * deltaTime * 0.1;
            }
        }
    }
}
