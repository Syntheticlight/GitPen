<template>
  <modal-inner :aria-label="$t('modals.commitMessage.title')">
    <p>{{ $t('modals.commitMessage.customize') }} <b>{{ config.name }}</b> {{ $t('modals.commitMessage.message') }}</p>
    <div class="modal__content">
      <div class="form-entry">
        <label class="form-entry__label">{{ $t('modals.commitMessage.title') }}</label>
        <div class="form-entry__field">
          <input class="textfield" :placeholder="$t('modals.commitMessage.placeholder')" type="text" v-model.trim="commitMessage" @keydown.enter="resolve()">
        </div>
      </div>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">{{ $t('common.cancel') }}</button>
      <button class="button button--resolve" @click="resolve()">{{ $t('common.confirm') }}</button>
    </div>
  </modal-inner>
</template>

<script>
import { mapGetters } from 'vuex';
import ModalInner from './common/ModalInner';
import i18nSvc from '../../services/i18nSvc';

export default {
  components: {
    ModalInner,
  },
  data: () => ({
    commitMessage: '',
  }),
  computed: {
    ...mapGetters('modal', [
      'config',
    ]),
  },
  methods: {
    $t(key, params) {
      return i18nSvc.t(key, params);
    },
    resolve() {
      this.config.resolve({
        commitMessage: this.commitMessage,
      });
    },
  },
};
</script>
