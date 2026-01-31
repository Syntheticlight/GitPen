<template>
  <div class="side-bar flex flex--column">
    <div class="side-title flex flex--row">
      <button v-if="panel !== 'menu'" class="side-title__button button" @click="setPanel('menu')" :v-title="$t('sideBar.mainMenu')">
        <icon-dots-horizontal></icon-dots-horizontal>
      </button>
      <div class="side-title__title">
        {{panelName}}
      </div>
      <button class="side-title__button button" @click="toggleSideBar(false)" :v-title="$t('sideBar.closeSideBar')">
        <icon-close></icon-close>
      </button>
    </div>
    <div class="side-bar__inner">
      <main-menu v-if="panel === 'menu'"></main-menu>
      <workspaces-menu v-else-if="panel === 'workspaces'"></workspaces-menu>
      <sync-menu v-else-if="panel === 'sync'"></sync-menu>
      <publish-menu v-else-if="panel === 'publish'"></publish-menu>
      <history-menu v-else-if="panel === 'history'"></history-menu>
      <import-export-menu v-else-if="panel === 'export'"></import-export-menu>
      <import-export-menu v-else-if="panel === 'importExport'"></import-export-menu>
      <workspace-backup-menu v-else-if="panel === 'workspaceBackups'"></workspace-backup-menu>
      <div v-else-if="panel === 'help'" class="side-bar__panel side-bar__panel--help">
        <pre class="markdown-highlighting" v-html="markdownSample"></pre>
      </div>
      <div class="side-bar__panel side-bar__panel--toc" :class="{'side-bar__panel--hidden': panel !== 'toc'}">
        <toc>
        </toc>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Toc from './Toc';
import MainMenu from './menus/MainMenu';
import WorkspacesMenu from './menus/WorkspacesMenu';
import SyncMenu from './menus/SyncMenu';
import PublishMenu from './menus/PublishMenu';
import HistoryMenu from './menus/HistoryMenu';
import ImportExportMenu from './menus/ImportExportMenu';
import WorkspaceBackupMenu from './menus/WorkspaceBackupMenu';
import markdownSample from '../data/markdownSample.md?raw';
import markdownConversionSvc from '../services/markdownConversionSvc';
import store from '../store';
import i18nSvc from '../services/i18nSvc';

const panelKeys = {
  menu: 'sideBar.panels.menu',
  workspaces: 'sideBar.panels.workspaces',
  help: 'sideBar.panels.help',
  toc: 'sideBar.panels.toc',
  sync: 'sideBar.panels.sync',
  publish: 'sideBar.panels.publish',
  history: 'sideBar.panels.history',
  importExport: 'sideBar.panels.importExport',
  workspaceBackups: 'sideBar.panels.workspaceBackups',
};

export default {
  components: {
    Toc,
    MainMenu,
    WorkspacesMenu,
    SyncMenu,
    PublishMenu,
    HistoryMenu,
    ImportExportMenu,
    WorkspaceBackupMenu,
  },
  data: () => ({
    markdownSample: markdownConversionSvc.highlight(markdownSample),
  }),
  computed: {
    panel() {
      if (store.state.light) {
        return null; // No menu in light mode
      }
      const result = store.getters['data/layoutSettings'].sideBarPanel;
      return panelKeys[result] ? result : 'menu';
    },
    panelName() {
      return i18nSvc.t(panelKeys[this.panel]);
    },
  },
  methods: {
    ...mapActions('data', [
      'toggleSideBar',
    ]),
    ...mapActions('data', {
      setPanel: 'setSideBarPanel',
    }),
    $t(key, params) {
      return i18nSvc.t(key, params);
    },
  },
};
</script>

<style lang="scss">
@import '../styles/variables.scss';

.side-bar {
  overflow: hidden;
  height: 100%;

  hr {
    margin: 10px 40px;
    display: none;
    border-top: 1px solid $hr-color;
  }

  * + hr {
    display: block;
  }

  hr + hr {
    display: none;
  }

  .textfield {
    font-size: 14px;
    height: 26px;
  }
}

.side-bar__inner {
  position: relative;
  height: 100%;
}

.side-bar__panel {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;

  &::after {
    content: '';
    display: block;
    height: 40px;
  }
}

.side-bar__panel--hidden {
  left: 1000px;
}

.side-bar__panel--menu {
  padding: 10px;
}

.side-bar__panel--help {
  padding: 0 10px 0 20px;

  pre {
    font-size: 0.9em;
    font-variant-ligatures: no-common-ligatures;
    line-height: 1.25;
    white-space: pre-wrap;
    word-break: break-word;
    word-wrap: break-word;
  }

  .code,
  .img,
  .imgref,
  .cl-toc {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.side-bar__info {
  padding: 10px;
  margin: -10px -10px 10px;
  background-color: $info-bg;
  font-size: 0.95em;

  p {
    margin: 10px 15px;
    font-size: 0.9rem;
    opacity: 0.67;
    line-height: 1.3;
  }
}
</style>
