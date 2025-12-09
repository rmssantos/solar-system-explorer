/**
 * Manages camera movement, zooming, and target tracking.
 * Supports Mouse and Touch inputs.
 * Enhanced with smooth fly-to animations!
 */
import * as THREE from 'three';

export class CameraControls {
    constructor(camera, domElement, app) {
        this.camera = camera;
        this.domElement = domElement;
        this.app = app; // Reference to main app (optional if we link solarSystem directly)
        this.solarSystem = null;

        // Enabled state
        this.enabled = true;

        // State
        this.target = new THREE.Vector3(0, 0, 0);
        this.orbitRadius = 800;
        this.theta = Math.PI / 4;
        this.phi = Math.PI / 6;

        this.minZoom = 20;
        this.maxZoom = 2000;

        // Mouse State
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Touch State
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.lastPinchDistance = null;

        // Follow Target
        this.followingObject = null;
        
        // Fly-to animation state
        this.isFlying = false;
        this.flyStartPos = new THREE.Vector3();
        this.flyEndPos = new THREE.Vector3();
        this.flyStartTarget = new THREE.Vector3();
        this.flyEndTarget = new THREE.Vector3();
        this.flyProgress = 0;
        this.flyDuration = 2.0; // seconds
        this.flyCallback = null;
        this.pendingObjectName = null;

        this.initListeners();
    }

    setSolarSystem(solarSystem) {
        this.solarSystem = solarSystem;
    }

    initListeners() {
        // --- Mouse ---
        this.domElement.addEventListener('mousedown', (e) => {
            if (!this.enabled) return;
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.domElement.addEventListener('mousemove', (e) => {
            if (!this.enabled) return; // Don't process when manual navigation is active
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                this.rotate(-deltaX * 0.005, -deltaY * 0.005);
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        this.domElement.addEventListener('wheel', (e) => {
            if (!this.enabled) return;
            e.preventDefault();
            this.zoom(e.deltaY * 0.5);
        }, { passive: false });

        this.domElement.addEventListener('click', (e) => this.onClick(e));

        // --- Touch ---
        this.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.domElement.addEventListener('touchend', (e) => {
            this.isDragging = false;
            this.lastPinchDistance = null;
        });
    }

    // --- Touch Logic ---

    onTouchStart(e) {
        if (!this.enabled) return;
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
        }
        else if (e.touches.length === 2) {
            this.isDragging = false; // Zoom takes precedence
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            this.lastPinchDistance = Math.hypot(dx, dy);
        }
    }

    onTouchMove(e) {
        if (!this.enabled) return;
        e.preventDefault(); // Stop scrolling

        if (e.touches.length === 1 && this.isDragging) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            const deltaX = touchX - this.lastTouchX;
            const deltaY = touchY - this.lastTouchY;

            this.rotate(-deltaX * 0.005, -deltaY * 0.005);

            this.lastTouchX = touchX;
            this.lastTouchY = touchY;
        }
        else if (e.touches.length === 2 && this.lastPinchDistance) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.hypot(dx, dy);

            const delta = this.lastPinchDistance - distance; // positive if shrinking
            this.zoom(delta * 2);

            this.lastPinchDistance = distance;
        }
    }

    // --- Click / Select Logic ---

    onClick(e) {
        if (!this.enabled) return; // Disabled during manual navigation
        if (!this.solarSystem) return;
        if (this.isFlying) return; // Don't interrupt flight

        // Calculate Mouse NDC
        // (clientX / innerWidth) * 2 - 1 ...
        const rect = this.domElement.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const obj = this.solarSystem.checkIntersection(this.camera, x, y);
        if (obj) {
            const name = this.solarSystem.highlightObject(obj);
            if (name) {
                // Start fly-to animation instead of instant teleport
                this.flyToObject(obj, name);
            }
        } else {
            // Maybe clear selection? 
            // this.solarSystem.clearHighlights(); 
            // Optional
        }
    }
    
    /**
     * Smooth fly-to animation for visiting objects
     * Uses natural physics: accelerate -> cruise -> decelerate
     */
    flyToObject(mesh, objectName) {
        // Get target world position
        const targetWorldPos = new THREE.Vector3();
        mesh.getWorldPosition(targetWorldPos);
        
        // Calculate good viewing distance based on object size
        let viewDistance = 150;
        if (mesh.geometry && mesh.geometry.boundingSphere) {
            viewDistance = mesh.geometry.boundingSphere.radius * 4;
        }
        viewDistance = Math.max(30, Math.min(viewDistance, 300));
        
        // Store current camera position and target
        this.flyStartPos.copy(this.camera.position);
        this.flyStartTarget.copy(this.target);
        
        // Calculate end position - approach from current direction but elevated slightly
        const direction = new THREE.Vector3()
            .subVectors(this.camera.position, targetWorldPos);
        
        // If too close, use a nice approach angle
        if (direction.length() < 50) {
            direction.set(1, 0.5, 1);
        }
        direction.normalize();
        
        // Add slight elevation for cinematic approach
        direction.y = Math.max(direction.y, 0.2);
        direction.normalize();
        
        this.flyEndTarget.copy(targetWorldPos);
        this.flyEndPos.copy(targetWorldPos).add(direction.multiplyScalar(viewDistance));
        
        // Calculate flight duration - natural feeling based on distance
        const distance = this.flyStartPos.distanceTo(this.flyEndPos);
        // Shorter distances = quicker, longer = proportionally longer but capped
        this.flyDuration = Math.min(Math.max(distance / 400, 1.5), 4.0);
        
        // Start animation
        this.isFlying = true;
        this.flyProgress = 0;
        this.pendingObjectName = objectName;
        this.followingObject = mesh;
        
        // Update orbit radius for after animation
        this.orbitRadius = viewDistance;
    }

    // --- Core API ---

    rotate(deltaTheta, deltaPhi) {
        this.theta += deltaTheta;
        this.phi += deltaPhi;
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
    }

    zoom(delta) {
        this.orbitRadius += delta;
        this.orbitRadius = Math.max(this.minZoom, Math.min(this.maxZoom, this.orbitRadius));
    }

    setTarget(mesh) {
        this.followingObject = mesh;
        if (this.orbitRadius > 300) this.orbitRadius = 150;
    }

    resetView() {
        this.followingObject = null;
        this.target.set(0, 0, 0);
        this.orbitRadius = 800;
        this.theta = Math.PI / 4;
        this.phi = Math.PI / 6;
        if (this.solarSystem) this.solarSystem.clearHighlights();
    }

    update(deltaTime) {
        // Skip updates when disabled (e.g., during manual navigation)
        if (!this.enabled) return;

        // Handle fly-to animation
        if (this.isFlying) {
            this.flyProgress += deltaTime / this.flyDuration;
            
            if (this.flyProgress >= 1.0) {
                // Animation complete
                this.flyProgress = 1.0;
                this.isFlying = false;
                
                // Set final position
                this.camera.position.copy(this.flyEndPos);
                this.target.copy(this.flyEndTarget);
                
                // IMPORTANT: Calculate theta and phi from final position
                // This prevents the "jump" when normal orbit update takes over
                const offset = new THREE.Vector3().subVectors(this.flyEndPos, this.flyEndTarget);
                this.orbitRadius = offset.length();
                
                // Calculate spherical coordinates from cartesian offset
                this.phi = Math.acos(Math.max(-1, Math.min(1, offset.y / this.orbitRadius)));
                this.theta = Math.atan2(offset.z, offset.x);
                
                this.camera.lookAt(this.target);
                
                // Show info panel after a gentle delay
                if (this.pendingObjectName && this.solarSystem?.uiManager) {
                    const objectName = this.pendingObjectName;
                    setTimeout(() => {
                        this.solarSystem?.uiManager?.showInfo(objectName);
                    }, 500);
                }
                this.pendingObjectName = null;
            } else {
                // Natural physics easing using smoothstep
                const t = this.flyProgress;
                const ease = t * t * (3 - 2 * t);
                
                // Interpolate camera position
                this.camera.position.lerpVectors(this.flyStartPos, this.flyEndPos, ease);
                
                // Always look at destination
                this.camera.lookAt(this.flyEndTarget);
            }
            return;
        }
        
        // Normal orbit update
        if (this.followingObject) {
            const worldPos = new THREE.Vector3();
            this.followingObject.getWorldPosition(worldPos);
            this.target.lerp(worldPos, 0.1);
        } else {
            this.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        }

        const x = this.orbitRadius * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.orbitRadius * Math.cos(this.phi);
        const z = this.orbitRadius * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.position.set(
            this.target.x + x,
            this.target.y + y,
            this.target.z + z
        );

        this.camera.lookAt(this.target);
    }
}
