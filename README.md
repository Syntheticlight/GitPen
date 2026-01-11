<h1 align="center" style="text-align:center;">
<img src="chrome-app/icon-512.png" width="128" />
<br />
GitPen
</h1>
<p align="center">
	<strong>Free, Open Source, Serverless Markdown Editor</strong><br>
  Supports GitHub and Gitee sync, deployable to Cloudflare Pages
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

## Features

- 📝 Support for Gitee and GitHub repository storage
- 🖼️ Multiple image hosting options (GitHub, Gitee, SM.MS) with paste or drag-and-drop upload
- 🎨 Customizable editor themes
- 📜 Version history management
- 📐 Support for KaTeX math expressions, Mermaid UML diagrams, music notation, and more
- ☁️ Serverless architecture, free deployment to Cloudflare Pages

<hr />

## Cloudflare Pages Deployment

### Prerequisites

1. A [Cloudflare](https://cloudflare.com) account
2. A GitHub OAuth App (for GitHub login)
3. A Gitee OAuth App (optional, for Gitee login)

### Creating OAuth Applications

#### GitHub OAuth App

1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: GitPen
   - **Homepage URL**: Your Cloudflare Pages domain (e.g., `https://gitpen.pages.dev`)
   - **Authorization callback URL**: `https://your-domain/oauth2/callback.html`
4. After creation, note down the `Client ID` and `Client Secret`

#### Gitee OAuth App (Optional)

1. Visit [Gitee Third-party Applications](https://gitee.com/oauth/applications)
2. Click "Create Application"
3. Fill in the application details:
   - **Application Name**: GitPen
   - **Homepage**: Your Cloudflare Pages domain
   - **Callback URL**: `https://your-domain/oauth2/callback.html`
4. After creation, note down the `Client ID` and `Client Secret`

### Deployment Steps

1. Fork this repository to your GitHub account
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Go to **Workers & Pages** > **Create application** > **Pages**
4. Select **Connect to Git**, authorize and select your forked repository
5. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### Configuring Environment Variables

After deployment, configure environment variables in Cloudflare Pages:

1. Go to Cloudflare Dashboard > Workers & Pages > Your project
2. Click **Settings** > **Environment variables**
3. Add the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Client Secret |
| `GITEE_CLIENT_ID` | No | Gitee OAuth App Client ID |
| `GITEE_CLIENT_SECRET` | No | Gitee OAuth App Client Secret |

4. Click **Save** to save the configuration
5. Redeploy the project for environment variables to take effect

### Functions Directory Structure

The project uses Cloudflare Functions for OAuth token exchange:

```
functions/
├── oauth2/
│   ├── githubToken.js    # GitHub OAuth token exchange
│   └── giteeToken.js     # Gitee OAuth token exchange
└── conf.js               # Public configuration endpoint
```

These functions are automatically deployed to Cloudflare Pages Functions.

### Custom Domain

1. In Cloudflare Pages project settings, click **Custom domains**
2. Add your custom domain
3. Configure DNS records as prompted
4. Update OAuth App callback URLs to the new domain

<hr />

## Local Development

### Requirements

- Node.js 16.14.0+
- npm 8.3.1+

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173/

### Build for Production

```bash
npm run build
```

Build output is in the `dist` directory.

### Deployment Script

The project provides an automated deployment script `deploy.sh` for one-click build and push to GitHub:

```bash
# Build and push (with default commit message)
./deploy.sh

# Use custom commit message
./deploy.sh "feat: add new feature"

# Build only, no push
./deploy.sh -b

# Push only, no build
./deploy.sh -p

# Show help
./deploy.sh -h
```

Or use npm script:

```bash
npm run deploy
```

The script will automatically:
1. Check if git and npm are available
2. Configure remote repository to https://github.com/Syntheticlight/GitPen
3. Run `npm run build` to build the project
4. Commit all changes and push to remote repository

### Running Tests

```bash
# Run Cloudflare Functions tests
npm run test:functions
```

<hr />

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<hr />

## Project Origin

GitPen is based on [StackEdit](https://github.com/benweet/stackedit), with major changes:

- Removed Python backend, replaced with Cloudflare Functions
- Simplified third-party login to only GitHub and Gitee
- Removed PDF/Pandoc export functionality
- Removed ChatGPT functionality
- Renamed project to GitPen

## License

[Apache License 2.0](LICENSE)
