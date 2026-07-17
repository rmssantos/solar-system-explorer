function catalogItem(value) {
    return Object.freeze({ ...value });
}

export const INSTRUMENT_CATALOG = Object.freeze([
    catalogItem({ id: 'camera', icon: '◉', purposeKey: 'game.agency.instrument.camera.purpose', consequenceKey: 'game.agency.instrument.camera.consequence' }),
    catalogItem({ id: 'magnetometer', icon: '⌁', purposeKey: 'game.agency.instrument.magnetometer.purpose', consequenceKey: 'game.agency.instrument.magnetometer.consequence' }),
    catalogItem({ id: 'radio', icon: '⌁⌁', purposeKey: 'game.agency.instrument.radio.purpose', consequenceKey: 'game.agency.instrument.radio.consequence' })
]);

export const POWER_PROFILE_CATALOG = Object.freeze([
    catalogItem({ id: 'survey', qualityBonus: 0, purposeKey: 'game.agency.power.survey.purpose', consequenceKey: 'game.agency.power.survey.consequence' }),
    catalogItem({ id: 'balanced', qualityBonus: 5, purposeKey: 'game.agency.power.balanced.purpose', consequenceKey: 'game.agency.power.balanced.consequence' }),
    catalogItem({ id: 'focused', qualityBonus: 10, purposeKey: 'game.agency.power.focused.purpose', consequenceKey: 'game.agency.power.focused.consequence' })
]);

export const ROUTE_PROFILE_CATALOG = Object.freeze([
    catalogItem({ id: 'fast', durationMultiplier: 0.7, qualityBonus: 0, purposeKey: 'game.agency.route.fast.purpose', consequenceKey: 'game.agency.route.fast.consequence' }),
    catalogItem({ id: 'stable', durationMultiplier: 1.2, qualityBonus: 10, purposeKey: 'game.agency.route.stable.purpose', consequenceKey: 'game.agency.route.stable.consequence' })
]);

export function getAgencyCatalogItem(catalog, id) {
    return catalog.find((item) => item.id === id) ?? null;
}
