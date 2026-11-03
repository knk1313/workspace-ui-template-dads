# 進捗（DADS 準拠の作り直し）

ブランチ: `feat/dads-redesign`。中断した場合はこのファイルを読んで再開する。

## フェーズ

| フェーズ | 状態 | メモ |
| --- | --- | --- |
| 1. 調査 | 完了 | `docs/dads-research.md`、`docs/current-state.md`、`docs/decisions.md`（docs/*.md は .gitignore 対象） |
| 2. デザイントークン | 未着手 | `src/tokens/`、コントラスト検査、ハードコード検査スクリプト |
| 3. コンポーネント実装 | 未着手 | 下表 |
| 4. ページ例 | 未着手 | |
| 5. リファクタ | 未着手 | |
| 6. テスト | 未着手 | 単体 / axe / E2E |
| 7. ドキュメント | 未着手 | README / docs / CHANGELOG |

## コンポーネント一覧

分類: 改修 = 既存を改修、新規 = 新規作成、不要 = 作らない（理由付き）。状態: 未着手 / 実装中 / 完了。

### アプリケーションシェル・レイアウト

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| サイドバーレイアウト（折りたたみ、モバイルドロワー） | 改修 | AppLayout / Sidebar / MobileNav | layouts/AppShell.tsx | 未着手 |
| 上部ナビゲーション型レイアウト | 新規 | - | layouts/TopNavLayout.tsx | 未着手 |
| ページヘッダー（タイトル、パンくず、アクション） | 改修 | PageHeader | ui/PageHeader.tsx | 未着手 |
| セクション見出し | 新規 | - | ui/Heading.tsx（DADS 見出し） | 未着手 |
| カード | 改修 | Card | ui/Card.tsx | 未着手 |
| パネル | 新規 | - | ui/Panel.tsx | 未着手 |
| 区切り線 | 新規 | - | ui/Divider.tsx | 未着手 |
| コンテナ | 新規 | - | ui/Container.tsx | 未着手 |

### ナビゲーション

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| サイドナビ（階層、現在地） | 改修 | NavMenu | ui/SideNav.tsx | 未着手 |
| ヘッダーナビ | 新規 | - | ui/HeaderNav.tsx（DADS 水平メニュー） | 未着手 |
| パンくずリスト | 改修 | PageHeader 内 | ui/Breadcrumb.tsx | 未着手 |
| タブ | 新規 | - | ui/Tabs.tsx | 未着手 |
| ページネーション | 新規 | - | ui/Pagination.tsx（DADS ページナビゲーション） | 未着手 |
| ステップ表示 | 新規 | - | ui/StepNavigation.tsx | 未着手 |
| コマンドパレット | 新規 | - | ui/CommandPalette.tsx | 未着手 |

### フォーム

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| ラベル・補足・必須・エラーの統一 | 新規 | RequiredMark | ui/FormField.tsx（DADS form-control-label） | 未着手 |
| テキスト入力 | 改修 | Input | ui/Input.tsx | 未着手 |
| テキストエリア | 改修 | Textarea | ui/Textarea.tsx | 未着手 |
| セレクト | 改修 | Select | ui/Select.tsx | 未着手 |
| コンボボックス | 新規 | - | ui/Combobox.tsx | 未着手 |
| チェックボックス | 改修 | Checkbox（button 実装） | ui/Checkbox.tsx（native input） | 未着手 |
| ラジオボタン | 新規 | - | ui/Radio.tsx | 未着手 |
| トグル | 新規 | - | ui/Switch.tsx | 未着手 |
| 日付選択 | 新規 | - | ui/DatePicker.tsx | 未着手 |
| ファイルアップロード | 新規 | - | ui/FileUpload.tsx | 未着手 |
| 検索ボックス | 改修 | DocumentToolbar 内 | ui/SearchBox.tsx | 未着手 |
| フォームレイアウト（1 / 2 カラム、設定画面型） | 新規 | SettingsPage の Section | ui/FormLayout.tsx | 未着手 |
| アクションパネル | 新規 | - | ui/ActionPanel.tsx | 未着手 |

### データ表示

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| テーブル（並べ替え、行選択、一括操作、ページネーション、空、読み込み中、横スクロール、固定ヘッダー、数値右寄せ） | 改修 | DocumentTable | ui/DataTable.tsx + ui/Table.tsx | 未着手 |
| 説明リスト | 新規 | - | ui/DescriptionList.tsx | 未着手 |
| 統計カード（KPI、前期比、単位、注記） | 改修 | StatCard | ui/StatCard.tsx | 未着手 |
| 縦積みリスト | 新規 | DocumentMobileList | ui/StackedList.tsx | 未着手 |
| グリッドリスト | 新規 | - | ui/GridList.tsx | 未着手 |
| アクティビティフィード | 新規 | DashboardPage 内 | ui/ActivityFeed.tsx | 未着手 |
| タイムライン | 新規 | - | ui/Timeline.tsx | 未着手 |
| バッジ・ラベル | 改修 | StatusBadge | ui/ChipLabel.tsx | 未着手 |
| アバター | 改修 | UserMenu 内 | ui/Avatar.tsx | 未着手 |
| タグ | 新規 | - | ui/ChipTag.tsx | 未着手 |

### グラフ

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| 折れ線 | 新規 | - | charts/LineChart.tsx | 未着手 |
| 棒（縦・横・積み上げ） | 改修 | DashboardPage の div 棒 | charts/BarChart.tsx | 未着手 |
| 面 | 新規 | - | charts/AreaChart.tsx | 未着手 |
| 散布図 | 不要 | - | ガイドブックが提供・推奨するグラフに含まれない（docs/decisions.md D-04） | - |
| ドーナツ | 新規 | - | charts/DonutChart.tsx（総量が明らかな構成比のみ） | 未着手 |
| 凡例・軸・単位・出典・注記・ツールチップ・データテーブル切替・代替テキスト | 新規 | - | charts/ChartFrame.tsx | 未着手 |
| データ可視化パレット | 新規 | - | tokens/theme.css（`--color-chart-*`） | 未着手 |

### フィードバック・オーバーレイ

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| アラート（情報・成功・警告・エラー） | 新規 | - | ui/NotificationBanner.tsx | 未着手 |
| トースト通知 | 改修 | Toast | ui/Toast.tsx | 未着手 |
| モーダルダイアログ | 改修 | Modal | ui/ModalDialog.tsx | 未着手 |
| 確認ダイアログ | 改修 | ConfirmDialog | ui/ConfirmDialog.tsx | 未着手 |
| ドロワー | 改修 | SideDrawer | ui/Drawer.tsx | 未着手 |
| ドロップダウンメニュー | 改修 | OverflowMenu / UserMenu | ui/DropdownMenu.tsx（DADS メニューリストボックス） | 未着手 |
| ポップオーバー | 新規 | - | ui/Popover.tsx | 未着手 |
| ツールチップ | 新規 | - | ui/Tooltip.tsx | 未着手 |
| 空状態 | 改修 | EmptyState | ui/EmptyState.tsx | 未着手 |
| 読み込み中（スケルトン、スピナー） | 新規 | - | ui/Skeleton.tsx / ui/Spinner.tsx | 未着手 |
| エラー画面（404、500） | 改修 | NotFoundContent | ui/ErrorPage.tsx | 未着手 |

### 要素

| 項目 | 分類 | 既存 | 新ファイル | 状態 |
| --- | --- | --- | --- | --- |
| ボタン（種類・サイズ・アイコン付き・読み込み中・無効） | 改修 | Button | ui/Button.tsx | 未着手 |
| アイコンボタン | 改修 | IconButton | ui/IconButton.tsx | 未着手 |
| ボタングループ | 新規 | - | ui/ButtonGroup.tsx | 未着手 |
| リンク | 新規 | - | ui/Link.tsx | 未着手 |
| アイコン | 新規 | - | ui/Icon.tsx | 未着手 |

## 残作業

- フェーズ 2 以降すべて。

## 既知の問題

- なし
