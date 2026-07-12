import { paperI18n } from './i18n/paperI18n.js';
import { siteAnalytics } from './analytics/siteAnalytics.js';
import { mountBuildInfo } from './buildInfo.js';

const languageToggle = document.querySelector('[data-language-toggle]');

function renderLanguage() {
    paperI18n.apply();
    languageToggle.textContent = paperI18n.language === 'pt' ? 'EN' : 'PT';
    languageToggle.setAttribute('aria-label', paperI18n.t('shared.switchTo'));
}

languageToggle.addEventListener('click', () => paperI18n.toggle());
paperI18n.subscribe(renderLanguage);
renderLanguage();
mountBuildInfo();
siteAnalytics.start('privacy');

