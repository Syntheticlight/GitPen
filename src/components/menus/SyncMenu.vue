<template>
  <div class="side-bar__panel side-bar__panel--menu">
    <div class="side-bar__info" v-if="isCurrentTemp">
      <p>{{currentFileName}} {{ $t('sync.cannotSync') }}</p>
    </div>
    <div v-else>
      <div class="side-bar__info" v-if="syncLocations.length">
        <p>{{currentFileName}} {{ $t('sync.alreadySynced') }}</p>
        <menu-entry @click.native="requestSync">
          <template v-slot:icon><icon-sync></icon-sync></template>
          <div>{{ $t('sync.syncNow') }}</div>
          <span>{{ $t('sync.syncNowDesc') }}</span>
        </menu-entry>
        <menu-entry @click.native="manageSync">
          <template v-slot:icon><icon-view-list></icon-view-list></template>
          <div><div class="menu-entry__label menu-entry__label--count">{{locationCount}}</div> {{ $t('sync.fileSync') }}</div>
          <span>{{ $t('sync.fileSyncDesc') }}</span>
        </menu-entry>
      </div>
      <div class="side-bar__info" v-else-if="noToken">
        <p>{{ $t('sync.mustLinkAccount') }}</p>
      </div>
      <hr>
      <div v-for="token in githubTokens" :key="token.sub">
        <menu-entry @click.native="openGithub(token)">
          <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
          <div>{{ $t('sync.openFromGithub') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
        <menu-entry @click.native="saveGithub(token)">
          <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
          <div>{{ $t('sync.saveOnGithub') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
        <menu-entry @click.native="saveGist(token)">
          <template v-slot:icon><icon-provider provider-id="gist"></icon-provider></template>
          <div>{{ $t('sync.saveOnGist') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
      </div>
      <div v-for="token in giteeTokens" :key="token.sub">
        <menu-entry @click.native="openGitee(token)">
          <template v-slot:icon><icon-provider provider-id="gitee"></icon-provider></template>
          <div>{{ $t('sync.openFromGitee') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
        <menu-entry @click.native="saveGitee(token)">
          <template v-slot:icon><icon-provider provider-id="gitee"></icon-provider></template>
          <div>{{ $t('sync.saveOnGitee') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
        <menu-entry @click.native="saveGiteeGist(token)">
          <template v-slot:icon><icon-provider provider-id="giteegist"></icon-provider></template>
          <div>{{ $t('sync.saveOnGiteeGist') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
      </div>
      <hr>
      <menu-entry @click.native="addGithubAccount">
        <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
        <span>{{ $t('sync.addGithubAccount') }}</span>
      </menu-entry>
      <menu-entry @click.native="addGiteeAccount">
        <template v-slot:icon><icon-provider provider-id="gitee"></icon-provider></template>
        <span>{{ $t('sync.addGiteeAccount') }}</span>
      </menu-entry>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MenuEntry from './common/MenuEntry';
import githubHelper from '../../services/providers/helpers/githubHelper';
import giteeHelper from '../../services/providers/helpers/giteeHelper';
import githubProvider from '../../services/providers/githubProvider';
import giteeProvider from '../../services/providers/giteeProvider';
import syncSvc from '../../services/syncSvc';
import store from '../../store';
import badgeSvc from '../../services/badgeSvc';
import i18nSvc from '../../services/i18nSvc';

const tokensToArray = (tokens, filter = () => true) => Object.values(tokens)
  .filter(token => filter(token))
  .sort((token1, token2) => token1.name.localeCompare(token2.name));

const openSyncModal = (token, type) => store.dispatch('modal/open', {
  type,
  token,
}).then(syncLocation => syncSvc.createSyncLocation(syncLocation));

export default {
  components: {
    MenuEntry,
  },
  computed: {
    ...mapState('queue', [
      'isSyncRequested',
    ]),
    ...mapGetters('workspace', [
      'syncToken',
    ]),
    ...mapGetters('file', [
      'isCurrentTemp',
    ]),
    ...mapGetters('syncLocation', {
      syncLocations: 'currentWithWorkspaceSyncLocation',
    }),
    locationCount() {
      return Object.keys(this.syncLocations).length;
    },
    currentFileName() {
      return `"${store.getters['file/current'].name}"`;
    },
    githubTokens() {
      return tokensToArray(store.getters['data/githubTokensBySub']);
    },
    giteeTokens() {
      return tokensToArray(store.getters['data/giteeTokensBySub']);
    },
    noToken() {
      return !this.githubTokens.length
        && !this.giteeTokens.length;
    },
  },
  methods: {
    $t(key, params) {
      return i18nSvc.t(key, params);
    },
    requestSync() {
      if (!this.isSyncRequested) {
        syncSvc.requestSync(true);
      }
    },
    async manageSync() {
      try {
        await store.dispatch('modal/open', 'syncManagement');
      } catch (e) { /* cancel */ }
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
    async openGithub(token) {
      try {
        const syncLocation = await store.dispatch('modal/open', {
          type: 'githubOpen',
          token,
        });
        store.dispatch(
          'queue/enqueue',
          async () => {
            await githubProvider.openFile(token, syncLocation);
            badgeSvc.addBadge('openFromGithub');
          },
        );
      } catch (e) { /* cancel */ }
    },
    async saveGithub(token) {
      try {
        await openSyncModal(token, 'githubSave');
        badgeSvc.addBadge('saveOnGithub');
      } catch (e) { /* cancel */ }
    },
    async openGitee(token) {
      try {
        const syncLocation = await store.dispatch('modal/open', {
          type: 'giteeOpen',
          token,
        });
        store.dispatch(
          'queue/enqueue',
          async () => {
            await giteeProvider.openFile(token, syncLocation);
            badgeSvc.addBadge('openFromGitee');
          },
        );
      } catch (e) { /* cancel */ }
    },
    async saveGitee(token) {
      try {
        await openSyncModal(token, 'giteeSave');
        badgeSvc.addBadge('saveOnGitee');
      } catch (e) { /* cancel */ }
    },
    async saveGist(token) {
      try {
        await openSyncModal(token, 'gistSync');
        badgeSvc.addBadge('saveOnGist');
      } catch (e) { /* cancel */ }
    },
    async saveGiteeGist(token) {
      try {
        await openSyncModal(token, 'giteeGistSync');
        badgeSvc.addBadge('saveOnGiteeGist');
      } catch (e) { /* cancel */ }
    },
  },
};
</script>
