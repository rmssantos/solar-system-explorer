/**
 * Speed HUD copy — pure formatting/lookup helpers extracted from
 * manualNavigation.js (same decomposition direction as WarpModel.js:
 * pure logic first, so it is unit-testable without DOM or Three.js).
 */
import { i18n } from '../i18n.js';

/** Speed of light in km/s — at or above this the HUD shows the special label. */
export const LIGHT_SPEED_KMS = 299792;

/** Human format for the speedometer ("1.5 milhões km/s", "50 mil km/s", ...). */
export function formatSpeed(kmPerSec) {
    if (kmPerSec >= LIGHT_SPEED_KMS) {
        return i18n.t('speed_light');
    } else if (kmPerSec >= 1000000) {
        return i18n.t('speed_million').replace('{n}', (kmPerSec / 1000000).toFixed(1));
    } else if (kmPerSec >= 1000) {
        return i18n.t('speed_thousand').replace('{n}', (kmPerSec / 1000).toFixed(0));
    }
    return `${kmPerSec.toLocaleString()} km/s`;
}

/** Kid-facing comparison line for the current speed. */
export function getSpeedComparison(kmPerSec) {
    if (kmPerSec >= LIGHT_SPEED_KMS) {
        return i18n.t('comp_universe');
    } else if (kmPerSec >= 50000000) {
        return i18n.t('comp_earth_mars');
    } else if (kmPerSec >= 20000000) {
        return i18n.t('comp_around_world');
    } else if (kmPerSec >= 5000000) {
        return i18n.t('comp_sun_earth');
    } else if (kmPerSec >= 1000000) {
        return i18n.t('comp_voyager');
    } else if (kmPerSec >= 500000) {
        return i18n.t('comp_lightning');
    } else if (kmPerSec >= 100000) {
        return i18n.t('comp_f1');
    } else if (kmPerSec >= 50000) {
        return i18n.t('comp_plane');
    } else {
        return i18n.t('comp_car');
    }
}
