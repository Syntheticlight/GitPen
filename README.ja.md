<h1 align="center" style="text-align:center;">
<img src="chrome-app/icon-512.png" width="128" />
<br />
GitPen
</h1>
<p align="center">
	<strong>無料・オープンソース・サーバーレスのMarkdownエディタ</strong><br>
  GitHubとGiteeの同期に対応、Cloudflare Pagesにデプロイ可能
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

## 機能

- 📝 GiteeとGitHubリポジトリへのノート保存に対応
- 🖼️ 複数の画像ホスティング（GitHub、Gitee、SM.MS）に対応、ペーストまたはドラッグ＆ドロップでアップロード
- 🎨 カスタマイズ可能なエディタテーマ
- 📜 バージョン履歴管理
- 📐 KaTeX数式、Mermaid UML図、楽譜などの拡張機能に対応
- ☁️ サーバーレスアーキテクチャ、Cloudflare Pagesへの無料デプロイ

<hr />

## Cloudflare Pagesへのデプロイ

### 前提条件

1. [Cloudflare](https://cloudflare.com)アカウント
2. GitHub OAuth App（GitHubログイン用）
3. Gitee OAuth App（オプション、Giteeログイン用）

### OAuthアプリケーションの作成

#### GitHub OAuth App

1. [GitHub Developer Settings](https://github.com/settings/developers)にアクセス
2. 「New OAuth App」をクリック
3. アプリケーション情報を入力：
   - **Application name**: GitPen
   - **Homepage URL**: Cloudflare Pagesのドメイン（例：`https://gitpen.pages.dev`）
   - **Authorization callback URL**: `https://あなたのドメイン/oauth2/callback.html`
4. 作成後、`Client ID`と`Client Secret`をメモ

#### Gitee OAuth App（オプション）

1. [Giteeサードパーティアプリケーション](https://gitee.com/oauth/applications)にアクセス
2. 「アプリケーションを作成」をクリック
3. アプリケーション情報を入力：
   - **アプリケーション名**: GitPen
   - **ホームページ**: Cloudflare Pagesのドメイン
   - **コールバックURL**: `https://あなたのドメイン/oauth2/callback.html`
4. 作成後、`Client ID`と`Client Secret`をメモ

### デプロイ手順

1. このリポジトリをあなたのGitHubアカウントにフォーク
2. [Cloudflare Dashboard](https://dash.cloudflare.com)にログイン
3. **Workers & Pages** > **Create application** > **Pages**に移動
4. **Connect to Git**を選択し、認証してフォークしたリポジトリを選択
5. ビルド設定を構成：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. **Save and Deploy**をクリック

### 環境変数の設定

デプロイ後、Cloudflare Pagesで環境変数を設定：

1. Cloudflare Dashboard > Workers & Pages > プロジェクトに移動
2. **Settings** > **Environment variables**をクリック
3. 以下の変数を追加：

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `GITHUB_CLIENT_ID` | はい | GitHub OAuth AppのClient ID |
| `GITHUB_CLIENT_SECRET` | はい | GitHub OAuth AppのClient Secret |
| `GITEE_CLIENT_ID` | いいえ | Gitee OAuth AppのClient ID |
| `GITEE_CLIENT_SECRET` | いいえ | Gitee OAuth AppのClient Secret |

4. **Save**をクリックして設定を保存
5. 環境変数を有効にするためにプロジェクトを再デプロイ

### Functionsディレクトリ構造

プロジェクトはOAuthトークン交換にCloudflare Functionsを使用：

```
functions/
├── oauth2/
│   ├── githubToken.js    # GitHub OAuthトークン交換
│   └── giteeToken.js     # Gitee OAuthトークン交換
└── conf.js               # 公開設定エンドポイント
```

これらの関数はCloudflare Pages Functionsに自動的にデプロイされます。

### カスタムドメイン

1. Cloudflare Pagesプロジェクト設定で**Custom domains**をクリック
2. カスタムドメインを追加
3. 指示に従ってDNSレコードを設定
4. OAuth Appのコールバック URLを新しいドメインに更新

<hr />

## ローカル開発

### 要件

- Node.js 16.14.0+
- npm 8.3.1+

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

http://localhost:5173/ にアクセス

### 本番用ビルド

```bash
npm run build
```

ビルド出力は`dist`ディレクトリにあります。

### デプロイスクリプト

プロジェクトには自動デプロイスクリプト`deploy.sh`が用意されており、ワンクリックでビルドとGitHubへのプッシュが可能：

```bash
# ビルドしてプッシュ（デフォルトのコミットメッセージ）
./deploy.sh

# カスタムコミットメッセージを使用
./deploy.sh "feat: add new feature"

# ビルドのみ、プッシュなし
./deploy.sh -b

# プッシュのみ、ビルドなし
./deploy.sh -p

# ヘルプを表示
./deploy.sh -h
```

またはnpmスクリプトを使用：

```bash
npm run deploy
```

スクリプトは自動的に：
1. gitとnpmが利用可能か確認
2. リモートリポジトリをhttps://github.com/Syntheticlight/GitPenに設定
3. `npm run build`を実行してプロジェクトをビルド
4. すべての変更をコミットしてリモートリポジトリにプッシュ

### テストの実行

```bash
# Cloudflare Functionsテストを実行
npm run test:functions
```

<hr />

## コントリビューション

コントリビューションを歓迎します！お気軽にPull Requestを送信してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. Pull Requestを開く

<hr />

## プロジェクトの由来

GitPenは[StackEdit](https://github.com/benweet/stackedit)をベースに、以下の主要な変更を加えています：

- Pythonバックエンドを削除し、Cloudflare Functionsに置き換え
- サードパーティログインをGitHubとGiteeのみに簡素化
- PDF/Pandocエクスポート機能を削除
- ChatGPT機能を削除
- プロジェクト名をGitPenに変更

## ライセンス

[Apache License 2.0](LICENSE)
