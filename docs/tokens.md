# デザイントークン一覧

定義場所: `src/tokens/`（Tailwind CSS v4 の `@theme`）。コンポーネントやページでは、ここに定義された名前のユーティリティクラスだけを使う。色コード・任意値クラスの直書きは `npm run lint`（`scripts/check-design-tokens.mjs`）で検出される。

| ファイル | 内容 |
| --- | --- |
| `primitives.css` | DADS design-tokens 2.0.1 のプリミティブ（色、文字サイズ、行高、角丸、エレベーション）。Tailwind 既定値はここで無効化 |
| `theme.css` | セマンティック別名（面・文字・線・プライマリー・フォーカス・意味色・無効・データ可視化・寸法）と独自ユーティリティ |
| `local.css` | ローカルデザインシステムの入口。キーカラー、リンクの色、書体、本文の既定値、画面の余白、部品ごとの角丸と影、ブレークポイント、段組みの幅 |
| `breakpoints.ts` | JSから使うブレークポイント（`minWidth("md")`）。`local.css`と同じ値にする |
| `theme-dark.css` | ダークモードのときに、`theme.css` の色のセマンティック別名を上書きする値 |
| `typography.css` | DADS テキストスタイル（`text-std-16N-170` など 56 種） |
| `contrast.test.ts` | トークンの組み合わせごとのコントラスト検査（`npm test`） |
| `local.test.ts` | `local.css`の値がDADSの要件を満たすかの検査（`npm test`） |

## ローカルデザインシステムとして調整する

DADSは、導入先に合わせて基本デザインを編集し、「ローカルデザインシステム」を作ることを想定している（[ローカルデザインシステムの作成](https://design.digital.go.jp/dads/guidance/local-design-system/)）。このテンプレートでは、編集する7項目の値を`src/tokens/local.css`に集めた。今の値は、DADSの既定から「信頼感・落ち着き」に寄せて調整したもの（`docs/decisions.md` D-36）。導入先に合わせて書き換える起点にする。

| 項目 | `local.css`のトークン | 守る要件 | 検査 |
| --- | --- | --- | --- |
| カラー | `--color-key-50`〜`1200`（キーカラーの13段） | テキストは4.5:1以上、枠線などは3:1以上。意味色の色相（エラーは赤、成功は緑）とフォーカスの色は変えない | `contrast.test.ts`、`local.test.ts` |
| タイポグラフィ | `--font-sans`、`--font-mono`、`--leading-body`、`--body-font-size`、`--body-letter-spacing` | 本文は16px以上、行の高さは1.5以上。14px未満は使わない | `local.test.ts` |
| 余白 | `--spacing`（1段 = 4px）、`--spacing-page-x`、`--spacing-page-x-wide`、`--spacing-page-y` | 値に規則性を持たせる（8pxの倍数）。タップ領域は44px以上 | `local.test.ts` |
| 角の形状 | `--radius-button`、`--radius-input`、`--radius-card`など部品ごとの14種 | `primitives.css`の`--radius-4`〜`32`から選ぶ | `local.test.ts`、`npm run lint` |
| ドロップシャドウとエレベーション | `--shadow-popup`、`--shadow-drawer`、`--shadow-dialog`など役割ごとの5種 | ダイアログはhoverで浮く要素より2段以上高くする。影を付けても3:1の枠線を付ける | `local.test.ts` |
| リンクテキスト | `--color-link`、`--color-link-hover`、`--color-link-active`、`--color-link-visited` | 4.5:1以上。青以外にしてもよいが、下線は外さない | `contrast.test.ts` |
| レイアウト | `--breakpoint-*`、`--container-content`、`--container-wide` | リキッドレイアウトにする。見た目の配置と読み上げの順をそろえる | `local.test.ts`（`breakpoints.ts`との一致） |

### 手順

1. ブランドやコミュニケーションの方針を先に決める。DADSは、方針、スタイル、UIコンポーネントの順に調整することを勧めている
2. `src/tokens/local.css`の値を書き換える
   - キーカラーをDADSのプリセットに替えるときは、`--color-key-*`の`blue`を`green`などの色相名に置き換える。ブランドカラーにするときは、同じ色相の13段を明るい順に色コードで書く
   - リンクの色を変えるときは、ダークモードの値（`theme-dark.css`の「リンク」）も変える
   - ブレークポイントを変えるときは、`src/tokens/breakpoints.ts`も同じ値にする
3. `npm run check`を実行する。要件を外れた組み合わせは、テストの名前（例：`テキスト on-highlight / 背景 surface-highlight`）で示される。外れた組み合わせは、`theme.css`か`theme-dark.css`でその別名が指す段を変えて直す
4. `npm run test:visual:update`で見た目の基準画像を撮り直し、差分を目で確かめる

`local.css`に置いていない値は、DADSの要件のために固定している。

- フォーカスの色（`--color-focus`、`--color-focus-ring`）は、DADSが変更を禁止している
- タップ領域（`--spacing-target`）は44pxより小さくしない
- 余白の1段（`--spacing`）は、操作部品の高さにも効くため変えない。画面の余白は`--spacing-page-*`で変える
- 部品のコード（`src/components/ui/`）のWAI-ARIAの指定と、強制カラーモードへの対応は外さない

## 色（プリミティブ）

`bg-blue-900` のように `{bg|text|border|…}-{色相}-{階調}` で使う。

| 色相 | 階調 |
| --- | --- |
| `blue` `light-blue` `cyan` `green` `lime` `yellow` `orange` `red` `magenta` `purple` | 50 / 100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000 / 1100 / 1200 |
| `key`（キーカラー。`local.css`で色相を選ぶ。今は cyan） | 同上 |
| `solid-gray` | 50 / 100 / 200 / 300 / 400 / 420 / 500 / 536 / 600 / 700 / 800 / 900 |
| `opacity-gray`（黒の透過） | 50 〜 900 |
| `white` `black` | - |
| `success-1` `success-2` `error-1` `error-2` `warning-yellow-1` `warning-yellow-2` `warning-orange-1` `warning-orange-2` | DADS セマンティック |

## 色（セマンティック）

| 用途 | トークン | 値 |
| --- | --- | --- |
| 面 | `canvas` / `surface` / `surface-muted` / `surface-strong` / `surface-hover` / `surface-selected` / `surface-highlight` / `on-highlight` / `scrim` / `scrim-light` | gray-50 / white / gray-50 / gray-100 / key-50 / key-100 / key-900 / white / opacity-600 / opacity-100 |
| 文字 | `text` / `text-strong` / `text-secondary` / `text-muted` / `text-subtle` / `text-disabled` / `text-on-primary` / `text-inverse` | gray-800 / gray-900 / gray-700 / gray-600 / gray-600 / gray-420 / white / white |
| 線 | `border` / `border-on-canvas` / `border-strong` / `border-emphasis` / `border-table` / `border-disabled` | gray-420 / gray-536 / gray-600 / black / gray-500 / gray-300 |
| 操作部品 | `control-hover` / `control-active`（ラジオボタンの円、スイッチのリング） | gray-420 / gray-600 |
| プライマリー | `primary` / `primary-hover` / `primary-active` / `primary-strong` / `primary-surface` / `primary-surface-hover` / `primary-outline-hover` / `primary-outline-active` | key-1000 / 1100 / 1200 / 1100 / 50 / 100 / 200 / 300 |
| リンク | `link` / `link-hover` / `link-active` / `link-visited` | blue-1000 / blue-900 / orange-900 / magenta-900 |
| フォーカス | `focus` / `focus-ring` / `focus-fill` | black / yellow-300 / yellow-300（変更禁止） |
| 意味色 | `success` / `success-surface` / `success-hover`、`error` / `error-hover` / `error-active` / `error-surface` / `error-outline-hover`、`warning` / `warning-hover` / `warning-chip` / `warning-surface`、`info` / `info-surface`、`neutral` / `neutral-surface` | green-800 / green-50 / green-1000、red-900 / red-1000 / red-1200 / red-50 / red-200、yellow-1000 / yellow-1100 / yellow-400 / yellow-50、key-900 / key-50、gray-536 / gray-50 |
| 無効 | `disabled` / `disabled-surface` / `on-disabled` | gray-300 / gray-50 / gray-50 |
| データ可視化 | `chart-1`〜`chart-5`、`chart-seq-1`〜`chart-seq-5`、`chart-positive` / `chart-negative`、`trend-up` / `trend-down`、`chart-grid` / `chart-axis` / `chart-reference` / `chart-neutral` | blue-900 / yellow-800 / blue-600 / gray-600 / blue-1200、blue-1200 / 900 / 600 / 400 / 200、blue-600 / red-600、blue-800 / red-900、gray-200 / 600 / 800 / 400 |

`text-subtle`・`error`・`warning`・`link-active` は、地（canvas）の上でも 4.5:1 を満たすよう DADS より 1 段濃くしている（`docs/decisions.md` D-17）。

コントラスト: テキストは背景に対して 4.5:1、非テキストは 3:1 を `src/tokens/contrast.test.ts` で検査している。disabled、`chart-seq-4` / `-5`、フォーカスリングの黄色単体、`warning-chip` は要件の対象外（理由はテスト内のコメント参照）。

### ダークモード

`<html data-theme="dark">` のとき、`theme-dark.css` が色のセマンティック別名を上書きする。値は DADS のプリミティブから選んだ独自の配色で、DADS の規定ではない（`docs/decisions.md` D-31）。

- 部品では、セマンティック別名（`bg-surface`、`text-text-muted` など）を使えば、ダークモードにも自動で対応する
- プリミティブを直接使う部品（チップラベル）は、`dark:bg-blue-1200` のように `dark:` を付けてダークモードの色を書く
- ダークモードの値も、ライトと同じ組み合わせで `contrast.test.ts` が検査する。チップラベルの色相ごとの組み合わせも検査する
- フォーカスは、黒い線が暗い地で見えないため、黄色の 4px の線と黒の 2px の帯に入れ替える。リンクやテキストボタンの黄色の塗り（`focus-fill`）は、明るい文字が読めなくなるため、ダークモードでは塗らない

## タイポグラフィ

- フォント: `font-sans`（OSの標準の書体。`system-ui`、ヒラギノ角ゴシック、Yu Gothic UI、メイリオなど）、`font-mono`（OSの標準の等幅の書体）。値は`local.css`。フォントは配信しない（`docs/decisions.md` D-02）
- 本文の既定値: `local.css`の`--body-font-size`（1rem）、`--leading-body`（1.5）、`--body-letter-spacing`（0.02em）を`body`に当てる
- 部品の本文: `text-body`（16px、標準の太さ、行の高さ`--leading-body`）、`text-body-bold`（太字）、`leading-body`を使う。DADSの`text-std-16N-170`や`leading-170`を部品に直接書くと、`npm run lint`で検出される
- 文字サイズ: `text-14` `text-16` `text-17` `text-18` `text-20` `text-22` `text-24` `text-26` `text-28` `text-32` `text-36` `text-45` `text-48` `text-57` `text-64`（Tailwind の `text-sm` 等は無効）
- 行高: `leading-100` `leading-120` `leading-130` `leading-140` `leading-150` `leading-160` `leading-170` `leading-175`
- 文字間隔: `tracking-0` `tracking-1`（0.01em） `tracking-2`（0.02em）
- テキストスタイル: `text-dsp-{64|57|48}{B|N}-140`、`text-std-{45|36}{B|N}-140`、`text-std-{32|28|26|24|22|20}{B|N}-150`、`text-std-18{B|N}-160`、`text-std-{17|16}{B|N}-170`、`text-std-16{B|N}-175`、`text-dns-{17|16|14}{B|N}-{130|120}`、`text-oln-{17|16|14}{B|N}-100`、`text-mono-{17|16|14}{B|N}-150`

使い分け: 本文 `text-body`、見出し `text-std-{20〜32}B-150`、表の中など密度を優先する場所 `text-dns-16N-130`（最小 `text-dns-14N-130`）、ボタン等 1 行 UI `text-oln-16B-100`。

## 角丸・影・線

部品では、`local.css`の役割のトークンを使う。DADSの段（`rounded-8`、`shadow-1`など）を部品に直接書くと、`npm run lint`で検出される。

| 役割 | 角丸 | 既定 |
| --- | --- | --- |
| ボタンのlgとmd、アイコンボタン、メニューのボタン | `rounded-button` | 4 |
| ボタンのsm、閉じるボタン | `rounded-button-sm` | 4 |
| ボタンのxs | `rounded-button-xs` | 4 |
| 入力欄、セレクト、テキストエリア | `rounded-input` | 4 |
| チェックボックス | `rounded-checkbox` | 4 |
| カード、パネル、ドロップ領域 | `rounded-card` | 6 |
| メニュー、リストボックス、カレンダー、ポップオーバー | `rounded-popup` | 6 |
| モーダルダイアログ、コマンドパレット、トースト | `rounded-dialog` | 6 |
| ノティフィケーションバナー | `rounded-banner` | 8 |
| チップラベル、入力欄の「必須」 | `rounded-chip` | 4 |
| ツールチップ | `rounded-tooltip` | 4 |
| サイドナビゲーションの項目 | `rounded-nav-item` | 4 |
| アバター（四角） | `rounded-avatar` | 4 |
| リンクのフォーカス、スケルトンの行 | `rounded-inline` | 4 |
| 円（ラジオボタン、スイッチなど） | `rounded-full` | - |

| 役割 | 影 | 既定の高さレベル |
| --- | --- | --- |
| リンクになっているカードのhover | `hover:shadow-card-hover` | 1 |
| メニュー、リストボックス、ポップオーバー、グラフのツールチップ | `shadow-popup` | 1 |
| ドロワー | `shadow-drawer` | 2 |
| モーダルダイアログ、コマンドパレット | `shadow-dialog` | 3 |
| トースト | `shadow-toast` | 3 |

カードは影を付けず、枠線で区切る（`docs/decisions.md` D-07）。DADSの段は`primitives.css`の`--radius-4`〜`32`と`--shadow-1`〜`8`にある。役割を足すときは`local.css`に書き、影なら`eslint.config.js`の許可する名前にも足す。

- 線幅: Tailwind の `border` `border-2` `border-3` `border-4`
- 線幅: Tailwind の `border` `border-2` `border-3` `border-4`

## 寸法

| トークン | 値 | 用途 |
| --- | --- | --- |
| `target` | 44px | タップ領域（`size-target`） |
| `control-sm` / `control-md` / `control-lg` | 40 / 48 / 56px | 入力部品の高さ（`h-control-md`） |
| `header` | 64px | ヘッダー |
| `sidebar` / `sidebar-collapsed` | 256 / 72px | サイドバー |
| `drawer` | 288px | ドロワー |
| `dialog` | 480px | ダイアログの最小幅 |
| `popup-max` | 308px | メニューの最大高さ |
| `table-min` | 640px | 横スクロールする表の最小幅 |
| `chart` / `chart-sm` | 256 / 160px | グラフの高さ |
| `icon-sm` / `icon-md` / `icon-lg` / `icon-xl` | 16 / 20 / 24 / 44px | アイコン |

## 余白とレイアウト

- 余白: Tailwindの余白の1段は`local.css`の`--spacing`（4px）。DADSの基準の8pxは2段にあたり、部品の中の余白は2、4、6、8、12、16段を基本にする
- 画面の余白: `px-page-x`（16px）、`md:px-page-x-wide`（32px）、`py-page-y`（24px）。`AppShell`、`TopNavLayout`、`Container`が使う
- 段組みの幅: `max-w-content`（52rem。読み物・フォーム）、`max-w-wide`（80rem。一覧・ダッシュボード）
- ブレークポイント: `sm` 40rem、`md` 48rem、`lg` 64rem、`xl` 80rem、`2xl` 96rem（`local.css`の`--breakpoint-*`）。モバイルとデスクトップの切り替えは`md`、サイドバーの常時表示は`lg`（`docs/decisions.md` D-05）
- JSで画面の幅を見るときは、`useMediaQuery(minWidth("md"))`のように`src/tokens/breakpoints.ts`を使う。メディアクエリの幅を直接書くと、`npm run lint`で検出される

## 独自ユーティリティ

| クラス | 内容 |
| --- | --- |
| `focus-ring` | DADS フォーカスインジケーター（黒 4px + 黄 2px）。`focus-visible:focus-ring` |
| `focus-ring-fill` | 背景も黄色にする（テキストボタン・リンク） |
| `tap-area` | 上下に見えないタップ領域を足して 44px を確保 |
| `scroll-shadow-x` | 横スクロール領域の端のシャドー |
| `underline-thick` | 下線 3px（hover） |
| `nums` | 等幅数字 |
| `h-below-header` | 画面の高さからヘッダーの高さを引いた高さ（ヘッダーの下に固定するサイドバー） |
