/**
 * I18n Vuex Module
 * 
 * Manages language state for the application.
 * 
 * Requirements: 3.6, 4.4, 7.1
 */

import i18nSvc from '../services/i18nSvc';
import { SUPPORTED_LOCALES } from '../i18n';

export default {
  namespaced: true,
  state: {
    locale: null, // Current locale, null means not initialized
  },
  mutations: {
    /**
     * Set the current locale
     * @param {Object} state - Vuex state
     * @param {string} locale - The locale code to set
     */
    setLocale(state, locale) {
      state.locale = locale;
    },
  },
  getters: {
    /**
     * Get the current locale
     * @param {Object} state - Vuex state
     * @returns {string} The current locale code
     */
    currentLocale: state => state.locale,

    /**
     * Get the list of supported locales
     * @returns {Array} Array of supported locale objects
     */
    supportedLocales: () => SUPPORTED_LOCALES,
  },
  actions: {
    /**
     * Initialize the locale
     * Loads saved locale from localStorage or detects browser language
     * 
     * @param {Object} context - Vuex action context
     * @returns {string} The initialized locale
     */
    initLocale({ commit }) {
      const locale = i18nSvc.init();
      commit('setLocale', locale);
      return locale;
    },

    /**
     * Switch to a new locale
     * Validates and persists the locale to localStorage
     * 
     * @param {Object} context - Vuex action context
     * @param {string} locale - The locale code to switch to
     * @returns {Promise<boolean>} True if locale was switched successfully
     */
    async switchLocale({ commit }, locale) {
      const success = i18nSvc.setLocale(locale);
      if (success) {
        commit('setLocale', locale);
      }
      return success;
    },
  },
};
