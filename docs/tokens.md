# デザイントークン一覧

定義場所: `src/tokens/`（Tailwind CSS v4 の `@theme`）。コンポーネントやページでは、ここに定義された名前のユーティリティクラスだけを使う。色コード・任意値クラスの直書きは `npm run lint`（`scripts/check-design-tokens.mjs`）で検出される。

| ファイル | 内容 |
| --- | --- |
| `primitives.css` | DADS design-tokens 2.0.1 のプリミティブ（色、フォント、文字サイズ、行高、角丸、エレベーション）。Tailwind 既定値はここで無効化 |
| `theme.css` | セマンティック別名（面・文字・線・プライマリー・リンク・フォーカス・意味色・無効・データ可視化・寸法）と独自ユーティリティ |
| `theme-dark.css` | ダークモードのときに、`theme.css` の色のセマンティック別名を上書きする値 |
| `typography.css` | DADS テキストスタイル（`text-std-16N-170` など 56 種） |
| `contrast.test.ts` | トークンの組み合わせごとのコントラスト検査（`npm test`） |

## 色（プリミティブ）

`bg-blue-900` のように `{bg|text|border|…}-{色相}-{階調}` で使う。

| 色相 | 階調 |
| --- | --- |
| `blue` `light-blue` `cyan` `green` `lime` `yellow` `orange` `red` `magenta` `purple` | 50 / 100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000 / 1100 / 1200 |
| `key`（= blue の別名、キーカラー） | 同上 |
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
| プライマリー | `primary` / `primary-hover` / `primary-active` / `primary-strong` / `primary-surface` / `primary-surface-hover` / `primary-outline-hover` / `primary-outline-active` | key-900 / 1000 / 1200 / 1100 / 50 / 100 / 200 / 300 |
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

- フォント: `font-sans`（Noto Sans JP Variable → システムフォント）、`font-mono`（Noto Sans Mono）
- 文字サイズ: `text-14` `text-16` `text-17` `text-18` `text-20` `text-22` `text-24` `text-26` `text-28` `text-32` `text-36` `text-45` `text-48` `text-57` `text-64`（Tailwind の `text-sm` 等は無効）
- 行高: `leading-100` `leading-120` `leading-130` `leading-140` `leading-150` `leading-160` `leading-170` `leading-175`
- 文字間隔: `tracking-0` `tracking-1`（0.01em） `tracking-2`（0.02em）
- テキストスタイル: `text-dsp-{64|57|48}{B|N}-140`、`text-std-{45|36}{B|N}-140`、`text-std-{32|28|26|24|22|20}{B|N}-150`、`text-std-18{B|N}-160`、`text-std-{17|16}{B|N}-170`、`text-std-16{B|N}-175`、`text-dns-{17|16|14}{B|N}-{130|120}`、`text-oln-{17|16|14}{B|N}-100`、`text-mono-{17|16|14}{B|N}-150`

使い分け: 本文 `text-std-16N-170`、見出し `text-std-{20〜32}B-150`、表の中など密度を優先する場所 `text-dns-16N-130`（最小 `text-dns-14N-130`）、ボタン等 1 行 UI `text-oln-16B-100`。

## 角丸・影・線

- 角丸: `rounded-4` `rounded-6` `rounded-8` `rounded-12` `rounded-16` `rounded-24` `rounded-32` `rounded-full`
- 影（エレベーション）: `shadow-1`〜`shadow-8`（ダイアログ 3、ドロワー 2、メニュー 1。カードは影なし）
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

余白は Tailwind のスペーシングスケール（4px 刻み）を使い、DADS の 8px 基準に合わせて 2 / 4 / 6 / 8 / 12 / 16 を基本とする。ブレークポイントは Tailwind 既定（`md` 768px を DADS の 1 ブレークポイントとして扱う）。

## 独自ユーティリティ

| クラス | 内容 |
| --- | --- |
| `focus-ring` | DADS フォーカスインジケーター（黒 4px + 黄 2px）。`focus-visible:focus-ring` |
| `focus-ring-fill` | 背景も黄色にする（テキストボタン・リンク） |
| `tap-area` | 上下に見えないタップ領域を足して 44px を確保 |
| `scroll-shadow-x` | 横スクロール領域の端のシャドー |
| `underline-thick` | 下線 3px（hover） |
| `nums` | 等幅数字 |
