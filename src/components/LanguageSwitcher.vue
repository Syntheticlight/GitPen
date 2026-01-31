<template>
  <div class="language-switcher" ref="switcher">
    <button 
      ref="button"
      type="button"
      class="navigation-bar__button navigation-bar__button--language button" 
      @click.stop.prevent="toggleDropdown" 
      v-title="'切换语言 / Switch Language'"
    >
      <icon-language></icon-language>
    </button>
    <teleport to="body">
      <div 
        v-if="showDropdown"
        class="language-switcher__dropdown" 
        :style="dropdownStyle"
        @click.stop
      >
        <button 
          v-for="locale in supportedLocales" 
          :key="locale.code"
          type="button"
          class="language-switcher__option"
          :class="{ 'language-switcher__option--active': locale.code === currentLocale }"
          @click.stop="switchLanguage(locale.code)"
        >
          <span class="language-switcher__native-name">{{ locale.nativeName }}</span>
          <span class="language-switcher__name">{{ locale.name }}</span>
        </button>
      </div>
    </teleport>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'LanguageSwitcher',
  data() {
    return {
      showDropdown: false,
      dropdownStyle: {},
    };
  },
  computed: {
    ...mapGetters('i18n', [
      'currentLocale',
      'supportedLocales',
    ]),
  },
  methods: {
    ...mapActions('i18n', [
      'switchLocale',
    ]),
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        this.$nextTick(() => {
          this.updateDropdownPosition();
        });
      }
    },
    updateDropdownPosition() {
      if (this.$refs.button) {
        const rect = this.$refs.button.getBoundingClientRect();
        this.dropdownStyle = {
          position: 'fixed',
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          zIndex: 10000,
        };
      }
    },
    closeDropdown(event) {
      // Don't close if clicking on the toggle button (it handles its own toggle)
      if (this.$refs.button && this.$refs.button.contains(event.target)) {
        return;
      }
      // Don't close if clicking inside the dropdown
      const dropdown = document.querySelector('.language-switcher__dropdown');
      if (dropdown && dropdown.contains(event.target)) {
        return;
      }
      if (this.showDropdown) {
        this.showDropdown = false;
      }
    },
    async switchLanguage(locale) {
      try {
        const success = await this.switchLocale(locale);
        if (success) {
          this.showDropdown = false;
          // Small delay to ensure localStorage is written before reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (err) {
        console.error('[LanguageSwitcher] Error switching language:', err);
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdown);
  },
};
</script>

<style lang="scss">
@import '../styles/variables.scss';

.language-switcher {
  position: relative;
  display: inline-block;
  z-index: 200;
}

.navigation-bar__button--language {
  opacity: 0.85;

  &:active,
  &:focus,
  &:hover {
    opacity: 1;
  }
}

.language-switcher__dropdown {
  position: fixed;
  z-index: 10000;
  min-width: 160px;
  padding: 4px 0;
  background-color: $navbar-bg;
  border-radius: $border-radius-base;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.language-switcher__option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: $navbar-color;
  transition: background-color 0.15s;

  &:hover {
    background-color: $navbar-hover-background;
    color: $navbar-hover-color;
  }

  &--active {
    background-color: rgba(255, 255, 255, 0.15);
    color: $navbar-hover-color;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
}

.language-switcher__native-name {
  font-size: 14px;
  font-weight: 500;
}

.language-switcher__name {
  font-size: 12px;
  opacity: 0.7;
}
</style>
