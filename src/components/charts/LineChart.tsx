import { CartesianGrid, Line, LineChart as RLineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from "recharts";
import { ChartDataTable, ChartFrame, type ChartFrameBaseProps, type ChartSize, type LegendItem } from "./ChartFrame";
import { shapePath } from "./ChartPatterns";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS, buildTrendSummary, formatNumber, limitSeries, seriesStyle, type ChartDatum, type ChartSeries } from "./chartUtils";

// 折れ線グラフ（時間変化・傾向）。横軸は時間（xKey）。
//   - 系列ごとに色 + データ点の形（circle / square / triangle / diamond / cross）+ 線種（実線 / 破線）を変える。
//   - 原点は 0、グリッドは横線のみ、3D や影は使わない。
//   - referenceLine で目標値などの比較線（破線）を引く。
//   - SVG に role="img" + aria-label（要約）を付け、ChartFrame のデータテーブルを代替手段にする。

export type ReferenceLineSpec = {
    y: number;
    label: string;
    /** ラベルの位置。系列の線と重ならない側を選ぶ（既定は左上）。 */
    labelPosition?: "insideTopLeft" | "insideTopRight" | "insideBottomLeft" | "insideBottomRight";
};

export type LineChartProps = ChartFrameBaseProps & {
    data: readonly ChartDatum[];
    /** 時間軸のキー（例: "month"）。 */
    xKey: string;
    /** 系列（最大 5）。 */
    series: readonly ChartSeries[];
    /** Y 軸のラベル。省略時は unit。 */
    yAxisLabel?: string;
    /** X 軸のラベル（例: 月）。 */
    xAxisLabel?: string;
    /** 目標値などの比較線。 */
    referenceLine?: ReferenceLineSpec;
    /** データ点を表示する（既定 true。系列ごとに形が変わる）。 */
    showDots?: boolean;
    /** aria-label に使う要約。省略時はデータから自動生成する。 */
    summary?: string;
    /** 固定サイズ（テスト用）。省略時は親の 100%。 */
    size?: ChartSize;
};

const DOT_RADIUS = 4;

export function LineChart({ data, xKey, series, yAxisLabel, xAxisLabel, referenceLine, showDots = true, summary, size, unit, title, ...frame }: LineChartProps) {
    const visible = limitSeries(series);
    const label = summary ?? buildTrendSummary({ title, data, series: visible, xKey, unit });
    const legend: LegendItem[] = visible.map((s, i) => {
        const style = seriesStyle(i);
        return { name: s.name, kind: "line", color: style.color, shape: showDots ? style.shape : undefined, dash: style.dash };
    });
    const axisLabelY = yAxisLabel ?? unit;

    const chart = (
        <RLineChart
            data={data as ChartDatum[]}
            width={size?.width}
            height={size?.height}
            role="img"
            aria-label={label}
            accessibilityLayer={false}
            margin={{ top: axisLabelY ? 28 : 8, right: 16, bottom: xAxisLabel ? 24 : 4, left: 4 }}
        >
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis
                dataKey={xKey}
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axis }}
                tickLine={false}
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -16, fill: CHART_COLORS.axis } : undefined}
            />
            <YAxis
                domain={[0, "auto"]}
                width="auto"
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axis }}
                tickLine={false}
                tickFormatter={(v: number) => formatNumber(v)}
                label={axisLabelY ? { value: axisLabelY, position: "top", offset: 12, fill: CHART_COLORS.axis } : undefined}
            />
            <Tooltip content={(props) => <ChartTooltip {...props} unit={unit} />} cursor={{ stroke: CHART_COLORS.neutral }} />
            {referenceLine && (
                <ReferenceLine
                    y={referenceLine.y}
                    stroke={CHART_COLORS.reference}
                    strokeDasharray="4 4"
                    label={{ value: referenceLine.label, position: referenceLine.labelPosition ?? "insideTopLeft", fill: CHART_COLORS.text }}
                />
            )}
            {visible.map((s, i) => {
                const style = seriesStyle(i);
                return (
                    <Line
                        key={s.key}
                        type="linear"
                        dataKey={s.key}
                        name={s.name}
                        data-series={s.key}
                        stroke={style.color}
                        strokeWidth={2}
                        strokeDasharray={style.dash}
                        isAnimationActive={false}
                        dot={showDots ? (p: DotItemDotProps) => <SeriesDot cx={p.cx} cy={p.cy} shape={style.shape} color={style.color} seriesKey={s.key} index={p.index} /> : false}
                        activeDot={{ r: DOT_RADIUS + 2, stroke: CHART_COLORS.surface, strokeWidth: 2, fill: style.color }}
                    />
                );
            })}
        </RLineChart>
    );

    return (
        <ChartFrame
            title={title}
            unit={unit}
            legend={legend}
            table={<ChartDataTable caption={title} rowHeader={{ key: xKey, label: xAxisLabel ?? "時点" }} columns={visible.map((s) => ({ key: s.key, label: s.name }))} rows={data} unit={unit} />}
            {...frame}
        >
            {size ? chart : <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>}
        </ChartFrame>
    );
}

type SeriesDotProps = {
    cx?: number;
    cy?: number;
    shape: ReturnType<typeof seriesStyle>["shape"];
    color: string;
    seriesKey: string;
    index: number;
};

/** 系列ごとに形の違うデータ点。recharts の dot render に渡す。 */
function SeriesDot({ cx, cy, shape, color, seriesKey, index }: SeriesDotProps) {
    if (cx === undefined || cy === undefined || Number.isNaN(cx) || Number.isNaN(cy)) return null;
    return <path key={`${seriesKey}-${index}`} d={shapePath(shape, DOT_RADIUS)} transform={`translate(${cx} ${cy})`} fill={color} stroke={CHART_COLORS.surface} strokeWidth={1} data-dot={seriesKey} />;
}
