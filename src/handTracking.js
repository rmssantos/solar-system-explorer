/**
 * Handles webcam input and MediaPipe Hands processing.
 * Maps gestures to camera controls and interaction.
 */
export class HandTracker {
    constructor(cameraControls, solarSystem) {
        this.cameraControls = cameraControls;
        this.solarSystem = solarSystem;

        this.videoElement = document.getElementById('input-video');
        this.hands = null;

        // State
        this.isTracking = false;
        this.lastWristX = null;
        this.lastWristY = null;
        this.initialPinchScale = null;
        this.isPinching = false;

        this.reticle = document.getElementById('reticle');
    }

    async start() {
        // Safe check for library
        if (typeof Hands === 'undefined') {
            console.error("MediaPipe Hands library NOT loaded. Check Internet connection or CDNs.");
            return;
        }

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        // Start Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            this.videoElement.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });

            this.isTracking = true;
            this.processVideo();
            console.log("Webcam started.");
        } catch (e) {
            console.warn("Webcam access denied or failed.", e);
            throw e; // Propagate to main catch
        }
    }

    async processVideo() {
        if (!this.isTracking) return;

        if (this.videoElement.readyState >= 2) {
            await this.hands.send({ image: this.videoElement });
        }
        requestAnimationFrame(() => this.processVideo());
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            this.handleGestures(landmarks);
            if (this.reticle) this.reticle.style.display = 'block';
        } else {
            this.lastWristX = null;
            this.lastWristY = null;
            this.isPinching = false;
            // Keep reticle hidden if no hand? Or visible for mouse? 
            // Let's keep it visible for mouse usually, but this resets hand state.
        }
    }

    handleGestures(landmarks) {
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        // 1. Gesture Detection
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const isPinchNow = pinchDist < 0.05;

        // Mode A: Rotate (Open Hand)
        if (!isPinchNow) {
            this.isPinching = false;
            this.initialPinchScale = null;

            if (this.lastWristX !== null) {
                const deltaX = (wrist.x - this.lastWristX) * 5;
                const deltaY = (wrist.y - this.lastWristY) * 5;

                if (Math.abs(deltaX) > 0.002 || Math.abs(deltaY) > 0.002) {
                    this.cameraControls.rotate(deltaX * 2, deltaY * 2);
                }
            }
            this.lastWristX = wrist.x;
            this.lastWristY = wrist.y;

            // Hover check
            const obj = this.solarSystem.checkIntersection(this.cameraControls.camera, 0, 0);
            this.solarSystem.clearHighlights();
            if (obj) {
                this.solarSystem.highlightObject(obj);
                this.reticle.classList.add('active');
            } else {
                this.reticle.classList.remove('active');
            }

        } else {
            // Mode B: Pinch
            if (!this.isPinching) {
                // Just started pinching
                this.isPinching = true;
                this.initialPinchScale = this.getHandScale(landmarks);

                // Select
                const obj = this.solarSystem.checkIntersection(this.cameraControls.camera, 0, 0);
                if (obj) {
                    const name = this.solarSystem.highlightObject(obj);
                    if (name) {
                        this.cameraControls.setTarget(obj);
                        this.solarSystem.uiManager.showInfo(name);
                    }
                }
            } else {
                // Zoom
                const currentScale = this.getHandScale(landmarks);
                // Protect against null scale
                if (this.initialPinchScale && currentScale) {
                    const scaleDelta = currentScale - this.initialPinchScale;
                    if (Math.abs(scaleDelta) > 0.01) {
                        this.cameraControls.zoom(-scaleDelta * 2000);
                        this.initialPinchScale = currentScale;
                    }
                }
            }
            this.lastWristX = null;
            this.lastWristY = null;
        }
    }

    getHandScale(landmarks) {
        const wrist = landmarks[0];
        const indexMCP = landmarks[5];
        return Math.hypot(wrist.x - indexMCP.x, wrist.y - indexMCP.y);
    }
}
