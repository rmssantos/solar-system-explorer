function requiredObject(value, message) {
    if (!value || typeof value !== 'object') throw new Error(message);
    return value;
}

export function parseNasaImageSearch(payload) {
    const item = requiredObject(payload?.collection?.items?.[0], 'NASA Images returned no image');
    const metadata = requiredObject(item.data?.[0], 'NASA Images returned no metadata');
    const imageLink = item.links?.find((link) => link.render === 'image' && typeof link.href === 'string');
    if (!imageLink) throw new Error('NASA Images returned no usable image link');
    return Object.freeze({
        nasaId: String(metadata.nasa_id ?? ''),
        title: String(metadata.title ?? 'NASA image'),
        description: String(metadata.description ?? ''),
        dateCreated: metadata.date_created ? String(metadata.date_created) : null,
        center: metadata.center ? String(metadata.center) : 'NASA',
        imageUrl: imageLink.href
    });
}

export function parseApod(payload) {
    requiredObject(payload, 'APOD returned invalid data');
    const imageUrl = payload.hdurl ?? payload.url;
    if (!imageUrl || payload.media_type === 'video') throw new Error('APOD returned no still image');
    return Object.freeze({
        title: String(payload.title ?? 'Astronomy Picture of the Day'),
        explanation: String(payload.explanation ?? ''),
        date: String(payload.date ?? ''),
        copyright: payload.copyright ? String(payload.copyright) : null,
        imageUrl: String(imageUrl)
    });
}

export function parseHorizonsVector(payload) {
    const result = String(payload?.result ?? '');
    const start = result.indexOf('$$SOE');
    const end = result.indexOf('$$EOE');
    if (start < 0 || end <= start) throw new Error('Horizons returned no ephemeris rows');
    const row = result.slice(start + 5, end).trim().split(/\r?\n/).find(Boolean);
    const columns = row?.split(',').map((column) => column.trim()) ?? [];
    const x = Number(columns[2]);
    const y = Number(columns[3]);
    const z = Number(columns[4]);
    if (![x, y, z].every(Number.isFinite)) throw new Error('Horizons returned an invalid vector');
    return Object.freeze({
        epoch: columns[1] ?? null,
        positionKm: Object.freeze({ x, y, z }),
        distanceKm: Math.hypot(x, y, z)
    });
}

export function parseOmmElements(payload) {
    const item = requiredObject(Array.isArray(payload) ? payload[0] : null, 'CelesTrak returned no OMM element');
    const normalized = {
        name: String(item.OBJECT_NAME ?? 'Satellite'),
        catalogNumber: Number(item.NORAD_CAT_ID),
        epoch: String(item.EPOCH ?? ''),
        meanMotion: Number(item.MEAN_MOTION),
        eccentricity: Number(item.ECCENTRICITY),
        inclinationDeg: Number(item.INCLINATION),
        rightAscensionDeg: Number(item.RA_OF_ASC_NODE),
        argumentPerigeeDeg: Number(item.ARG_OF_PERICENTER),
        meanAnomalyDeg: Number(item.MEAN_ANOMALY),
        bstar: Number(item.BSTAR ?? 0)
    };
    const numeric = Object.entries(normalized)
        .filter(([key]) => !['name', 'epoch'].includes(key))
        .map(([, value]) => value);
    if (!normalized.epoch || !numeric.every(Number.isFinite)) throw new Error('CelesTrak returned invalid OMM values');
    return Object.freeze(normalized);
}
