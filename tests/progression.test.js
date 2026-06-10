import { describe, it, expect, vi } from 'vitest';
import { XPSystem, RANKS } from '../src/xpSystem.js';
import { MissionSystem, MISSION_DEFINITIONS } from '../src/missionSystem.js';
import { AchievementSystem } from '../src/achievementSystem.js';

// These run in plain node (no DOM, no localStorage) on purpose: the systems'
// constructors must stay instantiable without a browser, or the logic below
// becomes untestable again.

describe('XPSystem leveling', () => {
    it('consumes the exported RANKS (no duplicated rank table)', () => {
        const xp = new XPSystem();
        expect(xp.ranks).toBe(RANKS);
    });

    it('starts at level 1 with 0 XP', () => {
        const xp = new XPSystem();
        expect(xp.xp).toBe(0);
        expect(xp.level).toBe(1);
        expect(xp.getCurrentRank().level).toBe(1);
    });

    it('levels up exactly at the rank threshold, not before', () => {
        const xp = new XPSystem();
        expect(xp.addXP(99).leveledUp).toBe(false);
        expect(xp.level).toBe(1);

        const result = xp.addXP(1); // total: 100 = level 2 threshold
        expect(result.leveledUp).toBe(true);
        expect(result.newLevel).toBe(2);
        expect(result.newRank.level).toBe(2);
    });

    it('a big XP award can jump multiple levels at once', () => {
        const xp = new XPSystem();
        const result = xp.addXP(450); // crosses 100 and 250 and 450
        expect(result.leveledUp).toBe(true);
        expect(result.newLevel).toBe(4);
    });

    it('caps at the last rank and reports 100% progress', () => {
        const xp = new XPSystem();
        xp.addXP(RANKS[RANKS.length - 1].minXP + 500);
        expect(xp.level).toBe(10);
        expect(xp.getNextRank()).toBeNull();
        expect(xp.getProgressPercent()).toBe(100);
        expect(xp.getXPToNextLevel()).toBe(0);
    });

    it('getXPToNextLevel counts down to the next threshold', () => {
        const xp = new XPSystem();
        xp.addXP(40);
        expect(xp.getXPToNextLevel()).toBe(60); // level 2 at 100
    });
});

describe('MissionSystem completion', () => {
    const fakeGM = { isVisited: () => false };

    it('runs on the exported MISSION_DEFINITIONS (no hand-maintained mirror)', () => {
        const ms = new MissionSystem(fakeGM);
        expect(ms.missions.map(m => m.id)).toEqual(MISSION_DEFINITIONS.map(m => m.id));
        expect(ms.missions.map(m => m.target)).toEqual(MISSION_DEFINITIONS.map(m => m.target));
    });

    it('starts with the order-1 mission active', () => {
        const ms = new MissionSystem(fakeGM);
        expect(ms.activeMission?.id).toBe('first_flight');
    });

    it('completes the mission targeting a visited object and advances', () => {
        const ms = new MissionSystem(fakeGM);
        const completed = ms.checkMissionComplete('mercury');
        expect(completed?.id).toBe('first_flight');
        expect(ms.completedMissions.has('first_flight')).toBe(true);
        expect(ms.activeMission?.id).not.toBe('first_flight');
    });

    it('never completes the same mission twice', () => {
        const ms = new MissionSystem(fakeGM);
        expect(ms.checkMissionComplete('mercury')?.id).toBe('first_flight');
        expect(ms.checkMissionComplete('mercury')).toBeNull();
    });

    it('completes a non-active mission when its target is visited early', () => {
        const ms = new MissionSystem(fakeGM);
        const completed = ms.checkMissionComplete('saturn');
        expect(completed?.id).toBe('ring_master');
        // Active mission is still the first uncompleted by order
        expect(ms.activeMission?.id).toBe('first_flight');
    });

    it('every mission has the fields the UI renders', () => {
        for (const m of MISSION_DEFINITIONS) {
            expect(m.id, JSON.stringify(m)).toBeTruthy();
            expect(m.target).toBeTruthy();
            expect(typeof m.xpReward).toBe('number');
            expect(typeof m.order).toBe('number');
            expect(m.title).toBeTruthy();
            expect(m.description).toBeTruthy();
            expect(m.hint).toBeTruthy();
        }
        // Orders are unique so getNextMission is deterministic
        const orders = MISSION_DEFINITIONS.map(m => m.order);
        expect(new Set(orders).size).toBe(orders.length);
    });
});

describe('AchievementSystem unlocks', () => {
    const stubXP = () => ({ addXP: vi.fn(() => ({ leveledUp: false })) });

    it('first visit unlocks first_discovery', () => {
        const ach = new AchievementSystem(stubXP(), null);
        ach.checkPlanetVisit('mercury', new Set(['mercury']));
        expect(ach.unlockedAchievements.has('first_discovery')).toBe(true);
    });

    it('inner_planets unlocks only when all four rocky planets are visited', () => {
        const ach = new AchievementSystem(stubXP(), null);
        ach.checkPlanetVisit('venus', new Set(['mercury', 'venus', 'earth']));
        expect(ach.unlockedAchievements.has('inner_planets')).toBe(false);

        ach.checkPlanetVisit('mars', new Set(['mercury', 'venus', 'earth', 'mars']));
        expect(ach.unlockedAchievements.has('inner_planets')).toBe(true);
    });

    it('moon_hunter unlocks at 5 distinct moons', () => {
        const ach = new AchievementSystem(stubXP(), null);
        const moons = ['moon', 'io', 'europa', 'titan', 'mimas'];
        ach.checkPlanetVisit('mimas', new Set(moons));
        expect(ach.unlockedAchievements.has('moon_hunter')).toBe(true);
        expect(ach.unlockedAchievements.has('moon_master')).toBe(false);
    });

    it('unlock awards XP exactly once', () => {
        const xp = stubXP();
        const ach = new AchievementSystem(xp, null);
        expect(ach.unlock('sun_worshipper')).toBe(true);
        expect(ach.unlock('sun_worshipper')).toBe(false);
        expect(xp.addXP).toHaveBeenCalledTimes(1);
    });

    it('completionist requires the full 39-object census', () => {
        const ach = new AchievementSystem(stubXP(), null);
        const many = new Set(Array.from({ length: 38 }, (_, i) => `obj${i}`));
        ach.checkPlanetVisit('obj37', many);
        expect(ach.unlockedAchievements.has('completionist')).toBe(false);

        many.add('obj38');
        ach.checkPlanetVisit('obj38', many);
        expect(ach.unlockedAchievements.has('completionist')).toBe(true);
    });
});
