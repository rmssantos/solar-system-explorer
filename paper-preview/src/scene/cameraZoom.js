export const CAMERA_DISTANCE_LIMITS = Object.freeze({ min: 0.32, max: 12 });
export const COCKPIT_THRESHOLD = 0.82;

export function adjustCameraDistance(distance, delta) {
    return Math.min(CAMERA_DISTANCE_LIMITS.max, Math.max(
        CAMERA_DISTANCE_LIMITS.min,
        distance + delta
    ));
}

export function cameraModeForDistance(distance) {
    return distance <= COCKPIT_THRESHOLD ? 'cockpit' : 'chase';
}
