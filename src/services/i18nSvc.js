/**
 * I18n Service - Internationalization Service
 * 
 * Provides language detection, translation, and locale management.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3, 5.4
 */

import { translations, SUPPORTED_LOCALES, BROWSER_LANGUAGE_MAP, DEFAULT_LOCALE } from '../i18n';

const LOCALE_STORAGE_KEY = 'gitpen-locale';

/**
 * Get a nested value from an object using a dot-separated key path
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-separated key path (e.g., 'common.cancel')
 * @returns {*} The value at the path, or undefined if not found
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
};

/**
 * Interpolate parameters into a string
 * @param {string} str - The string with placeholders like {name}
 * @param {Object} params - The parameters to interpolate
 * @returns {string} The interpolated string
 */
const interpolate = (str, params) => {
  if (!params || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
};

const i18nSvc = {
  // Current locale
  currentLocale: DEFAULT_LOCALE,

  // Supported locales list
  supportedLocales: SUPPORTED_LOCALES,

  /**
   * Detect browser language and map to supported locale
   * 
   * Mapping rules:
   * - zh-CN, zh-Hans, zh → zh-CN
   * - zh-TW, zh-HK, zh-Hant → zh-TW
   * - ja, ja-JP → ja
   * - All others → en
   * 
   * @returns {string} The detected locale code
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || '';
    
    // First, try exact match
    if (BROWSER_LANGUAGE_MAP[browserLang]) {
      return BROWSER_LANGUAGE_MAP[browserLang];
    }

    // Check if it contains zh-Hant (Traditional Chinese script)
    if (browserLang.includes('Hant') || browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK')) {
      return 'zh-TW';
    }

    // Check if it contains zh-Hans (Simplified Chinese script) or starts with zh-CN
    if (browserLang.includes('Hans') || browserLang.startsWith('zh-CN')) {
      return 'zh-CN';
    }

    // Try matching the primary language tag (e.g., 'zh' from 'zh-CN')
    const primaryLang = browserLang.split('-')[0];
    if (BROWSER_LANGUAGE_MAP[primaryLang]) {
      return BROWSER_LANGUAGE_MAP[primaryLang];
    }

    // Check if it starts with ja (Japanese)
    if (browserLang.startsWith('ja')) {
      return 'ja';
    }

    // Default to English
    return DEFAULT_LOCALE;
  },

  /**
   * Get translated text for a key
   * Falls back to English if translation is missing, then to the key itself
   * 
   * @param {string} key - The translation key (e.g., 'common.cancel')
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} The translated text
   */
  t(key, params = null) {
    if (!key) return '';

    // Try current locale first
    const currentTranslations = translations[this.currentLocale];
    let value = getNestedValue(currentTranslations, key);

    // Fall back to English if not found
    if (value === undefined && this.currentLocale !== DEFAULT_LOCALE) {
      const englishTranslations = translations[DEFAULT_LOCALE];
      value = getNestedValue(englishTranslations, key);
    }

    // If still not found, return the key itself
    if (value === undefined) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key;
    }

    // Interpolate parameters if provided
    return interpolate(value, params);
  },

  /**
   * Set the current locale
   * Validates the locale and persists to localStorage
   * 
   * @param {string} locale - The locale code to set
   * @returns {boolean} True if locale was set successfully
   */
  setLocale(locale) {
    // Validate locale
    const isValid = SUPPORTED_LOCALES.some(l => l.code === locale);
    if (!isValid) {
      console.warn(`[i18n] Invalid locale: ${locale}`);
      return false;
    }

    this.currentLocale = locale;

    // Persist to localStorage
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (e) {
      console.warn('[i18n] Failed to save locale to localStorage:', e);
    }

    return true;
  },

  /**
   * Validate if a locale value is valid
   * Checks that the value is a non-empty string and is a supported locale
   * 
   * @param {*} locale - The locale value to validate
   * @returns {boolean} True if the locale is valid
   */
  validateLocale(locale) {
    // Must be a non-empty string
    if (typeof locale !== 'string' || locale.trim() === '') {
      return false;
    }
    // Must be a supported locale
    return SUPPORTED_LOCALES.some(l => l.code === locale);
  },

  /**
   * Load locale from localStorage
   * Returns null if not found, invalid, or corrupted
   * 
   * Handles the following invalid cases:
   * - Missing localStorage entry
   * - Non-string values
   * - Empty strings
   * - Unsupported locale codes
   * - Corrupted data
   * 
   * Requirements: 7.3
   * 
   * @returns {string|null} The saved locale or null
   */
  loadSavedLocale() {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      
      // Check if value exists
      if (saved === null || saved === undefined) {
        return null;
      }
      
      // Validate the saved locale using the validation function
      if (this.validateLocale(saved)) {
        return saved;
      }
      
      // Invalid saved locale, clear it and log warning
      console.warn(`[i18n] Invalid saved locale: "${saved}", clearing and falling back to browser detection...`);
      this.clearSavedLocale();
      
    } catch (e) {
      // Handle any localStorage errors (e.g., SecurityError, QuotaExceededError)
      console.warn('[i18n] Failed to load locale from localStorage:', e);
      // Attempt to clear corrupted data
      this.clearSavedLocale();
    }
    return null;
  },

  /**
   * Clear saved locale from localStorage
   * Used when corrupted or invalid data is detected
   * 
   * @returns {boolean} True if cleared successfully
   */
  clearSavedLocale() {
    try {
      localStorage.removeItem(LOCALE_STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('[i18n] Failed to clear locale from localStorage:', e);
      return false;
    }
  },

  /**
   * Initialize the i18n service
   * Loads saved locale or detects browser language
   * 
   * Fallback behavior (Requirements 7.3):
   * 1. Try to load saved locale from localStorage
   * 2. If saved locale is invalid or corrupted, fall back to browser language detection
   * 3. Persist the detected language for future use
   * 
   * @returns {string} The initialized locale
   */
  init() {
    // Try to load saved locale first
    const savedLocale = this.loadSavedLocale();
    
    if (savedLocale) {
      this.currentLocale = savedLocale;
      return savedLocale;
    }

    // Fall back to browser language detection (Requirements 7.3)
    // This happens when:
    // - No saved locale exists
    // - Saved locale is invalid or corrupted
    const detectedLocale = this.detectBrowserLanguage();
    this.setLocale(detectedLocale);
    return detectedLocale;
  },

  /**
   * Get the current locale info
   * 
   * @returns {Object} The current locale info object
   */
  getCurrentLocaleInfo() {
    return SUPPORTED_LOCALES.find(l => l.code === this.currentLocale) || SUPPORTED_LOCALES[0];
  },

  /**
   * Check if a locale is supported
   * 
   * @param {string} locale - The locale code to check
   * @returns {boolean} True if the locale is supported
   */
  isSupported(locale) {
    return SUPPORTED_LOCALES.some(l => l.code === locale);
  },
};

export default i18nSvc;

// Also export individual functions for testing
export {
  getNestedValue,
  interpolate,
  LOCALE_STORAGE_KEY,
};
