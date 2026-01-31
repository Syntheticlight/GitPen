<template>
  <div class="side-bar__panel side-bar__panel--menu">
    <div class="side-bar__info" v-if="isCurrentTemp">
      <p>{{currentFileName}} {{ $t('publish.cannotPublish') }}</p>
    </div>
    <div v-else>
      <div class="side-bar__info" v-if="publishLocations.length">
        <p>{{currentFileName}} {{ $t('publish.alreadyPublished') }}</p>
        <menu-entry @click.native="requestPublish">
          <template v-slot:icon><icon-upload></icon-upload></template>
          <div>{{ $t('publish.publishNow') }}</div>
          <span>{{ $t('publish.publishNowDesc') }}</span>
        </menu-entry>
        <menu-entry @click.native="managePublish">
          <template v-slot:icon><icon-view-list></icon-view-list></template>
          <div><div class="menu-entry__label menu-entry__label--count">{{locationCount}}</div> {{ $t('publish.filePublish') }}</div>
          <span>{{ $t('publish.filePublishDesc') }}</span>
        </menu-entry>
      </div>
      <div class="side-bar__info" v-else-if="noToken">
        <p>{{ $t('publish.mustLinkAccount') }}</p>
      </div>
      <hr>
      <div v-for="token in githubTokens" :key="token.sub">
        <menu-entry @click.native="publishGist(token)">
          <template v-slot:icon><icon-provider provider-id="gist"></icon-provider></template>
          <div>{{ $t('publish.publishToGist') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
        <menu-entry @click.native="publishGithub(token)">
          <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
          <div>{{ $t('publish.publishToGithub') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
      </div>
      <div v-for="token in giteeTokens" :key="token.sub">
        <menu-entry @click.native="publishGiteeGist(token)">
          <template v-slot:icon><icon-provider provider-id="giteegist"></icon-provider></template>
          <div>{{ $t('publish.publishToGiteeGist') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
        <menu-entry @click.native="publishGitee(token)">
          <template v-slot:icon><icon-provider provider-id="gitee"></icon-provider></template>
          <div>{{ $t('publish.publishToGitee') }}</div>
          <span>{{token.name}}</span>
        </menu-entry>
      </div>
      <hr>
      <menu-entry @click.native="addGithubAccount">
        <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
        <span>{{ $t('publish.addGithubAccount') }}</span>
      </menu-entry>
      <menu-entry @click.native="addGiteeAccount">
        <template v-slot:icon><icon-provider provider-id="gitee"></icon-provider></template>
        <span>{{ $t('publish.addGiteeAccount') }}</span>
      </menu-entry>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MenuEntry from './common/MenuEntry';
import githubHelper from '../../services/providers/helpers/githubHelper';
import giteeHelper from '../../services/providers/helpers/giteeHelper';
import publishSvc from '../../services/publishSvc';
import store from '../../store';
import i18nSvc from '../../services/i18nSvc';

const tokensToArray = (tokens, filter = () => true) => Object.values(tokens)
  .filter(token => filter(token))
  .sort((token1, token2) => token1.name.localeCompare(token2.name));

const publishModalOpener = (type, featureId) => async (token) => {
  try {
    const publishLocation = await store.dispatch('modal/open', {
      type,
      token,
    });
    publishSvc.createPublishLocation(publishLocation, featureId);
  } catch (e) { /* cancel */ }
};

export default {
  components: {
    MenuEntry,
  },
  computed: {
    ...mapState('queue', [
      'isPublishRequested',
    ]),
    ...mapGetters('file', [
      'isCurrentTemp',
    ]),
    ...mapGetters('publishLocation', {
      publishLocations: 'current',
    }),
    locationCount() {
      return Object.keys(this.publishLocations).length;
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
    requestPublish() {
      if (!this.isPublishRequested) {
        publishSvc.requestPublish();
      }
    },
    async managePublish() {
      try {
        await store.dispatch('modal/open', 'publishManagement');
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
    publishGithub: publishModalOpener('githubPublish', 'publishToGithub'),
    publishGist: publishModalOpener('gistPublish', 'publishToGist'),
    publishGitee: publishModalOpener('giteePublish', 'publishToGitee'),
    publishGiteeGist: publishModalOpener('giteeGistPublish', 'publishGiteeGist'),
  },
};
</script>
