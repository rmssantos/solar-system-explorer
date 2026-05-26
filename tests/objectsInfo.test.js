/**
 * Schema-shape tests for the post-rename objectsInfo / objectsInfoEN data.
 *
 * These catch:
 *   - Leftover Portuguese property names after the schema migration.
 *   - Missing required fields on any celestial body.
 *   - PT/EN data drift (different planet keys).
 *   - Translation function returning the wrong language.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SOLAR_SYSTEM_DATA, getTranslatedObjectData } from '../src/data/objectsInfo.js';
import { SOLAR_SYSTEM_DATA_EN } from '../src/data/objectsInfoEN.js';
import { i18n } from '../src/i18n.js';

// Every body must have these (probes included).
const REQUIRED_FIELDS = ['name', 'type'];
// Planets/moons/stars/dwarfs must additionally have these.
// Probes/spacecraft have no radius or color in this dataset.
const PLANETARY_FIELDS = ['radiusKm', 'color'];
const PROBE_TYPES = /spacecraft|sonda|telesc[óo]pio|telescope|station|esta[çc][ãa]o|nave|alien/i;

// Old PT field names. Test fails if any of these reappear at the top level of any body.
const FORBIDDEN_PT_FIELDS = [
    'nome', 'tipo', 'distanciaMediaAoSol', 'duracaoDia', 'duracaoAno',
    'numeroLuasConhecidas', 'principaisLuas', 'temperaturaMediaAproximada',
    'curiosidades', 'factosUau', 'comparacao', 'raioKm', 'cor', 'imagemReal',
    'ehPlanetoAnao', 'descricao', 'distanciaKm',
];

describe('SOLAR_SYSTEM_DATA schema (post-rename)', () => {
    it('every body has the required English fields', () => {
        const failures = [];
        for (const [name, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            for (const field of REQUIRED_FIELDS) {
                if (!(field in data)) failures.push(`${name}.${field}`);
            }
            const isProbe = PROBE_TYPES.test(data.type || '');
            if (!isProbe) {
                for (const field of PLANETARY_FIELDS) {
                    if (!(field in data)) failures.push(`${name}.${field}`);
                }
            }
        }
        expect(failures, `Missing fields: ${failures.join(', ')}`).toEqual([]);
    });

    it('no body retains any old Portuguese field name at the top level', () => {
        const leaks = [];
        for (const [name, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            for (const bad of FORBIDDEN_PT_FIELDS) {
                if (bad in data) leaks.push(`${name}.${bad}`);
            }
        }
        expect(leaks, `Forbidden PT fields still present: ${leaks.join(', ')}`).toEqual([]);
    });

    it('no body retains old PT field names inside its moons either', () => {
        const leaks = [];
        for (const [name, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            const moons = data.moons || [];
            for (let i = 0; i < moons.length; i++) {
                const moon = moons[i];
                for (const bad of FORBIDDEN_PT_FIELDS) {
                    if (moon && bad in moon) leaks.push(`${name}.moons[${i}].${bad}`);
                }
            }
        }
        expect(leaks).toEqual([]);
    });

    it('numeric fields are numbers, not strings', () => {
        for (const [name, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            const isProbe = PROBE_TYPES.test(data.type || '');
            if (!isProbe) {
                expect(typeof data.radiusKm, `${name}.radiusKm`).toBe('number');
            }
            if ('avgDistanceFromSun' in data) {
                expect(typeof data.avgDistanceFromSun, `${name}.avgDistanceFromSun`).toBe('number');
            }
        }
    });
});

describe('SOLAR_SYSTEM_DATA_EN parity', () => {
    it('the English data file uses the same English schema (no PT leaks)', () => {
        const leaks = [];
        for (const [name, data] of Object.entries(SOLAR_SYSTEM_DATA_EN)) {
            for (const bad of FORBIDDEN_PT_FIELDS) {
                if (bad in data) leaks.push(`EN ${name}.${bad}`);
            }
        }
        expect(leaks).toEqual([]);
    });

    it('English file translates a subset of the same object keys', () => {
        // We do NOT require every key — EN data is a partial translation layer.
        // But every EN key must exist in the base PT data.
        const ptKeys = new Set(Object.keys(SOLAR_SYSTEM_DATA));
        const orphans = Object.keys(SOLAR_SYSTEM_DATA_EN).filter(k => !ptKeys.has(k));
        expect(orphans, `EN keys not in PT base: ${orphans.join(', ')}`).toEqual([]);
    });
});

describe('getTranslatedObjectData()', () => {
    beforeEach(() => {
        // Reset DOM-dependent state between tests.
        if (typeof document !== 'undefined') {
            try { localStorage.removeItem('spaceExplorer_lang'); } catch {}
        }
    });

    it('returns base data for an unknown name', () => {
        expect(getTranslatedObjectData('not-a-planet')).toBeNull();
    });

    it('returns Portuguese data when lang is pt', () => {
        i18n.setLang('pt');
        const earth = getTranslatedObjectData('earth');
        expect(earth).toBeTruthy();
        expect(earth.name).toMatch(/Terra/);
    });

    it('returns English-merged data when lang is en', () => {
        i18n.setLang('en');
        const earth = getTranslatedObjectData('earth');
        expect(earth).toBeTruthy();
        expect(earth.name).toMatch(/Earth/i);
        // Numeric fields preserved from base after merge.
        expect(typeof earth.radiusKm).toBe('number');
    });
});
