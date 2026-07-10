import { readDataCache, writeDataCache } from './cache.js';
import {
    parseApod,
    parseHorizonsVector,
    parseNasaImageSearch,
    parseOmmElements
} from './parsers.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NASA_IMAGE_TTL = 7 * DAY_MS;
const APOD_TTL = DAY_MS;
const HORIZONS_TTL = DAY_MS;
const SATELLITE_TTL = 2 * 60 * 60 * 1000;

function defaultStorage() {
    try {
        return globalThis.localStorage;
    } catch {
        return null;
    }
}

async function requestJson(fetchFn, url, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchFn(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

export function createSpaceDataService({
    fetchFn = globalThis.fetch?.bind(globalThis),
    storage = defaultStorage(),
    now = () => new Date(),
    nasaApiKey = 'DEMO_KEY',
    timeoutMs = 7000
} = {}) {
    if (typeof fetchFn !== 'function') throw new Error('A fetch implementation is required');

    async function load({ key, ttl, source, fallback, url, parser }) {
        const currentDate = now();
        const currentTime = currentDate.getTime();
        const cached = readDataCache(storage, key);
        if (cached && currentTime - cached.cachedAt <= ttl) {
            return Object.freeze({
                status: 'cached',
                source: Object.freeze(cached.source),
                updatedAt: new Date(cached.cachedAt).toISOString(),
                data: Object.freeze(cached.data)
            });
        }

        try {
            const payload = await requestJson(fetchFn, url, timeoutMs);
            const data = parser(payload);
            const cacheValue = { cachedAt: currentTime, source, data };
            writeDataCache(storage, key, cacheValue);
            return Object.freeze({
                status: 'live',
                source: Object.freeze(source),
                updatedAt: currentDate.toISOString(),
                data
            });
        } catch {
            if (cached) {
                return Object.freeze({
                    status: 'cached',
                    source: Object.freeze(cached.source),
                    updatedAt: new Date(cached.cachedAt).toISOString(),
                    data: Object.freeze(cached.data)
                });
            }
            return Object.freeze({
                status: 'fallback',
                source: Object.freeze(source),
                updatedAt: currentDate.toISOString(),
                data: Object.freeze({ ...fallback })
            });
        }
    }

    function getNasaImage(objectKey, query, fallback) {
        const url = new URL('https://images-api.nasa.gov/search');
        url.searchParams.set('q', query);
        url.searchParams.set('media_type', 'image');
        return load({
            key: `nasa-image:${objectKey}`,
            ttl: NASA_IMAGE_TTL,
            source: { name: 'NASA Image and Video Library', url: url.toString() },
            fallback,
            url: url.toString(),
            parser: parseNasaImageSearch
        });
    }

    function getApod(fallback) {
        const url = new URL('https://api.nasa.gov/planetary/apod');
        url.searchParams.set('api_key', nasaApiKey);
        return load({
            key: 'nasa-apod',
            ttl: APOD_TTL,
            source: { name: 'NASA Astronomy Picture of the Day', url: 'https://apod.nasa.gov/' },
            fallback,
            url: url.toString(),
            parser: parseApod
        });
    }

    function getPlanetVector(objectKey, command, date, fallback) {
        const startDate = new Date(`${date}T00:00:00Z`);
        const stopDate = new Date(startDate.getTime() + DAY_MS).toISOString().slice(0, 10);
        const url = new URL('https://ssd.jpl.nasa.gov/api/horizons.api');
        const params = {
            format: 'json', COMMAND: `'${command}'`, OBJ_DATA: "'NO'", MAKE_EPHEM: "'YES'",
            EPHEM_TYPE: "'VECTORS'", CENTER: "'500@10'", START_TIME: `'${date}'`,
            STOP_TIME: `'${stopDate}'`, STEP_SIZE: "'1 d'", CSV_FORMAT: "'YES'", VEC_TABLE: "'2'"
        };
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        return load({
            key: `horizons:${objectKey}:${date}`,
            ttl: HORIZONS_TTL,
            source: { name: 'NASA/JPL Horizons', url: url.toString() },
            fallback,
            url: url.toString(),
            parser: parseHorizonsVector
        });
    }

    function getSatelliteElements(catalogNumber, fallback) {
        const url = new URL('https://celestrak.org/NORAD/elements/gp.php');
        url.searchParams.set('CATNR', String(catalogNumber));
        url.searchParams.set('FORMAT', 'JSON');
        return load({
            key: `celestrak:${catalogNumber}`,
            ttl: SATELLITE_TTL,
            source: { name: 'CelesTrak GP/OMM', url: url.toString() },
            fallback,
            url: url.toString(),
            parser: parseOmmElements
        });
    }

    return { getNasaImage, getApod, getPlanetVector, getSatelliteElements };
}
