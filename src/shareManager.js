/**
 * Share Manager - Generate progress cards and share URLs
 * Allows players to share their exploration progress
 */
import { i18n } from './i18n.js';

export class ShareManager {
    /**
     * Generate a progress card as a data URL (PNG).
     * @param {object} app - The main App instance
     * @returns {string} data URL of the progress card image
     */
    generateProgressCard(app) {
        const width = 600;
        const height = 400;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark space background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0a0e2a');
        bgGrad.addColorStop(0.5, '#151a3a');
        bgGrad.addColorStop(1, '#0a0e2a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Stars
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 1.2 + 0.3;
            const alpha = Math.random() * 0.6 + 0.3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }

        // Border
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(i18n.t('share_card_title'), width / 2, 50);

        // Player name and rank
        const playerName = app.playerName || '???';
        const rank = app.xpSystem?.getCurrentRank?.();
        const rankName = rank ? (app.xpSystem.getRankName?.(rank) || '') : '';
        const rankIcon = rank?.icon || '';

        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`${rankIcon} ${playerName}`, width / 2, 90);

        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#a0aec0';
        ctx.fillText(rankName, width / 2, 112);

        // Planet icons row - show visited vs unvisited
        const planets = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        const planetColors = {
            sun: '#ffcc00',
            mercury: '#b0b0b0',
            venus: '#e8cda0',
            earth: '#4488ff',
            mars: '#cc4422',
            jupiter: '#cc9966',
            saturn: '#ddc488',
            uranus: '#88ccdd',
            neptune: '#4466cc'
        };

        const visited = app.gameManager?.visited || new Set();
        const circleY = 160;
        const circleSpacing = 55;
        const startX = width / 2 - (planets.length - 1) * circleSpacing / 2;

        planets.forEach((planet, i) => {
            const x = startX + i * circleSpacing;
            const isVisited = visited.has(planet);

            ctx.beginPath();
            ctx.arc(x, circleY, 18, 0, Math.PI * 2);
            ctx.fillStyle = isVisited ? planetColors[planet] : '#2d3748';
            ctx.fill();

            if (isVisited) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Planet initial letter below
            ctx.font = '10px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isVisited ? '#e2e8f0' : '#4a5568';
            ctx.textAlign = 'center';
            ctx.fillText(planet.charAt(0).toUpperCase(), x, circleY + 32);
        });

        // XP bar
        const xp = app.xpSystem?.xp || 0;
        const level = app.xpSystem?.level || 1;
        const maxXP = 3200; // Level 10 threshold
        const xpBarY = 220;
        const xpBarWidth = 400;
        const xpBarHeight = 16;
        const xpBarX = (width - xpBarWidth) / 2;

        // XP bar background
        ctx.fillStyle = '#1a2237';
        ctx.beginPath();
        ctx.roundRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight, 8);
        ctx.fill();

        // XP bar fill
        const xpPercent = Math.min(xp / maxXP, 1);
        const barGrad = ctx.createLinearGradient(xpBarX, 0, xpBarX + xpBarWidth, 0);
        barGrad.addColorStop(0, '#6366f1');
        barGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight, 8);
        ctx.fill();

        // XP text
        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(`${i18n.t('level')} ${level} - ${xp} XP`, width / 2, xpBarY + xpBarHeight + 20);

        // Mission count
        const missionsCompleted = app.missionSystem?.completedMissions?.size || 0;
        const totalMissions = app.missionSystem?.missions?.length || 20;

        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(
            `\uD83D\uDE80 ${i18n.t('cert_missions')}: ${missionsCompleted}/${totalMissions}`,
            width / 2,
            290
        );

        // Planets visited count
        ctx.fillText(
            `\uD83C\uDF0D ${i18n.t('cert_planets')}: ${visited.size}`,
            width / 2,
            320
        );

        // "Solar System Explorer" branding
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        const logoGrad = ctx.createLinearGradient(width / 2 - 100, 0, width / 2 + 100, 0);
        logoGrad.addColorStop(0, '#6366f1');
        logoGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = logoGrad;
        ctx.fillText('Solar System Explorer', width / 2, 370);

        return canvas.toDataURL('image/png');
    }

    /**
     * Generate a shareable URL with base64-encoded progress.
     * @param {object} app - The main App instance
     * @returns {string} The share URL
     */
    shareURL(app) {
        const visited = app.gameManager?.getVisitedList?.() || [];
        const xp = app.xpSystem?.xp || 0;
        const missions = app.missionSystem?.completedMissions?.size || 0;
        const name = app.playerName || '???';

        const data = { name, visited, xp, missions };
        const json = JSON.stringify(data);
        const encoded = btoa(unescape(encodeURIComponent(json)));

        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}#progress=${encoded}`;
    }

    /**
     * Copy text to clipboard.
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback for older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
                return true;
            } catch {
                return false;
            }
        }
    }

    /**
     * Check if the URL contains shared progress data and show overlay if so.
     */
    static checkSharedProgress() {
        const hash = window.location.hash;
        if (!hash.startsWith('#progress=')) return;

        try {
            const encoded = hash.substring('#progress='.length);
            const json = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(json);

            // Anyone can craft this URL: clamp every field before it is shown
            // inside a trusted-looking overlay (rendering is textContent-only,
            // so this is about content sanity, not script injection).
            if (!data || typeof data.name !== 'string' || !data.name.trim()) return;
            const safe = {
                name: data.name.trim().slice(0, 20),
                visited: Array.isArray(data.visited)
                    ? data.visited.filter(v => typeof v === 'string').slice(0, 50)
                    : [],
                xp: Math.max(0, Math.min(999999, Math.floor(Number(data.xp)) || 0)),
                missions: Math.max(0, Math.min(99, Math.floor(Number(data.missions)) || 0))
            };

            ShareManager.showFriendOverlay(safe);
            // Clean up the hash
            history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch {
            // Invalid data, ignore
        }
    }

    /**
     * Show overlay when visiting a shared progress link.
     * @param {{ name: string, visited: string[], xp: number, missions: number }} data
     */
    static showFriendOverlay(data) {
        const overlay = document.createElement('div');
        overlay.className = 'share-friend-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 20000; opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #1a1a3e, #0a0e2a);
            border: 2px solid rgba(99, 102, 241, 0.5);
            border-radius: 16px; padding: 32px; text-align: center;
            max-width: 400px; color: #e2e8f0; font-family: "Segoe UI", Arial, sans-serif;
        `;

        const title = document.createElement('h2');
        title.style.cssText = 'color: #ffd700; margin: 0 0 12px; font-size: 1.4rem;';
        title.textContent = i18n.t('share_friend_title');
        card.appendChild(title);

        const nameEl = document.createElement('p');
        nameEl.style.cssText = 'font-size: 1.6rem; font-weight: bold; color: #fff; margin: 8px 0;';
        nameEl.textContent = data.name;
        card.appendChild(nameEl);

        const visitedCount = Array.isArray(data.visited) ? data.visited.length : 0;
        const statsEl = document.createElement('p');
        statsEl.style.cssText = 'color: #94a3b8; margin: 8px 0 20px;';
        statsEl.textContent = i18n.t('share_friend_visited').replace('{count}', String(visitedCount));
        card.appendChild(statsEl);

        const moreStats = document.createElement('p');
        moreStats.style.cssText = 'color: #a0aec0; font-size: 0.9rem; margin: 0 0 20px;';
        moreStats.textContent = `${data.xp || 0} XP | ${data.missions || 0} ${i18n.t('cert_missions')}`;
        card.appendChild(moreStats);

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border: none; border-radius: 8px; padding: 10px 28px;
            color: white; font-size: 1rem; cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.textContent = i18n.t('close');
        closeBtn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        });
        card.appendChild(closeBtn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
    }
}
