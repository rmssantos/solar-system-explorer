/**
 * Warp speed model — pure data + name lookup.
 * Extracted from manualNavigation.js so the speed table is reusable and testable.
 *
 * In manual mode (system scaled by 50x), 1 unit ≈ 10,000 km. The km/s values are
 * the "fun comparison" speeds shown in the HUD, not a strict physics sim.
 */
import { i18n } from '../i18n.js';

export const WARP_SPEEDS = [
    { level: 1, speed: 500,     realKmS: 10000,     name: 'Impulso',       color: '#4a90e2' },
    { level: 2, speed: 1500,    realKmS: 50000,     name: 'Warp 1',        color: '#5a9df2' },
    { level: 3, speed: 4000,    realKmS: 100000,    name: 'Warp 2',        color: '#6ab0ff' },
    { level: 4, speed: 10000,   realKmS: 500000,    name: 'Warp 3',        color: '#7ac3ff' },
    { level: 5, speed: 25000,   realKmS: 1000000,   name: 'Warp 4',        color: '#8ad6ff' },
    { level: 6, speed: 60000,   realKmS: 5000000,   name: 'Warp 5',        color: '#ffa500' },
    { level: 7, speed: 150000,  realKmS: 20000000,  name: 'Warp 6',        color: '#ff8c00' },
    { level: 8, speed: 350000,  realKmS: 50000000,  name: 'Warp 7',        color: '#ff6347' },
    { level: 9, speed: 800000,  realKmS: 299792,    name: 'Warp 9 (Luz!)', color: '#ff00ff' },
];

const WARP_NAMES = {
    en: ['Impulse', 'Warp 1', 'Warp 2', 'Warp 3', 'Warp 4', 'Warp 5', 'Warp 6', 'Warp 7', 'Warp 9 (Light!)'],
    pt: ['Impulso', 'Warp 1', 'Warp 2', 'Warp 3', 'Warp 4', 'Warp 5', 'Warp 6', 'Warp 7', 'Warp 9 (Luz!)'],
};

export function getWarpName(level) {
    const lang = i18n.lang || 'pt';
    return WARP_NAMES[lang]?.[level - 1] || WARP_NAMES.pt[level - 1];
}
