export function cameraFollowAlpha(deltaSeconds, response = 18) {
    const delta = Math.min(0.1, Math.max(0, Number.isFinite(deltaSeconds) ? deltaSeconds : 0));
    return Math.min(1, Math.max(0, 1 - Math.exp(-response * delta)));
}
