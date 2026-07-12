import { paperI18n } from './i18n/paperI18n.js';
import { siteAnalytics } from './analytics/siteAnalytics.js';
import { mountBuildInfo } from './buildInfo.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('[data-reveal]');

if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach((target) => observer.observe(target));
}

const languageToggle = document.querySelector('[data-language-toggle]');

function renderLanguage() {
    paperI18n.apply();
    languageToggle.textContent = paperI18n.language === 'pt' ? 'EN' : 'PT';
    languageToggle.setAttribute('aria-label', paperI18n.t('shared.switchTo'));
}

languageToggle.addEventListener('click', () => {
    paperI18n.toggle();
    siteAnalytics.track('language_change', { language: paperI18n.language, surface: 'home' });
});
paperI18n.subscribe(renderLanguage);
renderLanguage();
mountBuildInfo();
siteAnalytics.start('home');
