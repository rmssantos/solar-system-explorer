function catalogItem(value) {
    return Object.freeze({ ...value });
}

export const INSTRUMENT_CATALOG = Object.freeze([
    catalogItem({ id: 'camera', icon: '◉' }),
    catalogItem({ id: 'magnetometer', icon: '⌁' }),
    catalogItem({ id: 'radio', icon: '⌁⌁' })
]);

export const POWER_PROFILE_CATALOG = Object.freeze([
    catalogItem({ id: 'survey', qualityBonus: 0 }),
    catalogItem({ id: 'balanced', qualityBonus: 5 }),
    catalogItem({ id: 'focused', qualityBonus: 10 })
]);

export const ROUTE_PROFILE_CATALOG = Object.freeze([
    catalogItem({ id: 'fast', durationMultiplier: 0.7, qualityBonus: 0 }),
    catalogItem({ id: 'stable', durationMultiplier: 1.2, qualityBonus: 10 })
]);

export function getAgencyCatalogItem(catalog, id) {
    return catalog.find((item) => item.id === id) ?? null;
}
