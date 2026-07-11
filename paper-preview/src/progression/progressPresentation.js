import { evaluateAwards, getExplorerLevel } from './expeditionProgress.js';

export function presentProgress(progress = {}, snapshot = {}, language = 'pt') {
    const xp = Math.max(0, Number.isFinite(progress.xp) ? Math.round(progress.xp) : 0);
    const rank = getExplorerLevel(xp, language);
    const isMaxLevel = rank.nextThreshold === rank.threshold;
    const xpForLevel = isMaxLevel ? 0 : rank.nextThreshold - rank.threshold;
    const xpIntoLevel = isMaxLevel ? 0 : xp - rank.threshold;
    return Object.freeze({
        xp,
        level: rank.level,
        title: rank.title,
        currentThreshold: rank.threshold,
        nextThreshold: rank.nextThreshold,
        xpIntoLevel,
        xpForLevel,
        xpRemaining: isMaxLevel ? 0 : Math.max(0, rank.nextThreshold - xp),
        progressPercent: isMaxLevel ? 100 : Math.max(0, Math.min(100, (xpIntoLevel / xpForLevel) * 100)),
        isMaxLevel,
        awards: evaluateAwards(snapshot, language)
    });
}

export function compareProgress(before = {}, after = {}) {
    const previousAwards = new Set((before.awards ?? []).map((award) => award.id));
    const leveledUp = Number(after.level ?? 0) > Number(before.level ?? 0);
    return Object.freeze({
        xpGained: Math.max(0, Number(after.xp ?? 0) - Number(before.xp ?? 0)),
        leveledUp,
        newLevel: leveledUp ? Object.freeze({ level: after.level, title: after.title }) : null,
        newAwards: Object.freeze((after.awards ?? []).filter((award) => !previousAwards.has(award.id)))
    });
}
