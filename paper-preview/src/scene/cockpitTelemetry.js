const MAX_SPEED = 24;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function degrees(radians) {
    return Math.round((radians * 180) / Math.PI);
}

function coordinate(value) {
    const safe = Number.isFinite(value) ? value : 0;
    const sign = safe >= 0 ? '+' : '-';
    return `${sign}${Math.abs(safe).toFixed(1).padStart(5, '0')}`;
}

export function createCockpitTelemetry(flightState, navigation = null, cameraMode = 'chase') {
    const speed = Math.hypot(
        flightState.velocity.x,
        flightState.velocity.y,
        flightState.velocity.z
    );
    const angle = navigation?.angleRadians ?? 0;
    const radarRadius = clamp(14 + Math.log10(Math.max(1, navigation?.distance ?? 1)) * 8, 14, 38);
    return Object.freeze({
        visible: cameraMode === 'cockpit',
        speed: Number(speed.toFixed(1)),
        speedNeedleDeg: clamp(-120 + (speed / MAX_SPEED) * 240, -120, 120),
        yawDeg: degrees(flightState.orientation.yaw),
        pitchDeg: degrees(flightState.orientation.pitch),
        rollDeg: degrees(flightState.orientation.roll),
        horizonOffsetPercent: clamp((flightState.orientation.pitch / (Math.PI / 2)) * 28, -28, 28),
        coordinates: Object.freeze({
            x: coordinate(flightState.position.x),
            y: coordinate(flightState.position.y),
            z: coordinate(flightState.position.z)
        }),
        radar: Object.freeze({
            xPercent: clamp(50 + Math.sin(angle) * radarRadius, 12, 88),
            yPercent: clamp(50 - Math.cos(angle) * radarRadius, 12, 88)
        })
    });
}
