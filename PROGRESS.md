# 進捗（DADS 準拠の作り直し）

ブランチ: `feat/dads-redesign`。中断した場合はこのファイルを読んで再開する。

## フェーズ

| フェーズ | 状態 | メモ |
| --- | --- | --- |
| 1. 調査 | 完了 | `docs/dads-research.md`、`docs/current-state.md`、`docs/decisions.md`（docs/*.md は .gitignore 対象） |
| 2. デザイントークン | 完了 | `src/tokens/`（primitives / theme / typography）、`contrast.test.ts`、`scripts/check-design-tokens.mjs`（lint に組み込み） |
| 3. コンポーネント実装 | 完了 | 下表。すべて単体テスト・axe 検査あり。デモページは利用者の指示で廃止し、ページ例で代替（D-16） |
| 4. ページ例 | 完了 | ダッシュボード / 一覧 / 詳細 / 作成・編集 / 設定 / ログイン / 404・500 |
| 5. リファクタ | 完了 | 旧部品・旧ページ・デモページを削除。構成は D-14。直書き検査は lint で 0 件 |
| 6. テスト | 完了 | 単体 521 件（axe・コントラスト含む）、E2E 45 件（desktop / mobile） |
| 7. ドキュメント | 完了 | README / README.en / CHANGELOG。docs/*.md は利用者の指示で Git 管理外 |

## コンポーネント一覧

分類: 改修 = 既存を改修、新規 = 新規作成、不要 = 作らない（理由付き）。状態: 未着手 / 実装中 / 完了。

### アプリケーションシェル・レイアウト

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| サイドバーレイアウト（折りたたみ、モバイルドロワー） | 改修 | AppLayout / Sidebar / MobileNav | layouts/AppShell.tsx | 完了 |
| 上部ナビゲーション型レイアウト | 新規 | - | layouts/TopNavLayout.tsx | 完了 |
| ページヘッダー（タイトル、パンくず、アクション） | 改修 | PageHeader | ui/PageHeader.tsx | 完了 |
| セクション見出し | 新規 | - | ui/Heading.tsx（DADS 見出し） | 完了 |
| カード | 改修 | Card | ui/Card.tsx | 完了 |
| パネル | 新規 | - | ui/Panel.tsx | 完了 |
| 区切り線 | 新規 | - | ui/Divider.tsx | 完了 |
| コンテナ | 新規 | - | ui/Container.tsx | 完了 |

### ナビゲーション

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| サイドナビ（階層、現在地） | 改修 | NavMenu | ui/SideNav.tsx | 完了 |
| ヘッダーナビ | 新規 | - | ui/HeaderNav.tsx（DADS 水平メニュー） | 完了 |
| パンくずリスト | 改修 | PageHeader 内 | ui/Breadcrumb.tsx | 完了 |
| タブ | 新規 | - | ui/Tabs.tsx | 完了 |
| ページネーション | 新規 | - | ui/Pagination.tsx（DADS ページナビゲーション） | 完了 |
| ステップ表示 | 新規 | - | ui/StepNavigation.tsx | 完了 |
| コマンドパレット | 新規 | - | ui/CommandPalette.tsx | 完了 |

### フォーム

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| ラベル・補足・必須・エラーの統一 | 新規 | RequiredMark | ui/FormField.tsx（DADS form-control-label） | 完了 |
| テキスト入力 | 改修 | Input | ui/Input.tsx | 完了 |
| テキストエリア | 改修 | Textarea | ui/Textarea.tsx | 完了 |
| セレクト | 改修 | Select | ui/Select.tsx | 完了 |
| コンボボックス | 新規 | - | ui/Combobox.tsx | 完了 |
| チェックボックス | 改修 | Checkbox（button 実装） | ui/Checkbox.tsx（native input） | 完了 |
| ラジオボタン | 新規 | - | ui/Radio.tsx | 完了 |
| トグル | 新規 | - | ui/Switch.tsx | 完了 |
| 日付選択 | 新規 | - | ui/DatePicker.tsx | 完了 |
| ファイルアップロード | 新規 | - | ui/FileUpload.tsx | 完了 |
| 検索ボックス | 改修 | DocumentToolbar 内 | ui/SearchBox.tsx | 完了 |
| フォームレイアウト（1 / 2 カラム、設定画面型） | 新規 | SettingsPage の Section | ui/FormLayout.tsx | 完了 |
| アクションパネル | 新規 | - | ui/ActionPanel.tsx | 完了 |

### データ表示

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| テーブル（並べ替え、行選択、一括操作、ページネーション、空、読み込み中、横スクロール、固定ヘッダー、数値右寄せ） | 改修 | DocumentTable | ui/DataTable.tsx + ui/Table.tsx | 完了 |
| 説明リスト | 新規 | - | ui/DescriptionList.tsx | 完了 |
| 統計カード（KPI、前期比、単位、注記） | 改修 | StatCard | ui/StatCard.tsx | 完了 |
| 縦積みリスト | 新規 | DocumentMobileList | ui/StackedList.tsx | 完了 |
| グリッドリスト | 新規 | - | ui/GridList.tsx | 完了 |
| アクティビティフィード | 新規 | DashboardPage 内 | ui/ActivityFeed.tsx | 完了 |
| タイムライン | 新規 | - | ui/Timeline.tsx | 完了 |
| バッジ・ラベル | 改修 | StatusBadge | ui/ChipLabel.tsx | 完了 |
| アバター | 改修 | UserMenu 内 | ui/Avatar.tsx | 完了 |
| タグ | 新規 | - | ui/ChipTag.tsx | 完了 |

### グラフ

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| 折れ線 | 新規 | - | charts/LineChart.tsx | 完了 |
| 棒（縦・横・積み上げ） | 改修 | DashboardPage の div 棒 | charts/BarChart.tsx | 完了 |
| 面 | 新規 | - | charts/AreaChart.tsx | 完了 |
| 散布図 | 不要 | - | ガイドブックが提供・推奨するグラフに含まれない（docs/decisions.md D-04） | - |
| ドーナツ | 新規 | - | charts/DonutChart.tsx（総量が明らかな構成比のみ） | 完了 |
| 凡例・軸・単位・出典・注記・ツールチップ・データテーブル切替・代替テキスト | 新規 | - | charts/ChartFrame.tsx | 完了 |
| データ可視化パレット | 新規 | - | tokens/theme.css（`--color-chart-*`） | 完了 |

### フィードバック・オーバーレイ

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| アラート（情報・成功・警告・エラー） | 新規 | - | ui/NotificationBanner.tsx | 完了 |
| トースト通知 | 改修 | Toast | ui/Toast.tsx | 完了 |
| モーダルダイアログ | 改修 | Modal | ui/ModalDialog.tsx | 完了 |
| 確認ダイアログ | 改修 | ConfirmDialog | ui/ConfirmDialog.tsx | 完了 |
| ドロワー | 改修 | SideDrawer | ui/Drawer.tsx | 完了 |
| ドロップダウンメニュー | 改修 | OverflowMenu / UserMenu | ui/DropdownMenu.tsx（DADS メニューリストボックス） | 完了 |
| ポップオーバー | 新規 | - | ui/Popover.tsx | 完了 |
| ツールチップ | 新規 | - | ui/Tooltip.tsx | 完了 |
| 空状態 | 改修 | EmptyState | ui/EmptyState.tsx | 完了 |
| 読み込み中（スケルトン、スピナー） | 新規 | - | ui/Skeleton.tsx / ui/Spinner.tsx | 完了 |
| エラー画面（404、500） | 改修 | NotFoundContent | ui/ErrorPage.tsx | 完了 |

### 要素

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| ボタン（種類・サイズ・アイコン付き・読み込み中・無効） | 改修 | Button | ui/Button.tsx | 完了 |
| アイコンボタン | 改修 | IconButton | ui/IconButton.tsx | 完了 |
| ボタングループ | 新規 | - | ui/ButtonGroup.tsx | 完了 |
| リンク | 新規 | - | ui/Link.tsx | 完了 |
| アイコン | 新規 | - | ui/Icon.tsx | 完了 |

## 残作業

- なし（PR 作成済み）。

## 既知の問題・制約

- `docs/*.md`（調査メモ・現状調査・判断記録・トークン一覧・グラフの選び方）は利用者の指示で Git 管理外にしている。リポジトリには README と CHANGELOG のみ含まれる。
- コンポーネントのデモページは利用者の指示で廃止した（完了条件 3 の「デモ」はページ例で代替）。
- ページ例のデータは画面ごとの状態として持つため、一覧での削除や詳細での承認は画面を移ると元に戻る。
- 横並びの StepNavigation は 1 ステップ 160px が必要なため、モバイルでは縦並びを指定して使う（作成フォームはそうしている）。
- `AppShell` / `TopNavLayout` の `embedded` プロパティはデモ用に作られたもので、現在アプリでは使っていない。
- DADS のいくつかの文字色（error-1, warning-yellow-2, orange-800, gray-536）は、地（gray-50）の上では 4.5:1 を満たさないため、1 段濃い色に置き換えた（theme.css のコメント参照）。
