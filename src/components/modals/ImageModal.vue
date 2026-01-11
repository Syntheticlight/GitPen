<template>
  <modal-inner :aria-label="$t('modals.image.title')">
    <div class="modal__content">
      <p>{{ $t('modals.image.url') }}<span v-if="uploading">({{ $t('common.loading') }})</span></p>
      <form-entry :label="$t('modals.image.url')" error="url">
        <template v-slot:field><input class="textfield" type="text" v-model.trim="url" @keydown.enter="resolve"></template>
      </form-entry>
    </div>
    <div class="modal__button-bar">
      <input class="hidden-file" id="upload-image-file-input" type="file" accept="image/*" :disabled="uploading" @change="uploadImage">
      <label for="upload-image-file-input"><a class="button">{{ $t('modals.imgStorage.uploadImage') }}</a></label>
      <button class="button" @click="reject()">{{ $t('common.cancel') }}</button>
      <button class="button button--resolve" @click="resolve" :disabled="uploading">{{ $t('common.confirm') }}</button>
    </div>
    <div>
      <hr />
      <p>{{ $t('modals.imgStorage.addAfterSelect') }}</p>

      <menu-entry @click.native="checkedImgDest(path)" v-for="path in workspaceImgPath" :key="path">
        <template v-slot:icon>
          <icon-check-circle v-if="checkedStorage.sub === path"></icon-check-circle>
          <icon-check-circle-un v-if="checkedStorage.sub !== path"></icon-check-circle-un>
        </template>
        <menu-item>
          <template v-slot:icon><icon-provider :provider-id="currentWorkspace.providerId"></icon-provider></template>
          <div>
            {{ $t('modals.imgStorage.currentWorkspacePath') }}
            <button class="menu-item__button button" @click.stop="removeByPath(path)" :v-title="$t('common.delete')">
              <icon-delete></icon-delete>
            </button>
          </div>
          <span>{{ $t('modals.imgStorage.path') }}：{{path}}</span>
        </menu-item>
      </menu-entry>
      <menu-entry @click.native="checkedImgDest(token.sub, token.providerId)" v-for="token in imageTokens" :key="token.sub">
        <template v-slot:icon>
          <icon-check-circle v-if="checkedStorage.sub === token.sub"></icon-check-circle>
          <icon-check-circle-un v-if="checkedStorage.sub !== token.sub"></icon-check-circle-un>
        </template>
        <menu-item>
          <template v-slot:icon><icon-provider :provider-id="token.providerId"></icon-provider></template>
          <div>
            {{ token.remark }}
            <button class="menu-item__button button" @click.stop="remove(token.providerId, token)" :v-title="$t('common.delete')">
              <icon-delete></icon-delete>
            </button>
          </div>
          <span>{{token.name}}</span>
          <span class="line-entry" v-if="token.uploadUrl">{{ $t('modals.imgStorage.uploadUrl') }}：{{token.uploadUrl}}</span>
          <span class="line-entry" v-if="token.headers">{{ $t('modals.imgStorage.customHeaders') }}：{{token.headers}}</span>
          <span class="line-entry" v-if="token.params">{{ $t('modals.imgStorage.customParams') }}：{{token.params}}</span>
        </menu-item>
      </menu-entry>
      <menu-entry @click.native="checkedImgDest(tokenStorage.token.sub, tokenStorage.providerId, tokenStorage.sid)" v-for="tokenStorage in tokensImgStorages" :key="tokenStorage.sid">
        <template v-slot:icon>
          <icon-check-circle v-if="checkedStorage.sid === tokenStorage.sid"></icon-check-circle>
          <icon-check-circle-un v-if="checkedStorage.sid !== tokenStorage.sid"></icon-check-circle-un>
        </template>
        <menu-item>
          <template v-slot:icon><icon-provider :provider-id="tokenStorage.providerId"></icon-provider></template>
          <div>{{tokenStorage.providerName}}
            <button class="menu-item__button button" @click.stop="remove(tokenStorage.providerId, tokenStorage)" :v-title="$t('common.delete')">
              <icon-delete></icon-delete>
            </button>
          </div>
          <span> {{tokenStorage.uname}}, {{ $t('modals.imgStorage.repo') }}: {{tokenStorage.repoUrl}}, {{ $t('modals.imgStorage.path') }}: {{tokenStorage.path}}, {{ $t('modals.imgStorage.branch') }}: {{tokenStorage.branch}}</span>
        </menu-item>
      </menu-entry>
      <menu-entry @click.native="addWorkspaceImgPath">
        <template v-slot:icon><icon-provider :provider-id="currentWorkspace.providerId"></icon-provider></template>
        <span>{{ $t('modals.imgStorage.addWorkspacePath') }}</span>
      </menu-entry>
      <menu-entry @click.native="addSmmsAccount">
        <template v-slot:icon><icon-provider provider-id="smms"></icon-provider></template>
        <span>{{ $t('modals.imgStorage.addSmms') }}</span>
      </menu-entry>
      <menu-entry @click.native="addCustomAccount">
        <template v-slot:icon><icon-provider provider-id="custom"></icon-provider></template>
        <span>{{ $t('modals.imgStorage.addCustom') }}</span>
      </menu-entry>
      <menu-entry @click.native="addGithubImgStorage">
        <template v-slot:icon><icon-provider provider-id="github"></icon-provider></template>
        <span>{{ $t('modals.imgStorage.addGithub') }}</span>
      </menu-entry>
    </div>
  </modal-inner>
</template>

<script>
import { mapGetters } from 'vuex';
import modalTemplate from './common/modalTemplate';
import MenuEntry from '../menus/common/MenuEntry';
import MenuItem from '../menus/common/MenuItem';
import smmsHelper from '../../services/providers/helpers/smmsHelper';
import store from '../../store';
import githubHelper from '../../services/providers/helpers/githubHelper';
import customHelper from '../../services/providers/helpers/customHelper';
import utils from '../../services/utils';
import imageSvc from '../../services/imageSvc';
import i18nSvc from '../../services/i18nSvc';

export default modalTemplate({
  components: {
    MenuEntry,
    MenuItem,
  },
  data: () => ({
    uploading: false,
    url: '',
  }),
  computed: {
    ...mapGetters('workspace', [
      'currentWorkspace',
      'currentWorkspaceIsGit',
    ]),
    checkedStorage() {
      return store.getters['img/getCheckedStorage'];
    },
    workspaceImgPath() {
      if (!this.currentWorkspaceIsGit) {
        return [];
      }
      const workspaceImgPath = store.getters['img/getWorkspaceImgPath'];
      return Object.keys(workspaceImgPath || {});
    },
    imageTokens() {
      return [
        ...Object.values(store.getters['data/smmsTokensBySub']).map(token => ({
          ...token,
          providerId: 'smms',
          remark: 'SM.MS图床',
        })),
        ...Object.values(store.getters['data/customTokensBySub']).map(token => ({
          ...token,
          providerId: 'custom',
          headers: token.customHeaders && JSON.stringify(token.customHeaders),
          params: token.customParams && JSON.stringify(token.customParams),
          remark: '自定义图床',
        })),
      ];
    },
    tokensImgStorages() {
      const providerTokens = [
        ...Object.values(store.getters['data/githubTokensBySub']).map(token => ({
          token,
          providerId: 'github',
          providerName: 'GitHub图床',
        })),
      ];
      const imgStorages = [];
      Object.values(providerTokens)
        .sort((item1, item2) => item1.token.name.localeCompare(item2.token.name))
        .forEach((it) => {
          if (!it.token.imgStorages || it.token.imgStorages.length === 0) {
            return;
          }
          // 拼接上当前用户名
          it.token.imgStorages.forEach(storage => imgStorages.push({
            ...storage,
            token: it.token,
            uname: it.token.name,
            providerId: it.providerId,
            providerName: it.providerName,
            repoUrl: `${storage.owner}/${storage.repo}`,
          }));
        });
      return imgStorages;
    },
  },
  methods: {
    $t(key, params) {
      return i18nSvc.t(key, params);
    },
    resolve(evt) {
      evt.preventDefault(); // Fixes image modal issue
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
    async uploadImage(evt) {
      if (!evt.target.files || !evt.target.files.length) {
        return;
      }
      const imgFile = evt.target.files[0];
      try {
        this.uploading = true;
        const { url, error } = await imageSvc.updateImg(imgFile);
        if (error) {
          store.dispatch('notification/error', error);
          return;
        }
        this.url = url;
      } catch (err) {
        store.dispatch('notification/error', err);
      } finally {
        this.uploading = false;
        // 上传后清空
        evt.target.value = '';
      }
    },
    async remove(proivderId, item) {
      try {
        await store.dispatch('modal/open', 'imgStorageDeletion');
        if (proivderId === 'smms' || proivderId === 'custom') {
          const tokensBySub = utils.deepCopy(store.getters[`data/${proivderId}TokensBySub`]);
          delete tokensBySub[item.sub];
          // 删除账号
          await store.dispatch('data/patchTokensByType', {
            [proivderId]: tokensBySub,
          });
        } else if (proivderId === 'github') {
          githubHelper.removeTokenImgStorage(item.token, item.sid);
        }
      } catch (e) {
        // Cancel
      }
    },
    async removeByPath(path) {
      store.dispatch('img/removeWorkspaceImgPath', path);
    },
    async addWorkspaceImgPath() {
      const { path } = await store.dispatch('modal/open', { type: 'workspaceImgPath' });
      store.dispatch('img/addWorkspaceImgPath', path);
    },
    async addSmmsAccount() {
      const { proxyUrl, apiSecretToken } = await store.dispatch('modal/open', { type: 'smmsAccount' });
      await smmsHelper.addAccount(proxyUrl, apiSecretToken);
    },
    async addCustomAccount() {
      const accountInfo = await store.dispatch('modal/open', { type: 'customAccount' });
      await customHelper.addAccount(accountInfo);
    },
    async addGithubImgStorage() {
      try {
        await store.dispatch('modal/open', { type: 'githubAccount' });
        const token = await githubHelper.addAccount(store.getters['data/localSettings'].githubRepoFullAccess);
        const imgStorageInfo = await store.dispatch('modal/open', {
          type: 'githubImgStorage',
          token,
        });
        githubHelper.updateToken(token, imgStorageInfo);
      } catch (e) { /* Cancel */ }
    },
    async checkedImgDest(sub, provider, sid) {
      let type = 'token';
      // 当前文档空间存储
      if (!provider) {
        type = 'workspace';
      } else if (provider === 'gitea' || provider === 'github') {
        type = 'tokenRepo';
      }
      store.dispatch('img/changeCheckedStorage', {
        type,
        provider,
        sub,
        sid,
      });
      // const { callback } = this.config;
      // this.config.reject();
      // const res = await googleHelper.openPicker(token, 'img');
      // if (res[0]) {
      //   store.dispatch('modal/open', {
      //     type: 'googlePhoto',
      //     url: res[0].url,
      //     callback,
      //   });
      // }
    },
  },
});
</script>
<style lang="scss">
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

.menu-item__button {
  width: 30px;
  height: 30px;
  padding: 4px;
  background-color: transparent;
  opacity: 0.75;
}
</style>
