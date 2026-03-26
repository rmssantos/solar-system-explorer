/**
 * Handles creation and animation of comets in the Solar System.
 */
import * as THREE from 'three';

export class CometSystem {
    constructor(solarSystemGroup, objects) {
        this.solarSystemGroup = solarSystemGroup;
        this.objects = objects;
        this.comets = [];
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
}
