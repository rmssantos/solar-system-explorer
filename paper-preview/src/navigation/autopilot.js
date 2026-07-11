function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function wrapAngle(value) {
    const turn = Math.PI * 2;
    return ((((value + Math.PI) % turn) + turn) % turn) - Math.PI;
}

function turnToward(current, target, blend) {
    return wrapAngle(current + wrapAngle(target - current) * blend);
}

export function createAutopilot(targetKey, from, target, arrivalRadius = 2.2) {
    const initialDistance = Math.hypot(target.x - from.x, target.y - from.y, target.z - from.z);
    const initialDx = (target.x - from.x) / Math.max(initialDistance, 0.0001);
    const initialDz = (target.z - from.z) / Math.max(initialDistance, 0.0001);
    const outwardDot = (-initialDz * from.x) + (initialDx * from.z);
    return {
        targetKey,
        arrivalRadius: Math.max(0.8, arrivalRadius),
        initialDistance: Math.max(initialDistance, arrivalRadius + 0.01),
        arcSign: outwardDot >= 0 ? 1 : -1,
        elapsed: 0,
        progress: 0
    };
}

export function stepAutopilot(flightState, autopilot, target, deltaSeconds) {
    if (!autopilot || !target) return { flightState, autopilot: null, arrived: false };
    const delta = clamp(deltaSeconds, 0, 0.1);
    const dx = target.x - flightState.position.x;
    const dy = target.y - flightState.position.y;
    const dz = target.z - flightState.position.z;
    const distance = Math.hypot(dx, dy, dz) || 0.0001;
    const remaining = distance - autopilot.arrivalRadius;
    if (remaining <= 0.035) {
        return {
            flightState: {
                ...flightState,
                velocity: { x: 0, y: 0, z: 0 }
            },
            autopilot: null,
            arrived: true
        };
    }

    const directX = dx / distance;
    const directY = dy / distance;
    const directZ = dz / distance;
    const speed = Math.min(28, Math.max(5.5, remaining * 0.82));
    const travel = Math.min(remaining, speed * delta);
    const actualSpeed = delta > 0 ? travel / delta : 0;
    const nextElapsed = autopilot.elapsed + delta;
    const progress = clamp(1 - ((remaining - travel) / Math.max(0.01, autopilot.initialDistance - autopilot.arrivalRadius)), 0, 1);
    const arcEnvelope = autopilot.targetKey === 'sun'
        ? 0.12 * Math.sin(Math.PI * progress)
        : 0.78 * Math.sin(Math.PI * Math.min(1, progress + 0.13));
    const curvedX = directX + (-directZ * autopilot.arcSign * arcEnvelope);
    const curvedY = directY;
    const curvedZ = directZ + (directX * autopilot.arcSign * arcEnvelope);
    const curvedLength = Math.hypot(curvedX, curvedY, curvedZ) || 1;
    const nx = curvedX / curvedLength;
    const ny = curvedY / curvedLength;
    const nz = curvedZ / curvedLength;
    const desiredYaw = Math.atan2(-nx, -nz);
    const desiredPitch = Math.asin(clamp(ny, -1, 1));
    const turnBlend = 1 - Math.exp(-6.5 * delta);
    const playfulBank = Math.sin(nextElapsed * 4.4) * 0.16 * Math.sin(Math.PI * progress);

    return {
        flightState: {
            ...flightState,
            position: {
                x: flightState.position.x + nx * travel,
                y: flightState.position.y + ny * travel,
                z: flightState.position.z + nz * travel
            },
            velocity: { x: nx * actualSpeed, y: ny * actualSpeed, z: nz * actualSpeed },
            orientation: {
                yaw: turnToward(flightState.orientation.yaw, desiredYaw, turnBlend),
                pitch: flightState.orientation.pitch + (desiredPitch - flightState.orientation.pitch) * turnBlend,
                roll: playfulBank
            }
        },
        autopilot: { ...autopilot, elapsed: nextElapsed, progress },
        arrived: false
    };
}
