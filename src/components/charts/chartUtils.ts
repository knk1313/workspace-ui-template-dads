// グラフ部品共通の定数とヘルパー（ダッシュボードデザインの実践ガイドブック / docs/decisions.md D-12）。
//   - 色は src/tokens/theme.css の --color-chart-* を CSS 変数のまま recharts に渡す（色コードは書かない）。
//   - 色だけに依存しない: 系列ごとにデータ点の形・線種・塗りの模様を変える（色覚多様性への配慮）。
//   - 系列は最大 5。超えた分は描画しない（警告を出す）。

export type ChartDatum = Record<string, number | string | null | undefined>;

export type ChartSeries = {
    /** データのキー。 */
    key: string;
    /** 凡例・ツールチップ・データテーブルに出す系列名。 */
    name: string;
};

export const MAX_SERIES = 5;

/** 系列色（青 / 黄 / 青 / グレー / 濃紺）。白背景に対して 3:1 以上。 */
export const SERIES_COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
] as const;

/** 単一色相（順序のあるデータ向け）。4・5 番目は 3:1 未満なので値ラベルを併記する。 */
export const SEQUENTIAL_COLORS = [
    "var(--color-chart-seq-1)",
    "var(--color-chart-seq-2)",
    "var(--color-chart-seq-3)",
    "var(--color-chart-seq-4)",
    "var(--color-chart-seq-5)",
] as const;

export const CHART_COLORS = {
    grid: "var(--color-chart-grid)",
    axis: "var(--color-chart-axis)",
    reference: "var(--color-chart-reference)",
    neutral: "var(--color-chart-neutral)",
    positive: "var(--color-chart-positive)",
    negative: "var(--color-chart-negative)",
    text: "var(--color-text)",
    surface: "var(--color-surface)",
    surfaceMuted: "var(--color-surface-muted)",
} as const;

/** 折れ線のデータ点の形（系列順）。 */
export type DotShape = "circle" | "square" | "triangle" | "diamond" | "cross";
export const SERIES_SHAPES: readonly DotShape[] = ["circle", "square", "triangle", "diamond", "cross"];

/** 線種（系列順）。undefined は実線。形と組み合わせて 5 系列を区別する。 */
export const SERIES_DASHES: readonly (string | undefined)[] = [undefined, "8 4", undefined, "3 3", undefined];

/** 塗りの模様（系列順）。1 系列目はベタ塗り、2 系列目以降に模様を重ねる。 */
export type PatternKind = "solid" | "diagonal" | "dots" | "crosshatch" | "horizontal";
export const SERIES_PATTERNS: readonly PatternKind[] = ["solid", "diagonal", "dots", "crosshatch", "horizontal"];

export type SeriesStyle = {
    color: string;
    shape: DotShape;
    dash: string | undefined;
    pattern: PatternKind;
};

/** 系列の番号（0 始まり）から色・形・線種・模様を決める。 */
export function seriesStyle(index: number, palette: readonly string[] = SERIES_COLORS): SeriesStyle {
    const i = Math.min(index, MAX_SERIES - 1);
    return { color: palette[i], shape: SERIES_SHAPES[i], dash: SERIES_DASHES[i], pattern: SERIES_PATTERNS[i] };
}

/** 模様の <pattern> 要素の id。idPrefix はグラフごとに useId で作る。 */
export function patternId(idPrefix: string, index: number): string {
    return `${idPrefix}-pattern-${index}`;
}

/**
 * 面・棒の塗り。patterns が true で 2 系列目以降なら模様（url(#id)）、それ以外はベタ塗りの色。
 */
export function seriesFill(idPrefix: string, index: number, patterns: boolean, palette: readonly string[] = SERIES_COLORS): string {
    const style = seriesStyle(index, palette);
    return patterns && style.pattern !== "solid" ? `url(#${patternId(idPrefix, index)})` : style.color;
}

/** useId の区切り文字（: や «»）を取り除き、SVG の id / url(#...) に使える文字列にする。 */
export function toSafeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

/** 系列数を 5 に制限する。超えていたら開発時に警告する。 */
export function limitSeries<T>(series: readonly T[]): T[] {
    if (series.length > MAX_SERIES) {
        console.warn(`グラフの系列は最大 ${MAX_SERIES} 色です。${series.length} 系列のうち先頭 ${MAX_SERIES} 系列だけを描画します。`);
    }
    return series.slice(0, MAX_SERIES);
}

/** 数値を日本語ロケールの桁区切りで整形し、単位があれば後ろに付ける。数値でない値はそのまま文字列にする。 */
export function formatNumber(value: unknown, unit?: string): string {
    if (typeof value === "number" && Number.isFinite(value)) {
        return `${value.toLocaleString("ja-JP")}${unit ?? ""}`;
    }
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
}

/** 0〜1 の割合を「12.3%」の形にする。 */
export function formatPercent(ratio: number, digits = 1): string {
    if (!Number.isFinite(ratio)) return "—";
    return `${(ratio * 100).toLocaleString("ja-JP", { minimumFractionDigits: 0, maximumFractionDigits: digits })}%`;
}

function numberAt(datum: ChartDatum | undefined, key: string): number | undefined {
    const v = datum?.[key];
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export type SummaryInput = {
    title: string;
    data: readonly ChartDatum[];
    series: readonly ChartSeries[];
    xKey: string;
    unit?: string;
};

/**
 * スクリーンリーダー向けの要約（aria-label）を作る。
 * 時系列: 「{title}。{系列名} の推移、最新値 {値}（{時点}）。」
 */
export function buildTrendSummary({ title, data, series, xKey, unit }: SummaryInput): string {
    if (data.length === 0) return `${title}。データがありません。`;
    const last = data[data.length - 1];
    const parts = series.map((s) => {
        const value = numberAt(last, s.key);
        return `${s.name} の推移、最新値 ${formatNumber(value, unit)}（${String(last[xKey])}）`;
    });
    return `${title}。${data.length} 時点。${parts.join("。")}。`;
}

/**
 * 数量比較（棒）の要約: 「{title}。{系列名} は {カテゴリー} が最大 {値}、{カテゴリー} が最小 {値}。」
 */
export function buildCompareSummary({ title, data, series, xKey, unit }: SummaryInput): string {
    if (data.length === 0) return `${title}。データがありません。`;
    const parts = series.map((s) => {
        let max: ChartDatum | undefined;
        let min: ChartDatum | undefined;
        for (const d of data) {
            const v = numberAt(d, s.key);
            if (v === undefined) continue;
            if (max === undefined || v > (numberAt(max, s.key) ?? -Infinity)) max = d;
            if (min === undefined || v < (numberAt(min, s.key) ?? Infinity)) min = d;
        }
        if (!max || !min) return `${s.name} はデータがありません`;
        return `${s.name} は ${String(max[xKey])} が最大 ${formatNumber(numberAt(max, s.key), unit)}、${String(min[xKey])} が最小 ${formatNumber(numberAt(min, s.key), unit)}`;
    });
    return `${title}。${data.length} 項目。${parts.join("。")}。`;
}

/**
 * 構成比（ドーナツ）の要約: 「{title}。合計 {値}。{名前} {割合}、…。」
 */
export function buildShareSummary(title: string, items: readonly { name: string; value: number }[], unit?: string): string {
    const total = items.reduce((sum, d) => sum + d.value, 0);
    if (items.length === 0 || total === 0) return `${title}。データがありません。`;
    const parts = items.map((d) => `${d.name} ${formatNumber(d.value, unit)}（${formatPercent(d.value / total)}）`);
    return `${title}。合計 ${formatNumber(total, unit)}。${parts.join("、")}。`;
}
