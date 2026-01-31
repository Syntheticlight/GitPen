import i18nSvc from '../services/i18nSvc';

class Feature {
  constructor(id, children = null) {
    this.id = id;
    this.children = children;
  }

  get badgeName() {
    return i18nSvc.t(`badges.features.${this.id}.name`);
  }

  get description() {
    return i18nSvc.t(`badges.features.${this.id}.description`);
  }

  toBadge(badgeCreations) {
    const children = this.children
      ? this.children.map(child => child.toBadge(badgeCreations))
      : null;
    return {
      featureId: this.id,
      name: this.badgeName,
      description: this.description,
      children,
      isEarned: children
        ? children.every(child => child.isEarned)
        : !!badgeCreations[this.id],
      hasSomeEarned: children && children.some(child => child.isEarned),
    };
  }
}

export default [
  new Feature(
    'navigationBar',
    [
      new Feature('formatButtons'),
      new Feature('editCurrentFileName'),
      new Feature('toggleExplorer'),
      new Feature('toggleSideBar'),
    ],
  ),
  new Feature(
    'explorer',
    [
      new Feature('createFile'),
      new Feature('switchFile'),
      new Feature('createFolder'),
      new Feature('moveFile'),
      new Feature('moveFolder'),
      new Feature('renameFile'),
      new Feature('renameFolder'),
      new Feature('removeFile'),
      new Feature('removeFolder'),
      new Feature('searchFile'),
    ],
  ),
  new Feature(
    'buttonBar',
    [
      new Feature('toggleNavigationBar'),
      new Feature('toggleSidePreview'),
      new Feature('toggleEditor'),
      new Feature('toggleFocusMode'),
      new Feature('toggleScrollSync'),
      new Feature('toggleStatusBar'),
    ],
  ),
  new Feature(
    'signIn',
    [
      new Feature('syncMainWorkspace'),
      new Feature('sponsor'),
    ],
  ),
  new Feature(
    'githubSignIn',
    [
      new Feature('githubSyncMainWorkspace'),
    ],
  ),
  new Feature(
    'workspaces',
    [
      new Feature('addCouchdbWorkspace'),
      new Feature('addGithubWorkspace'),
      new Feature('addGiteeWorkspace'),
      new Feature('addGitlabWorkspace'),
      new Feature('addGiteaWorkspace'),
      new Feature('addGoogleDriveWorkspace'),
      new Feature('renameWorkspace'),
      new Feature('removeWorkspace'),
      new Feature('autoSyncWorkspace'),
      new Feature('stopAutoSyncWorkspace'),
    ],
  ),
  new Feature(
    'manageAccounts',
    [
      new Feature('addBloggerAccount'),
      new Feature('addDropboxAccount'),
      new Feature('addGitHubAccount'),
      new Feature('addGiteeAccount'),
      new Feature('addGitLabAccount'),
      new Feature('addGiteaAccount'),
      new Feature('addGoogleDriveAccount'),
      new Feature('addGooglePhotosAccount'),
      new Feature('addWordpressAccount'),
      new Feature('addZendeskAccount'),
      new Feature('addSmmsAccount'),
      new Feature('addCustomAccount'),
      new Feature('removeAccount'),
    ],
  ),
  new Feature(
    'syncFiles',
    [
      new Feature('openFromDropbox'),
      new Feature('saveOnDropbox'),
      new Feature('openFromGithub'),
      new Feature('saveOnGithub'),
      new Feature('saveOnGist'),
      new Feature('openFromGitee'),
      new Feature('saveOnGitee'),
      new Feature('saveOnGiteeGist'),
      new Feature('openFromGitlab'),
      new Feature('saveOnGitlab'),
      new Feature('openFromGitea'),
      new Feature('saveOnGitea'),
      new Feature('openFromGoogleDrive'),
      new Feature('saveOnGoogleDrive'),
      new Feature('triggerSync'),
      new Feature('syncMultipleLocations'),
      new Feature('removeSyncLocation'),
    ],
  ),
  new Feature(
    'publishFiles',
    [
      new Feature('publishToBlogger'),
      new Feature('publishToBloggerPage'),
      new Feature('publishToDropbox'),
      new Feature('publishToGithub'),
      new Feature('publishToGist'),
      new Feature('publishToGitee'),
      new Feature('publishToGiteeGist'),
      new Feature('publishToGitlab'),
      new Feature('publishToGitea'),
      new Feature('publishToGoogleDrive'),
      new Feature('publishToWordPress'),
      new Feature('publishToZendesk'),
      new Feature('triggerPublish'),
      new Feature('publishMultipleLocations'),
      new Feature('removePublishLocation'),
    ],
  ),
  new Feature(
    'manageHistory',
    [
      new Feature('restoreVersion'),
      new Feature('chooseHistory'),
    ],
  ),
  new Feature(
    'manageProperties',
    [
      new Feature('setMetadata'),
      new Feature('changePreset'),
      new Feature('changeExtension'),
    ],
  ),
  new Feature(
    'comment',
    [
      new Feature('createDiscussion'),
      new Feature('addComment'),
      new Feature('removeComment'),
      new Feature('removeDiscussion'),
    ],
  ),
  new Feature(
    'importExport',
    [
      new Feature('importMarkdown'),
      new Feature('exportMarkdown'),
      new Feature('importHtml'),
      new Feature('exportHtml'),
    ],
  ),
  new Feature(
    'manageSettings',
    [
      new Feature('changeSettings'),
      new Feature('switchTheme'),
      new Feature('changeShortcuts'),
    ],
  ),
  new Feature(
    'manageTemplates',
    [
      new Feature('addTemplate'),
      new Feature('removeTemplate'),
    ],
  ),
];
