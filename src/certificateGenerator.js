/**
 * Certificate Generator - Creates a Space Explorer Certificate
 * Renders using HTML5 Canvas and allows download as PNG
 */
import { i18n } from './i18n.js';

export class CertificateGenerator {
    /**
     * Generate a certificate as a data URL (PNG).
     * @param {string} playerName - The player's name
     * @param {{ planetsVisited: number, missionsCompleted: number, xpTotal: number, quizStreak: number }} stats
     * @returns {string} data URL of the certificate image
     */
    generate(playerName, stats) {
        const width = 800;
        const height = 600;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark space background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0a0e2a');
        bgGrad.addColorStop(0.5, '#121840');
        bgGrad.addColorStop(1, '#0a0e2a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Stars
        for (let i = 0; i < 120; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 1.5 + 0.3;
            const alpha = Math.random() * 0.7 + 0.3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }

        // Gold border - outer
        ctx.strokeStyle = '#d4a537';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Gold border - inner (double line)
        ctx.strokeStyle = '#d4a537';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        // Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d4a537';
        ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
        ctx.fillText(i18n.t('cert_title'), width / 2, 90);

        // Trophy emoji representation
        ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", Arial';
        ctx.fillText('\uD83C\uDFC6', width / 2, 140);

        // "Awarded to" text
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#a0aec0';
        ctx.fillText(i18n.t('cert_awarded'), width / 2, 180);

        // Player name in large gold text
        ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(playerName, width / 2, 225);

        // Completion message
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(i18n.t('cert_completed'), width / 2, 265);

        // Divider line
        ctx.beginPath();
        ctx.moveTo(150, 290);
        ctx.lineTo(width - 150, 290);
        ctx.strokeStyle = 'rgba(212, 165, 55, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Stats section
        const statsY = 330;
        const statsSpacing = 130;
        const statsStartX = width / 2 - (statsSpacing * 1.5);

        const statItems = [
            { label: i18n.t('cert_planets'), value: String(stats.planetsVisited), icon: '\uD83C\uDF0D' },
            { label: i18n.t('cert_missions'), value: String(stats.missionsCompleted), icon: '\uD83D\uDE80' },
            { label: 'XP', value: String(stats.xpTotal), icon: '\u2B50' },
            { label: i18n.t('daily_streak'), value: String(stats.quizStreak), icon: '\uD83D\uDD25' }
        ];

        statItems.forEach((stat, i) => {
            const x = statsStartX + i * statsSpacing;

            // Icon
            ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", Arial';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(stat.icon, x, statsY - 15);

            // Value
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(stat.value, x, statsY + 20);

            // Label
            ctx.font = '12px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(stat.label, x, statsY + 42);
        });

        // Divider line below stats
        ctx.beginPath();
        ctx.moveTo(150, 400);
        ctx.lineTo(width - 150, 400);
        ctx.strokeStyle = 'rgba(212, 165, 55, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Date
        const dateStr = new Date().toLocaleDateString(i18n.lang === 'pt' ? 'pt-PT' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${i18n.t('cert_date')}: ${dateStr}`, width / 2, 435);

        // "Solar System Explorer" logo text
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        const logoGrad = ctx.createLinearGradient(width / 2 - 120, 0, width / 2 + 120, 0);
        logoGrad.addColorStop(0, '#6366f1');
        logoGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = logoGrad;
        ctx.fillText('Solar System Explorer', width / 2, 480);

        // Small rocket decoration
        ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", Arial';
        ctx.fillText('\uD83D\uDE80', width / 2 - 160, 482);
        ctx.fillText('\u2B50', width / 2 + 150, 482);

        return canvas.toDataURL('image/png');
    }

    /**
     * Download the certificate as a PNG file.
     * @param {string} playerName
     * @param {{ planetsVisited: number, missionsCompleted: number, xpTotal: number, quizStreak: number }} stats
     */
    download(playerName, stats) {
        const dataUrl = this.generate(playerName, stats);
        const link = document.createElement('a');
        link.download = `space_explorer_certificate_${playerName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
    }
}
