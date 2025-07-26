# カクヨム誤字報告機能

この拡張機能は、小説投稿サイト「カクヨム」に「小説家になろう」のような誤字・脱字報告機能を追加するブラウザ拡張機能です。

## 概要

### 機能
- 読者がエピソード閲覧時に誤字・脱字を発見した際の報告機能
- 作者が受け取った誤字報告を確認・解決する機能
- Cloudflare Workers を使用したバックエンドによるデータ管理

### 技術スタック
- **フロントエンド**: TypeScript + Chrome Extension API
- **バックエンド**: Cloudflare Workers + Hono Framework + D1 Database

## プロジェクト構成

```
kakuyomu-gozishusei/
├── client/                     # ブラウザ拡張機能
│   ├── src/
│   │   ├── reader.ts          # 読者用スクリプト（エピソード閲覧ページ）
│   │   ├── writer_home.ts     # 作者用スクリプト（作品管理ページ）
│   │   └── writer_episode.ts  # 作者用スクリプト（エピソード編集ページ）
│   ├── public/
│   │   ├── manifest.json      # 拡張機能の設定ファイル
│   │   └── *.js              # コンパイル済みJavaScript
│   └── package.json
├── server/                     # Cloudflare Workers API
│   ├── src/
│   │   └── index.ts          # API エンドポイント
│   ├── wrangler.jsonc        # Cloudflare Workers 設定
│   └── package.json
└── readme.md
```

## ソースコード詳細

### 1. クライアント側（ブラウザ拡張機能）

#### `client/src/reader.ts`
読者がエピソードを閲覧する際に動作するスクリプトです。

**主な機能:**
- エピソードページに「誤字報告」ボタンを追加
- 本文を編集可能にして、直接修正提案を行う機能
- 変更された段落のみを抽出してサーバーに送信
- 追加コメント機能

**主要な関数:**
- `getMetadata()`: ページメタデータの取得
- `displayForm()`: 誤字報告フォームの表示
- `submitErrorReport()`: 誤字報告の送信

**動作の流れ:**
1. エピソードページに「誤字報告」ボタンを追加
2. ボタンクリック時に本文を編集可能な状態に変更
3. 読者が直接テキストを修正
4. 変更された段落のみを検出してサーバーに送信

#### `client/src/writer_home.ts`
作者の作品管理ページで動作するスクリプトです。

**主な機能:**
- 作品全体の誤字報告一覧を表示
- 報告の確認・解決機能
- モーダルダイアログによる直感的なUI

**主要な関数:**
- `createErrorReportModal()`: 誤字報告一覧モーダルの作成
- `handleResolveError()`: 誤字報告の解決処理

**動作の流れ:**
1. 作品管理ページに「誤字報告確認」ボタンを追加
2. ボタンクリックでモーダルダイアログを表示
3. 作品全体の未解決誤字報告を一覧表示
4. 各報告に対して解決マークを付与可能

#### `client/src/writer_episode.ts`
作者のエピソード編集ページで動作するスクリプトです。

**主な機能:**
- 特定エピソードの誤字報告表示
- 報告内容の詳細確認
- 解決済みマーク機能

**主要な関数:**
- `createEpisodeErrorReportModal()`: エピソード別誤字報告モーダルの作成
- `handleEpisodeResolveError()`: エピソード別誤字報告の解決

**動作の流れ:**
1. エピソード編集ページに「誤字報告確認」ボタンを追加
2. そのエピソードに関する誤字報告のみを表示
3. 元の文章と修正提案を並べて表示
4. 解決処理の実行

### 2. サーバー側（Cloudflare Workers）

#### `server/src/index.ts`
Hono フレームワークを使用したAPIサーバーです。

**エンドポイント:**

| メソッド | パス | 機能 |
|---------|------|------|
| GET | `/works/{workId}/errors` | 作品全体の誤字報告取得 |
| GET | `/works/{workId}/episodes/{episodeId}/errors` | 特定エピソードの誤字報告取得 |
| POST | `/works/{workId}/episodes/{episodeId}/errors` | 新しい誤字報告の投稿 |
| PATCH | `/works/{workId}/episodes/{episodeId}/errors/{errorId}/edit` | 誤字報告の解決マーク |
| GET | `/works/{workId}/episodes/{episodeId}/errors/{errorId}` | 特定誤字報告の詳細取得 |

**主要な機能:**
- CORS設定（カクヨムからのリクエストを許可）
- D1データベースとの連携
- エラーハンドリング
- ユニークなエラーIDの生成

**データ型定義:**
```typescript
interface ChangedParagraph {
    id: string;        // 段落ID
    original: string;  // 元の文章
    modified: string;  // 修正後の文章
}

interface ErrorReport {
    id: number;           // データベースID
    error_id: string;     // ユニークなエラーID
    work_id: string;      // 作品ID
    episode_id: string;   # エピソードID
    error: string;        // JSON形式の修正提案
    comment: string;      // 追加コメント
    edited: number;       // 解決済みフラグ
}
```

### 3. 設定ファイル

#### `client/public/manifest.json`
Chrome拡張機能の設定ファイルです。

**重要な設定:**
- `manifest_version: 3`: 最新のManifest V3を使用
- `content_scripts`: 各ページに対応するスクリプトの注入設定
- `permissions`: ストレージ権限の設定

**マッチパターン:**
- `*://kakuyomu.jp/works/*/episodes/*`: 読者用（エピソード閲覧）
- `*://kakuyomu.jp/my/works/*`: 作者用（作品管理）
- `*://kakuyomu.jp/my/works/*/episodes/*`: 作者用（エピソード編集）

## データフロー

### 1. 誤字報告の投稿
```
読者 → reader.ts → Cloudflare Workers API → D1 Database
```

1. 読者がエピソードページで「誤字報告」ボタンをクリック
2. `reader.ts`が本文を編集可能にして表示
3. 読者が修正を行い送信ボタンをクリック
4. 変更された段落のみを抽出
5. APIエンドポイント（POST）に送信
6. サーバーがD1データベースに保存

### 2. 誤字報告の確認
```
作者 → writer_*.ts → Cloudflare Workers API → D1 Database → 表示
```

1. 作者が管理ページで「誤字報告確認」ボタンをクリック
2. `writer_*.ts`がAPIエンドポイント（GET）にリクエスト
3. サーバーがD1データベースから該当データを取得
4. モーダルダイアログで報告一覧を表示

### 3. 誤字報告の解決
```
作者 → writer_*.ts → Cloudflare Workers API → D1 Database (edited=1)
```

1. 作者が解決ボタンをクリック
2. APIエンドポイント（PATCH）にリクエスト
3. サーバーがデータベースのeditedフラグを1に更新

## セキュリティ対策

- **CORS設定**: カクヨムドメインからのリクエストのみ許可
- **入力検証**: サーバー側でリクエストデータの検証
- **SQLインジェクション対策**: プリペアドステートメントの使用
- **XSS対策**: HTMLエスケープ処理

## インストール・開発手順

### 拡張機能のインストール

1. リポジトリをクローン:
```bash
git clone https://github.com/tanahiro2010/kakuyomu-errorword-alert.git
cd kakuyomu-gozishusei
```

2. クライアント側のビルド:
```bash
cd client
npm install
npm run build
```

3. Chrome拡張機能としてインストール:
   - Chrome の拡張機能ページ（`chrome://extensions/`）を開く
   - 「デベロッパーモード」を有効にする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `client/public` フォルダを選択

### サーバー側の開発・デプロイ

```bash
cd server
npm install

# 開発環境での実行
npm run dev

# 本番環境へのデプロイ
npm run deploy
```

## 使用ライブラリ・フレームワーク

### クライアント側
- `typescript` (^5.8.3): TypeScriptコンパイラ
- `@types/chrome` (^0.1.1): Chrome Extension APIの型定義
- `wxt` (^0.20.7): Chrome拡張機能開発フレームワーク

### サーバー側
- `hono` (^4.8.9): 軽量で高速なWebフレームワーク
- `@cloudflare/workers-types` (^4.20250726.0): Cloudflare Workers の型定義
- `wrangler` (^4.4.0): Cloudflare Workers CLI
- `@types/node` (^24.1.0): Node.js の型定義

## 今後の拡張予定

- [ ] 報告内容の詳細表示機能の改善
- [ ] 報告者への通知機能
- [ ] 管理画面の追加
- [ ] モバイル対応の改善
- [ ] 複数の修正提案への対応
- [ ] 報告の統計機能

## ライセンス

ISC

## 作者

[tanahiro2010](https://tanahiro2010.com)

---

**注意**: この拡張機能はカクヨムの公式機能ではありません。個人的な開発プロジェクトです。