# Changelog

## 0.2.0 — デジタル庁デザインシステム（DADS）準拠への作り直し

テンプレート全体を DADS に合わせて作り直しました。旧版の部品と画面はすべて置き換えています。

### 追加

- **デザイントークン**（`src/tokens/`）
  - `@digital-go-jp/design-tokens` 2.0.1 の値を Tailwind CSS v4 の `@theme` に転記しました。
  - セマンティック別名（面・文字・線・プライマリー・リンク・フォーカス・意味色・データ可視化・寸法）を定義しました。
  - DADS のテキストスタイル 56 種を追加しました。
- **検査**
  - `scripts/check-design-tokens.mjs` を `npm run lint` に組み込みました。色コードや任意値クラスの直書きを検出します。
  - トークンの組み合わせごとのコントラスト検査を追加しました（WCAG 2.2 AA）。
- **UI 部品**: 約 55 部品を追加しました（README の一覧を参照）。すべてに単体テストと axe 検査があります。
- **グラフ部品**（Recharts のラッパー）
  - 折れ線・棒・面・ドーナツを追加しました。
  - 凡例、単位、出典、注記、データテーブルへの切り替え、代替テキストに対応しています。
  - 色に加えて、形・線種・模様でも系列を見分けられます。
- **アプリケーションシェル**
  - サイドバー型（折りたたみ、モバイルはドロワー）と上部ナビゲーション型を追加しました。
  - 本文へスキップ、コマンドパレット（Ctrl / Cmd + K）、お知らせ、アカウントメニューを付けました。
- **ページ例**: ダッシュボード、申請一覧、申請詳細、作成・編集フォーム、設定、ログイン、404、500 を追加しました。
- **ダミーデータ**: `src/mocks/` にまとめ、ページから分離しました。
- **E2E テスト**: Playwright で desktop と mobile の 2 幅を検査します（`npm run test:e2e`）。
- **フォント**: Noto Sans JP（`@fontsource-variable/noto-sans-jp`）を追加しました。

### 変更（互換性のない変更）

- **部品の場所と書き方**: 部品は `src/components/*.tsx` から `src/components/ui/*.tsx` に移り、default export から named export に変わりました。
  - Button の variant は `primary` / `secondary` / `tonal` / `text` / `danger` から、DADS の `solid-fill` / `outline` / `text` に変わりました。危険な操作は `tone="error"` で指定します。
  - Checkbox はネイティブの `<input type="checkbox">` になり、Props が変わりました。
  - Input のフローティングラベルは廃止しました。ラベル、要否、サポートテキスト、エラーは `FormField` で付けます。
  - Modal、SideDrawer、OverflowMenu、UserMenu は、ModalDialog、Drawer、DropdownMenu に置き換えました。
- **トークン**
  - `src/index.css` の独自トークン（`canvas` / `ink` / `brand` / `nav-active` / `status-*` など）は廃止しました。`src/tokens/theme.css` のトークンを使ってください。
  - Tailwind の既定パレット（`gray-100` など）、既定の文字サイズ（`text-sm` など）、既定の影と角丸は使えなくなりました。
- **ルーティング**
  - `src/routes.tsx` は `pageByPath` から react-router の `RouteObject[]` に変わりました。
  - `app.config.ts` の `navigation` は、子項目と `end` を持てるようになりました。
- **画面**: ドキュメント画面（`/documents`）は申請一覧（`/applications`）に置き換えました。
- **ダミーデータ**: `src/data/sample.ts` は `src/mocks/` に置き換えました。
- **npm scripts**: `lint` にデザイントークン検査を追加し、`test:e2e`、`test:e2e:install`、`test:watch` を追加しました。

### 削除

- 旧部品（`src/components/*.tsx`）と旧ページ（`src/pages/documents/` など）を削除しました。
- コンポーネントのデモページ（`/components`）は作りましたが、利用者の判断で削除しました。部品の使用例はページ例で示します。
