// eslint-disable-next-line import/no-cycle
import { loadCSS } from './lib-franklin.js';
import { htmlToElement, getPathDetails, fetchFragment } from './scripts.js';

const pathDetails = getPathDetails();

/**
 * @typedef {Object} DecoratorOptions
 * @property {boolean} isCommunity
 * @property {string} position
 * @property {string} popoverId
 * @property {boolean} lang
 */

export const getLanguagePath = (language) => {
  const { prefix, suffix } = pathDetails;
  return `${prefix}/${language}${suffix}`;
};

/**
 * changes current url to the new language url
 */
const switchLanguage = (lang) => {
  if (pathDetails.lang !== lang) {
  window.location.pathname = getLanguagePath(lang );
};
};

const communityLang = [
  { legend: 'de', title: 'Deutsch' },
  { legend: 'en', title: 'English' },
  { legend: 'es', title: 'Español' },
  { legend: 'fr', title: 'Français' },
  { legend: 'ja', title: '日本語' },
  { legend: 'pt-br', title: 'Português' },
  { legend: 'ko', title: '한국어' },
];
/**
 * Decoration for language popover - shared between header and footer
 */
const buildLanguagePopover = async (decoratorOptions) => {
  loadCSS(`${window.hlx.codeBasePath}/styles/language.css`);
  const popoverClass =
    decoratorOptions.position === 'top'
      ? 'language-selector-popover language-selector-popover--top'
      : 'language-selector-popover';
  let languagesEl;
  if (decoratorOptions.isCommunity) {
    languagesEl = htmlToElement(
      `<div><ul>${communityLang.map((l) => `<li><a href="${l.legend}">${l.title}</a></li>`).join('')}</ul><div>`,
    );
  } else {
    languagesEl = htmlToElement(await fetchFragment('languages/languages', 'en'));
  }
  const newLanguagesEl = languagesEl.querySelector('ul');
  const languageOptions = newLanguagesEl?.children || [];
  const languages = [...languageOptions].map((option) => ({
    title: option.textContent,
    lang: option?.firstElementChild?.getAttribute('href'),
  }));

  const currentLang = pathDetails.lang; 
  const options = languages
    .map((option) => {
      const lan = option.lang?.toLowerCase();
      const selected = currentLang === lan ? 'selected' : '';
      return `<span class="language-selector-label" data-value="${lan}" ${selected}>${option.title}</span>`;
    })
    .join('');
  const popover = htmlToElement(`
    <div class="${popoverClass}" id="${decoratorOptions.popoverId}" style="display:none">
      ${options}
    </div>`);

  popover.addEventListener('click', (e) => {
    const { target } = e;
    if (target.classList.contains('language-selector-label')) {
      target.setAttribute('selected', 'true');
      const lang = target.getAttribute('data-value');
      switchLanguage(lang, decoratorOptions);
    }
  });
  return {
    popover,
    languages,
  };
};

export class LanguageBlock {
  /**
   * @param {DecoratorOptions} decoratorOptions
   */
  constructor(decoratorOptions = {}) {
    this.decoratorOptions = decoratorOptions;
    decoratorOptions.lang = decoratorOptions.lang || pathDetails.lang || 'en';
    decoratorOptions.isCommunity = decoratorOptions.isCommunity ?? false;
    this.languagePopover = buildLanguagePopover(decoratorOptions);
  }
}
