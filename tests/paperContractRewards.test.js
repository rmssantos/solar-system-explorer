import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONTRACT_CATALOG } from '../paper-preview/src/contracts/contractCatalog.js';
import { CONTRACT_REWARDS, getContractReward } from '../paper-preview/src/contracts/contractRewards.js';

describe('orbital contract rewards', () => {
    it('gives every contract a distinct stamp, name and increasing XP reward', () => {
        expect(CONTRACT_REWARDS).toHaveLength(CONTRACT_CATALOG.length);
        expect(new Set(CONTRACT_REWARDS.map((reward) => reward.art)).size).toBe(CONTRACT_REWARDS.length);
        expect(new Set(CONTRACT_REWARDS.map((reward) => reward.copy.pt.title)).size).toBe(CONTRACT_REWARDS.length);
        expect(CONTRACT_REWARDS.map((reward) => reward.xp)).toEqual([...CONTRACT_REWARDS.map((reward) => reward.xp)].sort((a, b) => a - b));
        for (const contract of CONTRACT_CATALOG) {
            const reward = getContractReward(contract.id);
            expect(reward).toMatchObject({ contractId: contract.id });
            expect(reward.copy.en.title).toBeTruthy();
        }
    });

    it('ships every paper stamp as a compact WebP asset', () => {
        for (const reward of CONTRACT_REWARDS) {
            expect(reward.art).toMatch(/^\/art\/awards\/contract-[a-z-]+\.webp$/);
            const file = new URL(`../paper-preview/public${reward.art}`, import.meta.url);
            expect(existsSync(file), `${reward.art} is missing`).toBe(true);
            expect(statSync(file).size).toBeGreaterThan(2_000);
            expect(statSync(file).size).toBeLessThan(80_000);
        }
    });
});
