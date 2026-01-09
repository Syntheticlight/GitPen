<h1 align="center" style="text-align:center;">
<img src="chrome-app/icon-512.png" width="128" />
<br />
GitPen
</h1>
<p align="center">
	<strong>免费、开源、无服务器架构的 Markdown 编辑器</strong><br>
  支持 GitHub 和 Gitee 同步，可部署到 Cloudflare Pages
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

- 📝 支持 Gitee、GitHub 仓库存储笔记
- 🖼️ 支持多种图床（GitHub、Gitee、SM.MS）粘贴或拖拽上传
- 🎨 编辑区域支持选择主题或自定义
- 📜 支持历史版本管理
- 📐 支持 KaTeX 数学表达式、Mermaid UML 图、乐谱等扩展
- ☁️ 无服务器架构，可免费部署到 Cloudflare Pages

<hr />

## Cloudflare Pages 部署

### 前置条件

1. 一个 [Cloudflare](https://cloudflare.com) 账号
2. 一个 GitHub OAuth App（用于 GitHub 登录）
3. 一个 Gitee OAuth App（可选，用于 Gitee 登录）

### 创建 OAuth 应用

#### GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: GitPen
   - **Homepage URL**: 你的 Cloudflare Pages 域名（如 `https://gitpen.pages.dev`）
   - **Authorization callback URL**: `https://你的域名/oauth2/callback.html`
4. 创建后记录 `Client ID` 和 `Client Secret`

#### Gitee OAuth App（可选）

1. 访问 [Gitee 第三方应用](https://gitee.com/oauth/applications)
2. 点击 "创建应用"
3. 填写应用信息：
   - **应用名称**: GitPen
   - **应用主页**: 你的 Cloudflare Pages 域名
   - **应用回调地址**: `https://你的域名/oauth2/callback.html`
4. 创建后记录 `Client ID` 和 `Client Secret`

### 部署步骤

#### 方式一：通过 Cloudflare Dashboard 部署

1. Fork 本仓库到你的 GitHub 账号
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 **Workers & Pages** > **Create application** > **Pages**
4. 选择 **Connect to Git**，授权并选择你 fork 的仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `stackedit-master/stackedit-master`（如果项目在子目录）
6. 点击 **Save and Deploy**

#### 方式二：通过 Wrangler CLI 部署

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=gitpen
```

### 配置环境变量

部署完成后，需要在 Cloudflare Pages 中配置环境变量：

1. 进入 Cloudflare Dashboard > Workers & Pages > 你的项目
2. 点击 **Settings** > **Environment variables**
3. 添加以下变量：

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `GITHUB_CLIENT_ID` | 是 | GitHub OAuth App 的 Client ID |
| `GITHUB_CLIENT_SECRET` | 是 | GitHub OAuth App 的 Client Secret |
| `GITEE_CLIENT_ID` | 否 | Gitee OAuth App 的 Client ID |
| `GITEE_CLIENT_SECRET` | 否 | Gitee OAuth App 的 Client Secret |

4. 点击 **Save** 保存配置
5. 重新部署项目使环境变量生效

### Functions 目录结构

项目使用 Cloudflare Functions 处理 OAuth 令牌交换：

```
functions/
├── oauth2/
│   ├── githubToken.js    # GitHub OAuth 令牌交换
│   └── giteeToken.js     # Gitee OAuth 令牌交换
└── conf.js               # 公开配置端点
```

这些函数会自动部署到 Cloudflare Pages Functions。

### 自定义域名

1. 在 Cloudflare Pages 项目设置中点击 **Custom domains**
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. 更新 OAuth App 的回调地址为新域名

<hr />

## 本地开发

### 环境要求

- Node.js 16.14.0+
- npm 8.3.1+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173/

### 构建生产版本

```bash
npm run build
```

构建输出在 `dist` 目录。

### 部署脚本

项目提供了自动部署脚本 `deploy.sh`，可以一键构建并推送到 GitHub 仓库：

```bash
# 构建并推送（使用默认提交信息）
./deploy.sh

# 使用自定义提交信息
./deploy.sh "feat: add new feature"

# 仅构建，不推送
./deploy.sh -b

# 仅推送，不构建
./deploy.sh -p

# 查看帮助
./deploy.sh -h
```

或者使用 npm 脚本：

```bash
npm run deploy
```

脚本会自动：
1. 检查 git 和 npm 是否可用
2. 配置远程仓库为 https://github.com/Syntheticlight/GitPen
3. 执行 `npm run build` 构建项目
4. 提交所有更改并推送到远程仓库

### 运行测试

```bash
# 运行 Cloudflare Functions 测试
npm run test:functions
```

<hr />

## 贡献指南

欢迎贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建你的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交你的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

<hr />

## 项目来源

GitPen 基于 [StackEdit](https://github.com/benweet/stackedit) 重构，主要变更：

- 移除 Python 后端，改用 Cloudflare Functions
- 精简第三方登录，只保留 GitHub 和 Gitee
- 移除 PDF/Pandoc 导出功能
- 移除 ChatGPT 功能
- 项目重命名为 GitPen

## 许可证

[Apache License 2.0](LICENSE)
