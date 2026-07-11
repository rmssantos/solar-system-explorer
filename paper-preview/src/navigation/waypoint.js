const auFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 });

export function formatSolarDistance(distanceAu) {
    if (distanceAu === 0) return 'Centro do sistema';
    if (!Number.isFinite(distanceAu) || distanceAu < 0) return 'Órbita variável';
    return `${auFormatter.format(distanceAu)} UA ao Sol`;
}

export function calculateWaypoint({
    from,
    to,
    basis,
    interactionRadius = 0,
    solarDistanceAu = 0
}) {
    const offset = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
    const distanceUnits = Math.hypot(offset.x, offset.y, offset.z);
    const safeDistance = distanceUnits || 1;
    const rightAmount = (
        offset.x * basis.right.x + offset.y * basis.right.y + offset.z * basis.right.z
    ) / safeDistance;
    const forwardAmount = (
        offset.x * basis.forward.x + offset.y * basis.forward.y + offset.z * basis.forward.z
    ) / safeDistance;
    const upAmount = (
        offset.x * basis.up.x + offset.y * basis.up.y + offset.z * basis.up.z
    ) / safeDistance;
    const reached = distanceUnits <= interactionRadius;
    return Object.freeze({
        angleRadians: Math.atan2(rightAmount, forwardAmount),
        elevation: Math.asin(Math.min(1, Math.max(-1, upAmount))),
        distanceUnits,
        reached,
        distanceLabel: reached ? 'Ao alcance' : `${Math.round(distanceUnits)} u no diorama`,
        scientificLabel: formatSolarDistance(solarDistanceAu)
    });
}
