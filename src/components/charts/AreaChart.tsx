import { useId } from "react";
import { Area, CartesianGrid, AreaChart as RAreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartDataTable, ChartFrame, type ChartFrameBaseProps, type ChartSize, type LegendItem } from "./ChartFrame";
import { ChartPatterns } from "./ChartPatterns";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS, buildTrendSummary, formatNumber, formatPercent, limitSeries, seriesFill, seriesStyle, toSafeId, type ChartDatum, type ChartSeries } from "./chartUtils";

// 積み上げ面グラフ（数量と構成比の時間変化）。
//   - stacked（既定 true）で積み上げ、percent で 100% 積み上げ（構成比だけを見せる）。
//   - 面の塗りは透過（fillOpacity）ではなく系列色 + 模様で区別する。薄くしたい場合は SEQUENTIAL_COLORS を palette に渡す。

export type AreaChartProps = ChartFrameBaseProps & {
    data: readonly ChartDatum[];
    /** 時間軸のキー。 */
    xKey: string;
    /** 系列（最大 5）。 */
    series: readonly ChartSeries[];
    /** 積み上げる（既定 true）。 */
    stacked?: boolean;
    /** 100% 積み上げ（Y 軸を % にする）。 */
    percent?: boolean;
    /** 2 系列目以降に模様を重ねる（既定 true）。 */
    patterns?: boolean;
    /** Y 軸のラベル。省略時は unit（percent のときは「構成比」）。 */
    yAxisLabel?: string;
    xAxisLabel?: string;
    palette?: readonly string[];
    summary?: string;
    size?: ChartSize;
};

const STACK_ID = "stack";

export function AreaChart({ data, xKey, series, stacked = true, percent = false, patterns = true, yAxisLabel, xAxisLabel, palette, summary, size, unit, title, ...frame }: AreaChartProps) {
    const idPrefix = toSafeId(useId());
    const visible = limitSeries(series);
    const label = summary ?? buildTrendSummary({ title, data, series: visible, xKey, unit });
    const legend: LegendItem[] = visible.map((s, i) => {
        const style = seriesStyle(i, palette);
        return { name: s.name, kind: "fill", color: style.color, pattern: style.pattern, patterns };
    });
    const axisLabelY = yAxisLabel ?? (percent ? "構成比" : unit);
    const rowTotal = (row: ChartDatum) => visible.reduce((sum, s) => sum + (typeof row[s.key] === "number" ? (row[s.key] as number) : 0), 0);

    const chart = (
        <RAreaChart
            data={data as ChartDatum[]}
            width={size?.width}
            height={size?.height}
            role="img"
            aria-label={label}
            accessibilityLayer={false}
            stackOffset={percent ? "expand" : "none"}
            margin={{ top: axisLabelY ? 28 : 8, right: 16, bottom: xAxisLabel ? 24 : 4, left: 4 }}
        >
            <ChartPatterns idPrefix={idPrefix} count={visible.length} palette={palette} />
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis
                dataKey={xKey}
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axis }}
                tickLine={false}
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -16, fill: CHART_COLORS.axis } : undefined}
            />
            <YAxis
                domain={percent ? [0, 1] : [0, "auto"]}
                width="auto"
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axis }}
                tickLine={false}
                tickFormatter={(v: number) => (percent ? formatPercent(v, 0) : formatNumber(v))}
                label={axisLabelY ? { value: axisLabelY, position: "top", offset: 12, fill: CHART_COLORS.axis } : undefined}
            />
            <Tooltip
                content={(props) => (
                    <ChartTooltip
                        {...props}
                        unit={unit}
                        formatValue={
                            percent
                                ? (value, { dataKey }) => {
                                      // 100% 積み上げでは実数と割合を併記する。
                                      const row = props.payload?.[0]?.payload as ChartDatum | undefined;
                                      const total = row ? rowTotal(row) : 0;
                                      const raw = typeof dataKey === "string" && row ? row[dataKey] : value;
                                      const n = typeof raw === "number" ? raw : 0;
                                      return `${formatNumber(n, unit)}（${total > 0 ? formatPercent(n / total) : "—"}）`;
                                  }
                                : undefined
                        }
                    />
                )}
                cursor={{ stroke: CHART_COLORS.neutral }}
            />
            {visible.map((s, i) => {
                const style = seriesStyle(i, palette);
                return (
                    <Area
                        key={s.key}
                        type="linear"
                        dataKey={s.key}
                        name={s.name}
                        data-series={s.key}
                        stackId={stacked ? STACK_ID : undefined}
                        stroke={style.color}
                        strokeWidth={2}
                        fill={seriesFill(idPrefix, i, patterns, palette)}
                        fillOpacity={1}
                        isAnimationActive={false}
                        dot={false}
                        activeDot={{ r: 5, stroke: CHART_COLORS.surface, strokeWidth: 2, fill: style.color }}
                    />
                );
            })}
        </RAreaChart>
    );

    const columns = visible.map((s) => ({
        key: s.key,
        label: s.name,
        format: percent
            ? (value: unknown, row: ChartDatum) => {
                  const total = rowTotal(row);
                  const n = typeof value === "number" ? value : 0;
                  return `${formatNumber(n, unit)}（${total > 0 ? formatPercent(n / total) : "—"}）`;
              }
            : undefined,
    }));

    return (
        <ChartFrame
            title={title}
            unit={unit}
            legend={legend}
            table={<ChartDataTable caption={title} rowHeader={{ key: xKey, label: xAxisLabel ?? "時点" }} columns={columns} rows={data} unit={unit} />}
            {...frame}
        >
            {size ? chart : <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>}
        </ChartFrame>
    );
}
