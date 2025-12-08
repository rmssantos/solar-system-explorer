/**
 * Procedural Spaceship for Chase View.
 * Supports custom colors!
 */
import * as THREE from 'three';

export class Spaceship {
    constructor(scene, wingColor = '#ff4444') {
        this.scene = scene;
        this.mesh = null;
        this.engineLight = null;
        this.wingColor = wingColor;
        this.mesh = this.createShip();
        this.scene.add(this.mesh);

        // Idle animation state
        this.time = 0;
    }

    createShip() {
        const group = new THREE.Group();

        // Convert hex string to THREE color
        const wingColorHex = parseInt(this.wingColor.replace('#', '0x'));

        // 1. Fuselage - brighter with emissive
        const bodyGeom = new THREE.ConeGeometry(0.5, 3, 8);
        bodyGeom.rotateX(Math.PI / 2); // Point forward
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee, 
            roughness: 0.3, 
            metalness: 0.6,
            emissive: 0x333333,
            emissiveIntensity: 0.5
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.castShadow = true;
        group.add(body);

        // 2. Cockpit
        const cockpitGeom = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        cockpitGeom.rotateX(Math.PI / 2);
        const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, emissive: 0x001133, emissiveIntensity: 0.2 });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.set(0, 0.3, -0.2);
        group.add(cockpit);

        // 3. Wings - with custom color and emissive!
        const wingGeom = new THREE.BoxGeometry(3, 0.1, 1.5);
        const wingMat = new THREE.MeshStandardMaterial({ 
            color: wingColorHex, 
            roughness: 0.4, 
            metalness: 0.4,
            emissive: wingColorHex,
            emissiveIntensity: 0.3
        });
        const wings = new THREE.Mesh(wingGeom, wingMat);
        wings.position.set(0, 0, 0.5);
        wings.castShadow = true;
        group.add(wings);

        // Add wing stripes for extra style
        const stripeGeom = new THREE.BoxGeometry(2.8, 0.12, 0.2);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
        const stripe = new THREE.Mesh(stripeGeom, stripeMat);
        stripe.position.set(0, 0.05, 0.5);
        group.add(stripe);

        // 4. Engines
        const engineGeom = new THREE.CylinderGeometry(0.2, 0.4, 1, 8);
        engineGeom.rotateX(Math.PI / 2);
        const engineMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        // Glow (for Bloom)
        const glowGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan flame

        const createEngine = (x) => {
            const eng = new THREE.Mesh(engineGeom, engineMat);
            eng.position.set(x, 0, 1.2);
            eng.castShadow = true;

            const light = new THREE.Mesh(glowGeom, glowMat.clone());
            light.position.set(0, -0.6, 0); // Behind engine
            light.userData.isEngine = true;
            eng.add(light);

            return eng;
        };

        group.add(createEngine(1));
        group.add(createEngine(-1));

        return group;
    }

    update(deltaTime, camera, isMovingFast = false) {
        if (!this.mesh) return;

        // "Chase" Logic: Place ship in front of camera
        // Adjusted offset for better visibility
        const offset = new THREE.Vector3(0, -2, -25);
        offset.applyQuaternion(camera.quaternion);
        const targetPos = camera.position.clone().add(offset);

        // Use faster lerp when moving at high speed to prevent ship from leaving screen
        const lerpSpeed = isMovingFast ? 0.8 : 0.15;
        
        // Smoothly lerp towards target
        this.mesh.position.lerp(targetPos, lerpSpeed);

        // Rotation: Match camera - faster when moving
        this.mesh.quaternion.slerp(camera.quaternion, lerpSpeed);

        // 4. Cartoon "Bobbing" (Idle animation)
        this.time = (this.time || 0) + deltaTime;
        const bobAmount = 0.5;
        const bobFreq = 2.0;
        this.mesh.position.y += Math.sin(this.time * bobFreq) * bobAmount * 0.05;

        // 5. Engine Glow Pulse
        this.mesh.traverse(child => {
            if (child.userData.isEngine) {
                child.material.color.setHSL(0.5, 1, 0.5 + Math.sin(this.time * 10) * 0.3);
            }
        });
    }
}
