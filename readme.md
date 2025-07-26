# カクヨム誤字報告機能

「小説家になろう」にあるような誤字報告機能をカクヨムに追加するChrome拡張機能です。

## 概要

この拡張機能は、カクヨムの小説閲覧ページに誤字・脱字の報告ボタンを追加し、読者が作者に対して誤字や脱字を簡単に報告できるようにします。

## 機能

- **読者向け機能**: 小説の各エピソードに「誤字報告」ボタンを追加
- **作者向け機能**: 報告された誤字・脱字の管理機能（開発予定）
- **サーバー機能**: 誤字報告データの管理と配信

## プロジェクト構成

```
kakuyomu-gozishusei/
├── client/          # Chrome拡張機能
│   ├── src/
│   │   ├── reader.ts    # 読者向けスクリプト
│   │   └── writer.ts    # 作者向けスクリプト
│   ├── public/
│   │   └── manifest.json
│   └── package.json
├── server/          # Honoバックエンドサーバー
│   ├── src/
│   └── package.json
└── readme.md
```

## インストール方法

### 拡張機能のビルド

1. プロジェクトをクローン:
```bash
git clone https://github.com/tanahiro2010/kakuyomu-errorword-alert.git
cd kakuyomu-gozishusei
```

2. クライアント（拡張機能）のビルド:
```bash
cd client
npm install
npm run build
```

3. Chrome拡張機能としてインストール:
   - Chromeの「拡張機能」ページ（chrome://extensions/）を開く
   - 「デベロッパーモード」をONにする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `client/dist`フォルダを選択

### サーバーの起動（開発用）

```bash
cd server
npm install
npm run dev
```

## 使用方法

1. カクヨムの小説エピソードページを開く
2. ページ下部に追加された「誤字報告」ボタンをクリック
3. 報告フォームに誤字・脱字の詳細を入力
4. 「報告する」ボタンで送信

## 開発

### 技術スタック

- **フロントエンド**: TypeScript, Chrome Extension API
- **バックエンド**: Hono (Node.js)
- **ビルドツール**: TypeScript Compiler

### 開発環境セットアップ

1. 依存関係のインストール:
```bash
# クライアント
cd client && npm install

# サーバー
cd server && npm install
```

2. 開発サーバー起動:
```bash
# サーバー（ポート3000）
cd server && npm run dev

# クライアントのビルド監視
cd client && npm run build --watch
```

### 対象ページ

- **読者向け**: `*://kakuyomu.jp/works/*/episodes/*`
- **作者向け**: `*://kakuyomu.jp/my/works/*`

## 貢献

プルリクエストや Issues を歓迎します。

## ライセンス

ISC

## 作者

tanahiro2010

---

**注意**: この拡張機能はカクヨムの公式機能ではありません。個人的な開発プロジェクトです。

keywords: #chrome #拡張機能 #typescript