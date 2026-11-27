# ローカルデザインシステム

デジタル庁デザインシステム（DADS）は、導入先に合わせて基本デザインを編集し、「ローカルデザインシステム」を作ることを想定している。この文書には、このテンプレートで値を変えられる範囲、変えるときの手順と要件、DADSの既定から刷新した内容を書く。トークンの一覧は[tokens.md](tokens.md)、判断の理由は[decisions.md](decisions.md)のD-35とD-36にある。

## 変えられる範囲と要件

このテンプレートでは、DADSの「基本デザインの編集」の7項目の値を`src/tokens/local.css`に集めている。

| 項目 | `local.css`のトークン | 守る要件 | 検査 |
| --- | --- | --- | --- |
| カラー | `--color-key-50`〜`1200`（キーカラーの13段） | テキストは4.5:1以上、枠線などは3:1以上。意味色の色相（エラーは赤、成功は緑）とフォーカスの色は変えない | `contrast.test.ts`、`local.test.ts` |
| タイポグラフィ | `--font-sans`、`--font-mono`、`--leading-body`、`--body-font-size`、`--body-letter-spacing` | 本文は16px以上、行の高さは1.5以上。14px未満は使わない | `local.test.ts` |
| 余白 | `--spacing`（1段 = 4px）、`--spacing-page-x`、`--spacing-page-x-wide`、`--spacing-page-y` | 値に規則性を持たせる（8pxの倍数）。タップ領域は44px以上 | `local.test.ts` |
| 角の形状 | `--radius-button`、`--radius-input`、`--radius-card`など部品ごとの14種 | `primitives.css`の`--radius-4`〜`32`から選ぶ | `local.test.ts`、`npm run lint` |
| ドロップシャドウとエレベーション | `--shadow-popup`、`--shadow-drawer`、`--shadow-dialog`など役割ごとの5種 | ダイアログはhoverで浮く要素より2段以上高くする。影を付けても3:1の枠線を付ける | `local.test.ts` |
| リンクテキスト | `--color-link`、`--color-link-hover`、`--color-link-active`、`--color-link-visited` | 4.5:1以上。青以外にしてもよいが、下線は外さない | `contrast.test.ts` |
| レイアウト | `--breakpoint-*`、`--container-content`、`--container-wide` | リキッドレイアウトにする。見た目の配置と読み上げの順をそろえる | `local.test.ts`（`breakpoints.ts`との一致） |

### 調整の手順

1. ブランドやコミュニケーションの方針を先に決める。DADSは、方針、スタイル、UIコンポーネントの順に調整することを勧めている
2. `src/tokens/local.css`の値を書き換える
   - キーカラーをDADSのプリセットに替えるときは、`--color-key-*`の`cyan`を`green`などの色相名に置き換える。ブランドカラーにするときは、同じ色相の13段を明るい順に色コードで書く
   - リンクの色を変えるときは、ダークモードの値（`theme-dark.css`の「リンク」）も変える
   - ブレークポイントを変えるときは、`src/tokens/breakpoints.ts`も同じ値にする
3. `npm run check`を実行する。要件を外れた組み合わせは、テストの名前（例：`テキスト on-highlight / 背景 surface-highlight`）で示される。外れた組み合わせは、`theme.css`か`theme-dark.css`でその別名が指す段を変えて直す
4. `npm run test:visual:update`で見た目の基準画像を撮り直し、差分を目で確かめる

`local.css`に置いていない値は、DADSの要件のために固定している。

- フォーカスの色（`--color-focus`、`--color-focus-ring`）は、DADSが変更を禁止している
- タップ領域（`--spacing-target`）は44pxより小さくしない
- 余白の1段（`--spacing`）は、操作部品の高さにも効くため変えない。画面の余白は`--spacing-page-*`で変える
- 部品のコード（`src/components/ui/`）のWAI-ARIAの指定と、強制カラーモードへの対応は外さない

## 刷新した内容

DADSの既定（デジタル庁ウェブサイトベース）から、「信頼感・落ち着き」に寄せて値を変えた（D-36）。余白、影、レイアウト、リンクの色は、DADSの既定のままにしている。

| 項目 | 変更前（DADSの既定） | 変更後 |
| --- | --- | --- |
| キーカラー | blue | cyan（DADSのプリセット） |
| プライマリー（ライト） | `key-900` | `key-1000`。cyanの900は、黄色のフォーカスの塗りの上で4.09:1しかないため |
| 強調面（ダーク） | `blue-700` | `key-900`。白い文字で5.83:1 |
| 情報の色（ダーク） | `blue-300`、`blue-1200` | `key-300`、`key-1200` |
| 本文の行の高さ | 1.7 | 1.5（DADSの要件の下限） |
| 書体 | Noto Sans JP（自前で配信） | OSの標準の書体（D-02） |
| 角丸 | 8px が中心 | 操作する部品は4px、面の部品は6px、バナーは8px |

### 色が変わった部品

キーカラーから作る色（`primary`、`surface-hover`、`surface-selected`、`surface-highlight`、`info`）を使う部品は、青からcyanに変わった。

| 使っている色 | 部品 |
| --- | --- |
| `primary`（塗り、枠線、文字、選択の印） | Button、Checkbox、Radio、Switch、Tabs、SideNav、HeaderNav、Pagination、StepNavigation、Timeline、DatePicker、Combobox、CommandPalette、DataTable、FileUpload、Heading、Avatar、Spinner、ShellHeader（ロゴ） |
| `surface-hover`、`surface-selected`（行のhoverと選択） | Table、DataTable、Card、StackedList |
| `surface-highlight`（強調の面） | StatCard（強調） |
| `info`（情報の色） | NotificationBanner（info）、Toast（info） |

リンク（Link、Breadcrumbなど）の青と紫、グラフの色（ダッシュボードのガイドブックのパレット、D-12）、状態のチップの色は変えていない。

### 角丸が変わった部品

| 部品 | トークン | 変更前 | 変更後 |
| --- | --- | --- | --- |
| ボタン（lg、md）、IconButton、DropdownMenuのボタン、NotificationBannerの閉じるボタン、「本文へスキップ」のリンク | `rounded-button` | 8px | 4px |
| ボタン（sm）、ModalDialog・Drawer・Toastの閉じるボタン、DatePickerのカレンダーのボタン、ヘッダーのメニューのボタン | `rounded-button-sm` | 6px | 4px |
| ボタン（xs） | `rounded-button-xs` | 4px | 4px（変更なし） |
| Input、Select、Textarea、CommandPaletteの入力欄、Comboboxの開閉ボタン、SearchBoxの消去ボタン | `rounded-input` | 8px | 4px |
| Checkbox | `rounded-checkbox` | 4px | 4px（変更なし） |
| Card、Panel、StatCard、GridList、ActivityFeedの説明、DataTableの一括操作の帯、FileUploadのドロップ領域、Skeleton | `rounded-card` | 8px | 6px |
| Comboboxの候補、DropdownMenuのメニュー、DatePickerのカレンダー、Popover | `rounded-popup` | 8px | 6px |
| ModalDialog、CommandPalette、Toast | `rounded-dialog` | 8px | 6px |
| NotificationBanner（standard） | `rounded-banner` | 12px | 8px |
| ChipLabel、FormFieldの「必須」「任意」、DataTableの読み込み中のチップ | `rounded-chip` | 8px | 4px |
| SideNavの項目 | `rounded-nav-item` | 8px | 4px |
| Avatar（四角） | `rounded-avatar` | 8px | 4px |
| Tooltip、グラフのツールチップ | `rounded-tooltip` | 4px | 4px（変更なし） |
| Link、Breadcrumb、HeaderNav、Tabs、StackedList、DataTableの並べ替えのボタンのフォーカス、Skeletonの行 | `rounded-inline` | 4px | 4px（変更なし） |

円の部品（Radio、Switch、Pagination、Timeline、Spinner、Avatar（円）など）は`rounded-full`のまま。

### 行の高さが変わった部品

画面全体の本文の既定値を1.7から1.5にした。次の部品とページは、本文の行の高さを`leading-body`、`text-body`、`text-body-bold`で指定するようにし、1.7から1.5に変わった。

- 部品：ActivityFeed、Breadcrumb、Card、ChartFrame、CommandPalette、DescriptionList、Drawer、EmptyState、ErrorPage、FileUpload、FormField、FormLayout、GridList、Heading（小さい段）、ModalDialog、NotificationBanner、PageHeader、Panel、Popover、SearchBox、StackedList、StepNavigation、Table、Tabs、Textarea、Timeline、Toast
- レイアウトとページ：HeaderActions、ApplicationFormPage、ApplicationFormFields、LoginPage、SettingsPage

見出し（`text-std-{18〜45}B-1x0`）、表の中など密度を優先する文字（`text-dns-*`）、1行のUI（`text-oln-*`）の行の高さは変えていない。

## 参考資料

- [デジタル庁デザインシステムをどう使うか：導入先に合わせた「ローカルデザインシステム」を作る](https://digital-agency-news.digital.go.jp/articles/2026-11-26)（デジタル庁ニュース、2026年11月26日）
- [ローカルデザインシステムの作成](https://design.digital.go.jp/dads/guidance/local-design-system/)（DADS）
- DADSの基本デザイン：[カラー](https://design.digital.go.jp/dads/foundations/color/)、[タイポグラフィ](https://design.digital.go.jp/dads/foundations/typography/)、[余白](https://design.digital.go.jp/dads/foundations/spacing/)、[角の形状](https://design.digital.go.jp/dads/foundations/corner-shapes/)、[ドロップシャドウとエレベーション](https://design.digital.go.jp/dads/foundations/elevation/)、[リンクテキスト](https://design.digital.go.jp/dads/foundations/link-text/)、[レイアウト](https://design.digital.go.jp/dads/foundations/layout/)
