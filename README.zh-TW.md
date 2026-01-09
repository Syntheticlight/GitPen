<h1 align="center" style="text-align:center;">
<img src="chrome-app/icon-512.png" width="128" />
<br />
GitPen
</h1>
<p align="center">
	<strong>免費、開源、無伺服器架構的 Markdown 編輯器</strong><br>
  支援 GitHub 和 Gitee 同步，可部署到 Cloudflare Pages
</p>
<p align="center">
	<a href="https://github.com/Syntheticlight/GitPen">https://github.com/Syntheticlight/GitPen</a>
</p>
<p align="center">
    <a target="_blank" href="https://www.apache.org/licenses/LICENSE-2.0.txt">
		<img src="https://img.shields.io/:license-Apache2-blue.svg" alt="Apache 2" />
	</a>
</p>
<p align="center">
    <a href="./README.md">English</a> |
    <a href="./README.ja.md">日本語</a> |
    <a href="./README.zh-TW.md">繁體中文</a> |
    <a href="./README.zh-CN.md">简体中文</a>
</p>
<hr />

## 功能特性

- 📝 支援 Gitee、GitHub 儲存庫儲存筆記
- 🖼️ 支援多種圖床（GitHub、Gitee、SM.MS）貼上或拖放上傳
- 🎨 編輯區域支援選擇主題或自訂
- 📜 支援歷史版本管理
- 📐 支援 KaTeX 數學表達式、Mermaid UML 圖、樂譜等擴充功能
- ☁️ 無伺服器架構，可免費部署到 Cloudflare Pages

<hr />

## Cloudflare Pages 部署

### 前置條件

1. 一個 [Cloudflare](https://cloudflare.com) 帳號
2. 一個 GitHub OAuth App（用於 GitHub 登入）
3. 一個 Gitee OAuth App（可選，用於 Gitee 登入）

### 建立 OAuth 應用程式

#### GitHub OAuth App

1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 點擊「New OAuth App」
3. 填寫應用程式資訊：
   - **Application name**: GitPen
   - **Homepage URL**: 您的 Cloudflare Pages 網域（如 `https://gitpen.pages.dev`）
   - **Authorization callback URL**: `https://您的網域/oauth2/callback.html`
4. 建立後記錄 `Client ID` 和 `Client Secret`

#### Gitee OAuth App（可選）

1. 前往 [Gitee 第三方應用程式](https://gitee.com/oauth/applications)
2. 點擊「建立應用程式」
3. 填寫應用程式資訊：
   - **應用程式名稱**: GitPen
   - **應用程式首頁**: 您的 Cloudflare Pages 網域
   - **應用程式回呼位址**: `https://您的網域/oauth2/callback.html`
4. 建立後記錄 `Client ID` 和 `Client Secret`

### 部署步驟

#### 方式一：透過 Cloudflare Dashboard 部署

1. Fork 本儲存庫到您的 GitHub 帳號
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 進入 **Workers & Pages** > **Create application** > **Pages**
4. 選擇 **Connect to Git**，授權並選擇您 fork 的儲存庫
5. 設定建置設定：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `stackedit-master/stackedit-master`（如果專案在子目錄）
6. 點擊 **Save and Deploy**

#### 方式二：透過 Wrangler CLI 部署

```bash
# 安裝 Wrangler CLI
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 建置專案
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=gitpen
```

### 設定環境變數

部署完成後，需要在 Cloudflare Pages 中設定環境變數：

1. 進入 Cloudflare Dashboard > Workers & Pages > 您的專案
2. 點擊 **Settings** > **Environment variables**
3. 新增以下變數：

| 變數名稱 | 必需 | 說明 |
|----------|------|------|
| `GITHUB_CLIENT_ID` | 是 | GitHub OAuth App 的 Client ID |
| `GITHUB_CLIENT_SECRET` | 是 | GitHub OAuth App 的 Client Secret |
| `GITEE_CLIENT_ID` | 否 | Gitee OAuth App 的 Client ID |
| `GITEE_CLIENT_SECRET` | 否 | Gitee OAuth App 的 Client Secret |

4. 點擊 **Save** 儲存設定
5. 重新部署專案使環境變數生效

### Functions 目錄結構

專案使用 Cloudflare Functions 處理 OAuth 權杖交換：

```
functions/
├── oauth2/
│   ├── githubToken.js    # GitHub OAuth 權杖交換
│   └── giteeToken.js     # Gitee OAuth 權杖交換
└── conf.js               # 公開設定端點
```

這些函式會自動部署到 Cloudflare Pages Functions。

### 自訂網域

1. 在 Cloudflare Pages 專案設定中點擊 **Custom domains**
2. 新增您的自訂網域
3. 按照提示設定 DNS 記錄
4. 更新 OAuth App 的回呼位址為新網域

<hr />

## 本機開發

### 環境需求

- Node.js 16.14.0+
- npm 8.3.1+

### 安裝相依套件

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

前往 http://localhost:5173/

### 建置正式版本

```bash
npm run build
```

建置輸出在 `dist` 目錄。

### 部署腳本

專案提供了自動部署腳本 `deploy.sh`，可以一鍵建置並推送到 GitHub 儲存庫：

```bash
# 建置並推送（使用預設提交訊息）
./deploy.sh

# 使用自訂提交訊息
./deploy.sh "feat: add new feature"

# 僅建置，不推送
./deploy.sh -b

# 僅推送，不建置
./deploy.sh -p

# 檢視說明
./deploy.sh -h
```

或者使用 npm 腳本：

```bash
npm run deploy
```

腳本會自動：
1. 檢查 git 和 npm 是否可用
2. 設定遠端儲存庫為 https://github.com/Syntheticlight/GitPen
3. 執行 `npm run build` 建置專案
4. 提交所有變更並推送到遠端儲存庫

### 執行測試

```bash
# 執行 Cloudflare Functions 測試
npm run test:functions
```

<hr />

## 貢獻指南

歡迎貢獻！請隨時提交 Pull Request。

1. Fork 儲存庫
2. 建立您的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的變更（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 開啟 Pull Request

<hr />

## 專案來源

GitPen 基於 [StackEdit](https://github.com/benweet/stackedit) 重構，主要變更：

- 移除 Python 後端，改用 Cloudflare Functions
- 精簡第三方登入，只保留 GitHub 和 Gitee
- 移除 PDF/Pandoc 匯出功能
- 移除 ChatGPT 功能
- 專案重新命名為 GitPen

## 授權條款

[Apache License 2.0](LICENSE)
