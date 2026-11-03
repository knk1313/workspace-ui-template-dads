import { useId, useMemo } from "react";
import { Bar, CartesianGrid, LabelList, BarChart as RBarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartDataTable, ChartFrame, type ChartFrameBaseProps, type ChartSize, type LegendItem } from "./ChartFrame";
import { ChartPatterns } from "./ChartPatterns";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS, buildCompareSummary, formatNumber, limitSeries, seriesFill, seriesStyle, toSafeId, type ChartDatum, type ChartSeries } from "./chartUtils";
import type { ReferenceLineSpec } from "./LineChart";

// 棒グラフ（数量比較）。まず棒を検討する（ガイドブック）。
//   - layout: vertical = 縦棒（既定）、horizontal = 横棒（カテゴリー名が長いとき）。
//   - stacked で積み上げ、sorted で値の大小順（意味のある順列）、showValues で値ラベル。
//   - 2 系列目以降は模様（patterns）を重ね、色だけに依存しない。角丸なし、幅は最大 48px。

export type BarChartProps = ChartFrameBaseProps & {
    data: readonly ChartDatum[];
    /** カテゴリー軸のキー（例: "region"）。 */
    xKey: string;
    /** 系列（最大 5）。 */
    series: readonly ChartSeries[];
    /** 棒の向き。vertical = 縦棒、horizontal = 横棒。 */
    layout?: "vertical" | "horizontal";
    /** 積み上げ棒にする。 */
    stacked?: boolean;
    /** 値の合計が大きい順に並べ替える（大小順）。既定は data の順（日付順などの意味のある順列）。 */
    sorted?: boolean;
    /** 棒の近くに値を表示する（コントラストが 3:1 未満の色を使うときは必須）。 */
    showValues?: boolean;
    /** 2 系列目以降に模様を重ねる（既定 true）。 */
    patterns?: boolean;
    /** 目標値などの比較線（値軸の位置）。 */
    referenceLine?: ReferenceLineSpec;
    /** 値軸のラベル。省略時は unit。 */
    yAxisLabel?: string;
    /** カテゴリー軸のラベル（データテーブルの行見出しにも使う）。 */
    xAxisLabel?: string;
    /** 系列色の配列。順序のあるデータには SEQUENTIAL_COLORS を渡す。 */
    palette?: readonly string[];
    /** aria-label に使う要約。省略時はデータから自動生成する。 */
    summary?: string;
    /** 固定サイズ（テスト用）。 */
    size?: ChartSize;
};

const STACK_ID = "stack";
const MAX_BAR_SIZE = 48;

export function BarChart({
    data,
    xKey,
    series,
    layout = "vertical",
    stacked = false,
    sorted = false,
    showValues = false,
    patterns = true,
    referenceLine,
    yAxisLabel,
    xAxisLabel,
    palette,
    summary,
    size,
    unit,
    title,
    ...frame
}: BarChartProps) {
    const idPrefix = toSafeId(useId());
    const visible = limitSeries(series);
    const rows = useMemo(() => {
        if (!sorted) return data as ChartDatum[];
        const total = (d: ChartDatum) => visible.reduce((sum, s) => sum + (typeof d[s.key] === "number" ? (d[s.key] as number) : 0), 0);
        return [...data].sort((a, b) => total(b) - total(a));
    }, [data, sorted, visible]);
    const label = summary ?? buildCompareSummary({ title, data: rows, series: visible, xKey, unit });
    const legend: LegendItem[] = visible.map((s, i) => {
        const style = seriesStyle(i, palette);
        return { name: s.name, kind: "fill", color: style.color, pattern: style.pattern, patterns };
    });
    const horizontal = layout === "horizontal";
    const valueAxisLabel = yAxisLabel ?? unit;
    const tickProps = { fill: CHART_COLORS.axis };
    const lastKey = visible[visible.length - 1]?.key;

    const chart = (
        <RBarChart
            data={rows}
            layout={horizontal ? "vertical" : "horizontal"}
            width={size?.width}
            height={size?.height}
            role="img"
            aria-label={label}
            accessibilityLayer={false}
            barCategoryGap="20%"
            margin={{ top: valueAxisLabel && !horizontal ? 28 : showValues && !horizontal ? 20 : 8, right: showValues && horizontal ? 48 : 16, bottom: xAxisLabel && !horizontal ? 24 : 4, left: 4 }}
        >
            <ChartPatterns idPrefix={idPrefix} count={visible.length} palette={palette} />
            <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke={CHART_COLORS.grid} />
            {horizontal ? (
                <>
                    <XAxis
                        type="number"
                        domain={[0, "auto"]}
                        stroke={CHART_COLORS.axis}
                        tick={tickProps}
                        tickLine={false}
                        tickFormatter={(v: number) => formatNumber(v)}
                        label={valueAxisLabel ? { value: valueAxisLabel, position: "insideBottomRight", offset: -4, fill: CHART_COLORS.axis } : undefined}
                    />
                    <YAxis type="category" dataKey={xKey} width="auto" stroke={CHART_COLORS.axis} tick={tickProps} tickLine={false} interval={0} />
                </>
            ) : (
                <>
                    <XAxis
                        dataKey={xKey}
                        stroke={CHART_COLORS.axis}
                        tick={tickProps}
                        tickLine={false}
                        interval={0}
                        label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -16, fill: CHART_COLORS.axis } : undefined}
                    />
                    <YAxis
                        domain={[0, "auto"]}
                        width="auto"
                        stroke={CHART_COLORS.axis}
                        tick={tickProps}
                        tickLine={false}
                        tickFormatter={(v: number) => formatNumber(v)}
                        label={valueAxisLabel ? { value: valueAxisLabel, position: "top", offset: 12, fill: CHART_COLORS.axis } : undefined}
                    />
                </>
            )}
            <Tooltip content={(props) => <ChartTooltip {...props} unit={unit} />} cursor={{ fill: CHART_COLORS.surfaceMuted }} />
            {referenceLine && (
                <ReferenceLine
                    {...(horizontal ? { x: referenceLine.y } : { y: referenceLine.y })}
                    stroke={CHART_COLORS.reference}
                    strokeDasharray="4 4"
                    label={{ value: referenceLine.label, position: horizontal ? "insideTopLeft" : "insideTopRight", fill: CHART_COLORS.text }}
                />
            )}
            {visible.map((s, i) => (
                <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    data-series={s.key}
                    fill={seriesFill(idPrefix, i, patterns, palette)}
                    stackId={stacked ? STACK_ID : undefined}
                    maxBarSize={MAX_BAR_SIZE}
                    isAnimationActive={false}
                    activeBar={false}
                >
                    {/* 値ラベル: 集合棒は各棒の先端、積み上げ棒は最上段の系列にだけ合計を出す。 */}
                    {showValues && !stacked && <LabelList dataKey={s.key} position={horizontal ? "right" : "top"} fill={CHART_COLORS.text} formatter={(v: unknown) => formatNumber(v)} />}
                    {showValues && stacked && s.key === lastKey && (
                        <LabelList
                            position={horizontal ? "right" : "top"}
                            fill={CHART_COLORS.text}
                            valueAccessor={(entry: { payload?: ChartDatum }) => formatNumber(visible.reduce((sum, v) => sum + (typeof entry.payload?.[v.key] === "number" ? (entry.payload[v.key] as number) : 0), 0))}
                        />
                    )}
                </Bar>
            ))}
        </RBarChart>
    );

    return (
        <ChartFrame
            title={title}
            unit={unit}
            legend={legend}
            table={<ChartDataTable caption={title} rowHeader={{ key: xKey, label: xAxisLabel ?? "項目" }} columns={visible.map((s) => ({ key: s.key, label: s.name }))} rows={rows} unit={unit} />}
            {...frame}
        >
            {size ? chart : <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>}
        </ChartFrame>
    );
}
