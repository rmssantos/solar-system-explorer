/**
 * Handles creation and animation of the UFO easter egg in the Solar System.
 */
import * as THREE from 'three';

export class UFOSystem {
    constructor(solarSystemGroup, objects, hitboxMaterial) {
        this.solarSystemGroup = solarSystemGroup;
        this.objects = objects;
        this._hitboxMaterial = hitboxMaterial;

        this.ufoGroup = null;
        this.ufoBeam = null;
        this._ufoLights = null;
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
        const hitbox = new THREE.Mesh(hitboxGeom, this._hitboxMaterial);
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
    }

    updateUFO(deltaTime, animTime) {
        if (!this.ufoGroup) return;

        // Gentle hovering motion (use accumulated time, not Date.now)
        const time = animTime;
        this.ufoGroup.position.y = 80 + Math.sin(time * 0.5) * 5;

        // Slow rotation
        this.ufoGroup.rotation.y += deltaTime * 0.3;

        // Wobble slightly
        this.ufoGroup.rotation.z = Math.sin(time * 0.3) * 0.1;

        // Animate rim lights (cache references on first call)
        if (!this._ufoLights) {
            this._ufoLights = this.ufoGroup.children.filter(c => c.userData.isUfoLight);
        }
        for (const light of this._ufoLights) {
            const pulse = Math.sin(time * 3 + light.userData.lightIndex * 0.8) * 0.4 + 0.6;
            light.material.opacity = pulse;
        }

        // Beam pulsing
        if (this.ufoBeam) {
            this.ufoBeam.material.opacity = 0.1 + Math.sin(time * 2) * 0.08;
            this.ufoBeam.scale.x = 1 + Math.sin(time * 1.5) * 0.1;
            this.ufoBeam.scale.z = 1 + Math.sin(time * 1.5) * 0.1;
        }
    }
}
