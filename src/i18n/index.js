// I18n translations index file
import en from './en';
import ja from './ja';
import zhCN from './zh-CN';
import zhTW from './zh-TW';

// Supported locales configuration
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文' },
];

// Browser language to locale mapping
export const BROWSER_LANGUAGE_MAP = {
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-Hant': 'zh-TW',
  'ja': 'ja',
  'ja-JP': 'ja',
  // All others map to 'en'
};

// All translations
export const translations = {
  en,
  ja,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
};

// Default locale
export const DEFAULT_LOCALE = 'en';

export default translations;
