# Workspace UI Template（DADS 準拠）

日本語 | [English](README.en.md)

[デジタル庁デザインシステム（DADS）](https://design.digital.go.jp/dads/)に準拠した、管理画面向けのフロントエンドテンプレートです。Vite + React + TypeScript + Tailwind CSS v4 で作っています。

画面に表示されるデータ・文章はすべて架空のサンプルです。API やバックエンドは含みません。本テンプレートはデジタル庁の公式なものではなく、DADS の公開仕様をもとに独自に実装したものです。

![ダッシュボード](docs/screenshots/dashboard.png)

| 申請一覧 | 作成フォーム |
| --- | --- |
| ![申請一覧](docs/screenshots/applications.png) | ![作成フォーム](docs/screenshots/form.png) |

## DADS への準拠

- **デザイントークン**: 色・フォント・文字サイズ・行高・角丸・エレベーションは、公式の `@digital-go-jp/design-tokens` 2.0.1 の値を `src/tokens/` に転記しています。Tailwind の既定パレットと既定の文字サイズは無効化しており、トークン以外の色や寸法は書けません。
- **タイポグラフィ**: Noto Sans JP（セルフホスト）。本文 16px 基準、14px は補足に限定し、14px 未満は使いません。テキストスタイル（`text-std-16N-170` など）も使えます。
- **フォーカス表示**: DADS の黒 4px アウトライン + 黄 2px の 2 重構造です。
- **コントラスト**: テキストは 4.5:1 以上、UI 部品とグラフは 3:1 以上です。トークンの組み合わせごとにテストで確認し、実ブラウザでも axe で検査しています。
- **コンポーネント**: DADS にある部品（ボタン、インプットテキスト、テーブル、ノティフィケーションバナー、モーダルダイアログなど）は公式の HTML 実装の寸法と状態色に合わせています。DADS にない部品（トースト、ツールチップ、コマンドパレットなど）は、DADS のトークンと WAI-ARIA Authoring Practices に沿って設計しています。
- **ダッシュボード**: デジタル庁「ダッシュボードデザインの実践ガイドブック」の画面構成に沿っています。左上から右下へ、全体の指標から詳細へと並べ、グラフはガイドブックの推奨に従っています。色だけに頼らず、データテーブルと代替テキストも用意しています。

## 技術構成

| 用途 | 使っているもの |
| --- | --- |
| ビルド | Vite 8、TypeScript 6 |
| UI | React 19、react-router 8、Tailwind CSS v4、lucide-react（アイコン） |
| グラフ | Recharts 3（`src/components/charts/` のラッパー経由でだけ使う） |
| フォント | `@fontsource-variable/noto-sans-jp` |
| テスト | Vitest + Testing Library、axe-core、Playwright + `@axe-core/playwright` |
| Lint | ESLint 9、`scripts/check-design-tokens.mjs`（色コード・任意値クラスの直書きを検出） |

## セットアップ

Node.js 22.22.2 以上（22 系）、24.15.0 以上（24 系）、または 26 以上が必要です。推奨は Node.js 24 で、`.nvmrc` にも指定しています。

```bash
nvm use
npm install
npm run dev               # http://localhost:5173
```

## 画面（ページ例）

| URL | 画面 | 主な部品 |
| --- | --- | --- |
| `/` | ダッシュボード | StatCard、LineChart、BarChart、DonutChart、DataTable、ActivityFeed |
| `/applications` | 一覧（検索・絞り込み・一括操作） | SearchBox、Select、ChipTag、DataTable、Pagination、DropdownMenu、ModalDialog、Drawer |
| `/applications/:id` | 詳細 | PageHeader、Tabs、DescriptionList、StackedList、Timeline、NotificationBanner |
| `/applications/new`、`/applications/:id/edit` | 作成・編集フォーム（入力 → 確認 → 完了） | StepNavigation、FormField、Input、RadioGroup、DatePicker、Combobox、FileUpload、Switch、ActionPanel |
| `/settings` | 設定（設定画面型のフォーム） | Tabs、FormSection、Switch、RadioGroup、Select |
| `/login` | ログイン | Card、Input、Checkbox、NotificationBanner |
| `*`、`/error/500` | 404、500 | ErrorPage |

ログイン・404・500 はナビゲーションに出ないため、設定画面の末尾に各画面へのリンクを置いています。不要になったら削除してください。画面のレイアウトは、設定画面の「表示」で「サイドバー型」と「上部ナビゲーション型」を切り替えられます。

## コンポーネント

部品はすべて `src/components/` にあります。それぞれの使い方は、各ファイル冒頭のコメントと Props の型、同じ場所にある `*.test.tsx` を見てください。実際の組み合わせ方は上記のページ例が参考になります。

| 分類 | コンポーネント（`src/components/ui/`） |
| --- | --- |
| 要素 | Button / ButtonLink / ButtonAnchor、IconButton、ButtonGroup、Link / Anchor、Icon、Spinner |
| レイアウト | Container、Card（CardHeader / CardBody / CardFooter）、Panel、Divider、Heading、PageHeader |
| アプリケーションシェル（`src/layouts/`） | AppShell（サイドバー型、折りたたみ、モバイルはドロワー）、TopNavLayout（上部ナビゲーション型） |
| ナビゲーション | SideNav、HeaderNav、Breadcrumb、Tabs、Pagination、StepNavigation、CommandPalette |
| フォーム | FormField（ラベル・要否・サポートテキスト・エラー）、Input、Textarea、Select、Combobox、Checkbox、Radio / RadioGroup、Switch、DatePicker、FileUpload、SearchBox、FormLayout / FormSection、ActionPanel |
| データ表示 | Table、DataTable（並べ替え・行選択・一括操作・ページ送り・空状態・読み込み中・横スクロール・固定ヘッダー・数値の右寄せ）、DescriptionList、StatCard、StackedList、GridList、ActivityFeed、Timeline、ChipLabel / StatusChip、ChipTag、Avatar / AvatarGroup |
| グラフ（`src/components/charts/`） | LineChart、BarChart（縦・横・積み上げ）、AreaChart（積み上げ・100%）、DonutChart、ChartFrame（凡例・単位・出典・注記・データテーブル切替） |
| フィードバック | NotificationBanner、Toast（useToast）、ModalDialog、ConfirmDialog（useConfirm）、Drawer、DropdownMenu、Popover、Tooltip、EmptyState、Skeleton、ErrorPage |

散布図は、ダッシュボードガイドブックが推奨するグラフに含まれないため用意していません。

## テスト

```bash
npm run typecheck         # 型チェック
npm run lint              # ESLint + デザイントークン検査（色コード・任意値クラスの直書きを検出）
npm run test              # 単体テスト（全部品・全ページ、axe、トークンのコントラスト）
npm run test:e2e:install  # 初回のみ: Playwright の Chromium を入れる
npm run test:e2e          # E2E（desktop / mobile の 2 幅。表示・操作・axe）
npm run build             # 本番ビルド（dist/）
npm run check             # typecheck + lint + test
```

## ディレクトリ構成

```
src/
├── app.config.ts          # アプリ名・ロゴ・ナビゲーション・日付表示の既定値
├── routes.tsx             # 画面のルーティング
├── App.tsx / main.tsx     # Provider とルーター
├── index.css              # Tailwind・フォント・トークンの読み込み、基本スタイル
├── tokens/                # デザイントークン（primitives / theme / typography）とコントラスト検査
├── components/
│   ├── ui/                # UI 部品（1 部品 = 1 ファイル + テスト）
│   └── charts/            # Recharts のラッパー
├── layouts/               # AppShell / TopNavLayout / ヘッダーの操作
├── pages/                 # ページ例（dashboard / applications / settings / auth / errors）
├── mocks/                 # 架空のダミーデータ（ページから分離）
├── context/               # 日付表示・レイアウトの設定（localStorage に保存）
├── hooks/ lib/ test/
e2e/                       # Playwright の E2E テスト
scripts/check-design-tokens.mjs
```

## 自分のアプリにする

1. **アプリ名・ロゴ**: `src/app.config.ts` の `name`・`description`・`logo` を書き換えます。ファビコンは `public/favicon.svg` です。
2. **ページを足す**: `src/pages/` に画面を作り、`src/routes.tsx` にルートを足します。ナビゲーションに出す場合は `src/app.config.ts` の `navigation` にも足します。
3. **データ**: `src/mocks/` を API 呼び出しに置き換えます。
4. **色を変える**: `src/tokens/theme.css` のセマンティックトークンを変えます（例: `--color-primary`）。変えたら `npm run test` でコントラスト検査が通ることを確認してください。新しい色が必要なときは、トークンを追加してから使います。
5. **サンプル画面を消す**: `src/pages/applications/` と `src/mocks/` を消し、`src/routes.tsx` と `navigation` から外します。

## デプロイ

`npm run build` で `dist/` に静的ファイルを出力します。`BrowserRouter` を使っているため、ホスティング側で SPA fallback（存在しないパスにも `index.html` を返す設定）が必要です。

## 設計資料

| 文書 | 内容 |
| --- | --- |
| [docs/decisions.md](docs/decisions.md) | 判断記録。DADS の資料に記載がない点や、DADS と変えた点の理由 |
| [docs/tokens.md](docs/tokens.md) | デザイントークンの一覧（色・文字・寸法） |
| [docs/chart-guide.md](docs/chart-guide.md) | グラフの選び方（ダッシュボードデザインの実践ガイドブックの要約） |

## 参考資料

- [デジタル庁デザインシステム](https://www.digital.go.jp/policies/servicedesign/designsystem)（[β版サイト](https://design.digital.go.jp/dads/)）
- [ダッシュボードデザインの実践ガイドブック](https://www.digital.go.jp/resources/dashboard-guidebook)
- [@digital-go-jp/design-tokens](https://github.com/digital-go-jp/design-tokens)（MIT License）

## ライセンス

[MIT License](LICENSE)。`src/tokens/primitives.css` と `src/tokens/typography.css` の値は、デジタル庁の `@digital-go-jp/design-tokens` と `@digital-go-jp/tailwind-theme-plugin`（いずれも MIT License）に由来します。
