import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import koCommon from './locales/ko/common.json';
import koOption from './locales/ko/option.json';
import koPopover from './locales/ko/popover.json';
import koPlayer from './locales/ko/player.json';

import enCommon from './locales/en/common.json';
import enOption from './locales/en/option.json';
import enPopover from './locales/en/popover.json';
import enPlayer from './locales/en/player.json';

import jaCommon from './locales/ja/common.json';
import jaOption from './locales/ja/option.json';
import jaPopover from './locales/ja/popover.json';
import jaPlayer from './locales/ja/player.json';

import zhCommon from './locales/zh/common.json';
import zhOption from './locales/zh/option.json';
import zhPopover from './locales/zh/popover.json';
import zhPlayer from './locales/zh/player.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

function detectLanguage(): LanguageCode {
  const navLang = navigator.language.split('-')[0];
  const supported = SUPPORTED_LANGUAGES.map((l) => l.code) as readonly string[];
  return supported.includes(navLang) ? (navLang as LanguageCode) : 'ko';
}

const resources = {
  ko: { common: koCommon, option: koOption, popover: koPopover, player: koPlayer },
  en: { common: enCommon, option: enOption, popover: enPopover, player: enPlayer },
  ja: { common: jaCommon, option: jaOption, popover: jaPopover, player: jaPlayer },
  zh: { common: zhCommon, option: zhOption, popover: zhPopover, player: zhPlayer },
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'ko',
  defaultNS: 'common',
  ns: ['common', 'option', 'popover', 'player'],
  interpolation: { escapeValue: false },
});

// chrome.storage에서 저장된 언어 설정을 불러와서 적용
if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  chrome.storage.local.get('language', (result) => {
    if (result.language && i18n.language !== result.language) {
      i18n.changeLanguage(result.language);
    }
  });
}

export function changeLanguage(lng: LanguageCode) {
  i18n.changeLanguage(lng);
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({ language: lng });
  }
}

export default i18n;
