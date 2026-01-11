<template>
  <modal-inner :aria-label="$t('modals.link.title')">
    <div class="modal__content">
      <p>{{ $t('modals.link.url') }}</p>
      <form-entry :label="$t('modals.link.url')" error="url">
        <template v-slot:field><input class="textfield" type="text" v-model.trim="url" @keydown.enter="resolve"></template>
      </form-entry>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="reject()">{{ $t('common.cancel') }}</button>
      <button class="button button--resolve" @click="resolve">{{ $t('common.confirm') }}</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from './common/modalTemplate';
import i18nSvc from '../../services/i18nSvc';

export default modalTemplate({
  data: () => ({
    url: '',
  }),
  methods: {
    $t(key, params) {
      return i18nSvc.t(key, params);
    },
    resolve(evt) {
      evt.preventDefault(); // Fixes link modal issue
      if (!this.url) {
        this.setError('url');
      } else {
        const { callback } = this.config;
        this.config.resolve();
        callback(this.url);
      }
    },
    reject() {
      const { callback } = this.config;
      this.config.reject();
      callback(null);
    },
  },
});
</script>
