/**
 * IntroAnimation - Cinematic flythrough of the solar system
 * Plays a 6-second camera path through a simplified solar system scene
 * Used as a dynamic background for the welcome screen
 */
import * as THREE from 'three';

export class IntroAnimation {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 50000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(w, h);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.clock = new THREE.Clock();
        this.duration = 6; // seconds
        this.elapsed = 0;
        this.isComplete = false;
        this.isStopped = false;
        this.onComplete = null;
        this.planets = [];
        this.asteroidMesh = null;
        this.sunGlow = null;
        this.starField = null;

        this._onResize = this._handleResize.bind(this);
        window.addEventListener('resize', this._onResize);

        this.setupScene();
        this.createCameraPath();
    }

    setupScene() {
        // Background
        this.scene.background = new THREE.Color(0x000005);

        // --- Starfield ---
        const starCount = 5000;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 8000 + Math.random() * 4000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = r * Math.cos(phi);
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2.5,
            sizeAttenuation: true
        });
        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);

        // --- Lighting ---
        const ambient = new THREE.AmbientLight(0x222244, 0.5);
        this.scene.add(ambient);

        const sunLight = new THREE.PointLight(0xfff0dd, 3, 5000, 0.5);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // --- Sun ---
        const sunGeo = new THREE.SphereGeometry(30, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(0, 0, 0);
        this.scene.add(sun);

        // Sun glow (larger transparent sphere)
        const glowGeo = new THREE.SphereGeometry(50, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffcc44,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        this.sunGlow = new THREE.Mesh(glowGeo, glowMat);
        this.sunGlow.position.set(0, 0, 0);
        this.scene.add(this.sunGlow);

        // Even larger outer glow
        const outerGlowGeo = new THREE.SphereGeometry(80, 32, 32);
        const outerGlowMat = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.06,
            side: THREE.BackSide
        });
        const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
        outerGlow.position.set(0, 0, 0);
        this.scene.add(outerGlow);

        // --- Planets (arranged roughly in a line for the flyby) ---
        const planetDefs = [
            { name: 'Mercury', radius: 1, color: 0xa9a9a9, distance: 80, y: 0 },
            { name: 'Venus', radius: 2.5, color: 0xdeb887, distance: 130, y: -2 },
            { name: 'Earth', radius: 2.5, color: 0x4169e1, distance: 190, y: 3, hasMoon: true },
            { name: 'Mars', radius: 1.8, color: 0xcd5c5c, distance: 260, y: -1 },
            { name: 'Jupiter', radius: 12, color: 0xdaa520, distance: 550, y: 5, striped: true },
            { name: 'Saturn', radius: 10, color: 0xf4c430, distance: 750, y: -3, hasRing: true },
            { name: 'Uranus', radius: 6, color: 0x40e0d0, distance: 950, y: 8, tilted: true },
            { name: 'Neptune', radius: 6, color: 0x1e90ff, distance: 1150, y: -5 }
        ];

        planetDefs.forEach(def => {
            const geo = new THREE.SphereGeometry(def.radius, 24, 24);
            let mat;

            if (def.striped) {
                // Jupiter: create a simple canvas texture with horizontal stripes
                mat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8, metalness: 0.1 });
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                const colors = ['#DAA520', '#CD853F', '#D2B48C', '#B8860B', '#DAA520', '#CD853F', '#8B7355', '#DAA520'];
                const bandH = canvas.height / colors.length;
                colors.forEach((c, i) => {
                    ctx.fillStyle = c;
                    ctx.fillRect(0, i * bandH, canvas.width, bandH);
                });
                const tex = new THREE.CanvasTexture(canvas);
                tex.wrapS = THREE.RepeatWrapping;
                mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.1 });
            } else {
                mat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.7, metalness: 0.2 });
            }

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(def.distance, def.y, 10 + Math.random() * 20 - 10);
            this.scene.add(mesh);

            const planetObj = { mesh, def };

            // Moon for Earth
            if (def.hasMoon) {
                const moonGeo = new THREE.SphereGeometry(0.6, 16, 16);
                const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.position.set(def.distance + 5, def.y + 2, 12);
                this.scene.add(moon);
                planetObj.moon = moon;
            }

            // Ring for Saturn
            if (def.hasRing) {
                const ringGeo = new THREE.RingGeometry(def.radius * 1.3, def.radius * 2.2, 64);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xfff8dc,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.copy(mesh.position);
                ring.rotation.x = Math.PI * 0.4;
                this.scene.add(ring);
                planetObj.ring = ring;
            }

            // Tilt for Uranus
            if (def.tilted) {
                mesh.rotation.z = Math.PI * 0.3;
            }

            this.planets.push(planetObj);
        });

        // --- Asteroid Belt (between Mars at 260 and Jupiter at 550) ---
        const asteroidCount = 200;
        const asteroidGeo = new THREE.IcosahedronGeometry(0.5, 0);
        const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 1.0 });
        this.asteroidMesh = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);

        const dummy = new THREE.Object3D();
        for (let i = 0; i < asteroidCount; i++) {
            const dist = 340 + Math.random() * 150;
            const angle = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 30;
            dummy.position.set(
                dist + Math.cos(angle) * 30,
                y,
                Math.sin(angle) * 30
            );
            const s = 0.3 + Math.random() * 1.2;
            dummy.scale.set(s, s, s);
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            dummy.updateMatrix();
            this.asteroidMesh.setMatrixAt(i, dummy.matrix);
        }
        this.asteroidMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(this.asteroidMesh);
    }

    createCameraPath() {
        this.path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 50, -500),      // Start: dark space
            new THREE.Vector3(0, 20, -100),       // Approaching Sun
            new THREE.Vector3(100, 15, 100),      // Past inner planets (curve)
            new THREE.Vector3(300, 10, 60),       // Sweeping through inner system
            new THREE.Vector3(500, 5, 30),        // Through asteroid belt
            new THREE.Vector3(800, 20, -20),      // Past outer planets
            new THREE.Vector3(1200, 30, -50),     // Further out
            new THREE.Vector3(1500, 100, 0)       // Final lookback - high vantage
        ], false, 'catmullrom', 0.5);
    }

    update() {
        if (this.isStopped) return;

        const dt = this.clock.getDelta();
        // Cap delta to avoid big jumps (e.g., tab switch)
        this.elapsed += Math.min(dt, 0.1);
        const t = Math.min(this.elapsed / this.duration, 1);

        // Ease in-out
        const eased = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Move camera along path
        const pos = this.path.getPoint(eased);
        this.camera.position.copy(pos);

        // Look direction
        if (t < 0.9) {
            const lookPoint = this.path.getPoint(Math.min(eased + 0.03, 1));
            this.camera.lookAt(lookPoint);
        } else {
            // Last 10%: lerp lookAt toward the Sun (origin) for the big reveal
            const lookAhead = this.path.getPoint(Math.min(eased + 0.03, 1));
            const sunPos = new THREE.Vector3(0, 0, 0);
            const blend = (t - 0.9) / 0.1;
            const lookTarget = lookAhead.clone().lerp(sunPos, blend);
            this.camera.lookAt(lookTarget);
        }

        // Animate objects
        const time = this.elapsed;

        // Rotate planets
        this.planets.forEach(p => {
            p.mesh.rotation.y += dt * 0.5;
            if (p.moon) {
                // Orbit moon around earth
                const earthPos = p.mesh.position;
                p.moon.position.x = earthPos.x + Math.cos(time * 2) * 5;
                p.moon.position.z = earthPos.z + Math.sin(time * 2) * 5;
            }
        });

        // Rotate asteroid belt slowly
        if (this.asteroidMesh) {
            this.asteroidMesh.rotation.y += dt * 0.05;
        }

        // Pulse sun glow
        if (this.sunGlow) {
            this.sunGlow.material.opacity = 0.12 + Math.sin(time * 3) * 0.05;
            const s = 1 + Math.sin(time * 2) * 0.05;
            this.sunGlow.scale.set(s, s, s);
        }

        this.renderer.render(this.scene, this.camera);

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
        // Jump to end immediately
        this.isStopped = true;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }
        // Render the final frame
        const finalPos = this.path.getPoint(1);
        this.camera.position.copy(finalPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.renderer.render(this.scene, this.camera);

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
    }

    dispose() {
        this.isStopped = true;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }
        window.removeEventListener('resize', this._onResize);

        // Dispose geometries, materials, textures
        this.scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => {
                        if (m.map) m.map.dispose();
                        m.dispose();
                    });
                } else {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            }
        });

        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.remove();
        }
    }
}
