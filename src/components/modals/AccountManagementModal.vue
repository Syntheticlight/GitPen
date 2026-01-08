<template>
  <modal-inner class="modal__inner-1--account-management" aria-label="管理外部账号">
    <div class="modal__content">
      <div class="modal__image">
        <icon-key></icon-key>
      </div>
      <p v-if="entries.length">GitPen可以访问以下外部账号：</p>
      <p v-else>GitPen尚未访问任何外部账号。</p>
      <div>
        <div class="account-entry flex flex--column" v-for="entry in entries" :key="entry.token.sub">
          <div class="account-entry__header flex flex--row flex--align-center">
            <div class="account-entry__icon flex flex--column flex--center">
              <icon-provider :provider-id="entry.providerId"></icon-provider>
            </div>
            <div class="account-entry__description">
              {{entry.name}}
            </div>
            <div class="account-entry__buttons flex flex--row flex--center">
              <button class="account-entry__button button" @click="remove(entry)" v-title="'删除访问'">
                <icon-delete></icon-delete>
              </button>
            </div>
          </div>
          <div class="account-entry__row">
            <span class="account-entry__field" v-if="entry.userId">
              <b>用户ID:</b>
              {{entry.userId}}
            </span>
            <span class="account-entry__field" v-if="entry.url">
              <b>URL:</b>
              {{entry.url}}
            </span>
            <span class="account-entry__field line-entry" v-if="entry.customHeaders">
              <b>自定义请求头:</b>
              {{entry.customHeaders}}
            </span>
            <span class="account-entry__field line-entry" v-if="entry.customParams">
              <b>自定义Form参数:</b>
              {{entry.customParams}}
            </span>
            <span class="account-entry__field" v-if="entry.scopes">
              <b>权限范围:</b>
              {{entry.scopes.join(', ')}}
            </span>
          </div>
        </div>
      </div>
      <menu-entry @click.native="addGithubAccount">
        <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
        <span>添加GitHub账号</span>
      </menu-entry>
      <menu-entry @click.native="addGiteeAccount">
        <template v-slot:icon><icon-provider provider-id="gitee"></icon-provider></template>
        <span>添加Gitee账号</span>
      </menu-entry>
      <menu-entry @click.native="addSmmsAccount">
        <template v-slot:icon><icon-provider provider-id="smms"></icon-provider></template>
        <span>添加SM.MS账号</span>
      </menu-entry>
      <menu-entry @click.native="addCustomAccount">
        <template v-slot:icon><icon-provider provider-id="custom"></icon-provider></template>
        <span>添加自定义图床账号</span>
      </menu-entry>
    </div>
    <div class="modal__button-bar">
      <button class="button button--resolve" @click="config.resolve()">关闭</button>
    </div>
  </modal-inner>
</template>

<script>
import { mapGetters } from 'vuex';
import ModalInner from './common/ModalInner';
import MenuEntry from '../menus/common/MenuEntry';
import store from '../../store';
import utils from '../../services/utils';
import githubHelper from '../../services/providers/helpers/githubHelper';
import giteeHelper from '../../services/providers/helpers/giteeHelper';
import smmsHelper from '../../services/providers/helpers/smmsHelper';
import customHelper from '../../services/providers/helpers/customHelper';
import badgeSvc from '../../services/badgeSvc';

export default {
  components: {
    ModalInner,
    MenuEntry,
  },
  computed: {
    ...mapGetters('modal', [
      'config',
    ]),
    entries() {
      return [
        ...Object.values(store.getters['data/githubTokensBySub']).map(token => ({
          token,
          providerId: 'github',
          userId: token.sub,
          name: token.name,
          scopes: token.scopes,
        })),
        ...Object.values(store.getters['data/giteeTokensBySub']).map(token => ({
          token,
          providerId: 'gitee',
          userId: token.sub,
          name: token.name,
          scopes: ['projects', 'pull_requests'],
        })),
        ...Object.values(store.getters['data/smmsTokensBySub']).map(token => ({
          token,
          providerId: 'smms',
          userId: token.sub,
          name: token.name,
          scopes: ['api'],
        })),
        ...Object.values(store.getters['data/customTokensBySub']).map(token => ({
          token,
          providerId: 'custom',
          url: token.uploadUrl,
          userId: token.name,
          name: token.name,
          customHeaders: token.customHeaders && JSON.stringify(token.customHeaders),
          customParams: token.customParams && JSON.stringify(token.customParams),
          scopes: ['upload'],
        })),
      ];
    },
  },
  methods: {
    async remove(entry) {
      const tokensBySub = utils.deepCopy(store.getters[`data/${entry.providerId}TokensBySub`]);
      delete tokensBySub[entry.token.sub];
      await store.dispatch('data/patchTokensByType', {
        [entry.providerId]: tokensBySub,
      });
      badgeSvc.addBadge('removeAccount');
    },
    async addGithubAccount() {
      try {
        await store.dispatch('modal/open', { type: 'githubAccount' });
        await githubHelper.addAccount(store.getters['data/localSettings'].githubRepoFullAccess);
      } catch (e) { /* cancel */ }
    },
    async addGiteeAccount() {
      try {
        await store.dispatch('modal/open', { type: 'giteeAccount' });
        await giteeHelper.addAccount();
      } catch (e) { /* cancel */ }
    },
    async addSmmsAccount() {
      try {
        const { proxyUrl, apiSecretToken } = await store.dispatch('modal/open', { type: 'smmsAccount' });
        await smmsHelper.addAccount(proxyUrl, apiSecretToken);
      } catch (e) { /* cancel */ }
    },
    async addCustomAccount() {
      try {
        const accountInfo = await store.dispatch('modal/open', { type: 'customAccount' });
        await customHelper.addAccount(accountInfo);
      } catch (e) { /* cancel */ }
    },
  },
};
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.line-entry {
  word-break: break-word; /* 文本行的任意字内断开，就算是一个单词也会分开 */
  word-wrap: break-word; /* IE */
  white-space: -moz-pre-wrap; /* Mozilla */
  white-space: -hp-pre-wrap; /* HP printers */
  white-space: -o-pre-wrap; /* Opera 7 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: pre; /* CSS2 */
  white-space: pre-wrap; /* CSS 2.1 */
  white-space: pre-line; /* CSS 3 (and 2.1 as well, actually) */
}

.account-entry {
  margin: 1.5em 0;
  height: auto;
  font-size: 17px;
  line-height: 1.5;
}

$button-size: 30px;

.account-entry__header {
  line-height: $button-size;
}

.account-entry__row {
  border-top: 1px solid $hr-color;
  font-size: 0.67em;
  padding: 0.25em 0;
}

.account-entry__field {
  opacity: 0.5;
}

.account-entry__icon {
  height: 22px;
  width: 22px;
  margin-right: 0.75rem;
  flex: none;
}

.account-entry__description {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.account-entry__buttons {
  margin-left: 0.75rem;
}

.account-entry__button {
  width: $button-size;
  height: $button-size;
  padding: 4px;
  background-color: transparent;
  opacity: 0.75;

  &:active,
  &:focus,
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
