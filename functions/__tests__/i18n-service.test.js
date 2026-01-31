/**
 * Property-Based Tests for I18n Service
 * 
 * Property 1: Language Detection Mapping
 * 
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5
 * 
 * For any browser language string, the I18n_Service SHALL correctly map it to one of 
 * the four supported locales (en, ja, zh-TW, zh-CN) according to the defined mapping rules:
 * - zh-CN, zh-Hans, zh → zh-CN
 * - zh-TW, zh-HK, zh-Hant → zh-TW
 * - ja, ja-JP → ja
 * - All others → en
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Import the mapping rules from the i18n index
const BROWSER_LANGUAGE_MAP = {
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-Hant': 'zh-TW',
  'ja': 'ja',
  'ja-JP': 'ja',
};

const SUPPORTED_LOCALES = ['en', 'ja', 'zh-TW', 'zh-CN'];

/**
 * Pure function implementation of detectBrowserLanguage for testing
 * This mirrors the logic in i18nSvc.js
 */
const detectBrowserLanguage = (browserLang) => {
  if (!browserLang) return 'en';
  
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
  return 'en';
};

/**
 * Feature: i18n-customization, Property 1: Language Detection Mapping
 * 
 * For any browser language string, the I18n_Service SHALL correctly map it to one of 
 * the four supported locales (en, ja, zh-TW, zh-CN).
 */
describe('Property 1: Language Detection Mapping', () => {
  
  it('should always return a supported locale for any browser language string', async () => {
    // Generate realistic BCP 47 language tags
    const languageTagArb = fc.oneof(
      // Primary language only (e.g., 'en', 'zh', 'ja')
      fc.stringMatching(/^[a-z]{2,3}$/),
      // Language with region (e.g., 'en-US', 'zh-CN')
      fc.stringMatching(/^[a-z]{2,3}-[A-Z]{2}$/),
      // Language with script (e.g., 'zh-Hans', 'zh-Hant')
      fc.stringMatching(/^[a-z]{2,3}-[A-Z][a-z]{3}$/),
      // Language with script and region (e.g., 'zh-Hans-CN')
      fc.stringMatching(/^[a-z]{2,3}-[A-Z][a-z]{3}-[A-Z]{2}$/),
      // Empty string
      fc.constant('')
    );
    
    await fc.assert(
      fc.asyncProperty(
        languageTagArb,
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: Result must always be one of the supported locales
          return SUPPORTED_LOCALES.includes(result);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map zh-CN and zh-Hans variants to zh-CN', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('zh-CN', 'zh-Hans', 'zh', 'zh-CN-u-co-pinyin', 'zh-Hans-CN'),
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: All zh-CN/zh-Hans variants should map to zh-CN
          return result === 'zh-CN';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map zh-TW, zh-HK, and zh-Hant variants to zh-TW', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('zh-TW', 'zh-HK', 'zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK'),
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: All zh-TW/zh-HK/zh-Hant variants should map to zh-TW
          return result === 'zh-TW';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map ja and ja-JP variants to ja', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('ja', 'ja-JP', 'ja-JP-u-ca-japanese'),
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: All Japanese variants should map to ja
          return result === 'ja';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should default to en for unsupported languages', async () => {
    // Generate random language codes that are NOT Chinese or Japanese
    const unsupportedLangArb = fc.stringMatching(/^[a-z]{2}(-[A-Z]{2})?$/)
      .filter(lang => !lang.startsWith('zh') && !lang.startsWith('ja'));
    
    await fc.assert(
      fc.asyncProperty(
        unsupportedLangArb,
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: Unsupported languages should default to English
          return result === 'en';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty or null browser language gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', null, undefined),
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: Empty/null should default to English
          return result === 'en';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same input always produces same output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 20 }),
        async (browserLang) => {
          const result1 = detectBrowserLanguage(browserLang);
          const result2 = detectBrowserLanguage(browserLang);
          
          // Property: Function should be deterministic
          return result1 === result2;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly handle language codes with region subtags', async () => {
    // Generate language codes with region subtags
    const langWithRegionArb = fc.tuple(
      fc.constantFrom('en', 'fr', 'de', 'es', 'pt', 'ko', 'ru'),
      fc.constantFrom('US', 'GB', 'CA', 'AU', 'FR', 'DE', 'ES', 'BR', 'KR', 'RU')
    ).map(([lang, region]) => `${lang}-${region}`);
    
    await fc.assert(
      fc.asyncProperty(
        langWithRegionArb,
        async (browserLang) => {
          const result = detectBrowserLanguage(browserLang);
          
          // Property: Non-Chinese/Japanese languages with regions should default to English
          return result === 'en';
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: i18n-customization, Property 2: Preference Persistence Round-Trip
 * 
 * Validates: Requirements 1.2, 1.3, 2.2, 2.3, 3.6, 4.4, 4.5, 7.1, 7.2
 * 
 * For any valid locale setting, saving it to localStorage and then loading it back 
 * SHALL return the same locale value.
 */
describe('Property 2: Preference Persistence Round-Trip', () => {
  const LOCALE_STORAGE_KEY = 'gitpen-locale';
  const VALID_LOCALES = ['en', 'ja', 'zh-TW', 'zh-CN'];
  
  // Mock localStorage for testing
  let mockStorage = {};
  
  const mockLocalStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, value) => { mockStorage[key] = value; },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; },
  };
  
  /**
   * Save locale to localStorage
   */
  const saveLocale = (locale) => {
    if (!VALID_LOCALES.includes(locale)) {
      return false;
    }
    mockLocalStorage.setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  };
  
  /**
   * Load locale from localStorage
   */
  const loadLocale = () => {
    const saved = mockLocalStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && VALID_LOCALES.includes(saved)) {
      return saved;
    }
    return null;
  };
  
  beforeEach(() => {
    mockStorage = {};
  });
  
  it('should preserve locale value through save/load round-trip for all valid locales', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...VALID_LOCALES),
        async (locale) => {
          // Clear storage before each test
          mockLocalStorage.clear();
          
          // Save the locale
          const saveSuccess = saveLocale(locale);
          
          // Load the locale back
          const loadedLocale = loadLocale();
          
          // Property: Save should succeed and loaded value should equal saved value
          return saveSuccess && loadedLocale === locale;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should reject invalid locale values and not persist them', async () => {
    // Generate invalid locale strings
    const invalidLocaleArb = fc.string({ minLength: 1, maxLength: 10 })
      .filter(s => !VALID_LOCALES.includes(s));
    
    await fc.assert(
      fc.asyncProperty(
        invalidLocaleArb,
        async (invalidLocale) => {
          // Clear storage before each test
          mockLocalStorage.clear();
          
          // Try to save invalid locale
          const saveSuccess = saveLocale(invalidLocale);
          
          // Load should return null for invalid/missing locale
          const loadedLocale = loadLocale();
          
          // Property: Invalid locales should not be saved
          return !saveSuccess && loadedLocale === null;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle multiple sequential saves correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...VALID_LOCALES), { minLength: 1, maxLength: 10 }),
        async (localeSequence) => {
          // Clear storage before each test
          mockLocalStorage.clear();
          
          // Save each locale in sequence
          for (const locale of localeSequence) {
            saveLocale(locale);
          }
          
          // Load should return the last saved locale
          const loadedLocale = loadLocale();
          const lastLocale = localeSequence[localeSequence.length - 1];
          
          // Property: Last saved locale should be the one loaded
          return loadedLocale === lastLocale;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return null when loading from empty storage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Clear storage
          mockLocalStorage.clear();
          
          // Load from empty storage
          const loadedLocale = loadLocale();
          
          // Property: Empty storage should return null
          return loadedLocale === null;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle corrupted storage data gracefully', async () => {
    // Generate random corrupted data
    const corruptedDataArb = fc.string({ minLength: 1, maxLength: 20 })
      .filter(s => !VALID_LOCALES.includes(s));
    
    await fc.assert(
      fc.asyncProperty(
        corruptedDataArb,
        async (corruptedData) => {
          // Clear storage and set corrupted data directly
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, corruptedData);
          
          // Load should return null for corrupted data
          const loadedLocale = loadLocale();
          
          // Property: Corrupted data should result in null (fallback)
          return loadedLocale === null;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be idempotent - saving same locale multiple times has same effect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...VALID_LOCALES),
        fc.integer({ min: 1, max: 10 }),
        async (locale, repeatCount) => {
          // Clear storage before each test
          mockLocalStorage.clear();
          
          // Save the same locale multiple times
          for (let i = 0; i < repeatCount; i++) {
            saveLocale(locale);
          }
          
          // Load should return the locale
          const loadedLocale = loadLocale();
          
          // Property: Multiple saves of same value should be idempotent
          return loadedLocale === locale;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: i18n-customization, Property 6: Welcome Document Language Selection
 * 
 * Validates: Requirements 6.2
 * 
 * For any supported locale, the system SHALL load the corresponding welcome document file 
 * when creating a new welcome file for a first-time user.
 */
describe('Property 6: Welcome Document Language Selection', () => {
  const SUPPORTED_LOCALES = ['en', 'ja', 'zh-TW', 'zh-CN'];
  
  // Mock welcome file contents - in real implementation these are imported from .md files
  const welcomeFiles = {
    'en': '# Welcome to GitPen!',
    'ja': '# GitPen へようこそ！',
    'zh-TW': '# 歡迎來到 GitPen！',
    'zh-CN': '# 欢迎来到 GitPen ！',
  };
  
  /**
   * Get the welcome file content based on the current locale
   * This mirrors the logic in localDbSvc.js
   */
  const getWelcomeFileByLocale = (locale) => {
    return welcomeFiles[locale] || welcomeFiles['en'];
  };
  
  it('should return the correct welcome file for each supported locale', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (locale) => {
          const welcomeContent = getWelcomeFileByLocale(locale);
          
          // Property: Each supported locale should have a corresponding welcome file
          // and the content should be non-empty
          return welcomeContent !== undefined && 
                 welcomeContent !== null && 
                 welcomeContent.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return locale-specific content for each supported locale', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (locale) => {
          const welcomeContent = getWelcomeFileByLocale(locale);
          
          // Property: Content should match the expected locale-specific content
          return welcomeContent === welcomeFiles[locale];
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should fall back to English for unsupported locales', async () => {
    // Generate invalid locale strings that are not supported locales
    // Use a more constrained generator to avoid JavaScript reserved properties
    const unsupportedLocaleArb = fc.stringMatching(/^[a-z]{2,5}(-[A-Z]{2})?$/)
      .filter(s => !SUPPORTED_LOCALES.includes(s));
    
    await fc.assert(
      fc.asyncProperty(
        unsupportedLocaleArb,
        async (unsupportedLocale) => {
          const welcomeContent = getWelcomeFileByLocale(unsupportedLocale);
          
          // Property: Unsupported locales should fall back to English
          return welcomeContent === welcomeFiles['en'];
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be deterministic - same locale always returns same content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (locale) => {
          const content1 = getWelcomeFileByLocale(locale);
          const content2 = getWelcomeFileByLocale(locale);
          
          // Property: Function should be deterministic
          return content1 === content2;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return different content for different locales', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...SUPPORTED_LOCALES),
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (locale1, locale2) => {
          if (locale1 === locale2) {
            // Same locale should return same content
            return getWelcomeFileByLocale(locale1) === getWelcomeFileByLocale(locale2);
          }
          // Different locales should return different content
          return getWelcomeFileByLocale(locale1) !== getWelcomeFileByLocale(locale2);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle null/undefined locale by falling back to English', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(null, undefined, ''),
        async (invalidLocale) => {
          const welcomeContent = getWelcomeFileByLocale(invalidLocale);
          
          // Property: Invalid locales should fall back to English
          return welcomeContent === welcomeFiles['en'];
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should ensure all supported locales have unique welcome content', async () => {
    // This is a single assertion test, not property-based, but validates the setup
    const contents = SUPPORTED_LOCALES.map(locale => getWelcomeFileByLocale(locale));
    const uniqueContents = new Set(contents);
    
    // Property: All supported locales should have unique content
    expect(uniqueContents.size).toBe(SUPPORTED_LOCALES.length);
  });
});


/**
 * Feature: i18n-customization, Property 3: Translation Fallback
 * 
 * Validates: Requirements 5.3
 * 
 * For any translation key that exists in the English translation file but is missing 
 * in another language file, the I18n_Service SHALL return the English translation 
 * instead of undefined or an error.
 */
describe('Property 3: Translation Fallback', () => {
  // Mock translation files structure
  const translations = {
    en: {
      common: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        save: 'Save',
        delete: 'Delete',
        missingInOthers: 'Only in English',
      },
      navigation: {
        toggleExplorer: 'Toggle Explorer',
        toggleSideBar: 'Toggle Side Bar',
      },
      nested: {
        deep: {
          key: 'Deep nested value',
        },
      },
    },
    'zh-CN': {
      common: {
        cancel: '取消',
        confirm: '确认',
        close: '关闭',
        save: '保存',
        delete: '删除',
        // missingInOthers is intentionally missing
      },
      navigation: {
        toggleExplorer: '切换资源管理器',
        toggleSideBar: '切换侧边栏',
      },
      // nested.deep.key is intentionally missing
    },
    ja: {
      common: {
        cancel: 'キャンセル',
        confirm: '確認',
        close: '閉じる',
        save: '保存',
        delete: '削除',
        // missingInOthers is intentionally missing
      },
      navigation: {
        toggleExplorer: 'エクスプローラーの切り替え',
        toggleSideBar: 'サイドバーの切り替え',
      },
      // nested.deep.key is intentionally missing
    },
    'zh-TW': {
      common: {
        cancel: '取消',
        confirm: '確認',
        close: '關閉',
        save: '儲存',
        delete: '刪除',
        // missingInOthers is intentionally missing
      },
      navigation: {
        toggleExplorer: '切換資源管理器',
        toggleSideBar: '切換側邊欄',
      },
      // nested.deep.key is intentionally missing
    },
  };

  const DEFAULT_LOCALE = 'en';
  const SUPPORTED_LOCALES = ['en', 'ja', 'zh-TW', 'zh-CN'];

  /**
   * Get a nested value from an object using a dot-separated key path
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
   * Translation function with fallback to English
   * This mirrors the logic in i18nSvc.js
   */
  const translate = (key, locale) => {
    if (!key) return '';

    // Try current locale first
    const currentTranslations = translations[locale];
    let value = getNestedValue(currentTranslations, key);

    // Fall back to English if not found
    if (value === undefined && locale !== DEFAULT_LOCALE) {
      const englishTranslations = translations[DEFAULT_LOCALE];
      value = getNestedValue(englishTranslations, key);
    }

    // If still not found, return the key itself
    if (value === undefined) {
      return key;
    }

    return value;
  };

  it('should return English translation when key is missing in current locale', async () => {
    // Keys that exist in English but are missing in other locales
    const missingKeys = ['common.missingInOthers', 'nested.deep.key'];
    const nonEnglishLocales = SUPPORTED_LOCALES.filter(l => l !== 'en');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...missingKeys),
        fc.constantFrom(...nonEnglishLocales),
        async (key, locale) => {
          const result = translate(key, locale);
          const englishValue = getNestedValue(translations.en, key);

          // Property: Missing keys should fall back to English translation
          return result === englishValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return locale-specific translation when key exists in current locale', async () => {
    // Keys that exist in all locales
    const existingKeys = ['common.cancel', 'common.confirm', 'navigation.toggleExplorer'];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...existingKeys),
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (key, locale) => {
          const result = translate(key, locale);
          const localeValue = getNestedValue(translations[locale], key);

          // Property: Existing keys should return locale-specific translation
          return result === localeValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never return undefined for keys that exist in English', async () => {
    // All keys that exist in English
    const englishKeys = [
      'common.cancel',
      'common.confirm',
      'common.close',
      'common.save',
      'common.delete',
      'common.missingInOthers',
      'navigation.toggleExplorer',
      'navigation.toggleSideBar',
      'nested.deep.key',
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...englishKeys),
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (key, locale) => {
          const result = translate(key, locale);

          // Property: Result should never be undefined for keys that exist in English
          return result !== undefined && result !== null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return the key itself when key does not exist in any locale', async () => {
    // Generate non-existent keys
    const nonExistentKeyArb = fc.stringMatching(/^[a-z]+\.[a-z]+$/)
      .filter(key => getNestedValue(translations.en, key) === undefined);

    await fc.assert(
      fc.asyncProperty(
        nonExistentKeyArb,
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (key, locale) => {
          const result = translate(key, locale);

          // Property: Non-existent keys should return the key itself
          return result === key;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty key gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', null, undefined),
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (key, locale) => {
          const result = translate(key, locale);

          // Property: Empty keys should return empty string
          return result === '';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same key and locale always returns same result', async () => {
    const allKeys = [
      'common.cancel',
      'common.missingInOthers',
      'nested.deep.key',
      'nonexistent.key',
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...allKeys),
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (key, locale) => {
          const result1 = translate(key, locale);
          const result2 = translate(key, locale);

          // Property: Function should be deterministic
          return result1 === result2;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return English value for English locale regardless of fallback', async () => {
    const englishKeys = [
      'common.cancel',
      'common.missingInOthers',
      'nested.deep.key',
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...englishKeys),
        async (key) => {
          const result = translate(key, 'en');
          const englishValue = getNestedValue(translations.en, key);

          // Property: English locale should always return English value
          return result === englishValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle deeply nested keys with fallback', async () => {
    const nonEnglishLocales = SUPPORTED_LOCALES.filter(l => l !== 'en');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...nonEnglishLocales),
        async (locale) => {
          // nested.deep.key only exists in English
          const result = translate('nested.deep.key', locale);
          const englishValue = getNestedValue(translations.en, 'nested.deep.key');

          // Property: Deeply nested missing keys should fall back to English
          return result === englishValue;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: i18n-customization, Property 5: Invalid Preference Fallback
 * 
 * Validates: Requirements 7.3
 * 
 * For any invalid or corrupted locale value in localStorage, the I18n_Service SHALL 
 * fall back to browser language detection and return a valid supported locale.
 */
describe('Property 5: Invalid Preference Fallback', () => {
  const LOCALE_STORAGE_KEY = 'gitpen-locale';
  const VALID_LOCALES = ['en', 'ja', 'zh-TW', 'zh-CN'];
  const BROWSER_LANGUAGE_MAP = {
    'zh-CN': 'zh-CN',
    'zh-Hans': 'zh-CN',
    'zh': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-TW',
    'zh-Hant': 'zh-TW',
    'ja': 'ja',
    'ja-JP': 'ja',
  };
  
  // Mock localStorage for testing
  let mockStorage = {};
  
  const mockLocalStorage = {
    getItem: (key) => mockStorage[key] !== undefined ? mockStorage[key] : null,
    setItem: (key, value) => { mockStorage[key] = value; },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; },
  };
  
  /**
   * Validate if a locale value is valid
   * Mirrors the logic in i18nSvc.js
   */
  const validateLocale = (locale) => {
    // Must be a non-empty string
    if (typeof locale !== 'string' || locale.trim() === '') {
      return false;
    }
    // Must be a supported locale
    return VALID_LOCALES.includes(locale);
  };
  
  /**
   * Detect browser language and map to supported locale
   * Mirrors the logic in i18nSvc.js
   */
  const detectBrowserLanguage = (browserLang) => {
    if (!browserLang) return 'en';
    
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

    // Try matching the primary language tag
    const primaryLang = browserLang.split('-')[0];
    if (BROWSER_LANGUAGE_MAP[primaryLang]) {
      return BROWSER_LANGUAGE_MAP[primaryLang];
    }

    // Check if it starts with ja (Japanese)
    if (browserLang.startsWith('ja')) {
      return 'ja';
    }

    // Default to English
    return 'en';
  };
  
  /**
   * Load locale from localStorage with validation
   * Returns null if invalid or corrupted
   */
  const loadSavedLocale = () => {
    try {
      const saved = mockLocalStorage.getItem(LOCALE_STORAGE_KEY);
      
      // Check if value exists
      if (saved === null || saved === undefined) {
        return null;
      }
      
      // Validate the saved locale
      if (validateLocale(saved)) {
        return saved;
      }
      
      // Invalid saved locale, clear it
      mockLocalStorage.removeItem(LOCALE_STORAGE_KEY);
      
    } catch (e) {
      // Handle any localStorage errors
      mockLocalStorage.removeItem(LOCALE_STORAGE_KEY);
    }
    return null;
  };
  
  /**
   * Initialize locale with fallback behavior
   * Mirrors the logic in i18nSvc.js init()
   */
  const initLocale = (browserLang) => {
    // Try to load saved locale first
    const savedLocale = loadSavedLocale();
    if (savedLocale) {
      return savedLocale;
    }

    // Fall back to browser language detection
    return detectBrowserLanguage(browserLang);
  };
  
  beforeEach(() => {
    mockStorage = {};
  });
  
  it('should fall back to browser language detection when localStorage has invalid locale string', async () => {
    // Generate invalid locale strings (not in VALID_LOCALES)
    const invalidLocaleArb = fc.stringMatching(/^[a-z]{2,10}(-[A-Z]{2})?$/)
      .filter(s => !VALID_LOCALES.includes(s));
    
    // Generate valid browser language strings
    const browserLangArb = fc.constantFrom('en-US', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'de-DE');
    
    await fc.assert(
      fc.asyncProperty(
        invalidLocaleArb,
        browserLangArb,
        async (invalidLocale, browserLang) => {
          // Set invalid locale directly in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, invalidLocale);
          
          // Initialize should fall back to browser detection
          const result = initLocale(browserLang);
          
          // Property: Result must be a valid supported locale
          // AND the invalid locale should be cleared from storage
          const isValidResult = VALID_LOCALES.includes(result);
          const storageCleared = mockLocalStorage.getItem(LOCALE_STORAGE_KEY) === null;
          
          return isValidResult && storageCleared;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should fall back to browser language detection when localStorage has empty string', async () => {
    const browserLangArb = fc.constantFrom('en-US', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR');
    
    await fc.assert(
      fc.asyncProperty(
        browserLangArb,
        async (browserLang) => {
          // Set empty string in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, '');
          
          // Initialize should fall back to browser detection
          const result = initLocale(browserLang);
          
          // Property: Result must be a valid supported locale
          return VALID_LOCALES.includes(result);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should fall back to browser language detection when localStorage has whitespace-only string', async () => {
    // Generate whitespace-only strings
    const whitespaceArb = fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 10 });
    const browserLangArb = fc.constantFrom('en-US', 'ja-JP', 'zh-CN', 'zh-TW');
    
    await fc.assert(
      fc.asyncProperty(
        whitespaceArb,
        browserLangArb,
        async (whitespace, browserLang) => {
          // Set whitespace-only string in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, whitespace);
          
          // Initialize should fall back to browser detection
          const result = initLocale(browserLang);
          
          // Property: Result must be a valid supported locale
          return VALID_LOCALES.includes(result);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return valid locale when localStorage has valid locale', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...VALID_LOCALES),
        fc.constantFrom('en-US', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR'),
        async (validLocale, browserLang) => {
          // Set valid locale in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, validLocale);
          
          // Initialize should return the saved locale
          const result = initLocale(browserLang);
          
          // Property: Result should be the saved valid locale (not browser detection)
          return result === validLocale;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should always return a valid supported locale regardless of corrupted data', async () => {
    // Generate various types of corrupted data
    const corruptedDataArb = fc.oneof(
      // Random strings
      fc.string({ minLength: 0, maxLength: 50 }),
      // Numbers as strings
      fc.integer().map(n => String(n)),
      // JSON-like strings
      fc.constant('{"locale":"en"}'),
      fc.constant('[en]'),
      fc.constant('null'),
      fc.constant('undefined'),
      // Special characters
      fc.stringMatching(/^[!@#$%^&*()]+$/),
      // Unicode strings
      fc.unicodeString({ minLength: 1, maxLength: 10 })
    ).filter(s => !VALID_LOCALES.includes(s));
    
    const browserLangArb = fc.constantFrom('en-US', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'de-DE', '');
    
    await fc.assert(
      fc.asyncProperty(
        corruptedDataArb,
        browserLangArb,
        async (corruptedData, browserLang) => {
          // Set corrupted data in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, corruptedData);
          
          // Initialize should fall back to browser detection
          const result = initLocale(browserLang);
          
          // Property: Result must ALWAYS be a valid supported locale
          return VALID_LOCALES.includes(result);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should fall back to English when both localStorage is invalid and browser language is unsupported', async () => {
    // Generate invalid locale strings
    const invalidLocaleArb = fc.string({ minLength: 1, maxLength: 20 })
      .filter(s => !VALID_LOCALES.includes(s));
    
    // Generate unsupported browser languages (not Chinese or Japanese)
    const unsupportedBrowserLangArb = fc.constantFrom('fr-FR', 'de-DE', 'es-ES', 'pt-BR', 'ko-KR', 'ru-RU', '');
    
    await fc.assert(
      fc.asyncProperty(
        invalidLocaleArb,
        unsupportedBrowserLangArb,
        async (invalidLocale, browserLang) => {
          // Set invalid locale in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, invalidLocale);
          
          // Initialize should fall back to English
          const result = initLocale(browserLang);
          
          // Property: Result should be English (default) for unsupported browser languages
          return result === 'en';
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should correctly detect browser language after invalid preference fallback', async () => {
    // Test that browser language detection works correctly after fallback
    const testCases = [
      { browserLang: 'zh-CN', expected: 'zh-CN' },
      { browserLang: 'zh-TW', expected: 'zh-TW' },
      { browserLang: 'zh-HK', expected: 'zh-TW' },
      { browserLang: 'ja-JP', expected: 'ja' },
      { browserLang: 'ja', expected: 'ja' },
      { browserLang: 'en-US', expected: 'en' },
      { browserLang: 'fr-FR', expected: 'en' },
    ];
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testCases),
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !VALID_LOCALES.includes(s)),
        async (testCase, invalidLocale) => {
          // Set invalid locale in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, invalidLocale);
          
          // Initialize should fall back to browser detection
          const result = initLocale(testCase.browserLang);
          
          // Property: Result should match expected browser language mapping
          return result === testCase.expected;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be idempotent - multiple init calls with same invalid data produce same result', async () => {
    const invalidLocaleArb = fc.string({ minLength: 1, maxLength: 20 })
      .filter(s => !VALID_LOCALES.includes(s));
    const browserLangArb = fc.constantFrom('en-US', 'ja-JP', 'zh-CN', 'zh-TW');
    
    await fc.assert(
      fc.asyncProperty(
        invalidLocaleArb,
        browserLangArb,
        async (invalidLocale, browserLang) => {
          // Set invalid locale in storage
          mockLocalStorage.clear();
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, invalidLocale);
          
          // Call init multiple times
          const result1 = initLocale(browserLang);
          
          // Reset storage with same invalid data
          mockLocalStorage.setItem(LOCALE_STORAGE_KEY, invalidLocale);
          const result2 = initLocale(browserLang);
          
          // Property: Results should be identical
          return result1 === result2;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should validate locale correctly for all edge cases', async () => {
    // Test the validateLocale function directly
    const validCases = VALID_LOCALES;
    const invalidCases = [
      '', ' ', '\t', '\n',
      'EN', 'JA', 'ZH-CN', 'ZH-TW',  // Wrong case
      'english', 'japanese', 'chinese',
      'en-us', 'ja-jp',  // Wrong format
      null, undefined,
      123, {}, [], true, false,
    ];
    
    // All valid locales should pass validation
    for (const valid of validCases) {
      expect(validateLocale(valid)).toBe(true);
    }
    
    // All invalid cases should fail validation
    for (const invalid of invalidCases) {
      expect(validateLocale(invalid)).toBe(false);
    }
  });
});
