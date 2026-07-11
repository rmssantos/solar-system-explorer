import { describe, expect, it } from 'vitest';
import { chooseNearbyObject } from '../paper-preview/src/world/proximity.js';

describe('world interaction priority', () => {
    it('lets a nearby moon or satellite win over its much larger parent planet', () => {
        expect(chooseNearbyObject('jupiter', 'europa')).toBe('europa');
        expect(chooseNearbyObject('earth', 'iss')).toBe('iss');
        expect(chooseNearbyObject('earth', null)).toBe('earth');
    });
});
