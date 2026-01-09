<template>
  <div class="language-switcher" ref="switcher">
    <button 
      class="navigation-bar__button navigation-bar__button--language button" 
      @click="toggleDropdown" 
      v-title="'切换语言 / Switch Language'"
    >
      <icon-language></icon-language>
    </button>
    <div class="language-switcher__dropdown" v-if="showDropdown">
      <button 
        v-for="locale in supportedLocales" 
        :key="locale.code"
        class="language-switcher__option"
        :class="{ 'language-switcher__option--active': locale.code === currentLocale }"
        @click="switchLanguage(locale.code)"
      >
        <span class="language-switcher__native-name">{{ locale.nativeName }}</span>
        <span class="language-switcher__name">{{ locale.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'LanguageSwitcher',
  data() {
    return {
      showDropdown: false,
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
    },
    closeDropdown(event) {
      // Check if click is outside the component
      if (this.$refs.switcher && !this.$refs.switcher.contains(event.target)) {
        this.showDropdown = false;
      }
    },
    switchLanguage(locale) {
      this.switchLocale(locale);
      this.showDropdown = false;
      // Reload the page to apply translations
      window.location.reload();
    },
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdown);
  },
};
</script>

<style lang="scss">
@import '../styles/variables.scss';

.language-switcher {
  position: relative;
  display: inline-block;
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
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  min-width: 160px;
  margin-top: 4px;
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
