/**
 * Particle Effects - Visual celebrations for discoveries
 * Confetti, sparkles, and warp effects
 */
import * as THREE from 'three';

export class ParticleEffects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.confettiSystem = null;
    }

    /**
     * Create a burst of confetti at a position
     */
    createConfetti(position, count = 100) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];
        const sizes = [];

        const confettiColors = [
            new THREE.Color(0xff4444), // Red
            new THREE.Color(0x44ff44), // Green
            new THREE.Color(0x4444ff), // Blue
            new THREE.Color(0xffff44), // Yellow
            new THREE.Color(0xff44ff), // Pink
            new THREE.Color(0x44ffff), // Cyan
            new THREE.Color(0xffa500), // Orange
            new THREE.Color(0xffffff), // White
        ];

        for (let i = 0; i < count; i++) {
            positions.push(
                position.x + (Math.random() - 0.5) * 5,
                position.y + (Math.random() - 0.5) * 5,
                position.z + (Math.random() - 0.5) * 5
            );

            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            colors.push(color.r, color.g, color.b);

            velocities.push(
                (Math.random() - 0.5) * 2,
                Math.random() * 2 + 1,
                (Math.random() - 0.5) * 2
            );

            sizes.push(Math.random() * 3 + 1);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        const particleData = {
            mesh: points,
            velocities: velocities,
            life: 3.0,
            maxLife: 3.0
        };

        this.particles.push(particleData);
        return particleData;
    }

    /**
     * Create sparkle effect around an object
     */
    createSparkles(position, radius = 10, count = 50) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = radius * (0.8 + Math.random() * 0.4);

            positions.push(
                position.x + r * Math.sin(phi) * Math.cos(theta),
                position.y + r * Math.sin(phi) * Math.sin(theta),
                position.z + r * Math.cos(phi)
            );

            // Golden sparkles
            const brightness = 0.5 + Math.random() * 0.5;
            colors.push(brightness, brightness * 0.8, brightness * 0.3);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        const particleData = {
            mesh: points,
            type: 'sparkle',
            life: 2.0,
            maxLife: 2.0,
            originalPositions: [...positions]
        };

        this.particles.push(particleData);
        return particleData;
    }

    /**
     * Create warp speed effect (for navigation)
     */
    createWarpEffect(camera) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const count = 500;

        for (let i = 0; i < count; i++) {
            // Lines extending from camera
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 10;
            
            positions.push(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                -Math.random() * 200 - 50
            );

            // Blue-white color
            const intensity = Math.random() * 0.5 + 0.5;
            colors.push(intensity * 0.7, intensity * 0.8, intensity);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        camera.add(points);

        const particleData = {
            mesh: points,
            type: 'warp',
            life: 1.5,
            maxLife: 1.5,
            parent: camera
        };

        this.particles.push(particleData);
        return particleData;
    }

    /**
     * Create ring explosion effect
     */
    createRingExplosion(position, color = 0x4a90e2) {
        const geometry = new THREE.RingGeometry(0.1, 0.5, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(geometry, material);
        ring.position.copy(position);
        ring.lookAt(this.scene.position);
        this.scene.add(ring);

        const particleData = {
            mesh: ring,
            type: 'ring',
            life: 1.0,
            maxLife: 1.0,
            initialScale: 1
        };

        this.particles.push(particleData);
        return particleData;
    }

    /**
     * Update all particle systems
     */
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;

            const lifeRatio = particle.life / particle.maxLife;

            if (particle.type === 'sparkle') {
                // Sparkles expand and fade
                particle.mesh.material.opacity = lifeRatio;
                particle.mesh.scale.setScalar(1 + (1 - lifeRatio) * 2);
                particle.mesh.rotation.y += deltaTime * 0.5;
            } else if (particle.type === 'warp') {
                // Warp effect fades in then out
                const fadeIn = Math.min(1, (particle.maxLife - particle.life) * 4);
                const fadeOut = lifeRatio;
                particle.mesh.material.opacity = fadeIn * fadeOut * 0.8;
                
                // Stretch effect
                const positions = particle.mesh.geometry.attributes.position.array;
                for (let j = 2; j < positions.length; j += 3) {
                    positions[j] -= deltaTime * 200;
                    if (positions[j] < -300) {
                        positions[j] = -50;
                    }
                }
                particle.mesh.geometry.attributes.position.needsUpdate = true;
            } else if (particle.type === 'ring') {
                // Ring expands and fades
                const scale = particle.initialScale + (1 - lifeRatio) * 50;
                particle.mesh.scale.setScalar(scale);
                particle.mesh.material.opacity = lifeRatio;
            } else {
                // Regular confetti - falls and fades
                particle.mesh.material.opacity = lifeRatio;
                
                const positions = particle.mesh.geometry.attributes.position.array;
                const velocities = particle.velocities;
                
                for (let j = 0; j < positions.length; j += 3) {
                    const vi = j;
                    positions[j] += velocities[vi] * deltaTime * 10;
                    positions[j + 1] += velocities[vi + 1] * deltaTime * 10;
                    positions[j + 2] += velocities[vi + 2] * deltaTime * 10;
                    
                    // Gravity
                    velocities[vi + 1] -= deltaTime * 2;
                }
                particle.mesh.geometry.attributes.position.needsUpdate = true;
            }

            // Remove dead particles
            if (particle.life <= 0) {
                if (particle.parent) {
                    particle.parent.remove(particle.mesh);
                } else {
                    this.scene.remove(particle.mesh);
                }
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Trigger discovery celebration
     */
    celebrateDiscovery(position) {
        // Multiple effects for a grand celebration
        this.createConfetti(position, 150);
        this.createSparkles(position, 15, 80);
        this.createRingExplosion(position, 0xffd700);
        
        // Delayed second ring
        setTimeout(() => {
            this.createRingExplosion(position, 0x4a90e2);
        }, 200);
    }
}
