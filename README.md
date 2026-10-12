# life-time-next-js-app

人生の出来事や目標を、0歳から100歳までの時間軸上に表示するアプリケーションです。
サンプルデータはリポジトリ内のCSVから読み込みます。

## 技術スタック

- **Next.js 16.3.8** - React フレームワーク（App Routerを使用）
- **React 19.3.0** - ユーザーインターフェース構築
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **csv-parse** - CSVデータの解析
- **ESLint** - コード品質管理

## 機能

- 年齢を横軸にした人生タイムラインの表示
- CSVのサーバー側読み込みと入力検証
- マーカーへのホバー・フォーカス・タップによるカード表示
- 項目の選択による説明表示
- 登録データの年齢順テーブル表示（列ごとのソート、1ページ10件のページネーション付き）
- 種別・カテゴリ・目標状態・名称/説明キーワードによるテーブル絞り込み
- スマートフォンでの横スクロール
- レスポンシブデザイン対応
- 既存の配色を維持したダークモード切替
- TypeScriptによる型安全性

## 始め方

### 前提条件

- Node.js 26.x以上
- npm、yarn、またはpnpm

### インストール

1. リポジトリをクローン：
    ```bash
    git clone https://github.com/TakuyaFukumura/life-time-next-js-app.git
    ```
    ```bash
    cd life-time-next-js-app
    ```

2. 依存関係をインストール：
    ```bash
    npm install
    ```
   または
    ```bash
    yarn install
    ```
   または
    ```bash
    pnpm install
    ```

### 開発サーバーの起動

```bash
npm run dev
```

または

```bash
yarn dev
```

または

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて
アプリケーションを確認してください。

### ビルドと本番デプロイ

本番用にアプリケーションをビルドする：

```bash
npm run build
```

```bash
npm start
```

または

```bash
yarn build
```

```bash
yarn start
```

または

```bash
pnpm build
```

```bash
pnpm start
```

## プロジェクト構造

```
├── data/
│   └── life-events.csv      # 人生イベント・目標のサンプルデータ
├── src/
│   ├── lib/
│   │   └── life-events.ts   # CSV読み込み・解析・検証
│   └── app/
│       ├── components/      # Reactコンポーネント
│       │   ├── DarkModeProvider.tsx  # ダークモードProvider
│       │   ├── Header.tsx   # ヘッダーコンポーネント
│       │   └── Timeline.tsx # タイムライン表示
│       ├── globals.css      # グローバルスタイル
│       ├── layout.tsx       # アプリケーションレイアウト
│       └── page.tsx         # メインページコンポーネント
├── package.json
└── tsconfig.json
```

## サンプルCSV

`data/life-events.csv` を編集すると表示データを変更できます。ファイルはUTF-8（BOMなし）、カンマ区切りとし、列を次の順に記述してください。

```csv
type,name,age,category,description,status
event,初めての仕事,22,仕事,社会人生活が始まる,
goal,専門分野を学ぶ,30,仕事,学習と実践を続ける,進行中
```

`type`は`event`または`goal`、`age`は0〜100の整数、`category`は`仕事`または`家族`です。目標には`未着手`・`進行中`・`達成`・`中止`のいずれかの状態が必要です。CSVに不正なデータがある場合、項目を表示せずエラーメッセージを表示します。

## 開発

### テスト

このプロジェクトはJestを使用したテストが設定されています。

#### テストの実行

```bash
npm test
```

または

```bash
yarn test
```

または

```bash
pnpm test
```

#### テストの監視モード

```bash
npm run test:watch
```

#### カバレッジレポートの生成

```bash
npm run test:coverage
```

#### テストの内容

CSVの解析・入力検証、タイムラインの表示と操作、ヘッダーおよびダークモード切替をテストします。

### リンティング

```bash
npm run lint
```

または

```bash
yarn lint
```

または

```bash
pnpm lint
```

### 型チェック

TypeScriptの型チェックは、ビルド時またはIDEで自動的に実行されます。

## CI/CD

このプロジェクトはGitHub Actionsを使用した継続的インテグレーション（CI）を設定しています。

### 自動テスト

以下の条件でCIが実行されます：

- `main`ブランチへのプッシュ時
- プルリクエストの作成・更新時

CIでは以下のチェックが行われます：

- ESLintによる静的解析
- TypeScriptの型チェック
- Jestを使用したユニットテストとインテグレーションテスト
- アプリケーションのビルド検証
- Node.js 26.x での動作確認

## 自動依存関係更新（Dependabot）

このプロジェクトでは、依存関係の安全性と最新化のために[Dependabot](https://docs.github.com/ja/code-security/dependabot)
を利用しています。

- GitHub Actionsおよびnpmパッケージの依存関係は**月次（月曜日 09:00 JST）**で自動チェック・更新されます。
- 更新内容は自動でプルリクエストとして作成されます。
- 詳細な設定は `.github/dependabot.yml` を参照してください。

## トラブルシューティング

### ポート競合

デフォルトのポート3000が使用中の場合：

```bash
npm run dev -- --port 3001
```
