<template>
  <div class="side-bar__panel side-bar__panel--menu">
    <div class="side-bar__info">
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-if="loginToken">
        <div class="menu-entry__icon menu-entry__icon--image">
          <user-image :user-id="userId"></user-image>
        </div>
        <span>{{ $t('mainMenu.loggedInAs') }}<b>{{loginToken.name}}</b>。</span>
      </div>
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-if="syncToken">
        <div class="menu-entry__icon menu-entry__icon--image">
          <icon-provider :provider-id="currentWorkspace.providerId"></icon-provider>
        </div>
        <span v-if="currentWorkspace.providerId === 'giteeAppData'">
          <b>{{currentWorkspace.name}}</b> {{ $t('mainMenu.syncWithGiteeRepo') }}
        </span>
        <span v-else-if="currentWorkspace.providerId === 'githubAppData'">
          <b>{{currentWorkspace.name}}</b> {{ $t('mainMenu.syncWithGithubRepo') }}
        </span>
        <span v-else-if="currentWorkspace.providerId === 'githubWorkspace'">
          <b>{{currentWorkspace.name}}</b> {{ $t('mainMenu.syncWithGithubRepoLink') }}
        </span>
        <span v-else-if="currentWorkspace.providerId === 'giteeWorkspace'">
          <b>{{currentWorkspace.name}}</b> {{ $t('mainMenu.syncWithGiteeRepoLink') }}
        </span>
      </div>
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-else>
        <div class="menu-entry__icon menu-entry__icon--disabled">
          <icon-sync-off></icon-sync-off>
        </div>
        <span><b>{{currentWorkspace.name}}</b> {{ $t('mainMenu.notSynced') }}</span>
      </div>
    </div>
    <menu-entry v-if="!loginToken" @click.native="signin">
      <template v-slot:icon><icon-login></icon-login></template>
      <div>{{ $t('mainMenu.signinGitee') }}</div>
      <span>{{ $t('mainMenu.signinDesc') }}</span>
    </menu-entry>
    <menu-entry v-if="!loginToken" @click.native="signinWithGithub">
      <template v-slot:icon><icon-login></icon-login></template>
      <div>{{ $t('mainMenu.signinGithub') }}</div>
      <span>{{ $t('mainMenu.signinDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="setPanel('workspaces')">
      <template v-slot:icon><icon-database></icon-database></template>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="workspaceCount">{{workspaceCount}}</div> {{ $t('mainMenu.workspaces') }}</div>
      <span>{{ $t('mainMenu.workspacesDesc') }}</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('sync')">
      <template v-slot:icon><icon-sync></icon-sync></template>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="syncLocationCount">{{syncLocationCount}}</div> {{ $t('mainMenu.sync') }}</div>
      <span>{{ $t('mainMenu.syncDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="setPanel('publish')">
      <template v-slot:icon><icon-upload></icon-upload></template>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="publishLocationCount">{{publishLocationCount}}</div>{{ $t('mainMenu.publish') }}</div>
      <span>{{ $t('mainMenu.publishDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="setPanel('history')">
      <template v-slot:icon><icon-history></icon-history></template>
      <div>{{ $t('mainMenu.history') }}</div>
      <span>{{ $t('mainMenu.historyDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="fileProperties">
      <template v-slot:icon><icon-view-list></icon-view-list></template>
      <div>{{ $t('mainMenu.fileProperties') }}</div>
      <span>{{ $t('mainMenu.filePropertiesDesc') }}</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('toc')">
      <template v-slot:icon><icon-toc></icon-toc></template>
      {{ $t('mainMenu.toc') }}
    </menu-entry>
    <menu-entry @click.native="setPanel('help')">
      <template v-slot:icon><icon-help-circle></icon-help-circle></template>
      {{ $t('mainMenu.markdownHelp') }}
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('importExport')">
      <template v-slot:icon><icon-content-save></icon-content-save></template>
      {{ $t('mainMenu.importExport') }}
    </menu-entry>
    <menu-entry @click.native="print">
      <template v-slot:icon><icon-printer></icon-printer></template>
      {{ $t('mainMenu.print') }}
    </menu-entry>
    <hr>
    <menu-entry @click.native="badges">
      <template v-slot:icon><icon-seal></icon-seal></template>
      <div><div class="menu-entry__label menu-entry__label--count">{{badgeCount}}/{{featureCount}}</div> {{ $t('mainMenu.badges') }}</div>
      <span>{{ $t('mainMenu.badgesDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="accounts">
      <template v-slot:icon><icon-key></icon-key></template>
      <div><div class="menu-entry__label menu-entry__label--count">{{accountCount}}</div> {{ $t('mainMenu.accounts') }}</div>
      <span>{{ $t('mainMenu.accountsDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="templates">
      <template v-slot:icon><icon-code-braces></icon-code-braces></template>
      <div><div class="menu-entry__label menu-entry__label--count">{{templateCount}}</div> {{ $t('mainMenu.templates') }}</div>
      <span>{{ $t('mainMenu.templatesDesc') }}</span>
    </menu-entry>
    <menu-entry @click.native="settings">
      <template v-slot:icon><icon-settings></icon-settings></template>
      <div>{{ $t('mainMenu.settings') }}</div>
      <span>{{ $t('mainMenu.settingsDesc') }}</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('workspaceBackups')">
      <template v-slot:icon><icon-content-save></icon-content-save></template>
      {{ $t('mainMenu.workspaceBackups') }}
    </menu-entry>
    <menu-entry @click.native="reset">
      <template v-slot:icon><icon-logout></icon-logout></template>
      {{ $t('mainMenu.resetApp') }}
    </menu-entry>
    <menu-entry @click.native="about">
      <template v-slot:icon><icon-help-circle></icon-help-circle></template>
      {{ $t('mainMenu.about') }}
    </menu-entry>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import MenuEntry from './common/MenuEntry';
import providerRegistry from '../../services/providers/common/providerRegistry';
import UserImage from '../UserImage';
import giteeHelper from '../../services/providers/helpers/giteeHelper';
import githubHelper from '../../services/providers/helpers/githubHelper';
import syncSvc from '../../services/syncSvc';
import userSvc from '../../services/userSvc';
import store from '../../store';
import i18nSvc from '../../services/i18nSvc';

export default {
  components: {
    MenuEntry,
    UserImage,
  },
  computed: {
    ...mapGetters('workspace', [
      'currentWorkspace',
      'syncToken',
      'loginToken',
    ]),
    userId() {
      return userSvc.getCurrentUserId();
    },
    workspaceLocationUrl() {
      const provider = providerRegistry.providersById[this.currentWorkspace.providerId];
      return provider.getWorkspaceLocationUrl(this.currentWorkspace);
    },
    workspaceCount() {
      return Object.keys(store.getters['workspace/workspacesById']).length;
    },
    syncLocationCount() {
      return Object.keys(store.getters['syncLocation/currentWithWorkspaceSyncLocation']).length;
    },
    publishLocationCount() {
      return Object.keys(store.getters['publishLocation/current']).length;
    },
    templateCount() {
      return Object.keys(store.getters['data/allTemplatesById']).length;
    },
    accountCount() {
      return Object.values(store.getters['data/tokensByType'])
        .reduce((count, tokensBySub) => count + Object.values(tokensBySub).length, 0);
    },
    badgeCount() {
      return store.getters['data/allBadges'].filter(badge => badge.isEarned).length;
    },
    featureCount() {
      return store.getters['data/allBadges'].length;
    },
  },
  methods: {
    ...mapActions('data', {
      setPanel: 'setSideBarPanel',
    }),
    $t(key, params) {
      return i18nSvc.t(key, params);
    },
    async signin() {
      try {
        await giteeHelper.signin();
        await syncSvc.afterSignIn();
        syncSvc.requestSync();
      } catch (e) {
        // Cancel
      }
    },
    async signinWithGithub() {
      try {
        await githubHelper.signin();
        await syncSvc.afterSignIn();
        syncSvc.requestSync();
      } catch (e) {
        // Cancel
      }
    },
    async fileProperties() {
      try {
        await store.dispatch('modal/open', 'fileProperties');
      } catch (e) {
        // Cancel
      }
    },
    print() {
      window.print();
    },
    async settings() {
      try {
        await store.dispatch('modal/open', 'settings');
      } catch (e) { /* Cancel */ }
    },
    async templates() {
      try {
        await store.dispatch('modal/open', 'templates');
      } catch (e) { /* Cancel */ }
    },
    async accounts() {
      try {
        await store.dispatch('modal/open', 'accountManagement');
      } catch (e) { /* Cancel */ }
    },
    async badges() {
      try {
        await store.dispatch('modal/open', 'badgeManagement');
      } catch (e) { /* Cancel */ }
    },
    async reset() {
      try {
        await store.dispatch('modal/open', 'reset');
        localStorage.setItem('resetGitPen', '1');
        window.location.reload();
      } catch (e) { /* Cancel */ }
    },
    about() {
      store.dispatch('modal/open', 'about');
    },
  },
};
</script>
